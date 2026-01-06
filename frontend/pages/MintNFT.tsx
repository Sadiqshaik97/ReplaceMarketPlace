import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Image as ImageIcon, Sparkles, Info } from 'lucide-react';
import { MODULE_ADDRESS, MODULE_NAME, aptToOctas, aptos } from '../utils/contract';

export function MintNFT() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [minting, setMinting] = React.useState(false);
    const [txHash, setTxHash] = React.useState<string | null>(null);

    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        image: '',
        category: 'hotel',
        location: '',
        checkIn: '',
        checkOut: '',
        checkInTime: '',
        checkOutTime: '',
        guests: '2',
        originalPrice: '',
        royaltyPercentage: '10',
        resalePrice: '', // Resale price (required)
    });

    const categories = [
        { value: 'hotel', label: 'Hotel Booking' },
        { value: 'event', label: 'Event Ticket' },
        { value: 'train', label: 'Train Ticket' },
        { value: 'movie', label: 'Movie Ticket' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleMint = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) {
            alert('⚠️ Please connect your wallet first!');
            return;
        }

        // Validate resale price
        if (!formData.resalePrice || parseFloat(formData.resalePrice) <= 0) {
            alert('⚠️ Please enter a valid resale price');
            return;
        }

        setMinting(true);
        setTxHash(null);

        try {
            // Use the image URL directly as the token URI
            const metadataUri = formData.image;

            // Step 1: Mint the NFT
            console.log('🎨 Minting NFT...');
            const mintResponse = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::mint_booking`,
                    typeArguments: [],
                    functionArguments: [
                        account.address, // buyer
                        formData.name,
                        formData.description,
                        formData.category,
                        formData.location,
                        formData.checkIn + (formData.checkInTime ? ` ${formData.checkInTime}` : ''),
                        formData.checkOut + (formData.checkOutTime ? ` ${formData.checkOutTime}` : ''),
                        Math.floor(new Date(formData.checkOut + (formData.checkOutTime ? `T${formData.checkOutTime}` : 'T23:59:59')).getTime() / 1000).toString(),
                        formData.guests.toString(), // guests as u64 in move, string in SDK
                        metadataUri, // image URL
                        aptToOctas(parseFloat(formData.originalPrice)).toString(), // original_price
                        formData.royaltyPercentage, // royalty_percentage
                    ],
                },
            });
            setTxHash(mintResponse.hash);
            console.log('✅ NFT minted! Hash:', mintResponse.hash);

            // Step 2: Automatically list on marketplace
            console.log('📋 Listing NFT on marketplace...');

            // Wait for the transaction to be committed
            await aptos.waitForTransaction({ transactionHash: mintResponse.hash });

            // Get the transaction details to extract the token address from events
            const txn = await aptos.getTransactionByHash({ transactionHash: mintResponse.hash });
            console.log('📦 Transaction details:', txn);

            // Extract token address from the MintedEvent
            // The MintedEvent contains the token_address field
            let tokenAddress: string | null = null;

            if ('events' in txn && txn.events) {
                for (const event of txn.events) {
                    // Look for the MintedEvent
                    if (event.type.includes('MintedEvent')) {
                        tokenAddress = (event.data as any).token_address;
                        console.log('🎯 Found token address from event:', tokenAddress);
                        break;
                    }
                }
            }

            if (!tokenAddress) {
                throw new Error('Could not find token address in transaction events. Please try again.');
            }

            // List the NFT for resale
            const listResponse = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::list_for_resale`,
                    typeArguments: [],
                    functionArguments: [
                        tokenAddress, // token address
                        aptToOctas(parseFloat(formData.resalePrice)).toString(), // listing price in octas
                    ],
                },
            });

            console.log('✅ NFT listed! Hash:', listResponse.hash);
            alert(`✅ NFT Minted & Listed Successfully!\n\nMint Hash: ${mintResponse.hash}\nList Hash: ${listResponse.hash}\n\nYour NFT is now live on the marketplace at ${formData.resalePrice} APT!\n\nAnyone can now buy your ticket!`);

            // Reset form
            setFormData({
                name: '',
                description: '',
                image: '',
                category: 'hotel',
                location: '',
                checkIn: '',
                checkOut: '',
                checkInTime: '',
                checkOutTime: '',
                guests: '2',
                originalPrice: '',
                royaltyPercentage: '10',
                resalePrice: '',
            });
        } catch (error: any) {
            console.error('Minting/Listing failed:', error);
            alert(`❌ Error\n\n${error.message || 'Please check console for details'}`);
        } finally {
            setMinting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 section-padding content-layer">
            <div className="container mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-8 md:mb-10 text-center md:text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold bracket-text text-grey-900 dark:text-grey-100 mb-3">
                        [ MINT BOOKING NFT ]
                    </h1>
                    <p className="text-grey-600 dark:text-grey-400 text-sm sm:text-base">
                        Create your booking as an NFT with perpetual royalties
                    </p>
                </div>

                {/* Info Card */}
                <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 mb-8">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">How It Works</h3>
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                Your booking will be minted as an NFT and <strong>automatically listed on the marketplace</strong>. You'll earn the royalty percentage you set on EVERY future resale - automatically and forever! Anyone can buy your ticket from the marketplace.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Minting Form */}
                <form onSubmit={handleMint} className="card-flat-white dark:bg-grey-900 p-5 sm:p-8 rounded-xl border border-grey-200 dark:border-grey-700 space-y-6">
                    {/* Booking Name */}
                    <div>
                        <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                            Booking Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Paris Luxury Suite"
                            className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your booking..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all resize-none"
                            required
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                            Image URL *
                        </label>
                        <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400 dark:text-grey-500" />
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                                required
                            />
                        </div>
                        <p className="text-xs text-grey-500 dark:text-grey-500 mt-1 font-mono">
                            Use Unsplash, IPFS, or any image hosting service
                        </p>
                    </div>

                    {/* Category & Location Row */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g., Paris, France"
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Dates Row */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Check-in Date *
                            </label>
                            <input
                                type="date"
                                name="checkIn"
                                value={formData.checkIn}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Check-out Date *
                            </label>
                            <input
                                type="date"
                                name="checkOut"
                                value={formData.checkOut}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Time Row */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Check-in Time
                            </label>
                            <input
                                type="time"
                                name="checkInTime"
                                value={formData.checkInTime}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Check-out Time
                            </label>
                            <input
                                type="time"
                                name="checkOutTime"
                                value={formData.checkOutTime}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                            />
                        </div>
                    </div>

                    {/* Guests & Price Row */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Number of Guests *
                            </label>
                            <input
                                type="number"
                                name="guests"
                                value={formData.guests}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                                Original Price (APT) *
                            </label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleInputChange}
                                placeholder="e.g., 500"
                                step="0.01"
                                min="0.01"
                                className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Royalty Percentage */}
                    <div>
                        <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                            Royalty Percentage (5-10%) *
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                name="royaltyPercentage"
                                value={formData.royaltyPercentage}
                                onChange={handleInputChange}
                                min="5"
                                max="10"
                                step="1"
                                className="flex-1"
                            />
                            <span className="text-2xl font-bold text-aptos-green dark:text-aptos-green w-16 text-center">
                                {formData.royaltyPercentage}%
                            </span>
                        </div>
                        <p className="text-xs text-grey-500 dark:text-grey-500 mt-2 font-mono">
                            You'll earn {formData.royaltyPercentage}% on every future resale of this NFT
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-grey-200 dark:border-grey-700 my-2"></div>

                    {/* Resale Price - Always Required */}
                    <div>
                        <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                            Marketplace Price (APT) *
                        </label>
                        <input
                            type="number"
                            name="resalePrice"
                            value={formData.resalePrice}
                            onChange={handleInputChange}
                            placeholder="e.g., 600"
                            step="0.01"
                            min="0.01"
                            className="w-full px-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                            required
                        />
                        <p className="text-xs text-grey-500 dark:text-grey-500 mt-1 font-mono">
                            Your NFT will be listed on the marketplace at this price for anyone to buy
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-grey-200 dark:border-grey-700 pt-6">
                        {/* Preview */}
                        {formData.image && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-3">Preview</p>
                                <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden bg-grey-100 dark:bg-grey-800">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={minting || !account}
                            className="w-full btn-aptos-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {minting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Minting NFT...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Mint Booking NFT
                                </>
                            )}
                        </button>

                        {!account && (
                            <p className="text-sm text-grey-500 dark:text-grey-500 text-center mt-3">
                                Please connect your wallet to mint
                            </p>
                        )}
                    </div>
                </form>

                {/* Success Message */}
                {txHash && (
                    <div className="mt-6 card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-green-900 dark:text-green-100 mb-1">NFT Minted Successfully!</h3>
                                <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                                    Your booking NFT has been created on the Aptos blockchain.
                                </p>
                                <a
                                    href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-aptos-green hover:text-aptos-green-dark font-mono"
                                >
                                    View on Explorer →
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

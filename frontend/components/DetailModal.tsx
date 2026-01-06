import React from 'react';
import { Listing } from '../types';
import { X, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useBuyNFT } from '../hooks/useContract';

interface DetailModalProps {
    listing: Listing | null;
    onClose: () => void;
}

export function DetailModal({ listing, onClose }: DetailModalProps) {
    const { connected } = useWallet();
    const { buyNFT } = useBuyNFT();
    const [buying, setBuying] = React.useState(false);
    const [txSuccess, setTxSuccess] = React.useState(false);

    React.useEffect(() => {
        if (listing) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            // Restore body scroll when modal is closed
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [listing]);

    if (!listing) return null;

    const savingsPercent = Math.round(
        ((listing.originalPrice - listing.resalePrice) / listing.originalPrice) * 100
    );

    const handleBuy = async () => {
        if (!connected) {
            alert('⚠️ Wallet Not Connected\n\nPlease connect your wallet first using the "Connect Wallet" button in the header!');
            return;
        }

        setBuying(true);
        setTxSuccess(false);

        try {
            const tokenAddress = listing.id; // listing.id is the actual token address
            await buyNFT(tokenAddress, listing.resalePrice);
            setTxSuccess(true);
            alert(`✅ Successfully purchased ${listing.title} for ${listing.resalePrice} APT!\n\nTransaction confirmed on Aptos blockchain.`);

            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('Purchase failed:', error);
            alert(`❌ Purchase Failed\n\n${error.message || 'Check console for details'}`);
        } finally {
            setBuying(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-grey-900 rounded-2xl shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-grey-100 dark:bg-grey-800 hover:bg-grey-200 dark:hover:bg-grey-700 transition-colors"
                >
                    <X className="w-6 h-6 text-grey-900 dark:text-grey-100" />
                </button>

                {/* Hero Image */}
                <div className="relative h-96 overflow-hidden rounded-t-2xl bg-grey-100 dark:bg-grey-800">
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-grey-900 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="tag-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {listing.category.toUpperCase()}
                            </span>
                            {savingsPercent > 0 && (
                                <span className="tag-mono bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    SAVE {savingsPercent}%
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-display font-bold text-grey-900 dark:text-grey-100 mb-4">{listing.title}</h2>

                        <div className="flex flex-wrap gap-4 text-grey-600 dark:text-grey-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{listing.location}</span>
                            </div>
                            {listing.date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-mono text-sm">{listing.date}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-xl font-bold text-grey-900 dark:text-grey-100 mb-3">Description</h3>
                        <p className="text-grey-700 dark:text-grey-300 leading-relaxed">{listing.description}</p>
                    </div>

                    {/* Pricing & Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Price Card */}
                        <div className="card-flat-white dark:bg-grey-800 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-4">Pricing</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-grey-600 dark:text-grey-400 text-sm">Original Price</span>
                                    <span className="text-grey-500 dark:text-grey-500 line-through font-mono">{listing.originalPrice} APT</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-grey-600 dark:text-grey-400 text-sm">Resale Price</span>
                                    <span className="text-3xl font-bold text-grey-900 dark:text-grey-100">{listing.resalePrice} APT</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-grey-200 dark:border-grey-700">
                                    <span className="text-grey-600 dark:text-grey-400 text-sm">You Save</span>
                                    <span className="text-green-600 dark:text-green-400 font-bold font-mono">
                                        {(listing.originalPrice - listing.resalePrice).toFixed(2)} APT
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Royalty Info */}
                        <div className="card-flat-white dark:bg-grey-800 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-4">Royalty Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="w-5 h-5 text-aptos-green mt-1" />
                                    <div>
                                        <p className="text-grey-900 dark:text-grey-100 font-semibold">{listing.royaltyPercentage}% Perpetual Royalty</p>
                                        <p className="text-sm text-grey-600 dark:text-grey-400">Original buyer earns on every resale</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-grey-200 dark:border-grey-700">
                                    <p className="text-xs text-grey-500 dark:text-grey-500 font-mono mb-1">SELLER</p>
                                    <p className="text-sm text-grey-700 dark:text-grey-300 font-mono">{listing.seller}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-grey-500 dark:text-grey-500 font-mono mb-1">ORIGINAL BUYER</p>
                                    <p className="text-sm text-grey-700 dark:text-grey-300 font-mono">{listing.originalBuyer}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buy Button */}
                    <button
                        onClick={handleBuy}
                        disabled={buying || txSuccess}
                        className="w-full btn-aptos-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    >
                        {buying && (
                            <span className="absolute inset-0 flex items-center justify-center bg-grey-900/80">
                                <span className="animate-pulse text-white">Processing Transaction...</span>
                            </span>
                        )}
                        {txSuccess && (
                            <span className="absolute inset-0 flex items-center justify-center bg-green-500/90">
                                ✅ Purchase Successful!
                            </span>
                        )}
                        {!buying && !txSuccess && `Buy Now for ${listing.resalePrice} APT`}
                    </button>

                    <p className="text-xs text-center text-grey-500 dark:text-grey-500 font-mono">
                        {connected
                            ? '✅ WALLET CONNECTED - READY TO PURCHASE'
                            : '⚠️ CONNECT YOUR WALLET TO COMPLETE THE PURCHASE'}
                    </p>
                </div>
            </div>
        </div>
    );
}

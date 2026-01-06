import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Info } from 'lucide-react';
import { useGetListings, useGetListing } from '../hooks/useGetListings';
import { useBuyNFT, useListNFT, useCancelListing } from '../hooks/useContract';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos } from '../utils/contract';
import { ListingCard } from '../components/ListingCard';

const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        return new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch (e) {
        return dateStr;
    }
};

export function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { connected, account } = useWallet();
    const { buyNFT } = useBuyNFT();
    const { listNFT, isListing } = useListNFT();
    const { cancelListing, isCancelling } = useCancelListing();
    const [buying, setBuying] = React.useState(false);
    const [listPrice, setListPrice] = React.useState('');
    const [txSuccess, setTxSuccess] = React.useState(false);

    const { data: product, isLoading: productLoading } = useGetListing(id);
    const { data: allListings = [], isLoading: listingsLoading } = useGetListings();

    const isExpired = product?.checkOutTimestamp ? (Date.now() / 1000) > product.checkOutTimestamp : false;

    if (productLoading || listingsLoading) {
        return (
            <div className="min-h-screen pt-24 section-padding">
                <div className="container mx-auto text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-grey-200 dark:border-grey-700 border-t-aptos-green"></div>
                    <p className="text-grey-600 dark:text-grey-400 mt-4">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 section-padding">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold text-grey-900 dark:text-grey-100 mb-4">Product Not Found</h1>
                    <p className="text-grey-600 dark:text-grey-400 mb-8">The product you're looking for doesn't exist or is no longer listed.</p>
                    <button onClick={() => navigate(-1)} className="btn-aptos">
                        Back
                    </button>
                </div>
            </div>
        );
    }

    const handleBuy = async () => {
        if (!connected) {
            alert('⚠️ Wallet Not Connected\n\nPlease connect your wallet first!');
            return;
        }

        setBuying(true);
        setTxSuccess(false);

        try {
            const balanceResponse = await aptos.getAccountCoinAmount({
                accountAddress: account!.address,
                coinType: "0x1::aptos_coin::AptosCoin",
            });

            const currentBalance = Number(balanceResponse) / 100_000_000;
            if (currentBalance < product.resalePrice) {
                throw new Error(`Insufficient balance. You have ${currentBalance.toFixed(4)} APT but need at least ${product.resalePrice} APT.`);
            }

            await buyNFT(product.id, product.resalePrice);
            setTxSuccess(true);
            alert(`✅ Successfully purchased ${product.title}!`);

            setTimeout(() => {
                navigate('/my-collection');
            }, 2000);
        } catch (error: any) {
            console.error('Purchase failed:', error);
            alert(`❌ Purchase Failed\n\n${error.message || 'Error occurred'}`);
        } finally {
            setBuying(false);
        }
    };

    const handleList = async () => {
        if (!product || !listPrice || parseFloat(listPrice) <= 0) {
            alert('Please enter a valid price');
            return;
        }

        try {
            await listNFT(product.id, parseFloat(listPrice));
            alert('✅ NFT listed successfully!');
            window.location.reload();
        } catch (error: any) {
            console.error('Listing failed:', error);
            alert(`❌ Listing failed: ${error.message || 'Please try again'}`);
        }
    };

    const handleCancel = async () => {
        if (!product || !window.confirm(`Cancel listing for ${product.title}?`)) {
            return;
        }

        try {
            await cancelListing(product.id);
            alert('✅ Listing cancelled successfully!');
            window.location.reload();
        } catch (error: any) {
            console.error('Cancel failed:', error);
            alert(`❌ Cancel failed: ${error.message || 'Please try again'}`);
        }
    };

    const relatedProducts = allListings
        .filter(listing => listing.category === product.category && listing.id !== product.id)
        .slice(0, 3);

    const savingsPercent = Math.round(
        ((product.originalPrice - product.resalePrice) / product.originalPrice) * 100
    );

    return (
        <div className="min-h-screen pt-16 pb-12 section-padding bg-white dark:bg-grey-900">
            <div className="container mx-auto max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-grey-500 hover:text-aptos-green transition-colors mb-6 sm:mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Back</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-grey-100 dark:border-grey-800 shadow-lg bg-grey-50 group">
                            <img
                                src={product.image}
                                alt={product.title}
                                className={`w-full h-full object-cover ${isExpired ? 'grayscale' : ''}`}
                            />
                            {isExpired && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                                    <div className="border-4 border-red-500/80 px-6 py-3 rounded-xl rotate-[-15deg] bg-white/10 backdrop-blur-md shadow-2xl">
                                        <span className="text-red-500 font-black text-2xl uppercase tracking-[0.2em]">EXPIRED</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 p-3 bg-grey-50 dark:bg-grey-800/50 rounded-lg border border-grey-100 dark:border-grey-800 shadow-sm">
                                <p className="text-[10px] text-grey-500 uppercase font-bold mb-1">Authenticity</p>
                                <p className="text-[11px] font-bold text-aptos-green uppercase">Verified Booking</p>
                            </div>
                            <div className="flex-1 p-3 bg-grey-50 dark:bg-grey-800/50 rounded-lg border border-grey-100 dark:border-grey-800 shadow-sm">
                                <p className="text-[10px] text-grey-500 uppercase font-bold mb-1">Standard</p>
                                <p className="text-[11px] font-bold text-grey-900 dark:text-grey-100 uppercase">Aptos Token V2</p>
                            </div>
                        </div>

                        {/* Property Description moved to Left Column */}
                        <div className="bg-white dark:bg-grey-800/20 rounded-xl border-2 border-grey-100 dark:border-grey-800 overflow-hidden shadow-md hover:shadow-lg transition-all hidden md:block">
                            <div className="px-5 py-3 bg-grey-50/50 dark:bg-grey-800/50 border-b border-grey-200 dark:border-grey-700">
                                <h3 className="text-[10px] font-black uppercase text-grey-500 tracking-[0.2em] font-mono flex items-center gap-2">
                                    <Info className="w-3 h-3 text-aptos-green" />
                                    Property Information
                                </h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-1.5 tracking-wider">Asset Name</p>
                                        <p className="text-sm font-black text-grey-900 dark:text-grey-100 uppercase tracking-tight">{product.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-1.5 tracking-wider">Property Type</p>
                                        <span className="inline-flex px-2 py-0.5 rounded bg-aptos-green/10 border border-aptos-green/20 text-[10px] font-black text-aptos-green uppercase">{product.category}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-grey-100 dark:border-grey-800/50">
                                    <p className="text-[9px] text-grey-400 uppercase font-black mb-1.5 tracking-wider">Detailed Description</p>
                                    <p className="text-xs text-grey-600 dark:text-grey-400 leading-relaxed">{product.description || `This unique ${product.category} booking NFT grants the owner full reservation rights.`}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Information for Mobile only (Visible under Image) */}
                        <div className="md:hidden bg-white dark:bg-grey-800/20 rounded-xl border-2 border-grey-100 dark:border-grey-800 overflow-hidden shadow-md">
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-1">Asset Name</p>
                                        <p className="text-xs font-black text-grey-900 dark:text-grey-100 uppercase truncate">{product.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-1">Property Type</p>
                                        <span className="inline-flex px-1.5 py-0.5 rounded bg-aptos-green/10 border border-aptos-green/20 text-[9px] font-black text-aptos-green uppercase">{product.category}</span>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-grey-100 dark:border-grey-800/50">
                                    <p className="text-[9px] text-grey-400 uppercase font-black mb-1">Description</p>
                                    <p className="text-xs text-grey-600 dark:text-grey-400 leading-relaxed line-clamp-3">{product.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`p-4 rounded-lg border-2 shadow-md transition-shadow hover:shadow-lg ${isExpired ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-grey-50 dark:bg-grey-800 border-grey-100 dark:border-grey-700'}`}>
                            {isExpired && (
                                <div className="mb-4 p-3 bg-red-500 text-white rounded-md text-center font-black uppercase tracking-widest text-xs animate-pulse shadow-sm">
                                    ⚠️ This booking has expired and is no longer valid
                                </div>
                            )}
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] text-grey-500 uppercase font-bold mb-0.5">Listing Price</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`text-3xl font-black ${isExpired ? 'text-grey-400' : 'text-aptos-green'}`}>{product.resalePrice}</span>
                                        <span className="text-sm font-bold text-grey-500">APT</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-grey-500 uppercase font-bold mb-0.5">Discount</p>
                                    <p className={`text-sm font-bold ${isExpired ? 'text-grey-400' : 'text-green-500'}`}>-{savingsPercent}%</p>
                                </div>
                            </div>
                        </div>

                        {(account?.address && product.owner &&
                            account.address.toString().toLowerCase() === product.owner.toString().toLowerCase()) ? (
                            <div className="space-y-4">
                                {!product.isListed ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-grey-500 uppercase mb-1">Set Listing Price (APT)</label>
                                            <input
                                                type="number"
                                                value={listPrice}
                                                onChange={(e) => setListPrice(e.target.value)}
                                                placeholder="e.g. 5.0"
                                                className="w-full px-3 py-2 bg-white dark:bg-grey-900 border border-grey-200 dark:border-grey-700 rounded-lg text-sm text-grey-900 dark:text-grey-100 focus:outline-none focus:ring-2 focus:ring-aptos-green"
                                            />
                                        </div>
                                        <button
                                            onClick={handleList}
                                            disabled={isListing || !listPrice || isExpired}
                                            className="w-full py-2.5 bg-aptos-green hover:bg-aptos-green-dark text-black font-black uppercase tracking-wider rounded-lg transition-all shadow-md text-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                        >
                                            {isExpired ? 'Cannot List Expired Booking' : isListing ? 'Listing...' : 'List for Resale'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCancelling || isExpired}
                                        className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-wider rounded-lg transition-all shadow-md text-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                    >
                                        {isExpired ? 'Listing Expired' : isCancelling ? 'Cancelling...' : 'Cancel Listing'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {buying ? (
                                    <div className="flex items-center justify-center p-3 bg-aptos-green/10 border border-aptos-green/20 rounded-lg">
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-aptos-green border-t-transparent mr-2" />
                                        <span className="text-xs font-bold text-aptos-green">Processing Transaction...</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleBuy}
                                        disabled={txSuccess || !product.isListed || !connected || isExpired}
                                        className="w-full py-2.5 bg-aptos-green hover:bg-aptos-green-dark text-black font-black uppercase tracking-wider rounded-lg transition-all shadow-md text-sm disabled:opacity-50 disabled:bg-grey-300 dark:disabled:bg-grey-700 disabled:grayscale disabled:cursor-not-allowed"
                                    >
                                        {isExpired ? 'Booking Expired' :
                                            !connected ? 'Connect Wallet to Buy' :
                                                !product.isListed ? 'Not Listed for Sale' :
                                                    txSuccess ? '✅ Purchased' : 'Confirm Purchase'}
                                    </button>
                                )}
                            </>
                        )}



                        {/* Section 2: Booking Schedule & Status */}
                        <div className="bg-white dark:bg-grey-800/20 rounded-xl border-2 border-grey-100 dark:border-grey-800 overflow-hidden shadow-md hover:shadow-lg transition-all">
                            <div className="px-5 py-3 bg-grey-50/50 dark:bg-grey-800/50 border-b border-grey-200 dark:border-grey-700">
                                <h3 className="text-[10px] font-black uppercase text-grey-500 tracking-[0.2em] font-mono flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-aptos-green animate-pulse'}`} />
                                    Booking Schedule & Status
                                </h3>
                            </div>
                            <div className="p-5 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                    <div className="p-3 bg-grey-50/50 dark:bg-grey-900/50 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm">
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-2 tracking-wider">Check-In Time</p>
                                        <p className="text-xs font-black text-grey-900 dark:text-grey-100 font-mono">{formatDateTime(product.checkIn)}</p>
                                    </div>
                                    <div className="p-3 bg-grey-50/50 dark:bg-grey-900/50 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm">
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-2 tracking-wider">Check-Out Time</p>
                                        <p className="text-xs font-black text-red-500/80 dark:text-red-400/80 font-mono">{formatDateTime(product.checkOut)}</p>
                                    </div>
                                    <div className="p-3 bg-grey-50/50 dark:bg-grey-900/50 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm">
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-2 tracking-wider">Guest Capacity</p>
                                        <p className="text-[11px] font-black text-grey-900 dark:text-grey-100 uppercase">{product.guests || 0} {product.category === 'hotel' ? 'Person(s)' : 'Entry Pass'}</p>
                                    </div>
                                    <div className="p-3 bg-grey-50/50 dark:bg-grey-900/50 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm">
                                        <p className="text-[9px] text-grey-400 uppercase font-black mb-2 tracking-wider">Asset Status</p>
                                        <span className={`text-[10px] font-black uppercase ${isExpired ? 'text-red-500' : 'text-aptos-green'}`}>
                                            {isExpired ? 'Expired / Ended' : 'Active & Verified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Chain & Ownership Tracking */}
                        <div className="bg-white dark:bg-grey-800/20 rounded-xl border-2 border-grey-100 dark:border-grey-800 overflow-hidden shadow-md hover:shadow-lg transition-all">
                            <div className="px-5 py-3 bg-grey-50/50 dark:bg-grey-800/50 border-b border-grey-200 dark:border-grey-700">
                                <h3 className="text-[10px] font-black uppercase text-grey-500 tracking-[0.2em] font-mono flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-aptos-green" />
                                    Chain & Ownership Data
                                </h3>
                            </div>
                            <div className="p-5 space-y-6">
                                <div className="grid grid-cols-1 gap-4 text-left">
                                    <div className="p-3 bg-grey-50/50 dark:bg-grey-900/40 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm group/minter">
                                        <p className="text-[8px] text-grey-400 uppercase font-bold mb-1 tracking-tighter">Original Minter</p>
                                        <p className="text-xs font-mono text-grey-600 dark:text-grey-300 break-all leading-tight group-hover/minter:text-aptos-green transition-colors">
                                            {product.originalBuyer}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-grey-50/50 dark:bg-grey-900/40 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm group/addr">
                                        <p className="text-[8px] text-grey-400 uppercase font-bold mb-1 tracking-tighter">Current Owner Address</p>
                                        <p className="text-xs font-mono text-grey-600 dark:text-grey-300 break-all leading-tight group-hover/addr:text-aptos-green transition-colors">
                                            {product.owner}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-grey-50/50 dark:bg-grey-900/40 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm">
                                            <p className="text-[8px] text-grey-400 uppercase font-bold mb-1 border-b border-grey-100 dark:border-grey-800 pb-1">Minting Cost</p>
                                            <p className="mt-1 text-sm font-black text-grey-900 dark:text-grey-100 leading-none">
                                                {product.originalPrice} <span className="text-[8px] text-aptos-green">APT</span>
                                            </p>
                                        </div>
                                        <div className="p-3 bg-grey-50/50 dark:bg-grey-900/40 border border-grey-100 dark:border-grey-800 rounded-lg shadow-sm text-right">
                                            <p className="text-[8px] text-grey-400 uppercase font-bold mb-1 border-b border-grey-100 dark:border-grey-800 pb-1">Resale Events</p>
                                            <p className="mt-1 text-sm font-black text-aptos-green leading-none">{product.resaleCount || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-grey-100 dark:border-grey-800">
                        <h2 className="text-lg font-black uppercase text-grey-900 dark:text-grey-100 mb-6 tracking-tight">Similar Options</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {relatedProducts.map(listing => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    onClick={() => {
                                        navigate(`/product/${listing.id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

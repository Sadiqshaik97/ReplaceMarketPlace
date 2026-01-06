import { TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import { useGetUserNFTs, useGetUserStats } from '../hooks/useGetUserNFTs';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';

const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch (e) {
        return dateStr;
    }
};

export function MyCollection() {
    const { account } = useWallet();
    const { data: userBookings = [], isLoading, error, refetch } = useGetUserNFTs();
    const { stats } = useGetUserStats();
    const { totalValue, totalNFTs, totalRoyalties, activeListings } = stats;

    const navigate = useNavigate();

    return (
        <div className="min-h-screen pt-24 section-padding content-layer">
            <div className="container mx-auto">
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-display font-bold bracket-text text-grey-900 dark:text-grey-100 mb-3">
                        [ MY COLLECTION ]
                    </h1>
                    <p className="text-grey-600 dark:text-grey-400 text-base">
                        Manage your NFT collection and track your earnings
                    </p>
                </div>

                {/* Portfolio Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-aptos-green/10 rounded-lg">
                                <Activity className="w-5 h-5 text-aptos-green" />
                            </div>
                            <p className="text-xs text-grey-500 dark:text-grey-500 font-mono">TOTAL NFTS</p>
                        </div>
                        <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100">{totalNFTs}</p>
                    </div>

                    <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <DollarSign className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-xs text-grey-500 dark:text-grey-500 font-mono">PORTFOLIO VALUE</p>
                        </div>
                        <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100">{totalValue.toFixed(2)} APT</p>
                    </div>

                    <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-xs text-grey-500 dark:text-grey-500 font-mono">ROYALTIES EARNED</p>
                        </div>
                        <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100">{totalRoyalties} APT</p>
                    </div>

                    <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-500" />
                            </div>
                            <p className="text-xs text-grey-500 dark:text-grey-500 font-mono">ACTIVE LISTINGS</p>
                        </div>
                        <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100">{activeListings}</p>
                    </div>
                </div>

                {/* NFT Grid */}
                <div className="mb-10">
                    <h2 className="text-2xl font-display font-bold text-grey-900 dark:text-grey-100 mb-6">Your NFTs</h2>

                    {!account ? (
                        <div className="text-center py-20 card-flat-white dark:bg-grey-800 rounded-2xl">
                            <p className="text-grey-600 dark:text-grey-400 text-lg mb-4">Connect your wallet to view your collection</p>
                            <p className="text-grey-500 dark:text-grey-500">Please connect your Petra wallet to continue</p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-grey-200 dark:border-grey-700 border-t-aptos-green"></div>
                            <p className="text-grey-600 dark:text-grey-400 mt-4">Loading your NFTs from blockchain...</p>
                            <p className="text-sm text-grey-500 dark:text-grey-500 mt-2">This may take 30-60 seconds for newly minted NFTs</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 card-flat-white dark:bg-grey-800 rounded-2xl">
                            <p className="text-red-600 dark:text-red-400 text-lg mb-4 font-semibold">⚠️ API Rate Limit Exceeded</p>
                            <p className="text-grey-600 dark:text-grey-400 mb-4">
                                The Aptos API is temporarily blocking requests. This usually happens after multiple page refreshes.
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
                                <p className="text-sm text-grey-700 dark:text-grey-300 mb-2">
                                    <strong>What to do:</strong>
                                </p>
                                <ol className="text-sm text-grey-600 dark:text-grey-400 text-left list-decimal list-inside space-y-1">
                                    <li>Wait 5-10 minutes for the rate limit to reset</li>
                                    <li>Click the "Retry" button below</li>
                                    <li>Avoid refreshing the page multiple times</li>
                                </ol>
                            </div>
                            <button
                                onClick={() => refetch()}
                                className="btn-aptos"
                            >
                                🔄 Retry Loading NFTs
                            </button>
                            <p className="text-xs text-grey-500 dark:text-grey-500 mt-4">
                                Open console (F12) to see detailed error messages
                            </p>
                        </div>
                    ) : userBookings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userBookings.map((booking: any) => {
                                const isExpired = booking.checkOutTimestamp ? (Date.now() / 1000) > booking.checkOutTimestamp : false;
                                return (
                                    <div
                                        key={booking.id}
                                        onClick={() => navigate(`/product/${booking.id}`)}
                                        className={`card-aptos transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 border-2 border-grey-100 hover:border-aptos-green/30 ${isExpired
                                            ? 'grayscale opacity-75 border-red-500/20 shadow-none'
                                            : 'cursor-pointer'}`}
                                    >
                                        <div className="relative w-full aspect-[4/3] -mx-6 -mt-6 mb-4 overflow-hidden bg-grey-100 dark:bg-grey-800">
                                            <img
                                                src={booking.image}
                                                alt={booking.title}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Status Badge */}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                {isExpired ? (
                                                    <span className="tag-mono bg-red-500 text-white shadow-lg">
                                                        EXPIRED
                                                    </span>
                                                ) : booking.isListed ? (
                                                    <span className="tag-mono bg-blue-500 text-white">
                                                        LISTED
                                                    </span>
                                                ) : (
                                                    <span className="tag-mono bg-aptos-green text-black">
                                                        OWNED
                                                    </span>
                                                )}
                                            </div>

                                            {isExpired && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                    <div className="border-4 border-red-500/80 px-4 py-2 rounded-lg rotate-[-15deg] bg-white/10 backdrop-blur-md shadow-2xl skew-x-[-10deg]">
                                                        <span className="text-red-500 font-black text-xl uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">EXPIRED</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {/* Type Label */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-aptos-green uppercase tracking-wider">
                                                    TYPE:
                                                </span>
                                                <span className="text-sm font-semibold text-grey-900 dark:text-grey-100 uppercase">
                                                    {booking.category || 'Booking'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 py-2 border-y border-grey-100 dark:border-grey-800">
                                                <div>
                                                    <p className="text-[8px] text-grey-400 uppercase font-black">Check-In</p>
                                                    <p className="text-[10px] font-bold text-grey-900 dark:text-grey-100">{formatDateTime(booking.checkIn)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] text-grey-400 uppercase font-black">Check-Out</p>
                                                    <p className="text-[10px] font-bold text-red-500/80 dark:text-red-400/80">{formatDateTime(booking.checkOut)}</p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-grey-200 dark:border-grey-700">
                                                <p className="text-xs text-grey-500 dark:text-grey-500 mb-2 font-mono">
                                                    {booking.isListed ? 'LISTING PRICE' : 'ORIGINAL PRICE'}
                                                </p>
                                                <p className="text-2xl font-bold text-grey-900 dark:text-grey-100 mb-4">
                                                    {booking.isListed ? booking.resalePrice : booking.originalPrice} APT
                                                </p>

                                                {!booking.isListed && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!isExpired) navigate(`/product/${booking.id}`);
                                                        }}
                                                        disabled={isExpired}
                                                        className={`w-full btn-aptos ${isExpired ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                                    >
                                                        {isExpired ? 'Expired Asset' : 'List for Resale'}
                                                    </button>
                                                )}
                                                {booking.isListed && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!isExpired) navigate(`/product/${booking.id}`);
                                                        }}
                                                        disabled={isExpired}
                                                        className={`w-full px-4 py-2 font-semibold rounded-lg transition-colors ${isExpired
                                                            ? 'bg-grey-200 dark:bg-grey-800 text-grey-400 cursor-not-allowed grayscale'
                                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                                            }`}
                                                    >
                                                        {isExpired ? 'Expired Listing' : 'Cancel / Manage'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 card-flat-white dark:bg-grey-800 rounded-2xl">
                            <p className="text-grey-600 dark:text-grey-400 text-lg mb-4">You don't own any bookings yet.</p>
                            <p className="text-grey-500 dark:text-grey-500 mb-8">Mint your first booking NFT to get started</p>
                            <a href="/mint-nft" className="btn-aptos-lg">
                                Mint Booking NFT
                            </a>
                        </div>
                    )}
                </div>


            </div >
        </div >
    );
}

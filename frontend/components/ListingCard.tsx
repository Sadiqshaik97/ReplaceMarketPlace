import { MapPin } from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
    listing: Listing;
    onClick?: () => void;
}

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

export function ListingCard({ listing, onClick }: ListingCardProps) {
    const isExpired = listing.checkOutTimestamp ? (Date.now() / 1000) > listing.checkOutTimestamp : false;
    return (
        <div
            onClick={onClick}
            className={`group bg-white dark:bg-grey-900 border-2 border-grey-100 dark:border-grey-800 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-aptos-green/30
                ${isExpired
                    ? 'grayscale opacity-75 cursor-not-allowed shadow-none border-grey-200 dark:border-grey-700'
                    : 'cursor-pointer'
                }`}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-grey-100 dark:bg-grey-800">
                <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    {isExpired ? (
                        <span className="bg-red-500 px-1.5 py-0.5 rounded text-[8px] font-black tracking-tight text-white uppercase border border-red-600 shadow-sm animate-pulse">
                            Expired
                        </span>
                    ) : (
                        <span className="bg-white/90 dark:bg-grey-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black tracking-tight text-grey-900 dark:text-grey-100 uppercase border border-grey-200 dark:border-grey-700">
                            {listing.category}
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

            {/* Content Section */}
            <div className="p-3 space-y-2">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-aptos-green uppercase tracking-wider">Type:</span>
                        <span className="text-[10px] font-black text-grey-900 dark:text-grey-100 uppercase tracking-tight">{listing.category}</span>
                    </div>
                    <h3 className="text-sm font-black text-grey-900 dark:text-grey-100 uppercase tracking-tighter truncate group-hover:text-aptos-green transition-colors leading-tight">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-grey-500 font-medium mt-1">
                        <MapPin className="w-3 h-3 text-grey-400" />
                        <span className="truncate">{listing.location}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 py-1.5 border-t border-grey-50 dark:border-grey-800">
                        <div>
                            <p className="text-[7px] text-grey-400 uppercase font-black">In</p>
                            <p className="text-[9px] font-bold text-grey-900 dark:text-grey-100">{formatDateTime(listing.checkIn)}</p>
                        </div>
                        <div>
                            <p className="text-[7px] text-grey-400 uppercase font-black text-right">Out</p>
                            <p className="text-[9px] font-bold text-red-500/80 dark:text-red-400/80 text-right">{formatDateTime(listing.checkOut)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-grey-50 dark:border-grey-800">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-grey-400 uppercase tracking-widest leading-none">Price</span>
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-base font-black text-grey-900 dark:text-grey-100">{listing.resalePrice}</span>
                            <span className="text-[10px] font-bold text-aptos-green">APT</span>
                        </div>
                    </div>
                    <button
                        disabled={isExpired}
                        className={`h-7 sm:h-8 px-2 sm:px-3 text-[9px] sm:text-[10px] font-black uppercase tracking-tighter rounded transition-colors ${isExpired
                            ? 'bg-grey-200 dark:bg-grey-800 text-grey-400 cursor-not-allowed'
                            : 'bg-aptos-green hover:bg-aptos-green-dark text-black'
                            }`}
                    >
                        {isExpired ? 'Expired' : 'Buy Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}

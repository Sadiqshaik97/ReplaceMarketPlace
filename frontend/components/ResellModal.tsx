import React from 'react';
import { Listing } from '../types';
import { X, DollarSign } from 'lucide-react';

interface ResellModalProps {
    listing: Listing | null;
    onClose: () => void;
    onList: (price: number) => void;
}

export function ResellModal({ listing, onClose, onList }: ResellModalProps) {
    const [price, setPrice] = React.useState('');
    const [error, setError] = React.useState('');

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceNum = parseFloat(price);

        if (!price || isNaN(priceNum) || priceNum <= 0) {
            setError('Please enter a valid price greater than 0');
            return;
        }

        onList(priceNum);
        onClose();
    };

    const suggestedPrice = (listing.originalPrice * 0.9).toFixed(2);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-white dark:bg-grey-900 rounded-2xl p-8 shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-grey-100 dark:bg-grey-800 hover:bg-grey-200 dark:hover:bg-grey-700 transition-colors"
                >
                    <X className="w-5 h-5 text-grey-900 dark:text-grey-100" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-display font-bold text-grey-900 dark:text-grey-100 mb-2">List for Resale</h2>
                <p className="text-grey-600 dark:text-grey-400 mb-6">Set your resale price for this booking</p>

                {/* Listing Preview */}
                <div className="card-flat-white dark:bg-grey-800 p-4 rounded-xl mb-6 border border-grey-200 dark:border-grey-700">
                    <div className="flex gap-4">
                        <img
                            src={listing.image}
                            alt={listing.title}
                            className="w-20 h-20 object-cover rounded-lg bg-grey-100 dark:bg-grey-700"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-grey-900 dark:text-grey-100 mb-1">{listing.title}</h3>
                            <p className="text-sm text-grey-600 dark:text-grey-400">{listing.location}</p>
                            <p className="text-xs text-grey-500 dark:text-grey-500 mt-1 font-mono">
                                ORIGINAL: {listing.originalPrice} APT
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                            Resale Price (APT)
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400 dark:text-grey-500">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                    setError('');
                                }}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                        <p className="mt-2 text-xs text-grey-500 dark:text-grey-500 font-mono">
                            SUGGESTED: {suggestedPrice} APT (10% BELOW ORIGINAL)
                        </p>
                    </div>

                    {/* Royalty Info */}
                    <div className="card-flat dark:bg-grey-800 p-4 rounded-lg border border-grey-200 dark:border-grey-700">
                        <p className="text-sm text-grey-600 dark:text-grey-400 mb-2 font-mono">ROYALTY BREAKDOWN</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-grey-600 dark:text-grey-400">Your earnings</span>
                                <span className="text-grey-900 dark:text-grey-100 font-bold font-mono">
                                    {price ? (parseFloat(price) * (1 - listing.royaltyPercentage / 100)).toFixed(2) : '0.00'} APT
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-grey-600 dark:text-grey-400">Royalty ({listing.royaltyPercentage}%)</span>
                                <span className="text-aptos-green font-bold font-mono">
                                    {price ? (parseFloat(price) * (listing.royaltyPercentage / 100)).toFixed(2) : '0.00'} APT
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-lg bg-grey-100 dark:bg-grey-800 hover:bg-grey-200 dark:hover:bg-grey-700 text-grey-900 dark:text-grey-100 font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-aptos"
                        >
                            List for Sale
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

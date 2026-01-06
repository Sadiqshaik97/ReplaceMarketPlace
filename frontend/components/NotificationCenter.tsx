import React from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { MarketplaceEvent, formatAddress, formatTimeAgo } from '../services/transactions';

interface NotificationProps {
    events: MarketplaceEvent[];
    onDismiss: (index: number) => void;
    onClearAll: () => void;
}

export function NotificationCenter({ events, onDismiss, onClearAll }: NotificationProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const unreadCount = events.length;

    const getEventMessage = (event: MarketplaceEvent) => {
        switch (event.type) {
            case 'mint':
                return `New NFT minted by ${formatAddress(event.from)}`;
            case 'list':
                return `NFT listed for ${event.price} APT`;
            case 'buy':
                return `NFT purchased by ${formatAddress(event.from)}`;
            case 'royalty':
                return `Royalty payment of ${event.royaltyAmount} APT`;
            case 'cancel':
                return `Listing cancelled`;
            default:
                return 'New activity';
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-grey-100 dark:hover:bg-grey-800 rounded-lg transition-colors"
            >
                {unreadCount > 0 ? (
                    <BellRing className="w-6 h-6 text-aptos-green animate-pulse" />
                ) : (
                    <Bell className="w-6 h-6 text-grey-600 dark:text-grey-400" />
                )}

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-aptos-green text-black text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-grey-900 border border-grey-200 dark:border-grey-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-grey-200 dark:border-grey-700 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-grey-900 dark:text-grey-100">
                                Notifications ({unreadCount})
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={onClearAll}
                                    className="text-xs text-aptos-green hover:text-aptos-green-dark transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {events.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-grey-300 dark:text-grey-600 mx-auto mb-3" />
                                    <p className="text-sm text-grey-600 dark:text-grey-400">No new notifications</p>
                                </div>
                            ) : (
                                events.map((event, index) => (
                                    <div
                                        key={`${event.hash}-${index}`}
                                        className="p-4 border-b border-grey-100 dark:border-grey-800 hover:bg-grey-50 dark:hover:bg-grey-800 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-grey-900 dark:text-grey-100 mb-1">
                                                    {getEventMessage(event)}
                                                </p>
                                                <p className="text-xs text-grey-500 dark:text-grey-500 font-mono">
                                                    {formatTimeAgo(event.timestamp)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onDismiss(index)}
                                                className="flex-shrink-0 p-1 hover:bg-grey-200 dark:hover:bg-grey-700 rounded transition-colors"
                                            >
                                                <X className="w-4 h-4 text-grey-500 dark:text-grey-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

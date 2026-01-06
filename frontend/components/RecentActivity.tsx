import React from 'react';
import { ExternalLink, TrendingUp, ShoppingCart, Tag, X as XIcon, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import {
    fetchMarketplaceEvents,
    MarketplaceEvent,
    formatAddress,
    formatTimeAgo,
    getExplorerUrl
} from '../services/transactions';

interface RecentActivityProps {
    contractAddress?: string;
    userAddress?: string;
    limit?: number;
}

const ITEMS_PER_PAGE = 5;

export function RecentActivity({ contractAddress, userAddress, limit = 50 }: RecentActivityProps) {
    const [allEvents, setAllEvents] = React.useState<MarketplaceEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = React.useState<MarketplaceEvent[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchAddress, setSearchAddress] = React.useState('');
    const [notifications, setNotifications] = React.useState<MarketplaceEvent[]>([]);
    const [lastEventHash, setLastEventHash] = React.useState<string | null>(null);
    const [sortOrder, setSortOrder] = React.useState<'desc' | 'asc'>('desc');

    // Load events
    React.useEffect(() => {
        async function loadEvents() {
            if (!contractAddress && !userAddress) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const address = contractAddress || userAddress || '';
                const data = await fetchMarketplaceEvents(address, limit);

                // Explicitly sort by timestamp descending (newest first)
                const sortedData = [...data].sort((a, b) => b.timestamp - a.timestamp);

                // Check for new events (for notifications)
                if (sortedData.length > 0 && lastEventHash && sortedData[0].hash !== lastEventHash) {
                    const newEvents = sortedData.filter(e => e.timestamp > (allEvents[0]?.timestamp || 0));
                    if (newEvents.length > 0) {
                        setNotifications(prev => [...newEvents, ...prev].slice(0, 10)); // Keep last 10
                        // Play notification sound (optional)
                        playNotificationSound();
                    }
                }

                setAllEvents(sortedData);
                setFilteredEvents(sortedData);
                if (sortedData.length > 0) {
                    setLastEventHash(sortedData[0].hash);
                }
            } catch (err) {
                console.error('Failed to load events:', err);
                setError('Failed to load recent activity');
            } finally {
                setLoading(false);
            }
        }

        loadEvents();

        // Refresh every 30 seconds
        const interval = setInterval(loadEvents, 30000);
        return () => clearInterval(interval);
    }, [contractAddress, userAddress, limit]);

    // Sort and Filter events
    React.useEffect(() => {
        let events = [...allEvents];

        // 1. Filter by search address
        if (searchAddress.trim()) {
            events = events.filter(event =>
                event.from.toLowerCase().includes(searchAddress.toLowerCase()) ||
                event.to?.toLowerCase().includes(searchAddress.toLowerCase())
            );
        }

        // 2. Apply Sort Order
        events.sort((a, b) => {
            return sortOrder === 'desc'
                ? b.timestamp - a.timestamp
                : a.timestamp - b.timestamp;
        });

        setFilteredEvents(events);
        setCurrentPage(1);
    }, [searchAddress, allEvents, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentEvents = filteredEvents.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const playNotificationSound = () => {
        // Optional: play a subtle notification sound
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=');
            audio.volume = 0.3;
            audio.play().catch(() => { }); // Ignore errors
        } catch (e) {
            // Silently fail
        }
    };

    const getEventIcon = (type: MarketplaceEvent['type']) => {
        switch (type) {
            case 'mint':
                return <Tag className="w-5 h-5 text-aptos-green" />;
            case 'list':
                return <TrendingUp className="w-5 h-5 text-blue-500" />;
            case 'buy':
                return <ShoppingCart className="w-5 h-5 text-green-500" />;
            case 'royalty':
                return <TrendingUp className="w-5 h-5 text-purple-500" />;
            case 'cancel':
                return <XIcon className="w-5 h-5 text-grey-500" />;
        }
    };

    const getEventTitle = (event: MarketplaceEvent) => {
        switch (event.type) {
            case 'mint':
                return 'NFT Minted';
            case 'list':
                return 'Listed for Sale';
            case 'buy':
                return 'NFT Purchased';
            case 'royalty':
                return 'Royalty Paid';
            case 'cancel':
                return 'Listing Cancelled';
        }
    };

    const getEventDescription = (event: MarketplaceEvent) => {
        switch (event.type) {
            case 'mint':
                return `${formatAddress(event.from)} minted ${event.tokenName}`;
            case 'list':
                return `${formatAddress(event.from)} listed for ${event.price} APT`;
            case 'buy':
                return `${formatAddress(event.from)} purchased an NFT`;
            case 'royalty':
                return `${event.royaltyAmount} APT royalty paid`;
            case 'cancel':
                return `${formatAddress(event.from)} cancelled listing`;
        }
    };

    if (loading) {
        return (
            <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-grey-500 dark:text-grey-400 animate-spin" />
                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100">Loading Activity...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                <p className="text-grey-600 dark:text-grey-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="card-flat-white dark:bg-grey-900 rounded-xl border border-grey-200 dark:border-grey-700 overflow-hidden">
            {/* Header with Notifications */}
            <div className="p-6 border-b border-grey-200 dark:border-grey-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100">Recent Transactions</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-grey-500 dark:text-grey-500 font-mono">
                            LIVE • Updates every 30s
                        </span>
                        <NotificationCenter
                            events={notifications}
                            onDismiss={(index) => setNotifications(prev => prev.filter((_, i) => i !== index))}
                            onClearAll={() => setNotifications([])}
                        />
                    </div>
                </div>

                {/* Search and Sort Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400 dark:text-grey-500" />
                        <input
                            type="text"
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            placeholder="Search by address (0x...)"
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-sm text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all"
                        />
                        {searchAddress && (
                            <button
                                onClick={() => setSearchAddress('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600 dark:hover:text-grey-300"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-700 rounded-lg text-sm font-medium text-grey-700 dark:text-grey-200 hover:border-grey-300 dark:hover:border-grey-600 transition-all shadow-sm"
                    >
                        <Clock className="w-4 h-4 text-aptos-green" />
                        {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </button>
                </div>
            </div>

            {/* Events List */}
            {currentEvents.length === 0 ? (
                <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-grey-300 dark:text-grey-600 mx-auto mb-3" />
                    <p className="text-grey-600 dark:text-grey-400">
                        {searchAddress ? 'No transactions found for this address' : 'No recent activity'}
                    </p>
                    {searchAddress && (
                        <button
                            onClick={() => setSearchAddress('')}
                            className="text-sm text-aptos-green hover:text-aptos-green-dark mt-2"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="divide-y divide-grey-200 dark:divide-grey-700">
                        {currentEvents.map((event, index) => (
                            <div
                                key={`${event.hash}-${index}`}
                                className="p-4 hover:bg-grey-50 dark:hover:bg-grey-800 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 p-2 bg-grey-100 dark:bg-grey-800 rounded-lg">
                                        {getEventIcon(event.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold text-grey-900 dark:text-grey-100">
                                                    {getEventTitle(event)}
                                                </p>
                                                <p className="text-xs text-grey-600 dark:text-grey-400 mt-1">
                                                    {getEventDescription(event)}
                                                </p>
                                            </div>
                                            <span className="text-xs text-grey-500 dark:text-grey-500 font-mono whitespace-nowrap">
                                                {formatTimeAgo(event.timestamp)}
                                            </span>
                                        </div>

                                        {/* Transaction Hash Link */}
                                        <a
                                            href={getExplorerUrl(event.hash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 mt-2 text-xs text-aptos-green hover:text-aptos-green-dark transition-colors"
                                        >
                                            <span className="font-mono">{formatAddress(event.hash)}</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-grey-50 dark:bg-grey-800 border-t border-grey-200 dark:border-grey-700">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-grey-600 dark:text-grey-400">
                                    Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg hover:bg-grey-200 dark:hover:bg-grey-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-grey-700 dark:text-grey-300" />
                                    </button>

                                    <span className="text-sm text-grey-700 dark:text-grey-300 font-mono">
                                        {currentPage} / {totalPages}
                                    </span>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg hover:bg-grey-200 dark:hover:bg-grey-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-grey-700 dark:text-grey-300" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

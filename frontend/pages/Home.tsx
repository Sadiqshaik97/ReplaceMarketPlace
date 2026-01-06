import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ListingCard } from '../components/ListingCard';
import { RecentActivity } from '../components/RecentActivity';
import { useGetListings } from '../hooks/useGetListings';
import { MODULE_ADDRESS } from '../utils/contract';


export function Home() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');

    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('recent');
    const [showExpired, setShowExpired] = React.useState(false);

    const { data: allListings = [], isLoading, refetch, isError } = useGetListings();

    const categories = [
        { value: 'all', label: 'All Bookings' },
        { value: 'hotel', label: 'Hotels' },
        { value: 'event', label: 'Events' },
        { value: 'train', label: 'Trains' },
        { value: 'movie', label: 'Movies' },
    ];

    const sortOptions = [
        { value: 'recent', label: 'Recently Listed' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'date-soon', label: 'Checking-in Soon' },
    ];

    // Filter and Sort Logic
    const filteredAndSortedListings = React.useMemo(() => {
        let result = [...allListings];

        // 1. Filter by Search Query
        if (searchQuery) {
            result = result.filter((listing) =>
                listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Filter by Category
        if (selectedCategory !== 'all') {
            result = result.filter((listing) =>
                listing.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // 3. Filter by Expired Status
        if (!showExpired) {
            result = result.filter((listing) => {
                const isExpired = listing.checkOutTimestamp ? (Date.now() / 1000) > listing.checkOutTimestamp : false;
                return !isExpired;
            });
        }

        // 4. Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.resalePrice - b.resalePrice;
                case 'price-high':
                    return b.resalePrice - a.resalePrice;
                case 'date-soon':
                    return (a.checkIn || '').localeCompare(b.checkIn || '');
                case 'recent':
                default:
                    return parseInt(b.id) - parseInt(a.id);
            }
        });

        return result;
    }, [allListings, searchQuery, selectedCategory, showExpired, sortBy]);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="pt-32 pb-24 section-padding content-layer">
                <div className="container mx-auto">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold bracket-text text-grey-900 dark:text-grey-100 leading-tight">
                            [ RESELL BOOKINGS.<br />EARN FOREVER. ]
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-grey-600 dark:text-grey-400 max-w-3xl mx-auto leading-relaxed px-4">
                            Turn your hotel rooms, event tickets, and travel bookings into tradeable NFTs.
                            Original buyers earn <span className="font-semibold text-grey-900 dark:text-grey-100">perpetual royalties</span> on every resale.
                        </p>
                        <div className="pt-4">
                            <a href="#marketplace" className="btn-aptos-lg">
                                Explore Marketplace
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="section-padding bg-grey-50 dark:bg-grey-800 content-layer border-y border-grey-100 dark:border-grey-700/50">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                        <div className="text-center card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-100 dark:border-grey-800">
                            <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-1">5-10%</p>
                            <p className="text-grey-600 dark:text-grey-400 text-xs font-mono">PERPETUAL ROYALTY</p>
                        </div>
                        <div className="text-center card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-100 dark:border-grey-800">
                            <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-1">100%</p>
                            <p className="text-grey-600 dark:text-grey-400 text-xs font-mono">SECURE ON APTOS</p>
                        </div>
                        <div className="text-center card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-100 dark:border-grey-800">
                            <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-1">∞</p>
                            <p className="text-grey-600 dark:text-grey-400 text-xs font-mono">LIFETIME EARNINGS</p>
                        </div>
                        <div className="text-center card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-100 dark:border-grey-800">
                            <p className="text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-1">0</p>
                            <p className="text-grey-600 dark:text-grey-400 text-xs font-mono">PLATFORM FEES</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marketplace Section */}
            <section id="marketplace" className="section-padding content-layer">
                <div className="container mx-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold bracket-text text-grey-900 dark:text-grey-100 mb-3">
                            [ MARKETPLACE ]
                        </h2>
                        <p className="text-grey-600 dark:text-grey-400 text-base mb-8">
                            Discover and trade premium booking NFTs
                        </p>

                        <div className="space-y-6">
                            {/* Search and Sort Row */}
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-400 dark:text-grey-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by title, location, or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-grey-900 border border-grey-200 dark:border-grey-700 rounded-xl text-grey-900 dark:text-grey-100 placeholder-grey-400 dark:placeholder-grey-500 focus:outline-none focus:ring-2 focus:ring-aptos-green focus:border-aptos-green transition-all shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-3.5 bg-white dark:bg-grey-900 border border-grey-200 dark:border-grey-700 rounded-xl text-sm font-medium text-grey-700 dark:text-grey-200 focus:outline-none focus:ring-2 focus:ring-aptos-green transition-all cursor-pointer shadow-sm"
                                    >
                                        {sortOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => setShowExpired(!showExpired)}
                                        className={`px-4 py-3.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${showExpired
                                            ? 'bg-aptos-green/10 border-aptos-green text-aptos-green'
                                            : 'bg-white dark:bg-grey-900 border-grey-200 dark:border-grey-700 text-grey-600 dark:text-grey-400 hover:border-grey-300'
                                            }`}
                                    >
                                        {showExpired ? 'Showing Expired' : 'Hide Expired'}
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter Chips */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCategory(cat.value)}
                                        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === cat.value
                                            ? 'bg-grey-900 dark:bg-grey-100 text-white dark:text-grey-900 border-grey-900 dark:border-grey-100'
                                            : 'bg-white dark:bg-grey-900 text-grey-600 dark:text-grey-400 border-grey-200 dark:border-grey-700 hover:border-grey-300 dark:hover:border-grey-600'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* Listings Grid */}
                    {isLoading ? (
                        <div className="text-center py-24">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-grey-200 dark:border-grey-700 border-t-aptos-green"></div>
                            <p className="text-grey-600 dark:text-grey-400 mt-4 font-display">Loading listings from blockchain...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-20 card-flat-white dark:bg-grey-800 rounded-2xl border border-grey-100 dark:border-grey-700">
                            <p className="text-yellow-600 dark:text-yellow-400 text-lg mb-4 font-semibold">⚠️ Indexer Rate Limit</p>
                            <p className="text-grey-600 dark:text-grey-400 mb-6 max-w-md mx-auto">
                                The Aptos Indexer is temporarily busy. Your NFTs are safe! Please wait a moment and try again.
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="btn-aptos-lg"
                            >
                                🔄 Retry Loading
                            </button>
                        </div>
                    ) : filteredAndSortedListings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredAndSortedListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    onClick={() => navigate(`/product/${listing.id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 card-flat-white dark:bg-grey-800/50 rounded-2xl border border-dashed border-grey-200 dark:border-grey-700">
                            <Search className="w-16 h-16 text-grey-300 dark:text-grey-600 mx-auto mb-4" />
                            <p className="text-grey-600 dark:text-grey-400 text-lg font-display">No listings match your criteria.</p>
                            <p className="text-grey-500 dark:text-grey-500 text-sm mt-2">Try adjusting your filters or search query.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                    setShowExpired(false);
                                }}
                                className="text-aptos-green hover:underline mt-4 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Activity Section at Bottom */}
            <section className="section-padding bg-grey-50 dark:bg-grey-800 content-layer border-t border-grey-100 dark:border-grey-700/50">
                <div className="container mx-auto">
                    <RecentActivity
                        contractAddress={MODULE_ADDRESS}
                        limit={50}
                    />

                </div>
            </section>
        </div>
    );
}

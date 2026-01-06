import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, Hotel } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { WalletButton } from './WalletButton';
import { HamburgerMenu } from './HamburgerMenu';
import { BackToTop } from './BackToTop';
import { NotificationCenter } from './NotificationCenter';
import { fetchMarketplaceEvents, MarketplaceEvent } from '../services/transactions';

export function Layout() {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<MarketplaceEvent[]>([]);
    const [lastEventHash, setLastEventHash] = React.useState<string | null>(null);
    const location = useLocation();

    // Fetch notifications globally
    React.useEffect(() => {
        async function loadNotifications() {
            try {
                const events = await fetchMarketplaceEvents('0x1', 20);

                // Check for new events
                if (events.length > 0 && lastEventHash && events[0].hash !== lastEventHash) {
                    const newEvents = events.filter(e => {
                        const lastIndex = notifications.findIndex(n => n.hash === lastEventHash);
                        return lastIndex === -1 || events.indexOf(e) < lastIndex;
                    });

                    if (newEvents.length > 0) {
                        setNotifications(prev => [...newEvents, ...prev].slice(0, 10));
                    }
                } else if (!lastEventHash && events.length > 0) {
                    // Initial load - don't show as notifications
                    setLastEventHash(events[0].hash);
                }

                if (events.length > 0 && events[0].hash !== lastEventHash) {
                    setLastEventHash(events[0].hash);
                }
            } catch (error) {
                console.error('Failed to load notifications:', error);
            }
        }

        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [lastEventHash]);
    // Removed isHomePage as it's no longer used

    // Removed useEffect for fetching notifications

    return (
        <div className="min-h-screen bg-white dark:bg-grey-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-grey-900/80 backdrop-blur-md border-b border-grey-200 dark:border-grey-800 content-layer shadow-sm">
                <div className="container mx-auto h-16 flex items-center justify-between px-4">
                    {/* Logo & Navigation */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-aptos-green rounded-lg flex items-center justify-center flex-shrink-0">
                                <Hotel className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                            </div>
                            <span className="text-sm sm:text-base md:text-lg font-black tracking-tighter text-grey-900 dark:text-grey-100 uppercase whitespace-nowrap">
                                [ ResaleMarket ]
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className={`text-sm font-semibold hover:text-aptos-green transition-colors ${location.pathname === '/' ? 'text-aptos-green' : 'text-grey-600 dark:text-grey-400'}`}>
                                Marketplace
                            </Link>
                            <Link to="/mint-nft" className={`text-sm font-semibold hover:text-aptos-green transition-colors ${location.pathname === '/mint-nft' ? 'text-aptos-green' : 'text-grey-600 dark:text-grey-400'}`}>
                                Mint NFT
                            </Link>
                            <Link to="/my-collection" className={`text-sm font-semibold hover:text-aptos-green transition-colors ${location.pathname === '/my-collection' ? 'text-aptos-green' : 'text-grey-600 dark:text-grey-400'}`}>
                                My Collection
                            </Link>
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <WalletButton />
                        <NotificationCenter
                            events={notifications}
                            onDismiss={(index) => setNotifications(prev => prev.filter((_, i) => i !== index))}
                            onClearAll={() => setNotifications([])}
                        />
                        <ThemeToggle />
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-1.5 sm:p-2 hover:bg-grey-100 dark:hover:bg-grey-800 rounded-lg transition-colors"
                            aria-label="Open Menu"
                        >
                            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-grey-900 dark:text-grey-100" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hamburger Menu */}
            <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Main Content */}
            <main className="pt-16">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-grey-200 dark:border-grey-800 content-layer">
                <div className="container mx-auto text-center">
                    <p className="text-grey-600 dark:text-grey-400 text-xs">
                        © 2026 ResaleMarket. Built on <span className="font-semibold">Aptos</span>.
                    </p>
                </div>
            </footer>

            {/* Back to Top */}
            <BackToTop />
        </div>
    );
}

import { X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { WalletButton } from './WalletButton';

interface HamburgerMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
    const location = useLocation();

    if (!isOpen) return null;

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-menu-fade"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-[400px] bg-white dark:bg-grey-900 z-[101] animate-slide-in shadow-2xl border-l border-grey-200 dark:border-grey-800">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-grey-200 dark:border-grey-800">
                        <span className="text-xl font-display font-bold bracket-text text-grey-900 dark:text-grey-100">[ MENU ]</span>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-grey-100 dark:hover:bg-grey-800 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-grey-900 dark:text-grey-100" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-6 space-y-2">
                        <Link
                            to="/"
                            onClick={onClose}
                            className={`block w-full text-left px-4 py-4 text-lg font-medium rounded-lg transition-colors ${isActive('/')
                                ? 'bg-aptos-green/10 text-aptos-green'
                                : 'text-grey-900 dark:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800'
                                }`}
                        >
                            Marketplace
                        </Link>
                        <Link
                            to="/mint-nft"
                            onClick={onClose}
                            className={`block w-full text-left px-4 py-4 text-lg font-medium rounded-lg transition-colors ${isActive('/mint-nft')
                                ? 'bg-aptos-green/10 text-aptos-green'
                                : 'text-grey-900 dark:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800'
                                }`}
                        >
                            Mint NFT
                        </Link>
                        <Link
                            to="/my-collection"
                            onClick={onClose}
                            className={`block w-full text-left px-4 py-4 text-lg font-medium rounded-lg transition-colors ${isActive('/my-collection')
                                ? 'bg-aptos-green/10 text-aptos-green'
                                : 'text-grey-900 dark:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800'
                                }`}
                        >
                            My Collection
                        </Link>
                        <Link
                            to="/how-it-works"
                            onClick={onClose}
                            className={`block w-full text-left px-4 py-4 text-lg font-medium rounded-lg transition-colors ${isActive('/how-it-works')
                                ? 'bg-aptos-green/10 text-aptos-green'
                                : 'text-grey-900 dark:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800'
                                }`}
                        >
                            How It Works
                        </Link>
                    </nav>

                    {/* Wallet Button */}
                    <div className="p-6 border-t border-grey-200 dark:border-grey-800">
                        <WalletButton />
                    </div>
                </div>
            </div>
        </>
    );
}

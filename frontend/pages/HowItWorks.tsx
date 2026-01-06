import { Sparkles, Shield, TrendingUp, Zap, HelpCircle, CheckCircle } from 'lucide-react';

export function HowItWorks() {
    return (
        <div className="min-h-screen pt-24 section-padding content-layer">
            <div className="container mx-auto max-w-5xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold bracket-text text-grey-900 dark:text-grey-100 mb-4">
                        [ HOW IT WORKS ]
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-grey-600 dark:text-grey-400 max-w-3xl mx-auto px-4">
                        Learn how ResaleMarket revolutionizes booking resales with NFTs and perpetual royalties
                    </p>
                </div>

                {/* What is ResaleMarket */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-6">
                        What is ResaleMarket?
                    </h2>
                    <div className="card-flat-white dark:bg-grey-900 p-8 rounded-xl border border-grey-200 dark:border-grey-700">
                        <p className="text-grey-700 dark:text-grey-300 leading-relaxed mb-4">
                            ResaleMarket is a decentralized marketplace built on the Aptos blockchain that transforms hotel bookings, event tickets, and travel reservations into tradeable NFTs (Non-Fungible Tokens).
                        </p>
                        <p className="text-grey-700 dark:text-grey-300 leading-relaxed mb-4">
                            <strong className="text-grey-900 dark:text-grey-100">The Problem:</strong> Traditional booking platforms don't allow you to resell your reservations easily, and if you can, you don't benefit from future resales.
                        </p>
                        <p className="text-grey-700 dark:text-grey-300 leading-relaxed">
                            <strong className="text-grey-900 dark:text-grey-100">Our Solution:</strong> Every booking becomes an NFT with built-in perpetual royalties. Original buyers earn 5-10% on EVERY future resale - automatically and forever.
                        </p>
                    </div>
                </section>

                {/* How It Works Steps */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-8 text-center">
                        Three Simple Steps
                    </h2>

                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="card-flat-white dark:bg-grey-900 p-8 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-aptos-green/10 rounded-xl flex items-center justify-center">
                                        <span className="text-3xl font-display font-bold text-aptos-green">1</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-grey-900 dark:text-grey-100 mb-3">Mint Your Booking as NFT</h3>
                                    <p className="text-grey-700 dark:text-grey-300 leading-relaxed mb-4">
                                        When you create a booking (hotel, event, travel), it's automatically minted as a unique NFT on the Aptos blockchain. You set the royalty percentage (5-10%) that you'll earn on all future resales.
                                    </p>
                                    <div className="bg-grey-50 dark:bg-grey-800 p-4 rounded-lg">
                                        <p className="text-sm text-grey-600 dark:text-grey-400 font-mono">
                                            <strong className="text-grey-900 dark:text-grey-100">Example:</strong> Book a hotel room for 100 APT → NFT minted with 10% royalty
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="card-flat-white dark:bg-grey-900 p-8 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                        <span className="text-3xl font-display font-bold text-blue-500">2</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-grey-900 dark:text-grey-100 mb-3">List & Trade on Marketplace</h3>
                                    <p className="text-grey-700 dark:text-grey-300 leading-relaxed mb-4">
                                        List your booking NFT for resale at any price you choose. Buyers can purchase directly on the blockchain with instant, secure transactions. No middlemen, no platform fees.
                                    </p>
                                    <div className="bg-grey-50 dark:bg-grey-800 p-4 rounded-lg">
                                        <p className="text-sm text-grey-600 dark:text-grey-400 font-mono">
                                            <strong className="text-grey-900 dark:text-grey-100">Example:</strong> List your 100 APT booking for 90 APT → Buyer pays 90 APT → You receive 81 APT (90% after 10% royalty to original buyer)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="card-flat-white dark:bg-grey-900 p-8 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center">
                                        <span className="text-3xl font-display font-bold text-green-500">3</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-grey-900 dark:text-grey-100 mb-3">Earn Perpetual Royalties</h3>
                                    <p className="text-grey-700 dark:text-grey-300 leading-relaxed mb-4">
                                        As the original buyer, you automatically earn your set royalty percentage on EVERY future resale of your booking NFT. The smart contract handles everything - no manual claims needed.
                                    </p>
                                    <div className="bg-grey-50 dark:bg-grey-800 p-4 rounded-lg">
                                        <p className="text-sm text-grey-600 dark:text-grey-400 font-mono">
                                            <strong className="text-grey-900 dark:text-grey-100">Example:</strong> Your NFT resells 5 times at 90 APT each → You earn 9 APT per sale → Total: 45 APT in passive royalties!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Features */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-8 text-center">
                        Key Features
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-aptos-green/10 rounded-lg">
                                    <Sparkles className="w-6 h-6 text-aptos-green" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">Perpetual Royalties</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">Earn 5-10% on every future resale, automatically and forever</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <Shield className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">Blockchain Security</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">Built on Aptos for fast, secure, and transparent transactions</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <Zap className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">Zero Platform Fees</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">No hidden costs - only blockchain gas fees apply</p>
                                </div>
                            </div>
                        </div>

                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">Instant Settlements</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">Smart contracts ensure immediate, trustless transactions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-8 text-center">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4">
                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <HelpCircle className="w-5 h-5 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">What is an NFT?</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400 leading-relaxed">
                                        NFT stands for Non-Fungible Token. It's a unique digital asset stored on the blockchain that represents ownership of something - in our case, your booking reservation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <HelpCircle className="w-5 h-5 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">How do royalties work?</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400 leading-relaxed">
                                        When you create a booking NFT, you set a royalty percentage (5-10%). Every time that NFT is resold, the smart contract automatically sends you that percentage of the sale price. This continues forever, on every future sale.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <HelpCircle className="w-5 h-5 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">Do I need a crypto wallet?</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400 leading-relaxed">
                                        Yes, you need an Aptos-compatible wallet like Petra or Martian to buy, sell, and manage your booking NFTs. Click "Connect Wallet" in the header to get started.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-flat-white dark:bg-grey-900 p-6 rounded-xl border border-grey-200 dark:border-grey-700">
                            <div className="flex items-start gap-4">
                                <HelpCircle className="w-5 h-5 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-grey-900 dark:text-grey-100 mb-2">Are there any fees?</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400 leading-relaxed">
                                        ResaleMarket charges ZERO platform fees. You only pay standard Aptos blockchain gas fees for transactions, which are typically very low (fractions of a cent).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Getting Started */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-grey-900 dark:text-grey-100 mb-8 text-center">
                        Getting Started Checklist
                    </h2>

                    <div className="card-flat-white dark:bg-grey-900 p-8 rounded-xl border border-grey-200 dark:border-grey-700">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-6 h-6 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-base font-bold text-grey-900 dark:text-grey-100 mb-1">1. Install a Wallet</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">Download Petra or Martian wallet extension for your browser</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-6 h-6 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-base font-bold text-grey-900 dark:text-grey-100 mb-1">2. Connect Your Wallet</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">Click "Connect Wallet" in the header and follow the prompts</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-6 h-6 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-base font-bold text-grey-900 dark:text-grey-100 mb-1">3. Browse the Marketplace</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">Explore available booking NFTs and find one you like</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-6 h-6 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-base font-bold text-grey-900 dark:text-grey-100 mb-1">4. Make Your First Purchase</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">Click "Buy Now" and approve the transaction in your wallet</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-6 h-6 text-aptos-green flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-base font-bold text-grey-900 dark:text-grey-100 mb-1">5. Start Earning</h3>
                                    <p className="text-sm text-grey-600 dark:text-grey-400">List your NFTs for resale and watch the royalties roll in!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <a href="/" className="btn-aptos-lg">
                        Start Exploring Marketplace
                    </a>
                </div>
            </div>
        </div>
    );
}

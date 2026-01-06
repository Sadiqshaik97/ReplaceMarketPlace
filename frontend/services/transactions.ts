import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

export interface Transaction {
    hash: string;
    sender: string;
    type: string;
    success: boolean;
    timestamp: number;
    version: number;
    gas_used: number;
    function?: string;
    arguments?: any[];
}

export interface MarketplaceEvent {
    type: 'mint' | 'list' | 'buy' | 'royalty' | 'cancel';
    hash: string;
    timestamp: number;
    from: string;
    to?: string;
    amount?: number;
    tokenName?: string;
    price?: number;
    royaltyAmount?: number;
}

// Fetch recent transactions for a specific address
export async function fetchRecentTransactions(
    address: string,
    limit: number = 10
): Promise<Transaction[]> {
    try {
        const transactions = await aptos.getAccountTransactions({
            accountAddress: address,
            options: {
                limit,
            },
        });

        return transactions.map((tx: any) => ({
            hash: tx.hash,
            sender: tx.sender,
            type: tx.type,
            success: tx.success,
            timestamp: parseInt(tx.timestamp) / 1000000, // Convert to seconds
            version: parseInt(tx.version),
            gas_used: parseInt(tx.gas_used || 0),
            function: tx.payload?.function,
            arguments: tx.payload?.arguments,
        }));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

// Fetch marketplace-specific events
export async function fetchMarketplaceEvents(
    contractAddress: string,
    limit: number = 20
): Promise<MarketplaceEvent[]> {
    try {
        const transactions = await fetchRecentTransactions(contractAddress, limit);

        const events: MarketplaceEvent[] = [];

        for (const tx of transactions) {
            if (!tx.function || !tx.success) continue;

            const functionName = tx.function.split('::').pop();

            switch (functionName) {
                case 'mint_booking':
                    events.push({
                        type: 'mint',
                        hash: tx.hash,
                        timestamp: tx.timestamp,
                        from: tx.sender,
                        to: tx.arguments?.[0],
                        tokenName: `Booking #${events.filter(e => e.type === 'mint').length + 1}`,
                        price: tx.arguments?.[2] ? parseInt(tx.arguments[2]) / 100000000 : 0,
                    });
                    break;

                case 'list_for_resale':
                    events.push({
                        type: 'list',
                        hash: tx.hash,
                        timestamp: tx.timestamp,
                        from: tx.sender,
                        price: tx.arguments?.[1] ? parseInt(tx.arguments[1]) / 100000000 : 0,
                    });
                    break;

                case 'buy_resale':
                    events.push({
                        type: 'buy',
                        hash: tx.hash,
                        timestamp: tx.timestamp,
                        from: tx.sender,
                    });
                    break;

                case 'cancel_listing':
                    events.push({
                        type: 'cancel',
                        hash: tx.hash,
                        timestamp: tx.timestamp,
                        from: tx.sender,
                    });
                    break;
            }
        }

        return events;
    } catch (error) {
        console.error('Error fetching marketplace events:', error);
        return [];
    }
}

// Format address for display (0x1234...5678)
export function formatAddress(address: string): string {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format timestamp to relative time (e.g., "2 hours ago")
export function formatTimeAgo(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
}

// Get Aptos Explorer URL for transaction
export function getExplorerUrl(hash: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
    return `https://explorer.aptoslabs.com/txn/${hash}?network=${network}`;
}

// Smart contract integration utilities
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

// Your deployed contract address
export const MODULE_ADDRESS = '0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088';
export const MODULE_NAME = 'resale_marketplace_v3';

// Convert APT to octas (1 APT = 100,000,000 octas)
export function aptToOctas(apt: number): number {
    return Math.floor(apt * 100_000_000);
}

// Convert octas to APT
export function octasToApt(octas: number): number {
    return octas / 100_000_000;
}

// Format address for display
export function formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

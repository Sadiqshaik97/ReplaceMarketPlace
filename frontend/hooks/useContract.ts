import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos, MODULE_ADDRESS, MODULE_NAME, aptToOctas } from '../utils/contract';

export function useBuyNFT() {
    const { account, signAndSubmitTransaction } = useWallet();

    const buyNFT = async (tokenAddress: string, _price: number) => {
        if (!account) {
            throw new Error('Please connect your wallet first');
        }

        try {
            console.log('🚀 [DEBUG] Initiating buy_resale with:', {
                tokenAddress,
                price: _price,
                buyer: account.address.toString()
            });

            // Build the transaction payload using modern SDK format
            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::buy_resale` as any,
                    typeArguments: [],
                    functionArguments: [tokenAddress],
                },
            });

            console.log('✅ [DEBUG] Transaction submitted:', response.hash);

            // Wait for transaction confirmation
            await aptos.waitForTransaction({ transactionHash: response.hash });

            return response;
        } catch (error: any) {
            console.error('❌ [DEBUG] Error buying NFT:', error);
            // Re-throw with more context if it's a simulation error
            if (error?.message?.includes('Simulation')) {
                console.error('📋 [DEBUG] Full simulation error details:', JSON.stringify(error, null, 2));
            }
            throw error;
        }
    };

    return { buyNFT };
}

export function useListNFT() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [isListing, setIsListing] = useState(false);

    const listNFT = async (tokenAddress: string, priceInAPT: number) => {
        if (!account) {
            throw new Error('Please connect your wallet first');
        }

        setIsListing(true);
        try {
            const priceInOctas = aptToOctas(priceInAPT);

            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::list_for_resale` as any,
                    typeArguments: [],
                    functionArguments: [tokenAddress, priceInOctas.toString()],
                },
            });
            await aptos.waitForTransaction({ transactionHash: response.hash });

            return response;
        } catch (error) {
            console.error('Error listing NFT:', error);
            throw error;
        } finally {
            setIsListing(false);
        }
    };

    return { listNFT, isListing };
}

export function useCancelListing() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [isCancelling, setIsCancelling] = useState(false);

    const cancelListing = async (tokenAddress: string) => {
        if (!account) {
            throw new Error('Please connect your wallet first');
        }

        setIsCancelling(true);
        try {
            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::cancel_listing` as any,
                    typeArguments: [],
                    functionArguments: [tokenAddress],
                },
            });
            await aptos.waitForTransaction({ transactionHash: response.hash });
            return response;
        } catch (error) {
            console.error('Error cancelling listing:', error);
            throw error;
        } finally {
            setIsCancelling(false);
        }
    };

    return { cancelListing, isCancelling };
}

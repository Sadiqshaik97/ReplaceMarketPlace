import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos, MODULE_ADDRESS, MODULE_NAME, octasToApt } from '../utils/contract';
import { Listing } from '../types';

/**
 * Hook to fetch all NFTs owned by the connected wallet
 * Queries the contract directly to avoid indexer rate limits
 */
export function useGetUserNFTs() {
    const { account } = useWallet();

    return useQuery({
        queryKey: ['userNFTs', account?.address],
        queryFn: async (): Promise<Listing[]> => {
            if (!account?.address) return [];

            try {
                console.log('🔍 [DIRECT] Fetching user NFTs for:', account.address);

                // Step 1: Get all minted tokens from the contract
                const mintedTokensResponse = await aptos.view({
                    payload: {
                        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_all_minted_tokens`,
                        typeArguments: [],
                        functionArguments: [],
                    },
                });

                const allMintedTokens = mintedTokensResponse[0] as string[];
                console.log('📦 [DIRECT] Total minted tokens:', allMintedTokens.length);

                if (allMintedTokens.length === 0) return [];

                // Step 2: Fetch details and check ownership in parallel
                const fetchPromises = allMintedTokens.map(async (tokenAddress) => {
                    try {
                        const listingData = await aptos.view({
                            payload: {
                                function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_listing`,
                                typeArguments: [],
                                functionArguments: [tokenAddress],
                            },
                        });

                        const [isActive, owner, price, originalBuyer, royaltyNumerator] = listingData as any[];

                        // Case-insensitive ownership check
                        if (owner.toString().toLowerCase() !== (account.address as any).toString().toLowerCase()) {
                            return null;
                        }

                        // Fetch metadata for user-owned tokens
                        const metadataData = await aptos.view({
                            payload: {
                                function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_booking_metadata`,
                                typeArguments: [],
                                functionArguments: [tokenAddress],
                            },
                        });

                        const [
                            originalPrice,
                            ,
                            uri,
                            resaleCount,
                            name,
                            description,
                            category,
                            location,
                            checkIn,
                            checkOut,
                            guests,
                            checkOutTimestamp
                        ] = metadataData as any[];

                        return {
                            id: tokenAddress,
                            title: name || 'Booking NFT',
                            description: description || '',
                            image: uri,
                            category: category || 'hotel',
                            location: location || 'Aptos',
                            checkIn: checkIn || '',
                            checkOut: checkOut || '',
                            guests: Number(guests) || 0,
                            originalPrice: octasToApt(Number(originalPrice)),
                            resalePrice: octasToApt(Number(price)),
                            royaltyPercentage: Number(royaltyNumerator) / 100,
                            seller: owner,
                            originalBuyer: originalBuyer,
                            owner: owner,
                            resaleCount: Number(resaleCount) || 0,
                            isListed: isActive,
                            date: checkIn ? `${checkIn} - ${checkOut}` : '',
                            checkOutTimestamp: Number(checkOutTimestamp) || 0,
                        } as Listing;
                    } catch (err) {
                        console.error(`❌ Detail fetch failed for user token ${tokenAddress}:`, err);
                        return null;
                    }
                });

                const results = await Promise.all(fetchPromises);
                return results.filter((l): l is Listing => l !== null);

            } catch (error) {
                console.error('❌ Error in useGetUserNFTs:', error);
                return [];
            }
        },
        refetchInterval: 60000,
        staleTime: 30000,
        enabled: !!account?.address,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

/**
 * Hook to get stats about user's NFT collection
 */
export function useGetUserStats() {
    const { data: nfts = [], isLoading } = useGetUserNFTs();

    const stats = {
        totalNFTs: nfts.length,
        totalValue: nfts.reduce((sum, nft) => sum + (nft.originalPrice || 0), 0),
        activeListings: nfts.filter((nft) => nft.isListed).length,
        totalRoyalties: 0,
    };

    return { stats, isLoading };
}

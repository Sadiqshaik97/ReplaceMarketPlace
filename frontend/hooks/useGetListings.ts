import { useQuery } from '@tanstack/react-query';
import { aptos, MODULE_ADDRESS, MODULE_NAME, octasToApt } from '../utils/contract';
import { Listing } from '../types';

/**
 * Hook to fetch all active listings from the blockchain
 * Queries the contract directly to avoid indexer rate limits
 */
export function useGetListings() {
    return useQuery({
        queryKey: ['listings', MODULE_ADDRESS],
        queryFn: async (): Promise<Listing[]> => {
            try {
                console.log('🔍 [DIRECT] Fetching marketplace listings...');

                // Step 1: Get all active listing addresses directly from the contract
                let activeAddresses: string[] = [];
                try {
                    const response = await aptos.view({
                        payload: {
                            function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_active_listings`,
                            typeArguments: [],
                            functionArguments: [],
                        },
                    });
                    activeAddresses = response[0] as string[];
                    console.log('🎯 [DIRECT] Found active listings:', activeAddresses.length);
                } catch (viewError) {
                    console.warn('⚠️ [DIRECT] get_active_listings failed (standard if not redeployed yet):', viewError);
                    return [];
                }

                if (activeAddresses.length === 0) return [];

                // Step 2: Fetch details for each in parallel
                const fetchPromises = activeAddresses.map(async (tokenAddress) => {
                    try {
                        const [listingData, metadataData] = await Promise.all([
                            aptos.view({
                                payload: {
                                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_listing`,
                                    typeArguments: [],
                                    functionArguments: [tokenAddress],
                                },
                            }),
                            aptos.view({
                                payload: {
                                    function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_booking_metadata`,
                                    typeArguments: [],
                                    functionArguments: [tokenAddress],
                                },
                            })
                        ]);

                        const [isActive, owner, price, originalBuyer, royaltyNumerator] = listingData as any[];
                        if (!isActive) return null;

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
                        console.error(`❌ Detail fetch failed for ${tokenAddress}:`, err);
                        return null;
                    }
                });

                const results = await Promise.all(fetchPromises);
                return results.filter((l): l is Listing => l !== null);

            } catch (error) {
                console.error('❌ Error in useGetListings:', error);
                return [];
            }
        },
        refetchInterval: 120000,
        staleTime: 60000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(5000 * 2 ** attemptIndex, 60000),
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to get listing details for a specific token
 */
export function useGetListing(tokenAddress: string | undefined) {
    return useQuery({
        queryKey: ['listing', tokenAddress],
        queryFn: async (): Promise<Listing | null> => {
            if (!tokenAddress) return null;
            try {
                const [listingData, metadataData] = await Promise.all([
                    aptos.view({
                        payload: {
                            function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_listing`,
                            typeArguments: [],
                            functionArguments: [tokenAddress],
                        },
                    }),
                    aptos.view({
                        payload: {
                            function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_booking_metadata`,
                            typeArguments: [],
                            functionArguments: [tokenAddress],
                        },
                    })
                ]);

                const [isActive, owner, price, originalBuyer, royaltyNumerator] = listingData as any[];
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
                    isListed: isActive,
                    date: checkIn ? `${checkIn} - ${checkOut}` : '',
                    checkOutTimestamp: Number(checkOutTimestamp) || 0,
                } as Listing;
            } catch (error) {
                console.error('Error fetching listing details:', error);
                return null;
            }
        },
        enabled: !!tokenAddress,
    });
}

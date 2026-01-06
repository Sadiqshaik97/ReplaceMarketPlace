export interface Listing {
    id: string;
    title: string;
    category: 'hotel' | 'event' | 'train' | 'movie';
    location: string;
    description: string;
    image: string;
    originalPrice: number; // in APT
    resalePrice: number; // in APT
    royaltyPercentage: number;
    seller: string;
    originalBuyer: string;
    owner: string;
    resaleCount: number;
    isListed: boolean;
    date?: string;
    checkIn?: string;
    checkOut?: string;
    checkOutTimestamp?: number;
    guests?: number;
}

export interface UserBooking extends Listing {
    tokenId: string;
    purchaseDate: string;
}

export type Category = 'all' | 'hotel' | 'event' | 'train' | 'movie';

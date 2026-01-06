/// ResaleMarketplace: A decentralized secondary market for bookable items
/// 
/// This module enables users to:
/// - Mint bookings as NFTs with perpetual royalties to the original buyer
/// - List NFTs for resale at any price
/// - Buy NFTs with automatic royalty enforcement
/// - Query active listings
///
/// Key Features:
/// - Uses Aptos Token Standard V2 with built-in royalty support
/// - Original buyer receives royalties on ALL future resales forever
/// - Secure ownership verification and transfer mechanisms
/// - Event-driven architecture for tracking all marketplace activities

module marketplace_addr::resale_marketplace_v3 {
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::object::{Self, Object, ExtendRef, TransferRef};
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::royalty;
    use aptos_framework::aptos_account;

    // ================================= Errors ================================= //
    
    /// Caller is not the owner of the token
    const ENOT_OWNER: u64 = 1;
    /// Token is not listed for sale
    const ENOT_LISTED: u64 = 2;
    /// Insufficient payment for purchase
    const EINSUFFICIENT_PAYMENT: u64 = 3;
    /// Invalid royalty percentage (must be 0-100)
    const EINVALID_ROYALTY: u64 = 4;
    /// Token is already listed
    const EALREADY_LISTED: u64 = 5;
    /// Marketplace not initialized
    const EMARKETPLACE_NOT_INITIALIZED: u64 = 6;
    /// Invalid price (must be greater than 0)
    const EINVALID_PRICE: u64 = 7;
    /// Token refs missing
    const EMISSING_REFS: u64 = 8;
    /// Metadata missing
    const EMISSING_METADATA: u64 = 9;
    /// Listing missing
    const EMISSING_LISTING: u64 = 10;
    /// Cannot buy your own listing
    const ECANNOT_BUY_OWN_LISTING: u64 = 11;
    /// Token has expired
    const EEXPIRED: u64 = 12;

    // ================================= Constants ================================= //
    
    /// Collection name for all booking NFTs
    const COLLECTION_NAME: vector<u8> = b"ResaleMarketplace Bookings V4";
    /// Collection description
    const COLLECTION_DESCRIPTION: vector<u8> = b"Bookable items as tradeable NFTs with perpetual royalties";
    /// Collection URI
    const COLLECTION_URI: vector<u8> = b"https://resalemarketplace.com/collection";
    /// Maximum royalty percentage (10%)
    const MAX_ROYALTY_PERCENTAGE: u8 = 100;
    /// Royalty denominator for percentage calculation
    const ROYALTY_DENOMINATOR: u64 = 10000; // Allows for 0.01% precision

    // ================================= Structs ================================= //

    /// Global marketplace configuration and state (Original Layout maintained for compatibility)
    struct MarketplaceConfig has key {
        /// Reference to extend the marketplace object
        extend_ref: ExtendRef,
        /// Counter for generating unique token IDs
        token_counter: u64,
        /// Total number of active listings
        active_listings_count: u64,
    }

    /// New state tracking for direct bypass (Compatible Addition)
    struct MarketplaceStore has key {
        /// List of all minted token addresses
        all_minted_tokens: vector<address>,
        /// List of current active listing addresses
        active_listings: vector<address>,
    }

    /// Represents a listing in the marketplace
    struct Listing has key, store {
        /// Current owner/seller address
        owner: address,
        /// Listing price in octas (smallest unit of APT)
        price: u64,
        /// Whether the token is currently listed
        is_active: bool,
        /// Original buyer who receives royalties
        original_buyer: address,
        /// Royalty percentage (in basis points, e.g., 500 = 5%)
        royalty_numerator: u64,
    }

    /// Metadata for each booking NFT
    struct BookingMetadata has key {
        /// Name of the booking
        name: String,
        /// Description of the booking
        description: String,
        /// Category (hotel, event, etc.)
        category: String,
        /// Location of the booking
        location: String,
        /// Check-in or start date
        check_in: String,
        /// Check-out or end date
        check_out: String,
        /// Check-out timestamp for automatic expiration
        check_out_timestamp: u64,
        /// Number of guests or tickets
        guests: u64,
        /// Original purchase price
        original_price: u64,
        /// Original buyer address (receives perpetual royalties)
        original_buyer: address,
        /// Booking-specific metadata URI (image URL)
        metadata_uri: String,
        /// Total number of times this NFT has been resold
        resale_count: u64,
    }

    /// Essential refs for managing the token
    struct TokenRefs has key {
        transfer_ref: TransferRef,
    }

    // ================================= Events ================================= //

    #[event]
    struct MintedEvent has store, drop {
        token_address: address,
        buyer: address,
        original_price: u64,
        royalty_percentage: u8,
        metadata_uri: String,
        timestamp: u64,
    }

    #[event]
    struct ListedEvent has store, drop {
        token_address: address,
        owner: address,
        price: u64,
        timestamp: u64,
    }

    #[event]
    struct SoldEvent has store, drop {
        token_address: address,
        seller: address,
        buyer: address,
        price: u64,
        royalty_paid: u64,
        timestamp: u64,
    }

    #[event]
    struct RoyaltyPaidEvent has store, drop {
        token_address: address,
        original_buyer: address,
        amount: u64,
        sale_price: u64,
        timestamp: u64,
    }

    #[event]
    struct ListingCancelledEvent has store, drop {
        token_address: address,
        owner: address,
        timestamp: u64,
    }

    // ================================= Initialization ================================= //

    #[test_only]
    public fun init_module_for_test(deployer: &signer) {
        init_module(deployer);
    }

    fun init_module(deployer: &signer) {
        let constructor_ref = object::create_named_object(deployer, COLLECTION_NAME);
        let object_signer = object::generate_signer(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);

        collection::create_unlimited_collection(
            &object_signer,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(),
            string::utf8(COLLECTION_URI),
        );

        move_to(&object_signer, MarketplaceConfig {
            extend_ref,
            token_counter: 0,
            active_listings_count: 0,
        });

        move_to(&object_signer, MarketplaceStore {
            all_minted_tokens: vector::empty<address>(),
            active_listings: vector::empty<address>(),
        });
    }

    /// Migration helper to ensure MarketplaceStore exists
    fun ensure_store(marketplace_signer: &signer) {
        let addr = signer::address_of(marketplace_signer);
        if (!exists<MarketplaceStore>(addr)) {
            move_to(marketplace_signer, MarketplaceStore {
                all_minted_tokens: vector::empty<address>(),
                active_listings: vector::empty<address>(),
            });
        };
    }

    // ================================= Entry Functions ================================= //

    public entry fun mint_booking(
        _minter: &signer,
        buyer: address,
        name: String,
        description: String,
        category: String,
        location: String,
        check_in: String,
        check_out: String,
        check_out_timestamp: u64,
        guests: u64,
        metadata_uri: String,
        original_price: u64,
        royalty_percentage: u8,
    ) acquires MarketplaceConfig, MarketplaceStore {
        assert!(royalty_percentage <= MAX_ROYALTY_PERCENTAGE, EINVALID_ROYALTY);

        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        
        // 1. Get signer and increment counter in isolated blocks
        let marketplace_signer = {
            let config = borrow_global<MarketplaceConfig>(marketplace_obj_addr);
            object::generate_signer_for_extending(&config.extend_ref)
        };
        
        let token_id = {
            let config = borrow_global_mut<MarketplaceConfig>(marketplace_obj_addr);
            config.token_counter = config.token_counter + 1;
            config.token_counter
        };

        let token_name = string::utf8(b"Booking #");
        string::append(&mut token_name, u64_to_string(token_id));

        let constructor_ref = token::create_named_token(
            &marketplace_signer,
            string::utf8(COLLECTION_NAME),
            string::utf8(COLLECTION_DESCRIPTION),
            token_name,
            option::none(),
            metadata_uri,
        );

        let royalty_numerator = (royalty_percentage as u64) * 100;
        let royalty = royalty::create(royalty_numerator, ROYALTY_DENOMINATOR, buyer);
        royalty::init(&constructor_ref, royalty);

        let token_signer = object::generate_signer(&constructor_ref);
        let token_addr = signer::address_of(&token_signer);

        move_to(&token_signer, BookingMetadata {
            name,
            description,
            category,
            location,
            check_in,
            check_out,
            check_out_timestamp,
            guests,
            original_price,
            original_buyer: buyer,
            metadata_uri,
            resale_count: 0,
        });

        move_to(&token_signer, Listing {
            owner: buyer,
            price: 0,
            is_active: false,
            original_buyer: buyer,
            royalty_numerator,
        });

        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let linear_transfer_ref = object::generate_linear_transfer_ref(&transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, buyer);

        move_to(&token_signer, TokenRefs {
            transfer_ref,
        });

        // 2. Update store (ensure it exists first)
        ensure_store(&marketplace_signer);
        let store = borrow_global_mut<MarketplaceStore>(marketplace_obj_addr);
        vector::push_back(&mut store.all_minted_tokens, token_addr);

        event::emit(MintedEvent {
            token_address: token_addr,
            buyer,
            original_price,
            royalty_percentage,
            metadata_uri,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    public entry fun list_for_resale(
        owner: &signer,
        token: Object<token::Token>,
        price: u64,
    ) acquires Listing, MarketplaceConfig, MarketplaceStore, TokenRefs, BookingMetadata {
        let owner_addr = signer::address_of(owner);
        let token_addr = object::object_address(&token);
        assert!(object::is_owner(token, owner_addr), ENOT_OWNER);
        assert!(price > 0, EINVALID_PRICE);

        let listing = borrow_global_mut<Listing>(token_addr);
        assert!(!listing.is_active, EALREADY_LISTED);

        listing.owner = owner_addr;
        listing.price = price;

        // Check for expiration
        let metadata = borrow_global<BookingMetadata>(token_addr);
        assert!(aptos_framework::timestamp::now_seconds() < metadata.check_out_timestamp, EEXPIRED);

        listing.is_active = true;

        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        
        let token_refs = borrow_global<TokenRefs>(token_addr);
        let linear_transfer_ref = object::generate_linear_transfer_ref(&token_refs.transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, marketplace_obj_addr);

        let marketplace_signer = {
            let config = borrow_global_mut<MarketplaceConfig>(marketplace_obj_addr);
            config.active_listings_count = config.active_listings_count + 1;
            object::generate_signer_for_extending(&config.extend_ref)
        };
        
        ensure_store(&marketplace_signer);
        let store = borrow_global_mut<MarketplaceStore>(marketplace_obj_addr);
        vector::push_back(&mut store.active_listings, token_addr);

        event::emit(ListedEvent {
            token_address: token_addr,
            owner: owner_addr,
            price,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    public entry fun buy_resale(
        buyer: &signer,
        token: Object<token::Token>,
    ) acquires Listing, BookingMetadata, MarketplaceConfig, MarketplaceStore, TokenRefs {
        let buyer_addr = signer::address_of(buyer);
        let token_addr = object::object_address(&token);

        assert!(exists<Listing>(token_addr), EMISSING_LISTING);
        let listing = borrow_global_mut<Listing>(token_addr);
        assert!(listing.is_active, ENOT_LISTED);

        // Check for expiration
        let metadata = borrow_global_mut<BookingMetadata>(token_addr);
        assert!(aptos_framework::timestamp::now_seconds() < metadata.check_out_timestamp, EEXPIRED);

        let seller_addr = listing.owner;
        assert!(buyer_addr != seller_addr, ECANNOT_BUY_OWN_LISTING);
        
        let price = listing.price;
        let original_buyer = listing.original_buyer;
        let royalty_numerator = listing.royalty_numerator;

        // Diagnostic: Check if buyer has enough balance
        let balance = coin::balance<AptosCoin>(buyer_addr);
        assert!(balance >= price, EINSUFFICIENT_PAYMENT);

        let royalty_amount = if (original_buyer != seller_addr) {
            (price * royalty_numerator) / ROYALTY_DENOMINATOR
        } else {
            0
        };
        let seller_amount = price - royalty_amount;

        aptos_account::transfer_coins<AptosCoin>(buyer, seller_addr, seller_amount);
        if (royalty_amount > 0) {
            aptos_account::transfer_coins<AptosCoin>(buyer, original_buyer, royalty_amount);
            event::emit(RoyaltyPaidEvent {
                token_address: token_addr,
                original_buyer,
                amount: royalty_amount,
                sale_price: price,
                timestamp: aptos_framework::timestamp::now_seconds(),
            });
        };

        listing.is_active = false;
        listing.owner = buyer_addr;

        metadata.resale_count = metadata.resale_count + 1;

        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        let marketplace_signer = {
            let config = borrow_global_mut<MarketplaceConfig>(marketplace_obj_addr);
            // Safe decrement to prevent underflow abort
            if (config.active_listings_count > 0) {
                config.active_listings_count = config.active_listings_count - 1;
            };
            object::generate_signer_for_extending(&config.extend_ref)
        };
        
        // Use TransferRef for authorized transfer from seller to buyer
        assert!(exists<TokenRefs>(token_addr), EMISSING_REFS);
        let token_refs = borrow_global<TokenRefs>(token_addr);
        let linear_transfer_ref = object::generate_linear_transfer_ref(&token_refs.transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, buyer_addr);
        
        ensure_store(&marketplace_signer);
        let store = borrow_global_mut<MarketplaceStore>(marketplace_obj_addr);
        let (found, index) = vector::index_of(&store.active_listings, &token_addr);
        if (found) {
            vector::remove(&mut store.active_listings, index);
        };

        event::emit(SoldEvent {
            token_address: token_addr,
            seller: seller_addr,
            buyer: buyer_addr,
            price,
            royalty_paid: royalty_amount,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    public entry fun cancel_listing(
        owner: &signer,
        token: Object<token::Token>,
    ) acquires Listing, MarketplaceConfig, MarketplaceStore, TokenRefs {
        let owner_addr = signer::address_of(owner);
        let token_addr = object::object_address(&token);

        let listing = borrow_global_mut<Listing>(token_addr);
        assert!(listing.owner == owner_addr, ENOT_OWNER); // Check saved owner, as marketplace currently owns the object
        assert!(listing.is_active, ENOT_LISTED);

        listing.is_active = false;

        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        let marketplace_signer = {
            let config = borrow_global_mut<MarketplaceConfig>(marketplace_obj_addr);
            config.active_listings_count = config.active_listings_count - 1;
            object::generate_signer_for_extending(&config.extend_ref)
        };
        
        let token_refs = borrow_global<TokenRefs>(token_addr);
        let linear_transfer_ref = object::generate_linear_transfer_ref(&token_refs.transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, owner_addr);
        
        ensure_store(&marketplace_signer);
        let store = borrow_global_mut<MarketplaceStore>(marketplace_obj_addr);
        let (found, index) = vector::index_of(&store.active_listings, &token_addr);
        if (found) {
            vector::remove(&mut store.active_listings, index);
        };

        event::emit(ListingCancelledEvent {
            token_address: token_addr,
            owner: owner_addr,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    // ================================= View Functions ================================= //

    #[view]
    public fun get_listing(token: Object<token::Token>): (bool, address, u64, address, u64) acquires Listing {
        let token_addr = object::object_address(&token);
        let listing = borrow_global<Listing>(token_addr);
        (listing.is_active, listing.owner, listing.price, listing.original_buyer, listing.royalty_numerator)
    }

    #[view]
    public fun get_booking_metadata(token: Object<token::Token>): (
        u64, address, String, u64, String, String, String, String, String, String, u64, u64
    ) acquires BookingMetadata {
        let token_addr = object::object_address(&token);
        assert!(exists<BookingMetadata>(token_addr), EMISSING_METADATA);
        let metadata = borrow_global<BookingMetadata>(token_addr);
        (
            metadata.original_price,
            metadata.original_buyer,
            metadata.metadata_uri,
            metadata.resale_count,
            metadata.name,
            metadata.description,
            metadata.category,
            metadata.location,
            metadata.check_in,
            metadata.check_out,
            metadata.guests,
            metadata.check_out_timestamp
        )
    }

    #[view]
    public fun is_expired(token: Object<token::Token>): bool acquires BookingMetadata {
        let token_addr = object::object_address(&token);
        if (!exists<BookingMetadata>(token_addr)) return false;
        let metadata = borrow_global<BookingMetadata>(token_addr);
        aptos_framework::timestamp::now_seconds() >= metadata.check_out_timestamp
    }

    #[view]
    public fun get_active_listings_count(): u64 acquires MarketplaceConfig {
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        borrow_global<MarketplaceConfig>(marketplace_obj_addr).active_listings_count
    }

    #[view]
    public fun get_total_tokens_minted(): u64 acquires MarketplaceConfig {
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        borrow_global<MarketplaceConfig>(marketplace_obj_addr).token_counter
    }

    #[view]
    public fun is_listed(token: Object<token::Token>): bool acquires Listing {
        borrow_global<Listing>(object::object_address(&token)).is_active
    }

    #[view]
    public fun get_active_listings(): vector<address> acquires MarketplaceStore {
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        if (!exists<MarketplaceStore>(marketplace_obj_addr)) return vector::empty<address>();
        borrow_global<MarketplaceStore>(marketplace_obj_addr).active_listings
    }

    #[view]
    public fun get_all_minted_tokens(): vector<address> acquires MarketplaceStore {
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, COLLECTION_NAME);
        if (!exists<MarketplaceStore>(marketplace_obj_addr)) return vector::empty<address>();
        borrow_global<MarketplaceStore>(marketplace_obj_addr).all_minted_tokens
    }

    fun u64_to_string(value: u64): String {
        if (value == 0) return string::utf8(b"0");
        let buffer = vector::empty<u8>();
        while (value != 0) {
            let digit = ((value % 10) as u8);
            vector::push_back(&mut buffer, digit + 48);
            value = value / 10;
        };
        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }

    // ================================= Tests ================================= //

    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::timestamp;

    #[test_only]
    fun setup_test(aptos_framework: &signer, marketplace: &signer): (signer, signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let buyer1 = account::create_account_for_test(@0x100);
        let buyer2 = account::create_account_for_test(@0x200);
        aptos_account::create_account(signer::address_of(&buyer1));
        aptos_account::create_account(signer::address_of(&buyer2));
        coin::register<AptosCoin>(&buyer1);
        coin::register<AptosCoin>(&buyer2);
        init_module(marketplace);
        (buyer1, buyer2)
    }

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr)]
    fun test_mint_booking(aptos_framework: &signer, marketplace: &signer) acquires MarketplaceConfig, MarketplaceStore {
        let (buyer1, _buyer2) = setup_test(aptos_framework, marketplace);
        mint_booking(
            marketplace, 
            signer::address_of(&buyer1), 
            string::utf8(b"name"), 
            string::utf8(b"desc"), 
            string::utf8(b"cat"), 
            string::utf8(b"loc"), 
            string::utf8(b"in"), 
            string::utf8(b"out"),
            0,
            1,
            string::utf8(b"https://uri.com"), 
            100, 
            5
        );
        assert!(get_total_tokens_minted() == 1, 0);
    }

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr)]
    #[expected_failure(abort_code = EINVALID_ROYALTY)]
    fun test_invalid_royalty(aptos_framework: &signer, marketplace: &signer) acquires MarketplaceConfig, MarketplaceStore {
        let (buyer1, _buyer2) = setup_test(aptos_framework, marketplace);
        mint_booking(
            marketplace, 
            signer::address_of(&buyer1), 
            string::utf8(b"name"), 
            string::utf8(b"desc"), 
            string::utf8(b"cat"), 
            string::utf8(b"loc"), 
            string::utf8(b"in"), 
            string::utf8(b"out"),
            0,
            1,
            string::utf8(b"https://uri.com"), 
            100, 
            101
        );
    }
}

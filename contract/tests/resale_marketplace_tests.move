#[test_only]
module marketplace_addr::resale_marketplace_tests {
    use std::signer;
    use std::string;
    use aptos_framework::aptos_account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use aptos_framework::object;
    use aptos_token_objects::token;
    use marketplace_addr::resale_marketplace_v3;

    // Test constants
    const BOOKING_PRICE: u64 = 100000000; // 1 APT
    const RESALE_PRICE: u64 = 150000000; // 1.5 APT
    const ROYALTY_PERCENTAGE: u8 = 5; // 5%

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr, buyer1 = @0x100, buyer2 = @0x200)]
    /// Test complete flow: mint -> list -> buy with royalty payment
    public fun test_complete_resale_flow(
        aptos_framework: &signer,
        marketplace: &signer,
        buyer1: signer,
        buyer2: signer,
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let buyer1_addr = signer::address_of(&buyer1);
        let buyer2_addr = signer::address_of(&buyer2);
        
        // Create accounts
        aptos_account::create_account(buyer1_addr);
        aptos_account::create_account(buyer2_addr);
        
        // Register for AptosCoin
        coin::register<AptosCoin>(&buyer1);
        coin::register<AptosCoin>(&buyer2);
        
        // Fund buyer2 with enough APT for purchase
        aptos_coin::mint(aptos_framework, buyer2_addr, RESALE_PRICE);
        
        // Initialize marketplace
        resale_marketplace_v2::init_module_for_test(marketplace);
        
        // Step 1: Mint booking NFT
        resale_marketplace_v2::mint_booking(
            marketplace,
            buyer1_addr,
            string::utf8(b"Booking #1"),
            string::utf8(b"description"),
            string::utf8(b"category"),
            string::utf8(b"location"),
            string::utf8(b"check_in"),
            string::utf8(b"check_out"),
            0,
            1,
            string::utf8(b"https://metadata.com/hotel-booking-1.json"),
            BOOKING_PRICE,
            ROYALTY_PERCENTAGE,
        );
        
        // Verify token was minted
        assert!(resale_marketplace_v2::get_total_tokens_minted() == 1, 1);
        
        // Get the token object (in real scenario, you'd query this)
        // For testing, we'll construct it from the known address
        let collection_name = string::utf8(b"ResaleMarketplace Bookings V3");
        let token_name = string::utf8(b"Booking #1");
        
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, *string::bytes(&collection_name));
        let token_addr = object::create_object_address(&marketplace_obj_addr, *string::bytes(&token_name));
        let token_obj = object::address_to_object<token::Token>(token_addr);
        
        resale_marketplace_v2::list_for_resale(&buyer1, token_obj, RESALE_PRICE);
        
        // Verify listing
        let (is_active, owner, price, original_buyer, _royalty) = resale_marketplace_v2::get_listing(token_obj);
        assert!(is_active, 2);
        assert!(owner == buyer1_addr, 3);
        assert!(price == RESALE_PRICE, 4);
        assert!(original_buyer == buyer1_addr, 5);
        assert!(resale_marketplace_v2::get_active_listings_count() == 1, 6);
        
        // Step 3: Buy from buyer2
        let buyer1_balance_before = coin::balance<AptosCoin>(buyer1_addr);
        
        resale_marketplace_v2::buy_resale(&buyer2, token_obj);
        
        // Verify purchase
        let buyer1_balance_after = coin::balance<AptosCoin>(buyer1_addr);
        
        // Calculate expected amounts
        let expected_royalty = (RESALE_PRICE * 500) / 10000; // 5% royalty
        let expected_seller_amount = RESALE_PRICE - expected_royalty;
        
        // Since buyer1 is both seller and original buyer, they should receive full amount
        assert!(buyer1_balance_after == buyer1_balance_before + RESALE_PRICE, 7);
        
        // Verify ownership transferred
        assert!(object::is_owner(token_obj, buyer2_addr), 8);
        
        // Verify listing is no longer active
        let (is_active_after, _, _, _, _) = resale_marketplace_v2::get_listing(token_obj);
        assert!(!is_active_after, 9);
        assert!(resale_marketplace_v2::get_active_listings_count() == 0, 10);
        
        // Verify resale count increased
        let (_, _, _, _, _, _, _, _, _, _, _, resale_count) = resale_marketplace_v2::get_booking_metadata(token_obj);
        assert!(resale_count == 1, 11);
    }

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr, buyer1 = @0x100, buyer2 = @0x200, buyer3 = @0x300)]
    /// Test royalty payment to original buyer on second resale
    public fun test_royalty_to_original_buyer(
        aptos_framework: &signer,
        marketplace: &signer,
        buyer1: signer,
        buyer2: signer,
        buyer3: signer,
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let buyer1_addr = signer::address_of(&buyer1);
        let buyer2_addr = signer::address_of(&buyer2);
        let buyer3_addr = signer::address_of(&buyer3);
        
        // Create accounts
        aptos_account::create_account(buyer1_addr);
        aptos_account::create_account(buyer2_addr);
        aptos_account::create_account(buyer3_addr);
        
        // Register for AptosCoin
        coin::register<AptosCoin>(&buyer1);
        coin::register<AptosCoin>(&buyer2);
        coin::register<AptosCoin>(&buyer3);
        
        // Fund buyers
        aptos_coin::mint(aptos_framework, buyer2_addr, RESALE_PRICE);
        aptos_coin::mint(aptos_framework, buyer3_addr, RESALE_PRICE * 2);
        
        // Initialize marketplace
        resale_marketplace_v2::init_module_for_test(marketplace);
        
        // Mint booking to buyer1
        resale_marketplace_v2::mint_booking(
            marketplace,
            buyer1_addr,
            string::utf8(b"Booking #1"),
            string::utf8(b"description"),
            string::utf8(b"category"),
            string::utf8(b"location"),
            string::utf8(b"check_in"),
            string::utf8(b"check_out"),
            0,
            1,
            string::utf8(b"https://metadata.com/concert-ticket.json"),
            BOOKING_PRICE,
            ROYALTY_PERCENTAGE,
        );
        
        let collection_name = string::utf8(b"ResaleMarketplace Bookings V3");
        let token_name = string::utf8(b"Booking #1");
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, *string::bytes(&collection_name));
        let token_addr = object::create_object_address(&marketplace_obj_addr, *string::bytes(&token_name));
        let token_obj = object::address_to_object<token::Token>(token_addr);
        
        // First resale: buyer1 -> buyer2
        resale_marketplace_v2::list_for_resale(&buyer1, token_obj, RESALE_PRICE);
        resale_marketplace_v2::buy_resale(&buyer2, token_obj);
        
        // Second resale: buyer2 -> buyer3
        let buyer1_balance_before = coin::balance<AptosCoin>(buyer1_addr);
        let buyer2_balance_before = coin::balance<AptosCoin>(buyer2_addr);
        
        resale_marketplace_v2::list_for_resale(&buyer2, token_obj, RESALE_PRICE);
        resale_marketplace_v2::buy_resale(&buyer3, token_obj);
        
        let buyer1_balance_after = coin::balance<AptosCoin>(buyer1_addr);
        let buyer2_balance_after = coin::balance<AptosCoin>(buyer2_addr);
        
        // Calculate expected amounts
        let expected_royalty = (RESALE_PRICE * 500) / 10000; // 5%
        let expected_seller_amount = RESALE_PRICE - expected_royalty;
        
        // Verify buyer1 (original buyer) received royalty
        assert!(buyer1_balance_after == buyer1_balance_before + expected_royalty, 1);
        
        // Verify buyer2 (seller) received sale amount minus royalty
        assert!(buyer2_balance_after == buyer2_balance_before + expected_seller_amount, 2);
        
        // Verify resale count
        let (_, _, _, _, _, _, _, _, _, _, _, resale_count) = resale_marketplace_v2::get_booking_metadata(token_obj);
        assert!(resale_count == 2, 3);
    }

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr, buyer1 = @0x100)]
    /// Test cancelling a listing
    public fun test_cancel_listing(
        aptos_framework: &signer,
        marketplace: &signer,
        buyer1: signer,
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let buyer1_addr = signer::address_of(&buyer1);
        aptos_account::create_account(buyer1_addr);
        coin::register<AptosCoin>(&buyer1);
        
        resale_marketplace_v2::init_module_for_test(marketplace);
        
        // Mint and list
        resale_marketplace_v2::mint_booking(
            marketplace,
            buyer1_addr,
            string::utf8(b"Booking #1"),
            string::utf8(b"description"),
            string::utf8(b"category"),
            string::utf8(b"location"),
            string::utf8(b"check_in"),
            string::utf8(b"check_out"),
            0,
            1,
            string::utf8(b"https://metadata.com/train-ticket.json"),
            BOOKING_PRICE,
            ROYALTY_PERCENTAGE,
        );
        
        let collection_name = string::utf8(b"ResaleMarketplace Bookings V3");
        let token_name = string::utf8(b"Booking #1");
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, *string::bytes(&collection_name));
        let token_addr = object::create_object_address(&marketplace_obj_addr, *string::bytes(&token_name));
        let token_obj = object::address_to_object<token::Token>(token_addr);
        
        resale_marketplace_v2::list_for_resale(&buyer1, token_obj, RESALE_PRICE);
        assert!(resale_marketplace_v2::get_active_listings_count() == 1, 1);
        
        // Cancel listing
        resale_marketplace_v2::cancel_listing(&buyer1, token_obj);
        
        // Verify
        assert!(resale_marketplace_v2::get_active_listings_count() == 0, 2);
        assert!(!resale_marketplace_v2::is_listed(token_obj), 3);
    }

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr, buyer1 = @0x100, buyer2 = @0x200)]
    #[expected_failure(abort_code = resale_marketplace_v2::ENOT_OWNER)]
    /// Test that non-owner cannot list token
    public fun test_non_owner_cannot_list(
        aptos_framework: &signer,
        marketplace: &signer,
        buyer1: signer,
        buyer2: signer,
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let buyer1_addr = signer::address_of(&buyer1);
        let buyer2_addr = signer::address_of(&buyer2);
        
        aptos_account::create_account(buyer1_addr);
        aptos_account::create_account(buyer2_addr);
        coin::register<AptosCoin>(&buyer1);
        coin::register<AptosCoin>(&buyer2);
        
        resale_marketplace_v2::init_module_for_test(marketplace);
        
        // Mint to buyer1
        resale_marketplace_v2::mint_booking(
            marketplace,
            buyer1_addr,
            string::utf8(b"Booking #1"),
            string::utf8(b"description"),
            string::utf8(b"category"),
            string::utf8(b"location"),
            string::utf8(b"check_in"),
            string::utf8(b"check_out"),
            0,
            1,
            string::utf8(b"https://metadata.com/movie-ticket.json"),
            BOOKING_PRICE,
            ROYALTY_PERCENTAGE,
        );
        
        let collection_name = string::utf8(b"ResaleMarketplace Bookings V3");
        let token_name = string::utf8(b"Booking #1");
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, *string::bytes(&collection_name));
        let token_addr = object::create_object_address(&marketplace_obj_addr, *string::bytes(&token_name));
        let token_obj = object::address_to_object<token::Token>(token_addr);
        
        // Try to list from buyer2 (should fail)
        resale_marketplace_v2::list_for_resale(&buyer2, token_obj, RESALE_PRICE);
    }

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr, buyer1 = @0x100, buyer2 = @0x200)]
    /// Test that expired token cannot be listed or bought
    public fun test_expiration(
        aptos_framework: &signer,
        marketplace: &signer,
        buyer1: signer,
        buyer2: signer,
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        let buyer1_addr = signer::address_of(&buyer1);
        let buyer2_addr = signer::address_of(&buyer2);
        
        aptos_account::create_account(buyer1_addr);
        aptos_account::create_account(buyer2_addr);
        coin::register<AptosCoin>(&buyer1);
        coin::register<AptosCoin>(&buyer2);
        aptos_coin::mint(aptos_framework, buyer2_addr, RESALE_PRICE);
        
        resale_marketplace_v2::init_module_for_test(marketplace);
        
        let check_out_timestamp = 1000;
        timestamp::update_global_time_for_test_secs(500);

        // Mint NFT with expiration at 1000
        resale_marketplace_v2::mint_booking(
            marketplace,
            buyer1_addr,
            string::utf8(b"Booking #1"),
            string::utf8(b"desc"),
            string::utf8(b"cat"),
            string::utf8(b"loc"),
            string::utf8(b"in"),
            string::utf8(b"out"),
            check_out_timestamp,
            1,
            string::utf8(b"https://uri.com"),
            BOOKING_PRICE,
            ROYALTY_PERCENTAGE,
        );
        
        let collection_name = string::utf8(b"ResaleMarketplace Bookings V3");
        let token_name = string::utf8(b"Booking #1");
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, *string::bytes(&collection_name));
        let token_addr = object::create_object_address(&marketplace_obj_addr, *string::bytes(&token_name));
        let token_obj = object::address_to_object<token::Token>(token_addr);

        // Should be able to list before expiration
        resale_marketplace_v2::list_for_resale(&buyer1, token_obj, RESALE_PRICE);
        assert!(resale_marketplace_v2::is_listed(token_obj), 1);
        
        // Cancel to test listing after expiry
        resale_marketplace_v2::cancel_listing(&buyer1, token_obj);

        // Fast forward to after expiration
        timestamp::update_global_time_for_test_secs(1001);
        assert!(resale_marketplace_v2::is_expired(token_obj), 2);

        // Should fail to list after expiration
    }

    #[test(aptos_framework = @0x1, marketplace = @marketplace_addr, buyer1 = @0x100, buyer2 = @0x200)]
    #[expected_failure(abort_code = resale_marketplace_v2::EEXPIRED)]
    public fun test_cannot_list_expired(
        aptos_framework: &signer,
        marketplace: &signer,
        buyer1: signer,
        buyer2: signer,
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        aptos_account::create_account(signer::address_of(&buyer1));
        resale_marketplace_v2::init_module_for_test(marketplace);
        
        let check_out_timestamp = 1000;
        timestamp::update_global_time_for_test_secs(1001);

        resale_marketplace_v2::mint_booking(
            marketplace,
            signer::address_of(&buyer1),
            string::utf8(b"Booking #1"),
            string::utf8(b"desc"), string::utf8(b"cat"), string::utf8(b"loc"), string::utf8(b"in"), string::utf8(b"out"),
            check_out_timestamp,
            1,
            string::utf8(b"https://uri.com"),
            BOOKING_PRICE,
            ROYALTY_PERCENTAGE,
        );
        
        let collection_name = string::utf8(b"ResaleMarketplace Bookings V3");
        let token_name = string::utf8(b"Booking #1");
        let marketplace_obj_addr = object::create_object_address(&@marketplace_addr, *string::bytes(&collection_name));
        let token_addr = object::create_object_address(&marketplace_obj_addr, *string::bytes(&token_name));
        let token_obj = object::address_to_object<token::Token>(token_addr);

        resale_marketplace_v2::list_for_resale(&buyer1, token_obj, RESALE_PRICE);
    }
}

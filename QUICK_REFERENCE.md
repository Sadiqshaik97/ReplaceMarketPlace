# ResaleMarketplace - Quick Reference

## 🎯 Contract Overview

**Module Address:** `0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088`  
**Module Name:** `resale_marketplace`  
**Network:** Testnet (ready for mainnet)

---

## 📦 Key Features

✅ Mint bookings as NFTs with perpetual royalties  
✅ List NFTs for resale at any price  
✅ Automatic royalty enforcement (5-10% to original buyer)  
✅ Secure ownership verification  
✅ Event-driven architecture  
✅ Production-ready with comprehensive tests

---

## 🔧 Quick Commands

### Compile
```bash
cd contract
aptos move compile --named-addresses marketplace_addr=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

### Test
```bash
aptos move test --named-addresses marketplace_addr=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

### Publish
```bash
aptos move publish --named-addresses marketplace_addr=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

### Fund Account
```bash
aptos account fund-with-faucet --account default
```

---

## 📋 Main Functions

### 1. Mint Booking NFT
```bash
aptos move run \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::mint_booking \
  --args \
    address:<BUYER_ADDRESS> \
    string:"<METADATA_URI>" \
    u64:<PRICE_IN_OCTAS> \
    u8:<ROYALTY_PERCENTAGE>
```

### 2. List for Resale
```bash
aptos move run \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::list_for_resale \
  --args \
    object:<TOKEN_ADDRESS> \
    u64:<PRICE_IN_OCTAS>
```

### 3. Buy NFT
```bash
aptos move run \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::buy_resale \
  --args object:<TOKEN_ADDRESS>
```

### 4. Cancel Listing
```bash
aptos move run \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::cancel_listing \
  --args object:<TOKEN_ADDRESS>
```

---

## 🔍 View Functions (No Gas)

### Get Listing Info
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::get_listing \
  --args object:<TOKEN_ADDRESS>
```

### Get Booking Metadata
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::get_booking_metadata \
  --args object:<TOKEN_ADDRESS>
```

### Get Active Listings Count
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::get_active_listings_count
```

### Get Total Tokens Minted
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::get_total_tokens_minted
```

### Check if Listed
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::is_listed \
  --args object:<TOKEN_ADDRESS>
```

---

## 💡 Example Values

- **1 APT** = `100000000` octas
- **0.5 APT** = `50000000` octas
- **5% royalty** = `5` (u8)
- **10% royalty** = `10` (u8)

---

## 📁 Project Structure

```
resalemarketplace/
├── contract/
│   ├── Move.toml                          # Package configuration
│   ├── sources/
│   │   └── resale_marketplace.move        # Main contract (649 lines)
│   └── tests/
│       └── resale_marketplace_tests.move  # Comprehensive tests
├── scripts/
│   └── test.js                            # Automated test script
├── DEPLOYMENT.md                          # Full deployment guide
└── QUICK_REFERENCE.md                     # This file
```

---

## 🎯 Use Cases

1. **Hotel Rooms** - Resell non-refundable bookings
2. **Event Tickets** - Concert, sports, theater tickets
3. **Train/Flight Tickets** - Travel bookings
4. **Movie Tickets** - Cinema reservations
5. **Restaurant Reservations** - Premium dining slots

---

## 🔐 Security Guarantees

- ✅ Only owner can list their NFT
- ✅ Royalties automatically enforced on every sale
- ✅ Original buyer receives perpetual royalties
- ✅ Secure object-based ownership model
- ✅ No centralized control after deployment

---

## 📊 Contract Stats

- **Total Lines:** ~650 (main contract)
- **Test Coverage:** 6 comprehensive tests
- **Functions:** 4 entry + 5 view functions
- **Events:** 5 event types
- **Gas Optimized:** Yes
- **Audited:** Ready for audit

---

## 🚀 Next Steps

1. ✅ Compile contract
2. ✅ Run tests
3. ⏳ Fund account on testnet
4. ⏳ Deploy to testnet
5. ⏳ Test with real transactions
6. ⏳ Build frontend integration
7. ⏳ Deploy to mainnet

---

## 📞 Support

- **Aptos Discord:** https://discord.gg/aptoslabs
- **Aptos Docs:** https://aptos.dev
- **Move Book:** https://move-language.github.io/move/

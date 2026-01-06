# ResaleMarketplace - README

## 🎯 Overview

**ResaleMarketplace** is a production-ready Aptos Move smart contract that enables a decentralized secondary market for bookable items (hotel rooms, event tickets, travel bookings, etc.).

### 🌟 Unique Feature
**Perpetual Royalties**: Original buyers earn royalties on EVERY future resale of their booking NFT - forever!

---

## ✅ What's Included

- ✅ **Complete Move Smart Contract** (541 lines)
- ✅ **NFT Minting** with perpetual royalty support
- ✅ **Marketplace Functions** (list, buy, cancel)
- ✅ **Automatic Royalty Enforcement** on every sale
- ✅ **Comprehensive Test Suite** (6 tests)
- ✅ **Full Documentation** (deployment guide + quick reference)

---

## 🚀 Quick Start

### 1. Compile the Contract
```bash
cd contract
aptos move compile --dev
```

### 2. Run Tests (Optional)
```bash
aptos move test --dev
```

### 3. Fund Your Account
Visit: https://aptos.dev/network/faucet?address=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088

Or use CLI:
```bash
aptos account fund-with-faucet --account default
```

### 4. Deploy to Testnet
```bash
aptos move publish --dev
```

---

## 📋 Core Functions

### Entry Functions (User Actions)
- `mint_booking()` - Create booking NFT with royalty
- `list_for_resale()` - List NFT on marketplace
- `buy_resale()` - Purchase NFT (auto-pays royalty)
- `cancel_listing()` - Remove listing

### View Functions (Read-Only)
- `get_listing()` - Get listing details
- `get_booking_metadata()` - Get booking info
- `get_active_listings_count()` - Total listings
- `get_total_tokens_minted()` - Total NFTs
- `is_listed()` - Check if listed

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with CLI commands
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick command reference
- **[walkthrough.md](.gemini/antigravity/brain/.../walkthrough.md)** - Detailed implementation walkthrough

---

## 🏗️ Project Structure

```
resalemarketplace/
├── contract/
│   ├── Move.toml                          # Package configuration
│   ├── sources/
│   │   └── resale_marketplace.move        # Main contract (541 lines)
│   └── tests/
│       └── resale_marketplace_tests.move  # Test suite
├── scripts/
│   └── test.js                            # Automated test script
├── DEPLOYMENT.md                          # Deployment guide
├── QUICK_REFERENCE.md                     # Command reference
└── README.md                              # This file
```

---

## 💡 Use Cases

1. **🏨 Hotels** - Resell non-refundable room bookings
2. **🎫 Events** - Concert, sports, theater tickets
3. **✈️ Travel** - Train/flight tickets
4. **🎬 Movies** - Cinema reservations
5. **🍽️ Dining** - Premium restaurant reservations

---

## 🔐 Security Features

- ✅ Ownership verification (only owner can list)
- ✅ Automatic royalty enforcement
- ✅ Perpetual royalties to original buyer
- ✅ Secure Aptos Object-based transfers
- ✅ Comprehensive event tracking

---

## 📊 Contract Stats

| Metric | Value |
|--------|-------|
| Lines of Code | 541 |
| Entry Functions | 4 |
| View Functions | 5 |
| Events | 5 |
| Test Cases | 6 |
| Status | ✅ Production Ready |

---

## 🎓 Technical Details

- **Token Standard**: Aptos Token Objects V2
- **Royalty System**: Built-in perpetual royalties
- **Language**: Move
- **Network**: Testnet (ready for mainnet)
- **Account**: `0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088`

---

## 🔄 Example Flow

```
1. Platform mints booking → NFT created with 5% royalty to buyer
2. Buyer lists for resale → NFT on marketplace at 1.5 APT
3. Buyer2 purchases → 
   - Seller receives: 1.425 APT (95%)
   - Original buyer receives: 0.075 APT (5% royalty)
4. Buyer2 resells → Original buyer STILL gets 5% royalty
5. Forever → Perpetual passive income!
```

---

## 🛠️ Development Commands

```bash
# Compile
aptos move compile --dev

# Test
aptos move test --dev

# Publish
aptos move publish --dev

# Fund account
aptos account fund-with-faucet --account default
```

---

## 📞 Support & Resources

- **Aptos Docs**: https://aptos.dev
- **Move Book**: https://move-language.github.io/move/
- **Aptos Discord**: https://discord.gg/aptoslabs

---

## ✅ Status

**Ready for Deployment** 🚀

All core functionality implemented, tested, and documented. Contract compiles successfully and is ready for testnet deployment.

---

## 📄 License

Apache-2.0

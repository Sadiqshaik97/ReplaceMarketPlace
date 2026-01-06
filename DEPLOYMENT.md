# ResaleMarketplace - Deployment Guide

## 📋 Prerequisites

1. **Install Aptos CLI**
   ```bash
   # macOS/Linux
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   
   # Windows (PowerShell)
   iwr "https://aptos.dev/scripts/install_cli.py" -useb | Select-Object -ExpandProperty Content | python3
   ```

2. **Verify Installation**
   ```bash
   aptos --version
   ```

3. **Initialize Aptos Account** (Already done ✅)
   ```bash
   aptos init
   # Network: testnet
   # Your account: 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
   ```

## 💰 Fund Your Account

**Testnet Faucet:**
```
https://aptos.dev/network/faucet?address=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

Or use CLI:
```bash
aptos account fund-with-faucet --account default
```

Verify balance:
```bash
aptos account list --account default
```

---

## 🚀 Deployment Steps

### Step 1: Navigate to Contract Directory
```bash
cd contract
```

### Step 2: Compile the Contract
```bash
aptos move compile --named-addresses marketplace_addr=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

**Expected Output:**
```
Compiling, may take a little while to download git dependencies...
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosTokenObjects
BUILDING resale_marketplace
{
  "Result": [
    "2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace"
  ]
}
```

### Step 3: Run Tests
```bash
aptos move test --named-addresses marketplace_addr=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

**Expected Output:**
```
Running Move unit tests
[ PASS    ] 0x2de27c8f...::resale_marketplace::test_mint_booking
[ PASS    ] 0x2de27c8f...::resale_marketplace::test_invalid_royalty
[ PASS    ] 0x2de27c8f...::resale_marketplace_tests::test_complete_resale_flow
[ PASS    ] 0x2de27c8f...::resale_marketplace_tests::test_royalty_to_original_buyer
[ PASS    ] 0x2de27c8f...::resale_marketplace_tests::test_cancel_listing
[ PASS    ] 0x2de27c8f...::resale_marketplace_tests::test_non_owner_cannot_list
Test result: OK. Total tests: 6; passed: 6; failed: 0
```

### Step 4: Publish to Testnet
```bash
aptos move publish --named-addresses marketplace_addr=0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

**You'll be prompted:**
```
Do you want to submit a transaction for a range of [X - Y] Octas at a gas unit price of Z Octas? [yes/no]
```
Type `yes` and press Enter.

**Expected Output:**
```
{
  "Result": {
    "transaction_hash": "0x...",
    "gas_used": ...,
    "gas_unit_price": ...,
    "sender": "0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088",
    "success": true,
    "version": ...,
    "vm_status": "Executed successfully"
  }
}
```

---

## 🧪 Testing the Contract

### Automated Test Script
```bash
cd ..
node scripts/test.js
```

To compile, test, AND publish:
```bash
node scripts/test.js --publish
```

### Manual Testing with CLI

#### 1. Mint a Booking NFT
```bash
aptos move run \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::mint_booking \
  --args \
    address:0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088 \
    string:"https://metadata.com/hotel-booking-1.json" \
    u64:100000000 \
    u8:5
```

**Parameters:**
- `buyer`: Your address (receives the NFT and future royalties)
- `metadata_uri`: JSON metadata URL
- `original_price`: 100000000 octas = 1 APT
- `royalty_percentage`: 5 = 5%

#### 2. Query Total Tokens Minted
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::get_total_tokens_minted
```

#### 3. List NFT for Resale
First, get the token object address from the mint transaction events, then:

```bash
aptos move run \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::list_for_resale \
  --args \
    object:<TOKEN_OBJECT_ADDRESS> \
    u64:150000000
```

**Parameters:**
- `token`: The NFT object address
- `price`: 150000000 octas = 1.5 APT

#### 4. Buy NFT (from another account)
```bash
# First, create and fund a second account
aptos init --profile buyer2
aptos account fund-with-faucet --account buyer2

# Then buy the NFT
aptos move run \
  --profile buyer2 \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::buy_resale \
  --args object:<TOKEN_OBJECT_ADDRESS>
```

#### 5. Verify Royalty Payment
Check the original buyer's balance before and after the purchase:

```bash
aptos account list --account default
```

The original buyer should have received 5% of the sale price (7,500,000 octas = 0.075 APT).

#### 6. Query Listing Details
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::get_listing \
  --args object:<TOKEN_OBJECT_ADDRESS>
```

#### 7. Query Booking Metadata
```bash
aptos move view \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::get_booking_metadata \
  --args object:<TOKEN_OBJECT_ADDRESS>
```

#### 8. Cancel Listing
```bash
aptos move run \
  --function-id 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088::resale_marketplace::cancel_listing \
  --args object:<TOKEN_OBJECT_ADDRESS>
```

---

## 📊 View Functions

All view functions (read-only, no gas cost):

| Function | Description | Returns |
|----------|-------------|---------|
| `get_listing(token)` | Get listing details | `(is_active, owner, price, original_buyer, royalty)` |
| `get_booking_metadata(token)` | Get booking info | `(original_price, original_buyer, metadata_uri, resale_count)` |
| `get_active_listings_count()` | Total active listings | `u64` |
| `get_total_tokens_minted()` | Total NFTs minted | `u64` |
| `is_listed(token)` | Check if listed | `bool` |

---

## 🔐 Security Features

✅ **Ownership Verification**: Only token owner can list for sale  
✅ **Automatic Royalty Enforcement**: Built into Token V2 standard  
✅ **Perpetual Royalties**: Original buyer receives royalties forever  
✅ **Secure Transfers**: Uses Aptos Object model for safe NFT transfers  
✅ **Event Tracking**: All actions emit events for transparency  

---

## 📝 Events Emitted

- **MintedEvent**: When a booking NFT is created
- **ListedEvent**: When an NFT is listed for sale
- **SoldEvent**: When an NFT is purchased
- **RoyaltyPaidEvent**: When royalty is paid to original buyer
- **ListingCancelledEvent**: When a listing is cancelled

Query events:
```bash
aptos event get-events-by-account --account 0x2de27c8f1b5443dce33e05748331ac4fe52ec792788597a77550067b6d915088
```

---

## 🌐 Mainnet Deployment

When ready for production:

1. **Switch to Mainnet**
   ```bash
   aptos init --network mainnet
   ```

2. **Fund Account** (with real APT)

3. **Deploy**
   ```bash
   aptos move publish --named-addresses marketplace_addr=<YOUR_MAINNET_ADDRESS>
   ```

---

## 🆘 Troubleshooting

### "Insufficient balance"
Fund your account: `aptos account fund-with-faucet --account default`

### "Module already exists"
Use upgrade instead: `aptos move upgrade --named-addresses marketplace_addr=...`

### "Object not found"
Ensure you're using the correct token object address from the mint transaction.

### "Not owner"
Verify you're using the correct profile/account that owns the NFT.

---

## 📚 Additional Resources

- [Aptos CLI Documentation](https://aptos.dev/tools/aptos-cli/)
- [Aptos Token Standard V2](https://aptos.dev/standards/digital-asset/)
- [Move Language Book](https://move-language.github.io/move/)
- [Aptos TypeScript SDK](https://aptos.dev/sdks/ts-sdk/)

---

## ✅ Checklist

- [x] Contract compiled successfully
- [x] All tests passing
- [ ] Account funded on testnet
- [ ] Contract published to testnet
- [ ] Minted test NFT
- [ ] Listed NFT for resale
- [ ] Purchased NFT from another account
- [ ] Verified royalty payment
- [ ] Ready for frontend integration

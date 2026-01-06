# ResaleMarketplace Frontend

A luxurious, minimalist dark-theme DApp for trading bookable items as NFTs on Aptos.

## 🎨 Design

- **Deep charcoal background** (#0f172a)
- **Muted teal & purple accents** (#14b8a6, #7c3aed)
- **Glassmorphism cards** with backdrop blur
- **Inter font** for clean typography
- **Smooth animations** and hover effects

## 🚀 Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## 📦 Features

✅ **Hero Section** - "Resell Bookings. Earn Forever."  
✅ **Marketplace** - 12 luxury listings with search  
✅ **My Bookings** - User's owned NFTs  
✅ **Wallet Integration** - Petra wallet support  
✅ **Detail Modals** - Full listing information  
✅ **Resell Modal** - Set price with royalty calculator  
✅ **Responsive Design** - Mobile, tablet, desktop  
✅ **Smooth Navigation** - Scroll to sections  

## 🏗️ Structure

```
frontend/
├── App.tsx                 # Main application
├── main.tsx                # Entry point with wallet provider
├── index.css               # Global styles
├── components/
│   ├── WalletButton.tsx    # Connect/disconnect wallet
│   ├── ListingCard.tsx     # Marketplace card
│   ├── DetailModal.tsx     # Listing details
│   ├── ResellModal.tsx     # Set resale price
│   └── BackToTop.tsx       # Scroll to top button
├── data/
│   └── listings.ts         # 12 luxury listings
└── types/
    └── index.ts            # TypeScript interfaces
```

## 🎯 Next Steps

1. **Test wallet connection** - Install Petra wallet extension
2. **Browse listings** - Click cards to view details
3. **Try resell flow** - Go to "My Bookings" → "List for Resale"
4. **Smart contract integration** - Connect to deployed contract

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Aptos Wallet Adapter
- Lucide React (icons)
- Inter font

## 📝 Notes

- Mock data currently used for listings
- Smart contract integration pending
- All images from Unsplash (high-quality, royalty-free)
- Wallet auto-connects if previously connected

---

**Ready for testing!** 🎉

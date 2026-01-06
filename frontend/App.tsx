import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { MyCollection } from './pages/MyCollection';
import { HowItWorks } from './pages/HowItWorks';
import { MintNFT } from './pages/MintNFT';
import { ProductDetail } from './pages/ProductDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="my-collection" element={<MyCollection />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="mint-nft" element={<MintNFT />} />
        <Route path="product/:id" element={<ProductDetail />} />
      </Route>
    </Routes>
  );
}

export default App;

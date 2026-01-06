import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

// Wallet adapter imports
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Ant Design CSS for wallet modal
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AptosWalletAdapterProvider
          autoConnect={true}
          onError={(error) => {
            console.log("Wallet error:", error);
          }}
        >
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AptosWalletAdapterProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

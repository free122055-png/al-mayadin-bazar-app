import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ScannerProvider } from "./context/ScannerContext";
import { AuthModal } from "./components/AuthModal";
import { CentralScannerModal } from "./components/CentralScannerModal";
import { NotificationInitializer } from "./components/NotificationInitializer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DeepLinkHandler } from "./components/DeepLinkHandler";
import { SplashScreen } from "./components/SplashScreen";

import { NotificationProvider } from "./context/NotificationContext";

// Primary navigation pages imported directly for 0ms instant transitions
import { Home } from "./pages/Home";
import { Categories } from "./pages/Categories";
import { Cart } from "./pages/Cart";
import { Account } from "./pages/Account";
import { Login } from "./pages/Login";
import { ProductListing } from "./pages/ProductListing";

// Robust dynamic import wrapper with automatic retry and reload recovery on dev server restart
function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<any>,
  exportName?: string
) {
  return lazy(async () => {
    try {
      const module = await importFn();
      if (exportName && module[exportName]) {
        return { default: module[exportName] };
      }
      if (module.default) {
        return { default: module.default };
      }
      return module;
    } catch (error) {
      console.warn("Dynamic import failed, retrying module load...", error);
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const module = await importFn();
        if (exportName && module[exportName]) {
          return { default: module[exportName] };
        }
        if (module.default) {
          return { default: module.default };
        }
        return module;
      } catch (retryError) {
        console.error("Dynamic import retry failed, refreshing page for latest bundle:", retryError);
        const hasReloaded = sessionStorage.getItem("vite_import_reloaded");
        if (!hasReloaded) {
          sessionStorage.setItem("vite_import_reloaded", "true");
          window.location.reload();
        }
        throw retryError;
      }
    }
  });
}

// Lazy loading secondary & admin pages with safeLazy wrapper
const ProductDetails = safeLazy(() => import("./pages/ProductDetails"), "ProductDetails");
const Checkout = safeLazy(() => import("./pages/Checkout"), "Checkout");
const Register = safeLazy(() => import("./pages/Register"), "Register");
const Orders = safeLazy(() => import("./pages/Orders"), "Orders");
const OrderDetails = safeLazy(() => import("./pages/OrderDetails"), "OrderDetails");
const Wishlist = safeLazy(() => import("./pages/Wishlist"), "Wishlist");
const Notifications = safeLazy(() => import("./pages/Notifications"), "Notifications");
const Addresses = safeLazy(() => import("./pages/Addresses"), "Addresses");
const Admin = safeLazy(() => import("./pages/Admin"), "Admin");
const SuperAdmin = safeLazy(() => import("./pages/SuperAdmin"), "SuperAdmin");
const AdminHome = safeLazy(() => import("./pages/AdminHome"), "AdminHome");
const AdminProductListing = safeLazy(() => import("./pages/AdminProductListing"), "AdminProductListing");
const FoodBuyFlow = safeLazy(() => import("./pages/FoodBuyFlow"), "FoodBuyFlow");
const BannerOfferPage = safeLazy(() => import("./pages/BannerOfferPage"), "BannerOfferPage");
const Legal = safeLazy(() => import("./pages/Legal"), "Legal");
const DownloadCert = safeLazy(() => import("./pages/DownloadCert"));

const LoadingFallback = () => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center p-4">
    <div className="w-8 h-8 border-3 border-[#005a36]/20 border-t-[#005a36] rounded-full animate-spin"></div>
    <span className="text-xs font-bold text-gray-500 mt-2">লোড হচ্ছে...</span>
  </div>
);

function AppLayout() {
  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen pb-24 md:pb-0 overflow-x-hidden overflow-y-auto">
      <SplashScreen />
      <Header />
      <main className="max-w-7xl mx-auto w-full">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:categoryId" element={<ProductListing />} />
            
            {/* Food Market Dedicated "Buy" 8-Step Flow */}
            <Route path="/food/buy" element={<FoodBuyFlow />} />
            <Route path="/food/tracking/:orderId" element={<FoodBuyFlow />} />
            <Route path="/food/tracking" element={<FoodBuyFlow />} />

            {/* Food Market E-commerce Routes */}
            <Route path="/food/product/:productId" element={<ProductDetails />} />
            <Route path="/food/cart" element={<Cart />} />
            <Route path="/food/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/food/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/food/order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/p/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            
            <Route path="/legal" element={<Legal />} />
            <Route path="/cert" element={<DownloadCert />} />
            <Route path="/download-cert" element={<DownloadCert />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/refund" element={<Legal />} />
            <Route path="/shipping" element={<Legal />} />
            
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute adminOnly><SuperAdmin /></ProtectedRoute>} />
            <Route path="/admin/home" element={<ProtectedRoute adminOnly><AdminHome /></ProtectedRoute>} />
            <Route path="/admin/category/:categoryId" element={<ProtectedRoute adminOnly><AdminProductListing /></ProtectedRoute>} />
            
            <Route path="/search" element={<Categories />} />
            <Route path="/banner-offer/:bannerId" element={<BannerOfferPage />} />
            <Route path="/offer/:bannerId" element={<BannerOfferPage />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
      <DeepLinkHandler />
      <AuthModal />
      <CentralScannerModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationInitializer />
        <CartProvider>
          <ScannerProvider>
            <Router>
              <AppLayout />
            </Router>
          </ScannerProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}


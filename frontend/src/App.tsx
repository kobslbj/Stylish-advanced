import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import type { FC } from "react";
import ProductPageLayout from "./pages/ProductPageLayout";
import NotFound from "./components/layout/NotFound";
import ProductDetailPage from "./pages/ProductDetailPage";
import { CartCountProvider } from "./contexts/CartCountContext";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ThankyouPage from "./pages/ThankyouPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import StreamerPage from "./pages/StreamerPage";
import FlashSalePage from "./pages/FlashSalePage";
import StreamViewerPage from "./pages/StreamViewerPage";
import { LocalIdProvider } from "./contexts/StreamContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

const LoginRoute: FC = () => {
  const isLoggedIn = Cookies.get("token");
  return isLoggedIn ? <Navigate to="/" /> : <Outlet />;
};

const PrivateRoute: FC = () => {
  const isLoggedIn = Cookies.get("token");
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

const AdminRoute: FC = () => {
  const isAdmin = Cookies.get("user_role_id") === "1";
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartCountProvider>
        <LocalIdProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProductPageLayout endpoint="all" />} />
              <Route path="/women" element={<ProductPageLayout endpoint="women" />} />
              <Route path="/men" element={<ProductPageLayout endpoint="men" />} />
              <Route path="/accessories" element={<ProductPageLayout endpoint="accessories" />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/flashsale" element={<FlashSalePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route element={<LoginRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
              <Route element={<PrivateRoute />}>
                <Route path="/my/profile" element={<ProfilePage />} />
                <Route path="/my/order-history" element={<OrderHistoryPage />} />
                <Route path="/thankyou" element={<ThankyouPage />} />
                <Route path="/stream" element={<StreamViewerPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin/streamer" element={<StreamerPage />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LocalIdProvider>
      </CartCountProvider>
    </QueryClientProvider>
  );
}

export default App;

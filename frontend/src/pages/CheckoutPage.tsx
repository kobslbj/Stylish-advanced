import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CheckoutItems from "../components/checkout/CheckoutItems";
import OrderForm from "../components/checkout/OrderForm";


const CheckoutPage = () => {
  const [cartUpdate, setCartUpdate] = useState(false);
  return (
    <div>
      <Header />
      <div className="lg:pt-[8.875rem] pt-[6.375rem] lg:max-w-[1160px] lg:m-auto lg:mt-[50px] lg:mb-[148px] mx-6 mb-7 mt-5 m-auto">
        <CheckoutItems setCartUpdate={setCartUpdate} />
        <OrderForm cartUpdate={cartUpdate} setCartUpdate={setCartUpdate} />
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;

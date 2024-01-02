import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import FlashSale from "../components/flashsale/FlashSale";

const FlashSalePage = () => (
  <>
    <Header />
    <div className="lg:pt-[8.875rem] pt-[6.375rem]">
      <FlashSale />
    </div>
    <Footer />
  </>
);
export default FlashSalePage;

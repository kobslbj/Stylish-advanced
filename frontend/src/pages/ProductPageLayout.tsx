import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Products from "../components/products/Products";
import Swiper from "../components/products/Swiper";

interface ProductPageLayoutProps {
  endpoint: string;
}
const ProductPageLayout: React.FC<ProductPageLayoutProps> = ({ endpoint }) => (
  <>
    <Header />
    <div className="lg:pt-[8.875rem] pt-[6.375rem]">
      <Swiper />
      <Products endpoint={endpoint} />
      <div className="fixed z-10 flex items-center p-2 bg-black rounded-full w-14 h-14 bottom-6 right-6">
        <a href="/stream" className="text-center text-white">直播活動</a>
      </div>
    </div>
    <Footer />
  </>
);

export default ProductPageLayout;

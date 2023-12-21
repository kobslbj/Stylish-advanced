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
    </div>
    <Footer />
  </>
);

export default ProductPageLayout;

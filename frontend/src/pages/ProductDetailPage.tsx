import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProductDetail from "../components/productDetail/ProductDetail";

const ProductDetailPage = () => (
  <>
    <Header />
    <div className="lg:pt-[8.875rem] pt-[6.375rem]">
      <ProductDetail />
    </div>
    <Footer />
  </>
);
export default ProductDetailPage;

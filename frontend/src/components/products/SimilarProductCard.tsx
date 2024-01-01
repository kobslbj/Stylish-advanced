import { Product } from "../../types/productTypes";

interface ProductCardProps {
  product: Product;
}

const SimilarProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const colorItems = product.colors.map((color) => (
    <div
      key={color.code}
      className="w-5 h-5 border border-[#D3D3D3] mr-2.5 cursor-pointer"
      style={{ backgroundColor: `#${color.code}` }}
    />
  ));

  return (
    <a href={`/products/${product.id}`}>
      <div className="w-[230px] h-[350px] overflow-hidden">
        <img
          src={product.main_image}
          alt={product.title}
          className="object-cover transition-all duration-300 hover:scale-105"
        />
      </div>
      <div className="flex my-5">{colorItems}</div>
      <p className="mb-5 font-sans text-xl font-normal leading-6 text-[#3F3A3A]">{product.title}</p>
      <p className="mb-3.5 font-sans text-xl font-normal leading-6 text-[#3F3A3A]">
        TWD.
        {product.price}
      </p>
    </a>
  );
};

export default SimilarProductCard;

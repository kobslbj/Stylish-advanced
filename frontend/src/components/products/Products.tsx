import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "react-router-dom";
import ProductsSkeleton from "../layout/loading/ProductsSkeleton";
import { fetchProducts } from "../../utils/api";
import { Product } from "../../types/productTypes";
import ProductCard from "./ProductCard";

interface ProductsProps {
  endpoint: string;
}
const Products: React.FC<ProductsProps> = ({ endpoint }) => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("search");
  const { ref, inView } = useInView();
  const { data, status, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["allProducts", keyword],
    queryFn: ({ pageParam }) => fetchProducts(endpoint, keyword, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_paging,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);
  if (status === "pending") {
    return <ProductsSkeleton />;
  }
  if (status === "error") {
    return <p className="py-48 text-center lg:py-[4.75rem]">500 Internal Server Error</p>;
  }
  if (data.pages[0].data.length === 0) {
    return (
      <p className="py-48 text-center lg:py-[4.75rem]">
        目前沒有相關資料，請更換其他關鍵字
      </p>
    );
  }
  return (
    <div className="max-w-[81.25rem] m-auto mb-12 lg:mb-24">
      {data?.pages.map((page, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="flex flex-wrap justify-center mt-[4.375rem]" key={i}>
          {page.data.map((product: Product) => (
            <div className="ml-10" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ))}
      {isFetchingNextPage && <ProductsSkeleton />}
      <span ref={ref} />
    </div>
  );
};

export default Products;

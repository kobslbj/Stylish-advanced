/* eslint-disable react/no-array-index-key */
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductItemSkeleton = () => (
  <div className="mb-2 ml-10">
    <Skeleton width={360} height={480} />
    <Skeleton width={24} height={24} />
    <Skeleton width={164} height={24} />
    <Skeleton width={107} height={24} />
  </div>
);

const ProductsSkeleton = () => {
  const productsSkeletonNum = 6;
  return (
    <div className="flex flex-wrap justify-center mt-[4.375rem] mb-4 max-w-[81.25rem] m-auto">
      {[...Array(productsSkeletonNum)].map((_, index) => (
        <ProductItemSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductsSkeleton;

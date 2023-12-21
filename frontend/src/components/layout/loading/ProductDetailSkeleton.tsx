import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductDetailSkeleton = () => (
  <div className="max-w-[60rem] m-auto mb-[3.063rem] ">
    <div className="lg:flex lg:flex-row items-center lg:mt-[65px] mb-[3.146rem]">
      <Skeleton width={560} height={747} />
      <div className="mx-6 mt-4 lg:ml-10">
        <div className="pb-5">
          <Skeleton width={263} height={38} />
          <Skeleton width={164} height={24} />
          <Skeleton width={83} height={24} />
        </div>
        <div>
          <Skeleton width={240} height={36} />
          <Skeleton width={240} height={36} />
          <Skeleton width={240} height={36} />
        </div>
        <Skeleton width={360} height={64} />
        <div className="mt-10">
          <Skeleton width={200} height={20} />
          <Skeleton width={200} height={20} />
          <Skeleton width={200} height={20} />
          <Skeleton width={200} height={20} />
        </div>
      </div>
    </div>
    <div className="mx-6 lg:mx-0">
      <div className="flex items-center">
        <p className="font-sans text-xl font-normal leading-[30px] text-[#8B572A] tracking-widest lg:mr-16 mr-9">
          更多商品資訊
        </p>
        <div className="bg-[#3F3A3A] h-px flex-grow" />
      </div>
      <Skeleton width={960} height={60} />
      <Skeleton width={960} height={540} />
    </div>
  </div>
);

export default ProductDetailSkeleton;

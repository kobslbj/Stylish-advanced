import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchProductDetail } from "../../utils/api";
import { Product } from "../../types/productTypes";
import { CartCountContext } from "../../contexts/CartCountContext";
import NotFound from "../layout/NotFound";
import ProductDetailSkeleton from "../layout/loading/ProductDetailSkeleton";
import { ProductCart } from "../../types/productCartType";

const ProductDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery<Product>({
    queryFn: () => fetchProductDetail(id!),
    queryKey: ["productDetails", id],
  });
  const { incrementCartCount } = useContext(CartCountContext);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorName, setSelectedColorName] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (data) {
      setSelectedColor(data.colors[0]?.code);
      setSelectedColorName(data.colors[0]?.name);
    }
  }, [data]);

  if (isError) {
    return <p className="py-48 text-center lg:py-[4.75rem]">500 Internal Server Error</p>;
  }
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }
  if (data === undefined) {
    return <NotFound />;
  }

  const colorItems = data.colors.map((color) => (
    <div key={color.code} className="mr-2.5">
      <button
        type="button"
        className={`w-5 h-5 border border-[#D3D3D3] cursor-pointer ${
          selectedColor === color.code && "outline outline-offset-[6px] outline-1"
        }`}
        style={{ backgroundColor: `#${color.code}` }}
        onClick={() => {
          setSelectedColor(color.code);
          setSelectedColorName(color.name);
        }}
      />
      <span className="sr-only">{color.name}</span>
    </div>
  ));
  const variants = data.variants.filter((variant) => variant.color_code === selectedColor);

  const sizeItems = variants.map((variant) => (
    <button
      type="button"
      key={variant.size}
      className={`w-9 h-9 bg-[#ECECEC] rounded-full mr-5 flex items-center justify-center cursor-pointer disabled:opacity-25 ${
        selectedSize === variant.size && "bg-black text-white"
      }`}
      onClick={() => {
        setSelectedSize(variant.size);
      }}
      disabled={variant.stock === 0}
      
    >
      <p className="px-2 font-sans text-xl text-center">{variant.size}</p>
    </button>
  ));

  const selectedVariant = variants.find((variant) => variant.size === selectedSize);
  const isMaxCountReached = selectedVariant && count >= selectedVariant.stock;
  const amountButton = (
    <div className="flex justify-around py-[6px] px-[15px] border lg:w-40 w-full">
      <button
        type="button"
        onClick={() => {
          setCount((prev) => prev - 1);
        }}
        disabled={count === 1}
        className="disabled:opacity-25"
      >
        -
      </button>
      <span className="text-brown">{count}</span>
      <button
        type="button"
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
        disabled={isMaxCountReached}
        className="disabled:opacity-25"
      >
        +
      </button>
    </div>
  );
  const imagesItems = data.images?.map((image,index) => (
    <img key={index} src={image} alt="相關商品圖片" className="lg:mb-[30px] mb-5" />
  ));

  function addToCartHandler() {
    if (data && selectedVariant && count > 0) {
      const productCartData: ProductCart = {
        id: data.id,
        name: data.title,
        image: data.main_image,
        colorCode: selectedColor,
        colorName: selectedColorName,
        size: selectedSize,
        quantity: count,
        stock: selectedVariant.stock,
        price: data.price,
      };
      const existingCartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = existingCartItems.findIndex(
        (item: ProductCart) =>
          item.id === productCartData.id &&
          item.colorCode === productCartData.colorCode &&
          item.size === productCartData.size,
      );
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      if (existingItemIndex !== -1) {
        existingCartItems[existingItemIndex].quantity += productCartData.quantity;
        localStorage.setItem("cart", JSON.stringify(existingCartItems));
        Toast.fire({
          icon: "success",
          title: "已增加商品數量"
        });
      } else {
        existingCartItems.push(productCartData);
        localStorage.setItem("cart", JSON.stringify(existingCartItems));
        Toast.fire({
          icon: "success",
          title: "已加入購物車"
        });
        incrementCartCount();
      }
    }
  }

  return (
    <div className="max-w-[60rem] m-auto mb-[3.063rem] ">
      <div className="lg:flex lg:flex-row items-center lg:mt-[65px] mb-[3.146rem]">
        <img src={data.main_image} alt={data.title} className="w-full h-auto lg:max-w-[560px] aspect-w-3 aspect-h-4" />
        <div className="mx-6 mt-4 lg:ml-10">
          <div className="pb-5 border-b border-[#3F3A3A]">
            <h1 className="font-sans lg:text-[32px] text-xl tracking-wide font-normal text-[#3F3A3A] leading-[38px]">
              {data.title}
            </h1>
            <p className="font-sans lg:text-xl text-lg leading-6 text-[#BABABA] tracking-[.2em] mt-4">{data.id}</p>
            <p className="font-sans lg:text-3xl text-xl text-[#3F3A3A] mt-10">
              TWD.
              {data.price}
            </p>
          </div>
          <div>
            <div className="flex items-center mt-[1.875rem]">
              <span className="font-sans lg:text-xl text-sm font-normal leading-6 tracking-[.2em] mr-6">顏色 |</span>
              {colorItems}
            </div>
            <div className="flex items-center mt-[1.875rem]">
              <span className="font-sans lg:text-xl text-sm font-normal leading-6 tracking-[.2em] mr-6">尺寸 |</span>
              {sizeItems}
            </div>
            <div className="flex items-center mt-[1.875rem]">
              <span className="font-sans text-xl font-normal leading-6 tracking-[.2em] mr-6 lg:block hidden">
                數量 |
              </span>
              {amountButton}
            </div>
          </div>
          <button
            type="button"
            onClick={addToCartHandler}
            disabled={!data || !selectedVariant || count < 0}
            className="font-sans lg:text-xl text-base font-normal leading-6 text-white bg-black px-28 py-[1.063rem] mt-[1.875rem] w-full lg:max-w-[360px]"
          >
            {!selectedSize ? "請選擇尺寸" : "加入購物車"}
          </button>
          <div className="mt-10 font-sans lg:text-xl text-sm font-normal leading-[30px] text-[#3F3A3A]">
            <p>{data.note}</p>
            <pre className="mt-3">{data.description}</pre>
            <p className="mt-3">{data.texture}</p>
            <p className="mt-3">清洗 : {data.wash}</p>
            <p className="mt-3">產地 : {data.place}</p>
          </div>
        </div>
      </div>
      <div className="mx-6 lg:mx-0">
        <div className="flex items-center">
          <p className="font-sans text-base lg:text-xl font-normal leading-[30px] text-[#8B572A] tracking-widest lg:mr-16 mr-9">
            更多商品資訊
          </p>
          <div className="bg-[#3F3A3A] h-px flex-grow" />
        </div>
        <p className="mt-7 mb-[1.875rem] font-sans text-base lg:text-xl text-[#3F3A3A]">{data.story}</p>
        <div className="flex flex-col items-center">{imagesItems}</div>
      </div>
    </div>
  );
};

export default ProductDetail;

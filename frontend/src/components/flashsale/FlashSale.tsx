import { useState, useEffect, useContext } from "react";
import PurchaseProgress from "../chart/PurchaseProgress";
import {
  fetchAllSeckillProducts,
  panicBuyProduct,
  fetchOrderWin,
} from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { CartCountContext } from "../../contexts/CartCountContext";

import Cookies from "js-cookie";
import Swal from "sweetalert2";
import io from "socket.io-client";

const user_Id = Cookies.get("user_id");

type Product = {
  name: string;
  picture: string;
  price: string;
  number: number;
  remain: number;
  productId: number;
  size: string;
  colorCode: string;
  colorName: string;
};

interface Winner {
  productName: string;
  productImage: string;
  qty: number;
  userName: string;
  userPicture: string;
}
const FlashSale = () => {
  const [seckillProducts, setSeckillProducts] = useState<Product[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const navigate = useNavigate();
  const { incrementCartCount } = useContext(CartCountContext);
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL1);

    socket.on("changeSecKillNumber", (data) => {
      console.log("SecKill Data:", data);
      setSeckillProducts((currentProducts) => {
        return currentProducts.map((product) => {
          if (product.productId === data.productId) {
            return { ...product, remain: data.remain };
          }
          return product;
        });
      });
    });

    return () => {
      socket.off("changeSecKillNumber");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadSeckillProducts = async () => {
      const products = await fetchAllSeckillProducts();
      setSeckillProducts(products);
      console.log(products);
    };
    loadSeckillProducts();
  }, []);
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const result = await fetchOrderWin();
        setWinners(result);
      } catch (error) {
        console.error("Error fetching winners:", error);
      }
    };
    fetchWinners();
  }, []);

  const addToCart = (product: {
    productId: any;
    name: any;
    picture: any;
    price: any;
    size: any;
    colorCode: any;
    colorName: any;
  }) => {
    const cartItem = {
      id: product.productId,
      name: product.name,
      image: product.picture,
      price: product.price,
      size: product.size,
      colorCode: product.colorCode,
      colorName: product.colorName,
      quantity: 1,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    existingCart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(existingCart));
    incrementCartCount();
  };
  const handleBuy = async (productId: number) => {
    const userId = user_Id || "123123123";
    try {
      const message = await panicBuyProduct(parseInt(userId), productId);
      Swal.fire({
        title: "成功!",
        text: message,
        icon: "success",
        confirmButtonText: "確定",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/checkout");
        }
      });
    } catch (error) {
      console.error("Error during panic buying:", error);
      Swal.fire({
        title: "哭哭",
        text: "搶購失敗",
        icon: "error",
        confirmButtonText: "確定",
      });
    }
    const product = seckillProducts.find((p) => p.productId === productId);
    if (product) {
      addToCart(product);
    }
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const targetDate = new Date("2024-01-06").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      // 計算剩餘時間
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // 更新狀態
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    // 組件卸載時清除計時器
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[60rem] m-auto mb-[3.063rem]">
      <div className="flex flex-row items-center justify-center mt-10">
        <p className="flex flex-col text-[50px] text-center font-bold leading-6">
          Fashion Day Flash
        </p>
        &nbsp;&nbsp;
        <p className="text-red-600 flex flex-col text-[50px] text-center font-bold leading-6">
          Sale
        </p>
      </div>
      <div className="flex flex-row items-center justify-center mt-10">
        <div className="flex flex-row gap-3">
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.days}</p>
            <p>Days</p>
          </div>
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.hours}</p>
            <p>Hours</p>
          </div>
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.minutes}</p>
            <p>Mins</p>
          </div>
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.seconds}</p>
            <p>Secs</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center">
        {seckillProducts.map((product) => (
          <div className="w-[800px] h-[300px] flex-shrink-0 bg-[#FBFBFB] rounded-[20px] border mt-5 flex flex-row">
            <div className="flex items-center">
              <img
                src={product.picture}
                alt="product"
                className="w-[250px] h-[250px] object-cover"
              />
            </div>
            <div className="flex flex-col relative">
              <p className=" flex-shrink-0 text-black font-bold text-[1.5rem] leading-[2.375rem]  > mt-5 ml-5">
                {product.name}
              </p>
              <div className="flex flex-row">
                <p className="flex-shrink-0 text-black font-bold text-[1.5rem] leading-[2.375rem]   mt-2 ml-5">
                  {product.price}
                </p>
                <p className="flex-shrink-0 text-[#939393] font-bold text-[1.5rem] leading-[2.375rem] line-through mt-2 ml-5">
                  ${`${parseInt(product.price, 10) + 100}`}
                </p>
              </div>
              <div className="w-[270px] h-[100px] ml-5">
                <PurchaseProgress
                  purchased={product.number - product.remain}
                  remaining={product.remain}
                />
              </div>
              <p className="flex-shrink-0 text-black font-bold text-[1.5rem] leading-[2.375rem]   mt-2 ml-5">
                僅剩{product.remain}件商品!!
              </p>
              <button
                onClick={() => handleBuy(product.productId)}
                className="w-[5.5rem] h-[5.5rem] flex-shrink-0 bg-white border border-black text-black rounded-full absolute left-[25rem] top-[12rem] hover:bg-black hover:text-white"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
        <div className="text-2xl font-bold cursor-pointer">查看幸運兒</div>
        {winners.map((winner) => (
          <p key={winner.userName}>
            姓名: {winner.userName} 獲得 {winner.productName}
          </p>
        ))}
      </div>
    </div>
  );
};

export default FlashSale;

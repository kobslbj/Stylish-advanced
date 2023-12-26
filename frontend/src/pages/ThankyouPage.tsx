import Cookies from "js-cookie";
import { useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ThankyouPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const userName = Cookies.get("user_name");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="lg:pt-[8.875rem] pt-[6.375rem] flex-1">
        <div className="flex flex-col items-center mt-6">
          <p className="mb-4 text-xl">交易已完成</p>
          <p className="mb-2 text-xl">訂單編號: {orderId}</p>
          <p className="mb-4 text-xl">感謝 {userName} 使用此服務</p>
          <a
            href="/"
            className="rounded-md py-2.5 px-12 bg-black text-white font-normal text-base cursor-pointer disabled:opacity-50"
          >
            回到首頁
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ThankyouPage;

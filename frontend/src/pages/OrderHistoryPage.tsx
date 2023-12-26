import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import UserSideBar from "../components/layout/UserSideBar";
import OrderTable from "../components/orderHistory/OrderTable";

const OrderHistoryPage = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <div className="lg:pt-[8.875rem] pt-[6.375rem] flex-1 lg:max-w-[1160px] mx-auto">
      <div className="flex gap-3 my-8">
        <UserSideBar />
        <div className="mt-5 ml-4">
          <p className="font-sans text-[#3F3A3A] text-2xl font-bold mb-4">訂單紀錄</p>
          <OrderTable />
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default OrderHistoryPage;

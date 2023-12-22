import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import ProfileForm from "../components/profile/ProfileForm";
// import OrderHistory from "../components/profile/OrderHistory";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  function logoutHandler() {
    Cookies.remove("token");
    Cookies.remove("user_id");
    Cookies.remove("user_name");
    Cookies.remove("user_email");
    Cookies.remove("user_picture");
    localStorage.removeItem("cart");
    navigate("/");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="lg:pt-[8.875rem] pt-[6.375rem] flex-1 lg:max-w-[1160px] mx-auto">
        <div className="mt-3 ml-4">
          <div className="mb-3">
            <p className="font-sans text-[#3F3A3A] text-xl font-bold mb-4">使用者資料</p>
            <p>使用者名稱: {Cookies.get("user_name")}</p>
            <p>使用者email: {Cookies.get("user_email")}</p>
          </div>
          <div className="flex items-center gap-24">
            {editing ? <div>hello</div> : <ProfileForm />}
            <div className="flex flex-col items-center gap-8">
              <div className="bg-black rounded-full md:w-[11.25rem] md:h-[11.25rem]" />
              <button type="button"><input type="file" />編輯照片</button>
            </div>
          </div>
          <button
            type="button"
            onClick={logoutHandler}
            className="my-4 rounded-md py-2.5 px-12 bg-black text-white font-normal text-base cursor-pointer disabled:opacity-50"
          >
            登出
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import ProfileForm from "../components/profile/ProfileForm";
import EditAvatar from "../components/profile/EditAvatar";
import ProfileUser from "../assets/images/profile-user.png";
import UserSideBar from "../components/layout/UserSideBar";

const token = Cookies.get("token");
async function fetchUserProfile() {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditPicture, setShowEditPicture] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | File>("");
  const { data, isLoading, isError } = useQuery({
    queryFn: () => fetchUserProfile(),
    queryKey: ["user", Cookies.get("user_id")],
  });
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="py-40 text-center lg:py-[4rem]">500 Internal Server Error</p>;

  function logoutHandler() {
    Cookies.remove("token");
    Cookies.remove("user_id");
    Cookies.remove("user_name");
    Cookies.remove("user_email");
    Cookies.remove("user_picture");
    localStorage.removeItem("cart");
    navigate("/");
  }
  async function fileChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (!files || files.length === 0) {
      Swal.fire("未選擇檔案", "請選擇一張圖片", "error");
      return;
    }
    const file = files[0];
    const acceptedFileTypes = /image\/(png|jpeg|jpg)/;
    if (!acceptedFileTypes.test(file.type)) {
      Swal.fire("請重新選擇圖片", "只接受 .png, .jpg 或 .jpeg 格式的文件", "error");
      return;
    }
    const maxFileSize = 1048576; // 1MB in bytes
    if (file.size > maxFileSize) {
      Swal.fire("圖片太大了", "檔案大小不能超過1MB", "error");
      return;
    }
    setSelectedFile(file);
    setShowEditPicture((prev) => !prev);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="lg:pt-[8.875rem] pt-[6.375rem] flex-1 lg:max-w-[1160px] mx-auto">
        <div className="flex gap-10 my-8">
          <UserSideBar />
          <div className="mt-5 ml-4">
            <p className="font-sans text-[#3F3A3A] text-base font-bold mb-4">使用者資料</p>
            <div className="items-center block gap-5 lg:flex lg:gap-24">
              <ProfileForm data={data} />
              <div className="flex flex-col items-center gap-8">
                <img src={data.picture || ProfileUser} alt="個人照片" className="rounded-full w-[10rem] h-[10rem] object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-lg font-bold leading-6 border-b"
                >
                  編輯照片
                  <input
                    type="file"
                    id="uploadAvatar"
                    ref={fileInputRef}
                    onChange={fileChangeHandler}
                    className="hidden"
                  />
                </button>
                {showEditPicture && (
                <EditAvatar
                  setShowEditPicture={setShowEditPicture}
                  file={selectedFile}
                />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={logoutHandler}
              className="my-4 rounded-md py-2.5 px-12 bg-red-500 text-white font-normal text-base cursor-pointer disabled:opacity-50"
            >
              登出
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;

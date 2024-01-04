/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

interface LoginFormProps {
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  showLogin: boolean;
}

type Form = {
  email: string;
  password: string;
};

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});
interface UserData {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    picture: string;
  };
}

const LoginForm: React.FC<LoginFormProps> = ({ setShowLogin, showLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const validationScheme: ZodType<Form> = loginSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(validationScheme) });

  function setCookies(data: UserData) {
    const maxAge = { expires: 30 }; // 30 days
    Cookies.set("token", data.access_token, maxAge);
    Cookies.set("user_id", data.user.id.toString(), maxAge);
    Cookies.set("user_name", data.user.name, maxAge);
    Cookies.set("user_email", data.user.email, maxAge);
    Cookies.set("user_picture", data.user.picture, maxAge);
  }

  function handleError(error: any) {
    if (error?.response?.status === 404) {
      Swal.fire("查無此用戶", "請更換email", "error");
    }
    if (error?.response?.status >= 500 && error?.response?.status < 600) {
      Swal.fire("Server Error", "請稍後再試或和我們的技術團隊聯絡", "error");
    } else {
      Swal.fire("登入失敗", `${error}`, "error");
    }
  }

  async function loginHandler(values: Form) {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/signin`, {
        provider: "native",
        email: values.email,
        password: values.password,
      });
      console.log(response.data);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { access_token, user } = response.data.data;
      setCookies({ access_token, user });
      navigate("/");
    } catch (error: any) {
      handleError(error);
    }
    setLoading(false);
  }

  function showLoginHandler() {
    setShowLogin(!showLogin);
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <p className="mb-10 text-2xl text-black">會員登入</p>
      <form method="post" className="flex flex-col items-center" onSubmit={handleSubmit(loginHandler)}>
        <label htmlFor="email" className="block mb-6">
          <p className="mb-2.5 text-base font-medium text-black">電子郵件</p>
          <input
            type="email"
            required
            className="border rounded-md focus:outline-none py-2 px-3.5 min-w-[19.25rem] font-medium text-base"
            placeholder="例: test@test.com"
            {...register("email")}
          />
        </label>
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
        <label htmlFor="password" className="block mb-6">
          <p className="mb-2.5 text-base font-medium text-black">密碼</p>
          <input
            type="password"
            required
            className="border rounded-md focus:outline-none py-2 px-3.5 min-w-[19.25rem]"
            {...register("password")}
          />
        </label>
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
        <div className="flex flex-col items-center">
          <button
            disabled={loading}
            type="submit"
            className="rounded-md py-2.5 px-12 bg-black text-white font-normal text-base cursor-pointer disabled:opacity-50"
          >
            登入
          </button>
          <p className="text-base font-medium mt-2.5">
            尚未成為會員 ?
            <button type="button" className="text-brown" onClick={showLoginHandler}>
              會員註冊
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

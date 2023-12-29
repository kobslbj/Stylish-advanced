import { useState } from "react";
import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Swal from "sweetalert2";

interface SignupFormProps {
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  showLogin: boolean;
}

type Form = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z
      .string(),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "密碼不相符",
    path: ["confirmPassword"],
  });

const SignupForm: React.FC<SignupFormProps> = ({ setShowLogin, showLogin }) => {
  const [loading, setLoading] = useState(false);
  const validationScheme: ZodType<Form> = signupSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(validationScheme) });

  async function signupHandler(values: Form) {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/signup`, {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      Swal.fire("註冊成功", "歡迎使用Stylish", "success");
      setShowLogin(!showLogin);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Swal.fire("信箱已使用", `${error}`, "error");
      }
      if (error?.response?.status >= 500 && error?.response?.status < 600) {
        Swal.fire("Server Error", "請稍後再試或和我們的技術團隊聯絡", "error");
      } else {
        Swal.fire("登入失敗", `${error}`, "error");
      }
    }
    setLoading(false);
  }
  function showLoginHandler() {
    setShowLogin(!showLogin);
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <p className="mb-10 text-2xl text-black">會員註冊</p>
      <form className="flex flex-col items-center pb-11" onSubmit={handleSubmit(signupHandler)}>
        <label htmlFor="user" className="block mb-6">
          <p className="mb-2.5 text-base font-medium text-black">使用者名稱</p>
          <input
            type="text"
            required
            className="border rounded-md focus:outline-none py-2 px-3.5 min-w-[19.25rem] "
            placeholder="例: Jaren Chang"
            {...register("name")}
          />
          {errors.name && <p className="mt-2 text-red-500">{errors.name.message}</p>}
        </label>
        <label htmlFor="email" className="block mb-6">
          <p className="mb-2.5 text-base font-medium text-black">電子郵件</p>
          <input
            type="email"
            required
            className="border rounded-md focus:outline-none py-2 px-3.5 min-w-[19.25rem]"
            placeholder="例: test@test.com"
            {...register("email")}
          />
          {errors.email && <p className="mt-2 text-red-500">{errors.email.message}</p>}
        </label>
        <label htmlFor="password" className="block mb-6">
          <p className="mb-2.5 font-outfit text-base font-medium text-black">密碼</p>
          <input
            required
            type="password"
            className="border rounded-md focus:outline-none py-2 px-3.5 min-w-[19.25rem]"
            {...register("password")}
          />
          {errors.password && <p className="mt-2 text-red-500">{errors.password.message}</p>}
        </label>
        <label htmlFor="confirmPassword" className="block mb-6">
          <p className="mb-2.5 font-outfit text-base font-medium text-black">再次輸入密碼</p>
          <input
            required
            type="password"
            className="border rounded-md focus:outline-none py-2 px-3.5 min-w-[19.25rem]"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="mt-2 text-red-500">{errors.confirmPassword.message}</p>}
        </label>
        <div className="flex flex-col items-center">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md py-2.5 px-12 bg-black text-white font-outfit font-normal text-base cursor-pointer disabled:opacity-50"
          >
            註冊
          </button>
          <p className="text-base font-medium mt-2.5">
            已經是會員了 ?
            <button type="button" className="text-brown" onClick={showLoginHandler}>
              會員登入
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;

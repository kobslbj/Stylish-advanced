import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";

type Form = {
  name: string;
  phoneNumber: string;
  address: string;
  email: string;
};
const pofileSchema = z.object({
  name: z.string().min(2).max(255),
  phoneNumber: z
    .string()
    .length(10, "手機格式不正確"),
  address: z.string(),
  email: z.string().email(),
});

const ProfileForm = () => {
  const validationScheme: ZodType<Form> = pofileSchema;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(validationScheme) });

  const mutation = useMutation({
    mutationFn: async (values :z.infer<typeof pofileSchema>) => {
      axios.put(
        `${import.meta.env.NEXT_PUBLIC_API_URL}/user`,
        {
          headers: { Authorization: `Bearer ${Cookies.get().access_token}` },
        },
      );
      console.log(values);
    },
    onSuccess: () => {
      const userId = Cookies.get().user_id;
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        alert("Club not found");
      } else if (error?.response?.status >= 500 && error?.response?.status < 600) {
        alert("請稍後再試或和我們的技術團隊聯絡");
      } else {
        alert(error);
      }
    },
  });
  async function profileChangeHandler(values: z.infer<typeof pofileSchema>) {
    setLoading(true);
    await mutation.mutateAsync(values);
    setLoading(false);
  }
  const errorInput = "border-red-500 text-red-500";
  return (
    <form onSubmit={handleSubmit(profileChangeHandler)} className="lg:mt-[50px] flex flex-col">
      <div>
        <p className="font-sans text-[#3F3A3A] text-base font-bold mb-4">使用者資料</p>
        <div className="mb-6 pt-[25px] border-t border-[#3F3A3A]">
          <div className="lg:max-w-[43.5rem]">
            <label htmlFor="name" className="justify-between lg:flex gap-7">
              <p className="mb-2.5 lg:mb-0">使用者名稱</p>
              <input
                type="text"
                className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full ${
                  errors.name && errorInput
                }`}
                {...register("name")}
              />
            </label>
            {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            <label htmlFor="phone-number" className="justify-between lg:flex mt-[1.875rem]">
              <p className="mb-2.5 lg:mb-0">手機</p>
              <input
                type="text"
                placeholder="0912345678"
                className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full ${
                  errors.phoneNumber && errorInput
                }`}
                {...register("phoneNumber")}
              />
            </label>
            {errors.phoneNumber && <span className="text-red-500">{errors.phoneNumber.message}</span>}
            <label htmlFor="address" className="justify-between lg:flex mt-[1.875rem] block">
              <p className="mb-2.5 lg:mb-0">地址</p>
              <input
                type="text"
                className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full ${
                  errors.address && errorInput
                }`}
                {...register("address")}
              />
            </label>
            {errors.address && <span className="text-red-500">{errors.address.message}</span>}
            <label htmlFor="email" className="justify-between lg:flex my-[1.875rem] block">
              <p className="mb-2.5 lg:mb-0">Email</p>
              <input
                type="email"
                className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full ${
                  errors.email && errorInput
                }`}
                {...register("email")}
              />
              {errors.email && <span className="text-red-500">{errors.email.message}</span>}
            </label>
          </div>
        </div>
        <p className="font-sans text-[#3F3A3A] text-base font-bold mb-4 mt-[50px]">信用卡資料</p>
        <div className="mb-6 pt-[25px] border-t border-[#3F3A3A]">
          <div className="max-w-[43.5rem]">
            <div className="lg:flex justify-between items-center mt-[1.875rem]">
              <p className="mb-2.5 lg:mb-0">信用卡號碼</p>
              <div
                id="card-number"
                className="text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full "
              />
            </div>
            <div className="lg:flex justify-between items-center mt-[1.875rem]">
              <p className="mb-2.5 lg:mb-0">有效期限</p>
              <div
                id="card-expiration-date"
                className="text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full "
              />
            </div>
            <div className="lg:flex justify-between items-center mt-[1.875rem]">
              <p className="mb-2.5 lg:mb-0">安全碼</p>
              <div
                id="card-ccv"
                className="text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" className="my-4 rounded-md py-2.5 px-12 bg-black text-white font-normal text-base cursor-pointer disabled:opacity-50">
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="my-4 rounded-md py-2.5 px-12 bg-brown text-white font-normal text-base cursor-pointer disabled:opacity-50"
        >
          更新資料
        </button>
      </div>

    </form>
  );
};

export default ProfileForm;

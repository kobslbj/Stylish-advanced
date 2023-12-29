import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import { User } from "../../types/userType";

type Form = {
  name: string;
  phoneNumber: string;
  address: string;
  email: string;
  birthday: string;
};
const pofileSchema = z.object({
  name: z.string().min(2, "請填寫姓名").max(255),
  phoneNumber: z
    .string()
    .length(10, "手機格式不正確"),
  address: z.string().min(2, "請填寫地址"),
  email: z.string().email(),
  birthday: z.string().min(2, "請選擇生日日期"),
});
interface ProfileFormProps {
  data: User;
}
const ProfileForm: React.FC<ProfileFormProps> = ({ data }) => {
  const validationScheme: ZodType<Form> = pofileSchema;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(validationScheme),
    defaultValues: {
      name: data.name,
      email: data.email,
      address: data?.address || "",
      phoneNumber: data?.phone_number || "",
      birthday: new Date(data?.birthday).toISOString().split("T")[0] || "",
    } });

  const mutation = useMutation({
    mutationFn: async (values :z.infer<typeof pofileSchema>) => {
      axios.put(
        `${import.meta.env.VITE_API_URL}/user/profile`,
        {
          id: Cookies.get("user_id"),
          name: values.name,
          email: values.email,
          phone_number: values.phoneNumber,
          birthday: values.birthday,
          address: values.address,
        },
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        },
      );
      const maxAge = { expires: 30 };
      Cookies.set("user_name", values.name, maxAge);
      Cookies.set("user_email", values.email, maxAge);
    },
    onSuccess: () => {
      Swal.fire("個人資料更新成功", "感謝使用Stylish", "success");
      const token = Cookies.get("token");
      queryClient.invalidateQueries({ queryKey: ["user", token] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 400) {
        Swal.fire("All field is required");
      } else if (error?.response?.status >= 500 && error?.response?.status < 600) {
        Swal.fire("請稍後再試或和我們的技術團隊聯絡");
      } else {
        Swal.fire(error);
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
    <form onSubmit={handleSubmit(profileChangeHandler)}>
      <div className="mb-6 pt-[25px] border-t border-[#3F3A3A] lg:max-w-[43.5rem]">
        <label htmlFor="name" className="justify-between lg:flex gap-7">
          <p className="mb-2.5 lg:mb-0 text-xl">使用者名稱</p>
          <input
            type="text"
            className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[30rem] h-8 w-full ${
              errors.name && errorInput
            }`}
            {...register("name")}
          />
        </label>
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
        <label htmlFor="phone-number" className="justify-between lg:flex mt-[1.875rem]">
          <p className="mb-2.5 lg:mb-0 text-xl">手機</p>
          <input
            type="text"
            placeholder="0912345678"
            className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[30rem] h-8 w-full ${
              errors.phoneNumber && errorInput
            }`}
            {...register("phoneNumber")}
          />
        </label>
        {errors.phoneNumber && <span className="text-red-500">{errors.phoneNumber.message}</span>}
        <label htmlFor="address" className="justify-between lg:flex mt-[1.875rem] block">
          <p className="mb-2.5 lg:mb-0 text-xl">地址</p>
          <input
            type="text"
            className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[30rem] h-8 w-full ${
              errors.address && errorInput
            }`}
            {...register("address")}
          />
        </label>
        {errors.address && <span className="text-red-500">{errors.address.message}</span>}
        <label htmlFor="email" className="justify-between lg:flex my-[1.875rem] block">
          <p className="mb-2.5 lg:mb-0 text-xl">Email</p>
          <input
            type="email"
            className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[30rem] h-8 w-full ${
              errors.email && errorInput
            }`}
            {...register("email")}
          />
        </label>
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
        <label htmlFor="birthday" className="justify-between lg:flex my-[1.875rem] block">
          <p className="mb-2.5 lg:mb-0 text-xl">生日</p>
          <input
            type="date"
            className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[30rem] h-8 w-full ${
              errors.birthday && errorInput
            }`}
            {...register("birthday")}
          />
        </label>
        {errors.birthday && <span className="text-red-500">{errors.birthday.message}</span>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="my-4 rounded-md py-2.5 px-12 bg-black text-white font-normal text-base cursor-pointer disabled:opacity-50"
      >
        更新資料
      </button>
    </form>
  );
};

export default ProfileForm;

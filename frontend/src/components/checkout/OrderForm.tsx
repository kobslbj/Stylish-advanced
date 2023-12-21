import { useContext, useEffect, useState } from "react";
import { z, ZodType } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ProductCart } from "../../types/productCartType";
import useTappay from "../../hooks/useTappay";
import { CartCountContext } from "../../contexts/CartCountContext";

type Form = {
  name: string;
  phoneNumber: string;
  address: string;
  email: string;
  time: string;
};

const emailRegex =
  /(?<zipcode>(^\d{5}|^\d{3})?)(?<city>\D+[縣市])(?<district>\D+?(市區|鎮區|鎮市|[鄉鎮市區]))(?<others>.+)/;

const schema = z.object({
  name: z.string().min(2).max(255),
  phoneNumber: z
    .string()
    .length(10, "手機格式不正確")
    .regex(/^09\d{8}$/, "手機格式不正確"),
  address: z.string().regex(emailRegex, "請輸入正確的地址格式"),
  email: z.string().email(),
  time: z.enum(["08:00-12:00", "14:00-18:00", "不指定"]),
});
interface OrderFormProps {
  cartUpdate: boolean;
  setCartUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrderForm: React.FC<OrderFormProps> = ({ cartUpdate, setCartUpdate }) => {
  const navigate = useNavigate();
  const { count } = useContext(CartCountContext);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  useTappay();

  useEffect(() => {
    const handleStorageChange = () => {
      const cartItems: ProductCart[] = JSON.parse(localStorage.getItem("cart") || "[]");
      let newTotalAmount = 0;
      if (cartItems) {
        cartItems.forEach((item: ProductCart) => {
          newTotalAmount += item.price * item.quantity;
        });
      }
      setTotalAmount(newTotalAmount);
    };
    handleStorageChange();
    setCartUpdate(false);
  }, [count, cartUpdate, setCartUpdate]);

  const validationScheme: ZodType<Form> = schema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(validationScheme) });
  const freight = 0;

  function transformCartItems(cartItems: ProductCart[]) {
    const transformedList = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      color: {
        code: item.colorCode,
        name: item.colorName,
      },
      size: item.size,
      qty: item.quantity,
    }));
    return transformedList;
  }

  async function onSubmit(values: Form) {
    setLoading(true);
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    console.log(tappayStatus);
    if (tappayStatus.canGetPrime === false) {
      alert("can not get prime");
    }
    try {
      const prime = await new Promise<string>((resolve) => {
        TPDirect.card.getPrime((result) => {
          resolve(result.card.prime);
        });
      });
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const list = transformCartItems(cartItems);
      const requestBody = {
        prime,
        order: {
          userId: Cookies.get("user_id"),
          shipping: "delivery",
          payment: "credit_card",
          subtotal: totalAmount,
          freight,
          total: totalAmount + freight,
          recipient: {
            name: values.name,
            phone: values.phoneNumber,
            email: values.email,
            address: values.address,
            time: values.time,
          },
          list,
        },
      };
      console.log(requestBody);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/order/checkout`, requestBody, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      console.log(response.data.data);
      navigate(`/thankyou?order_id=${response.data.data.number}&time=${response.data.data.time}`);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const errorInput = "border-red-500 text-red-500";
  const disabled = !Cookies.get("token") || totalAmount === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="lg:mt-[50px] flex flex-col">
      {disabled && <span className="mb-3 text-red-500">請先登入並選擇商品</span>}
      <div>
        <p className="font-sans text-[#3F3A3A] text-base font-bold mb-4">訂購資料</p>
        <div className="mb-6 pt-[25px] border-t border-[#3F3A3A]">
          <div className="lg:max-w-[43.5rem]">
            <label htmlFor="name" className="justify-between lg:flex">
              <p className="mb-2.5 lg:mb-0">收件人姓名</p>
              <input
                type="text"
                className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full ${
                  errors.name && errorInput
                }`}
                disabled={disabled}
                defaultValue={Cookies.get("user_name") || ""}
                {...register("name")}
              />
            </label>
            {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            <p className="text-brown mt-2.5 mb-[1.875rem] text-right">務必填寫完整收件人姓名，避免包裹無法順利簽收</p>
            <label htmlFor="phone-number" className="justify-between lg:flex mt-[1.875rem]">
              <p className="mb-2.5 lg:mb-0">手機</p>
              <input
                type="text"
                placeholder="0912345678"
                className={`text-base font-sans border rounded-lg outline-none px-2 lg:w-[36rem] h-8 w-full ${
                  errors.phoneNumber && errorInput
                }`}
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
                defaultValue={Cookies.get("user_email") || ""}
                {...register("email")}
              />
              {errors.email && <span className="text-red-500">{errors.email.message}</span>}
            </label>
            <label htmlFor="time">
              <span className="lg:mr-14 lg:mb-0 mb-2.5 block lg:inline">配送時間</span>
              <input type="radio" value="08:00-12:00" {...register("time")} disabled={disabled} />
              <span className="ml-2 mr-8 font-sans text-base font-normal">08:00-12:00</span>
              <input type="radio" value="14:00-18:00" {...register("time")} disabled={disabled} />
              <span className="ml-2 mr-8 font-sans text-base font-normal">14:00-18:00</span>
              <input type="radio" value="不指定" {...register("time")} disabled={disabled} />
              <span className="ml-2 font-sans text-base font-normal ">不指定</span>
            </label>
            {errors.time && <p className="text-red-500">{errors.time.message}</p>}
          </div>
        </div>
        <p className="font-sans text-[#3F3A3A] text-base font-bold mb-4 mt-[50px]">付款資料</p>
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
      <div className="min-w-[240px] mt-10 ml-auto">
        <div className="flex items-center justify-between mb-2.5">
          <p>總金額</p>
          <div className="flex items-center">
            <p>NT.</p>
            <p className="ml-2 text-3xl">{totalAmount}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2.5">
          <p>運費</p>
          <div className="flex items-center">
            <p>NT.</p>
            <p className="ml-2 text-3xl">{freight}</p>
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-[#3F3A3A] pt-2.5 mb-[50px]">
          <p>應付金額</p>
          <div className="flex items-center">
            <p>NT.</p>
            <p className="ml-2 text-3xl">{totalAmount + freight}</p>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={disabled && loading}
        className="font-sans text-base lg:text-xl tracking-widest text-white bg-black lg:px-[74px] lg:py-[17px] py-2 lg:ml-auto lg:max-w-[240px] w-full disabled:opacity-20 disabled:cursor-not-allowed"
      >
        確認付款
      </button>
    </form>
  );
};

export default OrderForm;

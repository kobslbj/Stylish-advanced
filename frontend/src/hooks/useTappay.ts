import { useEffect } from "react";

const { VITE_TAPPAY_APPID, VITE_TAPPAY_APPKEY, VITE_TAPPAY_SERVER_TYPE } = import.meta.env;

const useTappay = () => {
  useEffect(() => {
    TPDirect.setupSDK(VITE_TAPPAY_APPID, VITE_TAPPAY_APPKEY, VITE_TAPPAY_SERVER_TYPE);
    TPDirect.card.setup({
      // @ts-ignore
      fields: {
        number: {
          element: "#card-number",
          placeholder: "**** **** **** ****",
        },
        expirationDate: {
          element: '#card-expiration-date',
          placeholder: "MM / YY",
        },
        ccv: {
          element: "#card-ccv",
          placeholder: "後三碼",
        },
      },
      isMaskCreditCardNumber: true,
      maskCreditCardNumberRange: {
        beginIndex: 0,
        endIndex: 16,
      },
    });
    TPDirect.card.onUpdate((update) => {
      const newType = update.cardType === "unknown" ? "" : update.cardType;
      $("#cardtype").text(newType);
    });
  }, []);
};

export default useTappay;

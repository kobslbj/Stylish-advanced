import axios from "axios";
import Cookies from "js-cookie";

export async function fetchProducts(endpoint: string, keyword: string | null, pageParam: number) {
  const url = keyword
    ? `${import.meta.env.VITE_API_URL}/products/search`
    : `${import.meta.env.VITE_API_URL}/products/${endpoint}`;

  const params = keyword ? { keyword, paging: pageParam } : { paging: pageParam };
  const response = await axios.get(url, { params });
  console.log(response)
  return response.data;
}

export async function fetchProductDetail(id: string) {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/details`, {
    params: {
      id,
    },
  });
  return response.data.data;
}
export async function fetchUserProfile() {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
  return response.data.data;
}

export async function fetchOrderHistory(id: string) {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/history`, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
  return response.data.data;
}

export async function fetchProductComments(id: string) {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/getComment`, {
    params: {
      id,
    },
  });
  return response.data.comment;
}

export async function fetchProductSimilar(productId: any) {
  const url = `${import.meta.env.VITE_API_URL}/products/similar`;
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };

  const body = {
    id: productId
  };

  const response = await axios.get(url, {
    headers: headers,
    params: body
  });

  return response.data;
}

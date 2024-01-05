import axios from "axios";
import Cookies from "js-cookie";

console.log(Cookies.get("user_id"));
export async function fetchProducts(endpoint: string, keyword: string | null, pageParam: number) {
  const url = keyword
    ? `${import.meta.env.VITE_API_URL}/products/search`
    : `${import.meta.env.VITE_API_URL}/products/${endpoint}`;

  const params = keyword ? { keyword, paging: pageParam } : { paging: pageParam };
  const response = await axios.get(url, { params });
  console.log(response);
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
    id: productId,
  };

  const response = await axios.get(url, {
    headers,
    params: body,
  });

  return response.data;
}
export async function fetchProductMaylike(UserId: any) {
  const url = `${import.meta.env.VITE_API_URL}/products/maylike`;
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };

  const body = {
    id: UserId,
  };

  const response = await axios.get(url, {
    headers,
    params: body,
  });

  return response.data;
}
export async function likeComment(commentId: any) {
  const url = `${import.meta.env.VITE_API_URL}/products/likeComment`;
  const body = {
    commentId,
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error liking comment:", error);
    throw error;
  }
}
export async function dislikeComment(commentId: any) {
  const url = `${import.meta.env.VITE_API_URL}/products/DislikeComment`;

  try {
    const response = await axios.post(url, { commentId }, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error disliking comment:", error);
    throw error;
  }
}

export async function fetchAllSeckillProducts() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/getAllSeckillProduct`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching seckill products:", error);
    throw error;
  }
}

export async function panicBuyProduct(userId: number, productId: number) {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/products/panicBuying`, {
      userId,
      productId
    });
    return response.data.message;
  } catch (error) {
    console.error("Error during panic buying:", error);
    throw error;
  }
}
export async function fetchOrderWin() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/win`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching winning order:", error);
    throw error;
  }
}


export async function getComparePrice(searchword:string) {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/products/comparePrice`, {
      searchword,
    });
    return response.data;
  } catch (error) {
    console.error("Error get compare price:", error);
    throw error;
  }
}

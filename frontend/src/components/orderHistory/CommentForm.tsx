import { useState, useRef, FormEvent } from "react";
import { FaStar } from "react-icons/fa";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import axios from "axios";
import Modal from "../layout/Modal";
import CloseButton from "../../assets/images/close.png";

interface CommentFormProps {
  setAddComment:React.Dispatch<React.SetStateAction<boolean>>,
  productId:string,
}
const CommentForm:React.FC<CommentFormProps> = ({ setAddComment, productId }) => {
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      const selectedImages = Array.from(files).slice(0, 3);
      const isValidImages = selectedImages.every((image) => {
        if (!image.type.startsWith("image/")) {
          Swal.fire("Invalid Image Type", "Please upload only images.", "error");
          return false;
        }
        const maxFileSize = 1048576 * 2; // 2MB in bytes
        if (image.size > maxFileSize) {
          Swal.fire("Image Size Exceeded", "Please ensure that the image size is less than 2MB.", "error");
          return false;
        }
        return true;
      });
      if (isValidImages) {
        setImages(selectedImages);
      } else {
        event.target.value = "";
      }
    }
  };
  async function submitCommentHandler(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", Cookies.get("user_name")!);
      formData.append("userpicture", Cookies.get("user_picture")!);
      formData.append("userId", Cookies.get("user_id")!);
      formData.append("productId", productId);
      formData.append("text", commentRef.current?.value || "");
      formData.append("rating", rating?.toString() || "");
      images.forEach((image) => {
        formData.append("images", image);
      });
      await axios.post(
        `${import.meta.env.VITE_API_URL}/products/createComment`,
        formData,
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}`, "Content-Type": "multipart/form-data" },
        },
      );
      Swal.fire("評論新增成功", "感謝分享", "success");
    } catch (error :any) {
      if (error?.response?.status === 403) {
        Swal.fire("帳號已過期", "請重新登入", "error");
      }
      if (error?.response?.status >= 500 && error?.response?.status < 600) {
        Swal.fire("Server Error", "請稍後再試或和我們的技術團隊聯絡", "error");
      } else {
        Swal.fire("評論上傳失敗", `${error}`, "error");
      }
    }
    setLoading(false);
    setAddComment(false);
  }
  return (
    <Modal>
      <form onSubmit={submitCommentHandler}>
        <button type="button" onClick={() => setAddComment((prev) => !prev)} className="absolute top-6 right-6">
          <img src={CloseButton} alt="close-button" />
        </button>
        <div className="flex items-center gap-4 mb-5">
          <p className="text-xl font-bold">評價</p>
          <div className="flex">
            {[...Array(5)].map((_, index) => {
              const currentRating = index + 1;
              return (
                // eslint-disable-next-line jsx-a11y/label-has-associated-control
                <label key={currentRating}>
                  <input
                    type="radio"
                    name="rating"
                    value={currentRating}
                    onClick={() => setRating(currentRating)}
                    className="hidden"
                  />
                  <FaStar
                    size={40}
                    className="inline cursor-pointer"
                    color={currentRating <= (hover! || rating!) ? "#ffc107" : "#e4e5e9"}
                    onMouseEnter={() => setHover(currentRating)}
                    onMouseLeave={() => setHover(null)}
                  />
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-4 text-xl font-bold">上傳圖片(最多3張)</p>
          <input type="file" id="image-upload" accept="image/*" multiple onChange={handleImageChange} />
        </div>
        <div className="flex gap-4 mt-4">
          {images.map((image, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <img key={index} src={URL.createObjectURL(image)} alt={`uploaded-${index}`} width="100" height="auto" />
          ))}
        </div>
        <p className="mt-5 text-xl font-bold">評論</p>
        <textarea
          placeholder="為商品寫下評價"
          ref={commentRef}
          className="block w-[40dvw] min-h-[6.25rem] max-h-[50dvh] px-4 pt-4 my-4 bg-[#F0F2F5] rounded-lg border border-black placeholder:text-lg placeholder:leading-6 placeholder:font-normal placeholder:text-[#767676] focus:outline-none"
        />
        <button type="submit" disabled={loading} className="rounded-md py-2.5 px-8 bg-black text-white font-normal text-base cursor-pointer disabled:opacity-50">提交表單</button>
      </form>
    </Modal>
  );
};
export default CommentForm;

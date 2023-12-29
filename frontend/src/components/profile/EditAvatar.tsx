import { useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import CloseButton from "../../assets/images/close.png";
import Modal from "../layout/Modal";

interface EditAvatarProps {
  file: string | File;
  setShowEditPicture:React.Dispatch<React.SetStateAction<boolean>>
}

const EditAvatar: React.FC<EditAvatarProps> = ({ file, setShowEditPicture }) => {
  const handleEditorRef = useRef<AvatarEditor>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (handleEditorRef.current) {
        const edittedCanvas = handleEditorRef.current.getImageScaledToCanvas();
        const blob = await new Promise<Blob | null>((resolve) => {
          edittedCanvas.toBlob((canvasBlob) => resolve(canvasBlob), "image/png");
        });
        if (blob) {
          const timestamp = Date.now();
          const fileName = `edited_avatar_${timestamp}.png`;
          const editedFile = new File([blob], fileName, {
            type: "image/png",
            lastModified: Date.now(),
          });
          const formData = new FormData();
          formData.append("id", Cookies.get("user_id")!);
          formData.append("image", editedFile);
          const response = await axios.put(
            `${import.meta.env.VITE_API_URL}/user/picture`,
            formData,
            {
              headers: { Authorization: `Bearer ${Cookies.get("token")}`, "Content-Type": "multipart/form-data" },
            },
          );
          const maxAge = { expires: 30 };
          Cookies.set("user_picture", response.data.picture, maxAge);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", Cookies.get("user_id")] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        Swal.fire("帳號已過期", "請重新登入", "error");
      }
      if (error?.response?.status >= 500 && error?.response?.status < 600) {
        Swal.fire("Server Error", "請稍後再試或和我們的技術團隊聯絡", "error");
      } else {
        Swal.fire("圖片上傳失敗", `${error}`, "error");
      }
    },
  });
  async function PictureSubmitHandler() {
    await mutation.mutateAsync();
    setShowEditPicture((prev) => !prev);
  }
  return (
    <Modal>
      <div className="flex flex-col items-center">
        <p className="pt-6 pb-4 text-2xl text-center text-black font-outfit">編輯頭像</p>
        <button type="button" onClick={() => setShowEditPicture((prev) => !prev)} className="absolute top-6 right-6">
          <img src={CloseButton} alt="close-button" />
        </button>
        <div className="flex flex-col items-center">
          <AvatarEditor
            ref={handleEditorRef}
            image={file}
            width={300}
            height={300}
            border={20}
            borderRadius={150}
            color={[0, 0, 0, 0.5]}
            scale={1}
            rotate={0}
          />
          <button
            type="submit"
            onClick={PictureSubmitHandler}
            className="my-5 py-2.5 px-14 bg-black text-white rounded-md"
          >
            上傳
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditAvatar;

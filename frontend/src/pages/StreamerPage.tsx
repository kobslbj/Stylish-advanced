import React, { useState, useRef } from "react";
import Cookies from "js-cookie";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaRegWindowClose, FaRegCommentAlt } from "react-icons/fa";
import Comment from "../components/stream/Comment";

interface CommentType {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    picture: string;
  };
}

const LiveStreaming: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [enableMicrophone, setEnableMicrophone] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [comments, setComments] = useState<CommentType[]>([]);

  const startStreaming = async () => {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: enableMicrophone,
      });

      setStream(userMedia);
      if (videoRef.current) {
        videoRef.current.srcObject = userMedia;
      }
    } catch (error) {
      console.error("Error accessing user media:", error);
    }
  };

  const stopStreaming = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setStream(undefined);
    }
  };

  const toggleMicrophone = () => {
    setEnableMicrophone((prev) => !prev);
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  async function commentSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (commentRef.current?.value.trim() === "") {
      return;
    }
    const newComment:CommentType = {
      id: Date.now().toString(),
      content: commentRef.current?.value.trim() || "",
      user: {
        id: Cookies.get("user_id") || "",
        name: "Stylish 小編",
        picture: Cookies.get("user_picture")! || "",
      },
    };
    setComments((prevComments) => [...prevComments, newComment]);
    if (commentRef.current) {
      commentRef.current.value = "";
    }
  }

  return (
    <div className="flex mt-6 max-w-[1280px] mx-auto">
      <div className={`flex flex-col items-center ${showChat ? "w-3/4" : "w-full"}`}>
        <video ref={videoRef} autoPlay playsInline className="w-full h-full border-2 border-solid rounded-lg aspect-[4/3]"><track kind="captions" srcLang="zh" label="中文" /></video>
        <div className="flex gap-6 m-3">
          <button type="button" onClick={toggleMicrophone} className="flex gap-3 px-6 py-4 border rounded-lg">
            <span className="font-bold">麥克風</span>
            {enableMicrophone ? <FaMicrophoneSlash size={25} /> : <FaMicrophone size={25} />}
          </button>
          <button type="button" onClick={startStreaming} disabled={!!stream} className="flex gap-3 px-6 py-4 border rounded-lg">
            <span className="font-bold">{stream ? "直播中" : "開啟直播"}</span>
            <FaVideo size={25} />
          </button>
          <button type="button" onClick={stopStreaming} disabled={!stream} className="flex gap-3 px-6 py-4 bg-red-600 border rounded-lg">
            <span className="font-bold text-white">離開</span>
            <FaRegWindowClose size={25} color="white" />
          </button>
          <button type="button" onClick={() => setShowChat((prev) => !prev)} className="flex gap-3 px-6 py-4 bg-black border rounded-lg">
            <span className="font-bold text-white">聊天室</span>
            <FaRegCommentAlt size={25} color="white" />
          </button>
        </div>
      </div>
      {showChat && (
      <div className="w-1/4 bg-black rounded-lg">
        <div className="w-full p-4 overflow-y-auto h-[50rem]">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
        <form className="flex items-center h-[4rem]" onSubmit={commentSubmitHandler}>
          <textarea ref={commentRef} rows={1} className="resize-none block mx-2 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300" placeholder="Your message..." />
          <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100">
            <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </div>
      )}
    </div>
  );
};

export default LiveStreaming;

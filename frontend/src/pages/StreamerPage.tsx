import React, { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { FaVideo, FaRegWindowClose } from "react-icons/fa";
import { MediaConnection, Peer } from "peerjs";
import io, { Socket } from "socket.io-client";
import Comment from "../components/stream/Comment";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  // const [enableMicrophone, setEnableMicrophone] = useState(true);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  const [localId, setLocalId] = useState("");
  const currentCall = useRef<MediaConnection>();
  // const currentConnection = useRef<DataConnection>();
  const peerRef = useRef<Peer>();

  const socketRef = useRef<Socket>();
  const room = "room1";
  useEffect(() => {
    const userName = Cookies.get("user_name");
    socketRef.current = io(import.meta.env.VITE_API_URL1, {
      path: "/video",
    });
    socketRef.current.emit("join", room, userName);
    socketRef.current.on("chat message", (message: CommentType) => {
      setComments((prevComments) => [...prevComments, message]);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const endCall = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setStream(undefined);
    }
    if (currentCall.current) {
      currentCall.current.close();
    }
    if (socketRef.current) { socketRef.current.emit("send streamId", undefined); }
  };
  useEffect(() => {
    const createPeer = () => {
      peerRef.current = new Peer();
      peerRef.current.on("open", (id) => {
        // setStreamId(id);
        setLocalId(id);
        if (socketRef.current) { socketRef.current.emit("send streamId", id); }
        setLoading(false);
      });
      // peerRef.current.on("connection", (connection) => {
      //   // connection.on("data", (data) => {
      //   //   setComments((prevComments) => [...prevComments, data as CommentType]);
      //   // });

      //   currentConnection.current = connection;
      // });
      peerRef.current.on("call", async (call) => {
        // 回傳直播內容
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userMedia);
        if (videoRef.current) {
          videoRef.current.srcObject = userMedia;
        }
        call.answer(userMedia);
        currentCall.current = call;
      });
    };

    createPeer();

    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    };
    scrollToBottom();
  }, [comments]);

  async function startStreaming() {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(userMedia);
      if (videoRef.current) {
        videoRef.current.srcObject = userMedia;
        // videoRef.current.play();
      }
      if (socketRef.current) { socketRef.current.emit("send streamId", localId); }
    } catch (error) {
      console.log(error);
    }
  }

  function commentSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (commentRef.current?.value.trim() === "") {
      return;
    }
    // if (!currentConnection.current) {
    //   alert("還沒連線");
    //   return;
    // }
    const newComment:CommentType = {
      id: Date.now().toString(),
      content: commentRef.current?.value.trim() || "",
      user: {
        id: Cookies.get("user_id") || "",
        name: "Stylish 小編",
        picture: Cookies.get("user_picture")! || "",
      },
    };
    // currentConnection.current.send(newComment);
    socketRef.current?.emit("chat message", room, newComment);
    setComments((prevComments) => [...prevComments, newComment]);

    if (commentRef.current) {
      commentRef.current.value = "";
    }
  }
  function stopStreming() {
    const newComment:CommentType = {
      id: Date.now().toString(),
      content: "=====直播已結束=====",
      user: {
        id: Cookies.get("user_id") || "",
        name: "Stylish 小編",
        picture: Cookies.get("user_picture")! || "",
      },
    };
      // currentConnection.current.send(newComment);
    socketRef.current?.emit("chat message", room, newComment);
    setComments((prevComments) => [...prevComments, newComment]);
    endCall();
  }

  const copyLink = () => {
    navigator.clipboard.writeText(localId);
    // Swal.fire("已複製到剪貼簿", "分享給用戶", "success");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="lg:pt-[8.875rem] pt-[6.375rem] flex-1 flex flex-col">
        <div className="flex items-center justify-center my-3">
          <p className="mr-3">房間號碼:{loading ? "loading..." : localId }</p>
          <button type="button" onClick={copyLink} className="rounded-md py-2.5 px-4 bg-black text-white font-normal text-base disabled:opacity-50">
            複製
          </button>
        </div>
        <div className="flex mb-4 max-w-[1280px] mx-auto">
          <div className="flex flex-col items-center w-3/4">
            <video ref={videoRef} autoPlay playsInline className="w-[660px] h-full border-2 border-solid rounded-lg aspect-[4/3] bg-black"><track kind="captions" srcLang="zh" label="中文" /></video>
            <div className="flex gap-6 m-3">
              {/* <button type="button" onClick={toggleMicrophone} className="flex gap-3 px-6 py-4 border rounded-lg">
            <span className="font-bold">麥克風</span>
            {enableMicrophone ? <FaMicrophoneSlash size={25} /> : <FaMicrophone size={25} />}
          </button> */}
              <button type="button" onClick={startStreaming} className="flex gap-3 px-6 py-4 border rounded-lg">
                <span className="font-bold">開直播</span>
                <FaVideo size={25} />
              </button>
              <button type="button" onClick={stopStreming} disabled={!stream} className="flex gap-3 px-6 py-4 bg-red-600 border rounded-lg">
                <span className="font-bold text-white">離開</span>
                <FaRegWindowClose size={25} color="white" />
              </button>
            </div>
          </div>
          <div className="flex flex-col w-1/4 bg-black rounded-lg">
            <div ref={chatContainerRef} className="w-full p-4 overflow-y-auto h-[35rem]">
              {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </div>
            <form className="flex items-center h-[4rem]" onSubmit={commentSubmitHandler}>
              <textarea ref={commentRef} rows={1} className="resize-none block mx-2 p-2.5 w-full text-xs text-gray-900 bg-white rounded-lg border border-gray-300" placeholder="Your message..." />
              <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100">
                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LiveStreaming;

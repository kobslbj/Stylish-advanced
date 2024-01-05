import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
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

const StreamViewerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const peerRef = useRef<Peer>();
  const currentCall = useRef<MediaConnection>();
  // const currentConnection = useRef<DataConnection>();
  const [remoteId, setRemoteId] = useState("");

  const socketRef = useRef<Socket>();
  const room = "room1";
  useEffect(() => {
    const userName = Cookies.get("user_name");
    socketRef.current = io(import.meta.env.VITE_API_URL1, {
      path: "/video",
    });
    socketRef.current.emit("join", room, userName);
    socketRef.current.on("receive streamId", (streamId) => {
      setRemoteId(streamId);
    });
    socketRef.current.on("chat message", (message: CommentType) => {
      setComments((prevComments) => [...prevComments, message]);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const endCall = () => {
    if (!remoteId && videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (currentCall.current) {
      currentCall.current.close();
    }
  };

  useEffect(() => {
    peerRef.current = new Peer();
    // peerRef.current.on("connection", (connection) => {
    //   currentConnection.current = connection;
    // });
    if (!remoteId && videoRef.current) {
      videoRef.current.srcObject = null;
    }
    return () => {
      endCall();
    };
  });

  async function watchStream() {
    if (!remoteId) {
      return;
    }
    if (peerRef.current) {
      // const connection = peerRef.current.connect(remoteId);
      // currentConnection.current = connection;
      // if (!currentConnection.current) {
      //   alert("目前沒有直播");
      // }
      // connection.on("open", () => {
      //   console.log("已連接");
      // });
      // connection.on("data", (data) => {
      //   setComments((prevComments) => [...prevComments, data as CommentType]);
      // });
      const userMedia = await navigator.mediaDevices.getUserMedia({ video: true });
      const call = peerRef.current.call(remoteId, userMedia);

      // 停止本地端直播
      const videoTrack = userMedia.getVideoTracks()[0];
      videoTrack.stop();
      userMedia.getTracks().forEach((track) => track.stop());

      // 接收直播
      call.on("stream", async (stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
      call.on("error", (err) => {
        console.error(err);
      });
      call.on("close", () => {
        console.log("closed");
        endCall();
      });
      // currentCall.current = call;
      // console.log(currentCall.current);
    }
  }

  async function commentSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // if (!currentConnection.current) {
    //   alert("還沒連線");
    //   return;
    // }
    if (commentRef.current?.value.trim() === "") {
      console.log("no comment");
      return;
    }
    const newComment:CommentType = {
      id: Date.now().toString(),
      content: commentRef.current?.value.trim() || "",
      user: {
        id: Cookies.get("user_id") || "",
        name: Cookies.get("user_name") || "",
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="lg:pt-[8.875rem] pt-[6.375rem] flex-1 flex flex-col">
        <div className="flex items-center justify-center my-3">
          {/* <input value={remoteId} onChange={(e) => setRemoteId(e.target.value)} type="text" placeholder="房間號碼" className="py-1 mr-2 w-[20rem] border rounded-lg" /> */}
          <button
            type="button"
            onClick={watchStream}
            disabled={!remoteId}
            className="px-4 py-2 text-base font-normal text-white bg-black rounded-md disabled:opacity-50"
          >
            {remoteId ? "加入直播" : "目前沒有直播" }
          </button>
        </div>
        <div className="flex mb-2 max-w-[1280px] mx-auto">
          <div className="w-3/4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              controls
              className="w-[660px] h-full border-2 border-solid rounded-lg aspect-[4/3] bg-black"
            ><track kind="captions" srcLang="zh" label="中文" />
            </video>
          </div>
          <div className="w-1/4 bg-black rounded-lg">
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

export default StreamViewerPage;

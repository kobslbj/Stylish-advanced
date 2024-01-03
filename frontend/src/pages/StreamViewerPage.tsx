import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { DataConnection, MediaConnection, Peer } from "peerjs";
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

const StreamViewerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const socketRef = useRef<Socket>();
  const room = "room1";
  useEffect(() => {
    const userName = Cookies.get("user_name");
    socketRef.current = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
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

  const peerRef = useRef<Peer>();
  const currentCall = useRef<MediaConnection>();
  const currentConnection = useRef<DataConnection>();
  const [remoteId, setRemoteId] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | undefined>(undefined);

  const endCall = () => {
    if (myStream) {
      const tracks = myStream.getTracks();
      tracks.forEach((track) => track.stop());
      setMyStream(undefined);
    }
    if (currentCall.current) {
      currentCall.current.close();
    }
  };

  useEffect(() => {
    peerRef.current = new Peer();
    return () => {
      endCall();
    };
  }, []);

  async function watchStream() {
    if (peerRef.current) {
      const connection = peerRef.current.connect(remoteId);
      currentConnection.current = connection;
      connection.on("open", () => {
        console.log("已連接");
      });
      const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(userMedia);
      const call = peerRef.current.call(remoteId, userMedia);
      call.on("stream", async (stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
      call.on("error", (err) => {
        console.error(err);
      });
      call.on("close", () => {
        endCall();
      });
    }
  }

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
        name: Cookies.get("user_name") || "",
        picture: Cookies.get("user_picture")! || "",
      },
    };
    socketRef.current?.emit("chat message", room, newComment);
    setComments((prevComments) => [...prevComments, newComment]);

    if (commentRef.current) {
      commentRef.current.value = "";
    }
  }

  return (
    <div className="flex mt-6 max-w-[1280px] mx-auto">
      <div>
        <input value={remoteId} onChange={(e) => setRemoteId(e.target.value)} type="text" placeholder="對方的 Peer 的 Id" />
        <button
          type="button"
          onClick={watchStream}
        >
          開始觀看
        </button>
      </div>
      <div className="w-3/4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full h-full border-2 border-solid rounded-lg aspect-[4/3] bg-black"
        ><track kind="captions" srcLang="zh" label="中文" />
        </video>
      </div>
      <div className="w-1/4 bg-black rounded-lg">
        <div ref={chatContainerRef} className="w-full p-4 overflow-y-auto h-[50rem]">
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
    </div>
  );
};

export default StreamViewerPage;

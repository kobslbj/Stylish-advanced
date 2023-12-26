import React, { useState, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaRegWindowClose, FaRegCommentAlt } from "react-icons/fa";

const LiveStreaming: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [enableMicrophone, setEnableMicrophone] = useState(true);
  const [showChat, setShowChat] = useState(true);

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

  return (
    <div className="flex mt-6 max-w-[1280px] mx-auto">
      <div className="flex flex-col items-center w-3/4">
        <video ref={videoRef} autoPlay playsInline className="w-full border-2 border-solid rounded-lg aspect-[4/3]"><track kind="captions" srcLang="zh" label="中文" /></video>
        <div className="flex gap-6 m-5">
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
      <div className="flex w-1/4 bg-black rounded-lg">
        <textarea
          className="resize-none min-w-[20rem] min-h-[2rem] mt-2.5 p-2 dark:text-black bg-[#F0F2F5] border border-neutral-400 rounded-[0.625rem] focus:outline-none"
        />
      </div>
      )}
    </div>
  );
};

export default LiveStreaming;

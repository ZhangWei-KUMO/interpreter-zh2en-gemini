'use client';

import { useRef, useState } from "react";
import cn from "classnames";
import { LiveAPIProvider } from "@/contexts/LiveAPIContext";
import SidePanel from "@/components/side-panel/SidePanel";
import { Altair } from "@/components/altair/Altair";
import ControlTray from "@/components/control-tray/ControlTray";

// Get API key only in browser environment
const getApiKey = () => {
  if (typeof window !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY || "AIzaSyB7B6681pEsgWq9mFkJNVqo3viGty2KiRw"
  }
  return '';
};

const API_KEY = getApiKey();
if (typeof window !== 'undefined' && !API_KEY) {
  throw new Error("set GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

export default function Home() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY || ''}>
        <div className="streaming-console">
          <SidePanel />
          <main>
            <div className="main-app-area">
              {/* APP goes here */}
              <Altair />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
              enableEditingSettings={true}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
} 
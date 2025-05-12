'use client';

import { useRef, useState } from "react";
import cn from "classnames";
import dynamic from 'next/dynamic';
import { Altair } from "@/components/altair/Altair";
import ControlTray from "@/components/control-tray/ControlTray";

// Dynamically import the client-only wrapper for SidePanel
const SidePanelClientOnly = dynamic(() => import('@/components/side-panel/SidePanelClientOnly'), { ssr: false });

export default function AppClientLayout() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <div className="streaming-console">
        <SidePanelClientOnly />
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
    </div>
  );
} 
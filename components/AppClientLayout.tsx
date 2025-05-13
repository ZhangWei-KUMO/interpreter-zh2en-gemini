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
  const [translationActive, setTranslationActive] = useState(false);

  return (
    <div className="App">
      <div className="streaming-console">
        <SidePanelClientOnly />
        <main>
          <div className="main-app-area">
            <div className="content-container">
              <div className="welcome-card">
                <div className="welcome-header">
                  <span className="material-symbols-outlined logo-icon">translate</span>
                  <h1>中文 ⟷ English Interpreter</h1>
                </div>
                
                <div className="status-indicator">
                  <div className={`status-dot ${translationActive ? 'active' : 'inactive'}`}></div>
                  <p>{translationActive ? 'Translation Active' : 'Ready to Translate'}</p>
                </div>
                
                <div className="instructions">
                  <h2>Getting Started</h2>
                  <ol>
                    <li>点击右下角的电源按钮开始翻译</li>
                    <li>请说中文或英文</li>
                    <li>AI将进行中英同声传译</li>
                  </ol>
                </div>
                
                <div className="language-badges">
                  <div className="language-badge">
                    <span className="material-symbols-outlined">record_voice_over</span>
                    <span>中文</span>
                  </div>
                  <div className="arrow">→</div>
                  <div className="language-badge">
                    <span className="material-symbols-outlined">mic</span>
                    <span>English</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Altair组件负责API调用，不可见 */}
            <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
              <Altair />
            </div>
            
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
            onRecordingStateChange={(isRecording) => setTranslationActive(isRecording)}
          >
            {/* put your own buttons here */}
          </ControlTray>
        </main>
      </div>
    </div>
  );
} 
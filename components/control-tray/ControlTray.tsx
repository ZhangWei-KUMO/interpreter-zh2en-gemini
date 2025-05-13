'use client';

/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cn from "classnames";
import { memo, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
import { UseMediaStreamResult } from "@/hooks/use-media-stream-mux";
import { useScreenCapture } from "@/hooks/use-screen-capture";
import { useWebcam } from "@/hooks/use-webcam";
import { AudioRecorder } from "../../lib/audio-recorder";
import AudioPulse from "@/components/audio-pulse/AudioPulse";
import "./control-tray.scss";
import SettingsDialog from "@/components/settings-dialog/SettingsDialog";
import { useConsoleVisibility } from "@/contexts/ConsoleVisibilityContext";

export type ControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement>;
  children?: ReactNode;
  supportsVideo: boolean;
  onVideoStreamChange?: (stream: MediaStream | null) => void;
  enableEditingSettings?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
};

type MediaStreamButtonProps = {
  isStreaming: boolean;
  onIcon: string;
  offIcon: string;
  start: () => Promise<any>;
  stop: () => any;
  className?: string;
  tooltip?: string;
};

/**
 * button used for triggering webcam or screen-capture
 */
const MediaStreamButton = memo(
  ({ isStreaming, onIcon, offIcon, start, stop, className, tooltip }: MediaStreamButtonProps) => (
    <button 
      className={cn("action-button", className, { active: isStreaming })} 
      onClick={isStreaming ? stop : start}
      title={tooltip}
    >
      <span className="material-symbols-outlined">{isStreaming ? onIcon : offIcon}</span>
    </button>
  )
);

MediaStreamButton.displayName = 'MediaStreamButton';

function ControlTray({
  videoRef,
  children,
  onVideoStreamChange = () => {},
  supportsVideo,
  enableEditingSettings,
  onRecordingStateChange,
}: ControlTrayProps) {
  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] =
    useState<MediaStream | null>(null);
  const [webcam, screenCapture] = videoStreams;
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { isConsoleVisible, toggleConsole } = useConsoleVisibility();

  const { client, connected, connect, disconnect, volume } =
    useLiveAPIContext();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);
  
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`
    );
  }, [inVolume]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }

    let timeoutId = -1;

    function sendVideoFrame() {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;

      if (!video || !canvas) {
        return;
      }

      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      if (canvas.width + canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 1.0);
        const data = base64.slice(base64.indexOf(",") + 1, Infinity);
        client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }
      if (connected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    }
    if (connected && activeVideoStream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [connected, activeVideoStream, client, videoRef]);

  // 处理媒体流切换
  const changeStreams = (next?: UseMediaStreamResult) => async () => {
    if (next) {
      const mediaStream = await next.start();
      setActiveVideoStream(mediaStream);
      onVideoStreamChange(mediaStream);
    } else {
      setActiveVideoStream(null);
      onVideoStreamChange(null);
    }

    videoStreams.filter((msr) => msr !== next).forEach((msr) => msr.stop());
  };

  // 处理连接/断开
  const toggleConnection = () => {
    if (connected) {
      disconnect();
      if (onRecordingStateChange) onRecordingStateChange(false);
    } else {
      // 显示连接中提示
      setIsConnecting(true);
      
      connect()
        .then(() => {
          setIsConnecting(false);
          if (onRecordingStateChange && !muted) onRecordingStateChange(true);
        })
        .catch((error) => {
          setIsConnecting(false);
          // 显示错误提示
          alert(`连接失败: ${error.message || '连接服务器时出错，请检查网络或API密钥是否正确'}`);
          console.error("Connection error:", error);
        });
    }
  };

  return (
    <>
      <section className="control-tray">
        <canvas style={{ display: "none" }} ref={renderCanvasRef} />
        
        <div className={cn("actions-nav", { disabled: !connected })}>
          <button
            className={cn("action-button mic-button", { active: !muted })}
            onClick={() => {
              const newMuted = !muted;
              setMuted(newMuted);
              if (onRecordingStateChange && connected) {
                onRecordingStateChange(!newMuted);
              }
            }}
            title={muted ? "打开麦克风" : "关闭麦克风"}
          >
            {!muted ? (
              <span className="material-symbols-outlined filled">mic</span>
            ) : (
              <span className="material-symbols-outlined filled">mic_off</span>
            )}
          </button>

          <div className="action-button no-action outlined">
            <AudioPulse volume={volume} active={connected} hover={false} />
          </div>

          {supportsVideo && (
            <>
              <MediaStreamButton
                isStreaming={screenCapture.isStreaming}
                start={changeStreams(screenCapture)}
                stop={changeStreams()}
                onIcon="cancel_presentation"
                offIcon="present_to_all"
                className="screen-button"
                tooltip="分享屏幕"
              />
              <MediaStreamButton
                isStreaming={webcam.isStreaming}
                start={changeStreams(webcam)}
                stop={changeStreams()}
                onIcon="videocam_off"
                offIcon="videocam"
                className="camera-button"
                tooltip="开启摄像头"
              />
            </>
          )}
          
          {children}
        </div>

        <div className="right-buttons">
          <button
            ref={connectButtonRef}
            className={cn("connection-button", { connected })}
            onClick={toggleConnection}
            disabled={isConnecting}
          >
            <span className="material-symbols-outlined">
              {connected ? "power" : "power_off"}
            </span>
            <span className="button-text">
              {isConnecting ? "连接中..." : (connected ? "断开连接" : "开始连接")}
            </span>
          </button>

          <button 
            className={cn("console-button", { active: isConsoleVisible })} 
            onClick={toggleConsole}
            title="控制台"
          >
            <span className="material-symbols-outlined">terminal</span>
          </button>

          {enableEditingSettings && (
            <button 
              className="settings-button" 
              onClick={() => setShowSettings(true)}
              title="设置"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          )}
        </div>
      </section>

      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default memo(ControlTray); 
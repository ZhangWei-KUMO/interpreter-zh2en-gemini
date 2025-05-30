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
import { useEffect, useState, useRef } from "react";
import "./settings-dialog.scss";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";

// 用于存储用户设置的localStorage键名
const STORAGE_KEYS = {
  API_KEY: 'gemini-interpreter-api-key',
  SYSTEM_PROMPT: 'gemini-interpreter-system-prompt',
  VOICE_NAME: 'gemini-interpreter-voice-name',
};

// 默认系统提示词
const DEFAULT_SYSTEM_PROMPT = 
`你是一个专业的、忠诚的国家元首级口译人员，你应当认真听取对方的语言。如果是中文则需要精准地翻译成英文，如果是英文则需要精准地翻译成中文。`;

// 可选的语音名称
const VOICE_OPTIONS = [
  { value: "Puck", label: "Puck" },
  { value: "Charon", label: "Charon" },
  { value: "Kore", label: "Kore" },
  { value: "Fenrir", label: "Fenrir" },
  { value: "Aoede", label: "Aoede" },
];

// 默认语音名称
const DEFAULT_VOICE_NAME = "Kore";

interface SettingsDialogProps {
  onClose?: () => void;
}

export default function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const { setConfig, config, client, connected, disconnect } = useLiveAPIContext();
  
  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [voiceName, setVoiceName] = useState(DEFAULT_VOICE_NAME);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [needsReconnect, setNeedsReconnect] = useState(false);
  
  const drawerRef = useRef<HTMLDivElement>(null);

  // 从localStorage加载设置
  useEffect(() => {
    const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const storedSystemPrompt = localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT);
    const storedVoiceName = localStorage.getItem(STORAGE_KEYS.VOICE_NAME);

    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    if (storedSystemPrompt) {
      setSystemPrompt(storedSystemPrompt);
    }
    
    if (storedVoiceName) {
      setVoiceName(storedVoiceName);
    }
  }, []);

  // Handle ESC key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCloseDrawer = () => {
    setIsClosing(true);
    // Add small delay to allow animation to complete
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      // 调用外部关闭回调
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  const saveSettings = () => {
    // 保存系统提示词和语音名称到localStorage
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, systemPrompt);
    localStorage.setItem(STORAGE_KEYS.VOICE_NAME, voiceName);

    // 检查API Key是否更改
    const oldApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const apiKeyChanged = oldApiKey !== apiKey;
    
    if (apiKeyChanged && apiKey) {
      // 保存新的API Key
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
      setNeedsReconnect(true);
      setMessage("API Key has been updated. Please reconnect to apply changes.");
    }

    // 更新模型配置 - 系统提示词和语音设置
    setConfig({
      ...config,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        ...config.generationConfig,
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          languageCode: "cmn-CN" as any,
        },
      }
    });

    if (!apiKeyChanged) {
      setSaved(true);
      setMessage("Settings saved successfully!");
      setTimeout(() => {
        setSaved(false);
        setMessage("");
      }, 3000);
    }
  };

  const handleReconnect = async () => {
    try {
      // 先断开连接
      if (connected) {
        await disconnect();
      }
      
      // 由于我们不能直接修改client中的apiKey，这里建议用户刷新页面
      setMessage("Please refresh the page to apply the new API Key.");
      
      // 关闭抽屉
      setTimeout(() => {
        handleCloseDrawer();
        window.location.reload(); // 刷新页面以使用新的API Key
      }, 2000);
    } catch (error) {
      console.error("Error during reconnection:", error);
      setMessage("Failed to reconnect. Please refresh the page manually.");
    }
  };

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setVoiceName(DEFAULT_VOICE_NAME);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="settings-dialog-background" 
      onClick={handleCloseDrawer}
      style={{ opacity: isClosing ? 0 : 1, transition: 'opacity 0.3s ease' }}
    >
      <div 
        ref={drawerRef}
        className="settings-dialog" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="settings-drawer-title"
        style={isClosing ? { transform: 'translateX(100%)', transition: 'transform 0.3s ease' } : {}}
      >
        <div className="dialog-header">
          <h3 id="settings-drawer-title">设置</h3>
          <button 
            className="close-button" 
            onClick={handleCloseDrawer}
            aria-label="关闭设置"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="dialog-content">
          <div className="settings-section">
            <h4>API 配置</h4>
            <div className="input-group">
              <label htmlFor="api-key">Gemini API Key</label>
              <input
                id="api-key"
                type="text"
                placeholder="输入你的 Gemini API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="input-help">
                输入用于翻译的 Gemini API Key。
                如果已更改，需要重新连接才能生效。
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h4>语音设置</h4>
            <div className="input-group">
              <label htmlFor="voice-name">语音角色</label>
              <select
                id="voice-name"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="voice-select"
              >
                {VOICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="input-help">
                选择模型回复时使用的语音角色。
                不同的角色有不同的音色和风格。
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h4>系统提示词</h4>
            <div className="input-group">
              <label htmlFor="system-prompt">系统指令</label>
              <textarea
                id="system-prompt"
                placeholder="输入模型的系统指令"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
              <p className="input-help">
                此提示词将用作系统指令以指导模型行为。
                根据您的中英文翻译需求进行自定义。
              </p>
            </div>
          </div>

          {message && (
            <div className={needsReconnect ? "warning-indicator" : "success-indicator"}>
              {message}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button
            className="reset-button"
            onClick={handleReset}
          >
            恢复默认设置
          </button>
          
          {needsReconnect ? (
            <button
              className="primary-button"
              onClick={handleReconnect}
            >
              重新连接
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={saveSettings}
            >
              保存设置
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
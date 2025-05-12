'use client';

import { useState, useEffect, useRef } from 'react';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import styles from './DigitalHuman.module.scss';

const DigitalHuman = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { client } = useLiveAPIContext();
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // 监听音频/语音事件
    const handleAudio = (data: ArrayBuffer) => {
      setIsSpeaking(true);
      
      // 当收到音频数据后，等待一小段时间再停止说话效果
      // 这是因为音频数据可能以块的形式到达，中间有间隔
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
      }, 500);
    };

    // 监听中断事件（停止语音）
    const handleInterrupted = () => {
      setIsSpeaking(false);
    };

    client.on('audio', handleAudio);
    client.on('interrupted', handleInterrupted);

    return () => {
      client.off('audio', handleAudio);
      client.off('interrupted', handleInterrupted);
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, [client]);

  return (
    <div className={styles.digitalHumanContainer}>
      <div className={`${styles.digitalHumanAvatar} ${isSpeaking ? styles.speaking : ''}`}>
        <div className={styles.head}>
          <div className={styles.face}>
            <div className={styles.eyes}>
              <div className={styles.eye}></div>
              <div className={styles.eye}></div>
            </div>
            <div className={`${styles.mouth} ${isSpeaking ? styles.animated : ''}`}></div>
          </div>
        </div>
        <div className={styles.body}></div>
      </div>
      <div className={styles.speechIndicator}>
        {isSpeaking && (
          <div className={styles.audioWaves}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalHuman; 
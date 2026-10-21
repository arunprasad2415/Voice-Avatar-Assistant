import { useState, useEffect } from "react";

import normalAvatar from "../assets/avatar-normal.png";
import talkAvatar from "../assets/avatar-talk.png";
import talkAvatar1 from "../assets/avatar-talk-1.png";

import blinkAvatar from "../assets/avatar-blink.png";
import blinkTalkAvatar from "../assets/avatar-blink-talk.png";

import "../styles/components/Avatar.css";

const Avatar = ({ isSpeaking = false, status = "Support Assistant" }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [speechFrame, setSpeechFrame] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);

      setTimeout(() => {
        setIsBlinking(false);
      }, 250);
    }, 3500);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    let speakingInterval;

    if (isSpeaking) {
      speakingInterval = setInterval(() => {
        setSpeechFrame((prev) => (prev + 1) % 5);
      }, 140);
    }

    return () => clearInterval(speakingInterval);
  }, [isSpeaking]);

  const frame = isSpeaking ? speechFrame : 0;
  let currentAvatar;

  if (isBlinking) {
    if (frame !== 0) {
      currentAvatar = blinkTalkAvatar;
    } else {
      currentAvatar = blinkAvatar;
    }
  } else {
    switch (frame) {
      case 1:
        currentAvatar = talkAvatar;
        break;

      case 2:
        currentAvatar = talkAvatar1;
        break;

      case 4:
        currentAvatar = talkAvatar1;
        break;

      default:
        currentAvatar = normalAvatar;
    }
  }

  return (
    <div className="avatar">
      <div
        className={`avatar-image-wrapper ${
          isSpeaking ? "avatar-speaking" : ""
        }`}
      >
        <img
          src={currentAvatar}
          alt="Vaishu Assistant"
          className="avatar-image"
        />
      </div>

      <div className="avatar-info">
        <h2 className="avatar-name">Vaishu</h2>

        {isSpeaking ? (
          <div className="avatar-wave" aria-label="Speaking">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <p className="avatar-status" aria-live="polite">{status}</p>
        )}
      </div>
    </div>
  );
};

export default Avatar;
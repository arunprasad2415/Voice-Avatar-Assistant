import { useState, useEffect, useRef } from "react";

import normalAvatar from "../assets/avatar-normal.png";
import talkAvatar from "../assets/avatar-talk.png";
import talkAvatar1 from "../assets/avatar-talk-1.png";
import blinkAvatar from "../assets/avatar-blink.png";
import blinkTalkAvatar from "../assets/avatar-blink-talk.png";

import { buildLipSync, fillerFrame } from "../utils/lipSync";
import "../styles/components/Avatar.css";

// Overlays stacked on the always-visible neutral face, so switching never flashes the background.
const OVERLAYS = {
  small: talkAvatar1,
  open: talkAvatar,
  blink: blinkAvatar,
  blinkTalk: blinkTalkAvatar,
};

// speechText: the sentence being spoken right now (null when silent).
// wordIndex: char index of the word the voice reports it is on, when the voice supports it.
const Avatar = ({ speechText = null, wordIndex = -1, status = "Support Assistant" }) => {
  const [mouth, setMouth] = useState("closed");
  const [isBlinking, setIsBlinking] = useState(false);
  const timelineRef = useRef([]);
  const stepRef = useRef(0);
  const isSpeaking = Boolean(speechText);

  // Natural blinking: irregular gaps, quick lids, and the occasional double blink.
  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => blink(Math.random() < 0.18), 2200 + Math.random() * 3800);
    };
    const blink = (twice) => {
      setIsBlinking(true);
      timer = setTimeout(() => {
        setIsBlinking(false);
        timer = twice ? setTimeout(() => blink(false), 160) : setTimeout(schedule, 0);
      }, 120);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // Lip sync: play the mouth shapes estimated from the words being spoken.
  useEffect(() => {
    if (!speechText) {
      return;
    }
    timelineRef.current = buildLipSync(speechText);
    stepRef.current = 0;

    let timer;
    const next = () => {
      const step = stepRef.current++;
      const frame = timelineRef.current[step] || fillerFrame(step);
      setMouth(frame.shape);
      timer = setTimeout(next, frame.ms);
    };
    timer = setTimeout(next, 0);
    return () => clearTimeout(timer);
  }, [speechText]);

  // When the voice reports the word it is on, jump the lips to that word to stay in sync.
  useEffect(() => {
    if (wordIndex < 0) return;
    const step = timelineRef.current.findIndex((frame) => frame.charIndex >= wordIndex);
    if (step >= 0) stepRef.current = step;
  }, [wordIndex]);

  const shownMouth = isSpeaking ? mouth : "closed";
  const overlay = isBlinking ? (shownMouth === "closed" ? "blink" : "blinkTalk") : shownMouth;

  return (
    <div className="avatar">
      <div
        className={`avatar-portrait ${isSpeaking ? "avatar-portrait-speaking" : ""}`}
        role="img"
        aria-label="Vaishu, your support assistant"
      >
        <div className="avatar-head">
          <img src={normalAvatar} alt="" className="avatar-frame avatar-frame-base" draggable="false" />
          {Object.entries(OVERLAYS).map(([key, src]) => (
            <img
              key={key}
              src={src}
              alt=""
              className={`avatar-frame ${overlay === key ? "avatar-frame-on" : ""}`}
              draggable="false"
            />
          ))}
        </div>
      </div>

      <div className="avatar-info">
        <h2 className="avatar-name">Vaishu</h2>
        <p className="avatar-status" aria-live="polite">
          <span className="avatar-status-dot" aria-hidden="true" />
          {status}
        </p>
      </div>
    </div>
  );
};

export default Avatar;

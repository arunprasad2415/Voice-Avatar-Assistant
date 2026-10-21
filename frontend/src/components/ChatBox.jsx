import { useRef, useEffect, useState, useCallback } from "react";
import "../styles/components/ChatBox.css";

const formatTime = (time) =>
  new Date(time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Reveals a reply a few characters at a time; screen readers get the full text at once.
const TypedText = ({ text, onTick }) => {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? text.length : 0));

  useEffect(() => {
    if (shown >= text.length) {
      return;
    }
    const id = setTimeout(() => {
      setShown((n) => Math.min(text.length, n + 3));
      onTick();
    }, 18);
    return () => clearTimeout(id);
  }, [shown, text, onTick]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {shown < text.length && <span className="chat-caret" />}
      </span>
    </>
  );
};

const ChatBox = ({
  messages,
  isTyping = false,
  typedTime = null,
  liveTranscript = "",
  suggestions = [],
  onSuggestion,
  onReplay,
}) => {
  const boxRef = useRef(null);

  // Scroll the chat itself, never the page.
  const scrollToBottom = useCallback(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, liveTranscript, scrollToBottom]);

  return (
    <div className="chatbox" ref={boxRef} aria-live="polite">
      {messages.length === 0 && !isTyping && !liveTranscript ? (
        <div className={`chatbox-empty ${suggestions.length ? "chatbox-empty-wide" : ""}`}>
          <p>Tap the microphone and ask me anything.</p>

          {suggestions.length > 0 && (
            <div className="chat-suggestions">
              {suggestions.map((question, i) => (
                <button
                  type="button"
                  key={question}
                  className="chat-suggestion"
                  style={{ "--i": i }}
                  onClick={() => onSuggestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message chat-message-${message.role}`}
          >
            <div className="chat-bubble">
              {message.time === typedTime ? (
                <TypedText text={message.text} onTick={scrollToBottom} />
              ) : (
                message.text
              )}
            </div>
            <div className="chat-meta">
              {message.time && <time>{formatTime(message.time)}</time>}
              {message.role === "assistant" && onReplay && (
                <button
                  type="button"
                  className="chat-replay"
                  onClick={() => onReplay(message.text)}
                  aria-label="Play this reply aloud"
                  title="Play aloud"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {liveTranscript && (
        <div className="chat-message chat-message-user chat-message-live" aria-hidden="true">
          <div className="chat-bubble">
            {liveTranscript}
            <span className="chat-caret" />
          </div>
        </div>
      )}

      {isTyping && (
        <div className="chat-message chat-message-assistant chat-typing" aria-label="Assistant is typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  );
};

export default ChatBox;

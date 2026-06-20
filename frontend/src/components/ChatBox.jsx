import { useRef, useEffect } from "react";
import "../styles/components/ChatBox.css";

const ChatBox = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chatbox">
      {messages.length === 0 ? (
        <div className="chatbox-empty">
          <p>Tap the microphone and ask me anything.</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message chat-message-${message.role}`}
          >
            <div className="chat-bubble">{message.text}</div>
          </div>
        ))
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatBox;
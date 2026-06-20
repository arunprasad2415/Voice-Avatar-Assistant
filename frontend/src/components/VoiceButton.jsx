import "../styles/components/VoiceButton.css";

const VoiceButton = ({ isListening, disabled = false, onClick }) => {
  return (
    <button
      type="button"
      className={`voice-button ${isListening ? "voice-button-active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      <svg
        className="voice-button-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
          fill="currentColor"
        />
        <path
          d="M17 11a5 5 0 0 1-10 0M12 16v3M9 19h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <span className="voice-button-label">
        {isListening ? "Listening..." : "Tap to speak"}
      </span>
    </button>
  );
};

export default VoiceButton;
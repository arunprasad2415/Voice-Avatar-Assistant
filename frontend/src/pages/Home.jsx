import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import VoiceButton from "../components/VoiceButton";
import ChatBox from "../components/ChatBox";
import LeadForm from "../components/LeadForm";
import ThemeToggle from "../components/ThemeToggle";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import voiceService from "../services/voiceService";
import { speak, stopSpeaking } from "../utils/speak";
import "../styles/pages/Home.css";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [textInput, setTextInput] = useState("");

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const lastHandledRef = useRef("");

  const sendMessage = async (userText) => {
    if (!userText || !userText.trim()) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsProcessing(true);

    try {
      const result = await voiceService.askAssistant(userText);
      const reply = result.data.reply;

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

      speak(reply, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!transcript || transcript === lastHandledRef.current) {
      return;
    }
    lastHandledRef.current = transcript;
    const userText = transcript;
    resetTranscript();
    sendMessage(userText);
  }, [transcript, resetTranscript]);

  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      startListening();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (isProcessing || !textInput.trim()) {
      return;
    }
    stopSpeaking();
    setIsSpeaking(false);
    sendMessage(textInput.trim());
    setTextInput("");
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-brand">Voice Assistant</div>
        <div className="home-header-right">
          <ThemeToggle />
          <Link to="/admin/login" className="home-admin-link">
            Admin
          </Link>
        </div>
      </header>

      <main className="home-main">
        <div className="home-card">
          <div className="home-avatar-row">
            <Avatar isSpeaking={isSpeaking} />
          </div>

          <ChatBox messages={messages} />

          <form className="home-text-form" onSubmit={handleTextSubmit}>
            <input
              type="text"
              className="home-text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isProcessing}
            />
            <button
              type="submit"
              className="home-text-send"
              disabled={isProcessing || !textInput.trim()}
            >
              Send
            </button>
          </form>

          <div className="home-controls">
            {isSupported ? (
              <VoiceButton
                isListening={isListening}
                disabled={isProcessing}
                onClick={handleVoiceButtonClick}
              />
            ) : (
              <p className="home-unsupported">
                Voice input is not supported in this browser. You can still type above.
              </p>
            )}

            {isProcessing && <span className="home-processing">Thinking...</span>}
          </div>

          <div className="home-lead-prompt">
            <button
              type="button"
              className="home-lead-toggle"
              onClick={() => setShowLeadForm((prev) => !prev)}
            >
              {showLeadForm ? "Hide form" : "Leave your details"}
            </button>
          </div>
        </div>

        {showLeadForm && (
          <div className="home-lead-form-wrap">
            <LeadForm />
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
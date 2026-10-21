import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import VoiceButton from "../components/VoiceButton";
import ChatBox from "../components/ChatBox";
import LeadForm from "../components/LeadForm";
import ThemeToggle from "../components/ThemeToggle";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import voiceService from "../services/voiceService";
import faqService from "../services/faqService";
import { speak, stopSpeaking } from "../utils/speak";
import "../styles/pages/Home.css";

const CHAT_KEY = "chat-history";
const SUGGESTION_COUNT = 4;

const STATUS_TEXT = {
  idle: "Support Assistant",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking",
};

// Chat survives a refresh but not closing the tab.
const loadChat = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CHAT_KEY)) || [];
  } catch {
    return [];
  }
};

const Home = () => {
  const [messages, setMessages] = useState(loadChat);
  const [suggestions, setSuggestions] = useState([]);
  // Only replies that arrive in this visit type themselves out, not ones restored from storage.
  const [typedTime, setTypedTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    } catch {
      // Storage unavailable (private mode, quota); chat just won't persist.
    }
  }, [messages]);

  useEffect(() => {
    faqService
      .getFAQs()
      .then((res) =>
        setSuggestions(
          (res.data || [])
            .filter((faq) => faq.isActive)
            .slice(0, SUGGESTION_COUNT)
            .map((faq) => faq.question)
        )
      )
      .catch(() => {});
  }, []);

  // Don't keep talking after the user navigates away.
  useEffect(() => stopSpeaking, []);

  const addMessage = (role, text) => {
    const time = Date.now();
    setMessages((prev) => [...prev, { role, text, time }]);
    return time;
  };

  const speakReply = (text) => {
    speak(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const sendMessage = async (userText) => {
    const text = userText?.trim();
    if (!text || isProcessing) {
      return;
    }

    handleStopSpeaking();
    addMessage("user", text);
    setIsProcessing(true);

    try {
      const result = await voiceService.askAssistant(text);
      const reply = result.data.reply;

      setTypedTime(addMessage("assistant", reply));
      speakReply(reply);
    } catch (err) {
      addMessage(
        "assistant",
        err.response?.data?.message || "Sorry, something went wrong. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const {
    isListening,
    transcript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition(sendMessage);

  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      handleStopSpeaking();
      startListening();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (isProcessing || !textInput.trim()) {
      return;
    }
    sendMessage(textInput);
    setTextInput("");
  };

  const handleClearChat = () => {
    handleStopSpeaking();
    setMessages([]);
  };

  const assistantState = isSpeaking
    ? "speaking"
    : isProcessing
      ? "thinking"
      : isListening
        ? "listening"
        : "idle";

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
        <section className={`home-hero home-hero-${assistantState}`}>
          <div className="home-hero-halo" aria-hidden="true" />
          <Avatar isSpeaking={isSpeaking} status={STATUS_TEXT[assistantState]} />
          <h1 className="home-headline">
            Ask me anything, <em>out loud</em>.
          </h1>
          <p className="home-lede">
            I answer questions about our products, pricing and support. Speak or type, and if
            you would rather talk to a person, leave your details and the team will reach out.
          </p>
        </section>

        <div className="home-column">
          <div className="home-card">
            <ChatBox
              messages={messages}
              isTyping={isProcessing}
              typedTime={typedTime}
              liveTranscript={isListening ? transcript : ""}
              suggestions={suggestions}
              onSuggestion={sendMessage}
              onReplay={speakReply}
            />

            <form className="home-text-form" onSubmit={handleTextSubmit}>
              <input
                type="text"
                className="home-text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your message..."
                aria-label="Your message"
                maxLength={500}
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

              {isSpeaking && (
                <button type="button" className="home-stop" onClick={handleStopSpeaking}>
                  <span aria-hidden="true">■</span> Stop speaking
                </button>
              )}
              {speechError && <p className="home-unsupported">{speechError}</p>}
            </div>

            <div className="home-lead-prompt">
              <button
                type="button"
                className="home-lead-toggle"
                onClick={() => setShowLeadForm((prev) => !prev)}
              >
                {showLeadForm ? "Hide form" : "Leave your details"}
              </button>
              {messages.length > 0 && (
                <button type="button" className="home-lead-toggle" onClick={handleClearChat}>
                  Clear chat
                </button>
              )}
            </div>
          </div>

          {showLeadForm && (
            <div className="home-lead-form-wrap">
              <LeadForm />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;

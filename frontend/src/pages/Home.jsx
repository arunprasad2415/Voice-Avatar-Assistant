import { useState, useEffect, useRef } from "react";
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
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

const SILENT = { text: null, wordIndex: -1 };

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
  // What the avatar is saying right now, and the word the voice reports it is on (for lip sync).
  const [speech, setSpeech] = useState(SILENT);
  // "chat" or "details"; direction picks which way the panels slide.
  const [panel, setPanel] = useState({ view: "chat", direction: "none" });
  const [textInput, setTextInput] = useState("");
  // Each utterance gets an id so late callbacks from a cancelled one are ignored.
  const utteranceRef = useRef(0);

  const isSpeaking = Boolean(speech.text);

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
    const id = ++utteranceRef.current;
    const isCurrent = () => id === utteranceRef.current;

    speak(text, {
      onStart: () => isCurrent() && setSpeech({ text, wordIndex: -1 }),
      onBoundary: (event) =>
        isCurrent() && event.name === "word" && setSpeech({ text, wordIndex: event.charIndex }),
      onEnd: () => isCurrent() && setSpeech(SILENT),
    });
  };

  const handleStopSpeaking = () => {
    utteranceRef.current += 1;
    stopSpeaking();
    setSpeech(SILENT);
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
    isTranscribing,
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

  const openDetails = () => {
    if (isListening) stopListening();
    setPanel({ view: "details", direction: "forward" });
  };

  const assistantState = isSpeaking
    ? "speaking"
    : isProcessing || isTranscribing
      ? "thinking"
      : isListening
        ? "listening"
        : "idle";

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-brand">
          <span className="home-brand-mark" aria-hidden="true">V</span>
          <span className="home-brand-name">Voice Assistant</span>
        </div>
        <div className="home-header-right">
          <ThemeToggle />
          <Link to="/admin/login" className="home-admin-link">
            Admin
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className={`home-hero home-hero-${assistantState}`}>
          <div className="home-hero-stage">
            <div className="home-hero-halo" aria-hidden="true" />
            <Avatar
              speechText={speech.text}
              wordIndex={speech.wordIndex}
              status={STATUS_TEXT[assistantState]}
            />
          </div>

          <div className="home-hero-copy">
            <p className="home-eyebrow">Your voice concierge</p>
            <h1 className="home-headline">
              Ask me anything, <em>out loud</em>.
            </h1>
            <p className="home-lede">
              Questions about products, pricing or support, answered in seconds. Speak or
              type, and leave your details whenever you would like a person to follow up.
            </p>
          </div>
        </section>

        <section className="home-panel">
          <div
            key={panel.view}
            className={`home-panel-view home-panel-${panel.direction}`}
          >
            {panel.view === "details" ? (
              <LeadForm onBack={() => setPanel({ view: "chat", direction: "back" })} />
            ) : (
              <>
                <ChatBox
                  messages={messages}
                  isTyping={isProcessing}
                  typedTime={typedTime}
                  liveTranscript={isListening ? transcript : ""}
                  suggestions={suggestions}
                  onSuggestion={sendMessage}
                  onReplay={speakReply}
                />

                <form className="home-composer" onSubmit={handleTextSubmit}>
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
                    aria-label="Send message"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </form>

                <div className="home-controls">
                  {isSupported ? (
                    <VoiceButton
                      isListening={isListening}
                      disabled={isProcessing || isTranscribing}
                      onClick={handleVoiceButtonClick}
                    />
                  ) : (
                    <p className="home-notice">
                      Voice input isn't supported in this browser. You can still type.
                    </p>
                  )}

                  {isSpeaking && (
                    <button type="button" className="home-stop" onClick={handleStopSpeaking}>
                      <span aria-hidden="true">■</span> Stop
                    </button>
                  )}
                </div>
                {speechError && <p className="home-notice home-notice-error">{speechError}</p>}

                <div className="home-panel-footer">
                  <button type="button" className="home-link" onClick={openDetails}>
                    Leave your details
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                  {messages.length > 0 && (
                    <button type="button" className="home-link home-link-muted" onClick={handleClearChat}>
                      Clear chat
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  X,
  BookOpen,
  Target,
  User,
} from "lucide-react";

/**
 * Custom hook for typing animation effect
 */
function useTypingEffect(text, speed = 20) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return { displayedText, isTyping };
}

/**
 * ChatCopilot Component
 * Conversational AI interface for career guidance
 */
export default function ChatCopilot({ employeeId, employeeName }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingMessageIndex, setTypingMessageIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && employeeName) {
      const greetingMessage = {
        role: "assistant",
        content: `Hi ${employeeName}! 👋 I'm your Career Compass Copilot. I can help you with:\n\n📋 **Profile Summary** - Review your strengths and achievements\n🎯 **Role Recommendations** - Find opportunities that match your skills\n📚 **Skill Development** - Learn what you need for your dream role\n\nWhat would you like to explore today?`,
        timestamp: new Date().toISOString(),
        citations: [],
        suggested_actions: [
          "Show my profile",
          "What roles fit me?",
          "What skills do I need?",
        ],
        isNew: true,
      };
      setMessages([greetingMessage]);
      setTypingMessageIndex(0); // Trigger typing for greeting
    }
  }, [employeeName, messages.length]);

  // Handle send message
  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) return;

    // Add user message to chat
    const userMessage = {
      role: "user",
      content: trimmedMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // Call chat API (employee_id now comes from auth token)
      const authToken =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            message: trimmedMessage,
            conversation_history: messages.filter(
              (m) => m.role === "user" || m.role === "assistant"
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add assistant response to chat with typing animation
      const assistantMessage = {
        role: "assistant",
        content:
          data.response_text ||
          "I apologize, but I couldn't generate a response.",
        timestamp: new Date().toISOString(),
        citations: data.citations || [],
        suggested_actions: data.suggested_actions || [],
        intent: data.intent,
        isNew: true, // Flag to trigger typing animation
      };

      setMessages((prev) => {
        const newMessages = [...prev, assistantMessage];
        setTypingMessageIndex(newMessages.length - 1); // Set index for typing animation
        return newMessages;
      });
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message);

      // Add error message to chat
      const errorMessage = {
        role: "assistant",
        content:
          "❌ Sorry, I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date().toISOString(),
        citations: [],
        suggested_actions: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Escape") {
      setInputValue("");
    }
  };

  // Handle suggested action click
  const handleSuggestedActionClick = (action) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
    setError(null);
  };

  // Get icon for citation source
  const getCitationIcon = (source) => {
    switch (source) {
      case "project":
        return <Target className="w-4 h-4" />;
      case "skill":
      case "skill_gap":
        return <BookOpen className="w-4 h-4" />;
      case "competency":
        return <Sparkles className="w-4 h-4" />;
      case "role":
        return <User className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel border border-white/55 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-5 flex items-center justify-between shadow-lg shadow-indigo-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Compass Copilot</h3>
            <p className="text-xs text-indigo-100 tracking-[0.32em] uppercase">
              Career guidance
            </p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClearConversation}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold tracking-[0.25em] uppercase"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-white/60 p-6 space-y-4 scroll-smooth">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            index={index}
            isTyping={index === typingMessageIndex}
            onTypingComplete={() => {
              if (index === typingMessageIndex) {
                setTypingMessageIndex(null);
                // Remove isNew flag after typing completes
                setMessages((prev) =>
                  prev.map((msg, i) =>
                    i === index ? { ...msg, isNew: false } : msg
                  )
                );
              }
            }}
            getCitationIcon={getCitationIcon}
            handleSuggestedActionClick={handleSuggestedActionClick}
          />
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md border border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-2 glass-panel border border-rose-200/70 bg-rose-50/80 text-rose-700 px-4 py-2 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input Area */}
      <div className="glass-panel border-t border-white/60 bg-white/75 px-6 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your career path, roles, or skills..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 resize-none transition-all text-slate-700"
              rows={1}
              disabled={isLoading}
              aria-label="Chat message input"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="glass-button p-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Send message"
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">
            Enter
          </kbd>{" "}
          to send •
          <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs ml-1">
            Esc
          </kbd>{" "}
          to clear
        </p>
      </div>
    </div>
  );
}

/**
 * MessageBubble Component - Handles typing animation for assistant messages
 */
function MessageBubble({
  message,
  index,
  isTyping,
  onTypingComplete,
  getCitationIcon,
  handleSuggestedActionClick,
}) {
  const { displayedText, isTyping: stillTyping } = useTypingEffect(
    message.role === "assistant" && message.isNew ? message.content : null,
    15 // Typing speed in milliseconds
  );

  // Notify parent when typing completes
  useEffect(() => {
    if (isTyping && !stillTyping && displayedText === message.content) {
      onTypingComplete();
    }
  }, [stillTyping, displayedText, message.content, isTyping, onTypingComplete]);

  // Use displayed text if typing, otherwise use full content
  const contentToShow =
    message.role === "assistant" && message.isNew && isTyping
      ? displayedText
      : message.content;

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } animate-fade-in`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          message.role === "user"
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
            : "glass-panel border border-white/60 bg-white/85 text-slate-700 shadow-lg"
        }`}
      >
        {/* Message Content with Typing Effect */}
        <div className="whitespace-pre-wrap break-words space-y-2">
          {contentToShow.split("\n").map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>

        {/* Only show citations and actions after typing completes */}
        {(!message.isNew || !isTyping) && (
          <>
            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200/50 animate-fade-in">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  📌 Evidence:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.citations.map((citation, idx) => (
                    <div
                      key={idx}
                      className="glass-chip px-2.5 py-1 text-xs font-medium text-purple-600 flex items-center gap-1"
                      title={citation.details?.join(", ") || citation.text}
                    >
                      {getCitationIcon(citation.source)}
                      <span>{citation.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Actions */}
            {message.suggested_actions &&
              message.suggested_actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200/50 animate-fade-in">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    💡 Try asking:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggested_actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedActionClick(action)}
                        className="glass-chip px-3 py-1 text-xs font-semibold text-indigo-600 hover:shadow-lg transition-shadow"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}

        {/* Timestamp */}
        <p className="text-xs opacity-60 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

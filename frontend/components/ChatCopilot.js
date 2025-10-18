import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, X, BookOpen, Target, User } from 'lucide-react';

/**
 * ChatCopilot Component
 * Conversational AI interface for career guidance
 */
export default function ChatCopilot({ employeeId, employeeName }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && employeeName) {
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${employeeName}! 👋 I'm your Career Compass Copilot. I can help you with:\n\n📋 **Profile Summary** - Review your strengths and achievements\n🎯 **Role Recommendations** - Find opportunities that match your skills\n📚 **Skill Development** - Learn what you need for your dream role\n\nWhat would you like to explore today?`,
          timestamp: new Date().toISOString(),
          citations: [],
          suggested_actions: [
            'Show my profile',
            'What roles fit me?',
            'What skills do I need?'
          ]
        }
      ]);
    }
  }, [employeeName, messages.length]);

  // Handle send message
  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Call chat API (employee_id now comes from auth token)
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: trimmedMessage,
          conversation_history: messages.filter(m => m.role === 'user' || m.role === 'assistant')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response to chat
      const assistantMessage = {
        role: 'assistant',
        content: data.response_text || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date().toISOString(),
        citations: data.citations || [],
        suggested_actions: data.suggested_actions || [],
        intent: data.intent
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date().toISOString(),
        citations: [],
        suggested_actions: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      setInputValue('');
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
      case 'project':
        return <Target className="w-4 h-4" />;
      case 'skill':
      case 'skill_gap':
        return <BookOpen className="w-4 h-4" />;
      case 'competency':
        return <Sparkles className="w-4 h-4" />;
      case 'role':
        return <User className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Compass Copilot</h3>
            <p className="text-xs text-purple-200">Your AI Career Assistant</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClearConversation}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-800 shadow-md border border-gray-200'
              }`}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap break-words space-y-2">
                {message.content.split('\n').map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>

              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <p className="text-xs font-semibold text-gray-600 mb-2">📌 Evidence:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.citations.map((citation, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1 bg-purple-100/50 text-purple-800 px-2 py-1 rounded-lg text-xs"
                        title={citation.details?.join(', ') || citation.text}
                      >
                        {getCitationIcon(citation.source)}
                        <span className="font-medium">{citation.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {message.suggested_actions && message.suggested_actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <p className="text-xs font-semibold text-gray-600 mb-2">💡 Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggested_actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedActionClick(action)}
                        className="bg-blue-100/50 hover:bg-blue-200/50 text-blue-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs opacity-60 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
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
        <div className="mx-6 mb-2 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your career path, roles, or skills..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none transition-all bg-white/90"
              rows={1}
              disabled={isLoading}
              aria-label="Chat message input"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
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
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to send • 
          <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs ml-1">Esc</kbd> to clear
        </p>
      </div>
    </div>
  );
}

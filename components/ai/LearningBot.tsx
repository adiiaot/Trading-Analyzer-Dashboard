'use client';

import React, { useState } from 'react';
import { Brain, Send, Loader } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const LearningBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-card p-5 flex flex-col h-[500px]">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-neon-green" />
        <h2 className="text-text-primary font-bold text-lg">Learning Bot</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
        {messages.length === 0 ? (
          <div className="text-text-secondary text-body text-center py-8">
            Ask me about forex, gold trading, or risk management...
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-card text-body ${
                  msg.role === 'user'
                    ? 'bg-neon-green text-dark-bg'
                    : 'bg-dark-sidebar text-text-secondary'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="bg-dark-sidebar px-4 py-2 rounded-card text-text-secondary flex items-center gap-2 text-body">
              <Loader className="w-4 h-4 animate-spin text-neon-green" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a question..."
          className="flex-1 bg-dark-sidebar border border-dark-border rounded-input px-3 py-2 text-text-primary placeholder-text-tertiary text-body focus:border-neon-green focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-neon-green hover:bg-neon-green-hover disabled:bg-dark-border text-dark-bg px-4 py-2 rounded-btn font-semibold transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

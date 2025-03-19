import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send } from 'lucide-react';
import { Message, Settings, Conversation, Source } from './types';
import { ChatMessage } from './components/ChatMessage';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    model: 'gpt-3.5',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are a helpful AI assistant that answers questions based on the provided knowledge base.',
    similarityThreshold: 0.7,
    maxSourcesPerQuery: 3
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      timestamp: Date.now(),
      messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    inputRef.current?.focus();
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversationId === id) {
      const remainingConvs = conversations.filter(conv => conv.id !== id);
      setActiveConversationId(remainingConvs[0]?.id);
    }
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === id ? { ...conv, title: newTitle } : conv
    ));
  };

  const clearConversation = (id: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === id ? { ...conv, messages: [] } : conv
    ));
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConversationId) return;
  
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: Date.now(),
      status: 'sending'
    };
  
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ));
    setInput('');
  
    // Add a loading message from the bot
    const loadingMessage: Message = {
      id: uuidv4(),
      content: "Generating response...",
      role: 'assistant',
      timestamp: Date.now(),
      status: 'sending'
    };
  
    setConversations(prev => prev.map(conv =>
      conv.id === activeConversationId
        ? { ...conv, messages: [...conv.messages, loadingMessage] }
        : conv
    ));
  
    try {
      // Call FastAPI backend
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }
  
      const data = await response.json();
      const aiResponse = data.message.content;
  
      // Parse the response to separate "Think" and "Response" sections
      const thinkSection = aiResponse.includes("<think>")
        ? aiResponse.split("<think>")[1].split("</think>")[0].trim()
        : null;
      const responseSection = aiResponse.includes("</think>")
        ? aiResponse.split("</think>")[1].trim()
        : aiResponse;
  
      // Replace \n\n with <br /><br /> for proper spacing
      const formattedResponse = responseSection
        .replace(/\n\n/g, "<br /><br />") // Double line breaks
        .replace(/\n/g, "<br />"); // Single line breaks
  
      const aiMessage: Message = {
        id: uuidv4(),
        content: formattedResponse, // Response section with proper formatting
        role: 'assistant',
        timestamp: Date.now(),
        status: 'sent',
        sources: data.message.sources,
        think: thinkSection // Add the "Think" section as a separate field
      };
  
      // Remove the loading message and add the actual response
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: conv.messages
                .filter(m => m.id !== loadingMessage.id) // Remove loading message
                .map(m => m.id === userMessage.id ? { ...m, status: 'sent' } : m)
                .concat(aiMessage) // Add the AI response
            }
          : conv
      ));
    } catch (error) {
      console.error('Error:', error);
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: conv.messages
                .filter(m => m.id !== loadingMessage.id) // Remove loading message
                .map(m => m.id === userMessage.id ? { ...m, status: 'error' } : m)
            }
          : conv
      ));
    } finally {
      scrollToBottom();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversationId}
        onNewChat={createNewConversation}
        onSelectConversation={setActiveConversationId}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        onClearConversation={clearConversation}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="border-t bg-white shadow-inner-lg">
              <div className="max-w-3xl mx-auto px-4 lg:px-8 py-4">
                <div className="flex gap-4 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question about your knowledge base..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to The Recentring to Ultimate Truth</h2>
              <p className="text-gray-600 mb-4">Start a new conversation or select an existing one</p>
              <button
                onClick={createNewConversation}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={setSettings}
        />
      )}
    </div>
  );
}

export default App;
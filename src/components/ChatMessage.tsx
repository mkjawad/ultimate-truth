import React from 'react';
import { MessageCircle, Bot, CheckCircle2, XCircle, Clock, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Message } from '../types';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = React.useState(false);
  const [showThink, setShowThink] = React.useState(false);

  const StatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} message-animation`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-500' : 'bg-gray-700'
      }`}>
        {isUser ? (
          <MessageCircle className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      
      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-6 py-4 max-w-[85%] ${
          isUser ? 'bg-primary-500 text-white ml-auto' : 'bg-white shadow-sm border border-gray-100'
        }`}>
          <p 
            className={`${isUser ? 'text-white' : 'text-gray-800'} leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: message.content }} // Render formatted content
          />
        </div>

        {/* Display "Think" section if available */}
        {!isUser && message.think && (
          <div className="mt-3">
            <button
              onClick={() => setShowThink(!showThink)}
              className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              {showThink ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showThink ? 'Hide Reasoning' : 'Show Reasoning'}
            </button>
            {showThink && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p>{message.think}</p>
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center gap-3 mt-2 text-xs ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <div className="flex items-center gap-1.5 text-gray-500">
            <StatusIcon />
            <span>{format(message.timestamp, 'h:mm a')}</span>
          </div>
          {!isUser && message.sources && message.sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showSources ? 'Hide Sources' : 'Show Sources'}
            </button>
          )}
        </div>
        
        {!isUser && showSources && message.sources && (
          <div className="mt-3 space-y-2">
            {message.sources.map((source, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{source.title}</h4>
                  <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                    {(source.similarity * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{source.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Plus, Settings, MessageSquare, ChevronDown, Search, Pencil, Trash2, XCircle } from 'lucide-react';
import { Conversation } from '../types';
import { format } from 'date-fns';

interface SidebarProps {
  conversations: Conversation[];
  activeConversation?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearConversation: (id: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations = [],
  activeConversation,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearConversation,
  onOpenSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-gray-800 text-white rounded-lg py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="px-2 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400 px-2 mb-2">
            <span className="font-medium">Recent Chats</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          {filteredConversations.map((conv) => (
            <div key={conv.id} className="group relative">
              {editingId === conv.id ? (
                <div className="p-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    className="flex-1 bg-gray-800 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-green-500 hover:text-green-400"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-2 rounded-lg mb-1 flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                    activeConversation === conv.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 truncate">
                    <div className="text-sm font-medium truncate">{conv.title}</div>
                    <div className="text-xs text-gray-400">
                      {format(conv.timestamp, 'MMM d, yyyy')}
                    </div>
                  </div>
                </button>
              )}
              <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(conv)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Pencil className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => onClearConversation(conv.id)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <XCircle className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => onDeleteConversation(conv.id)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  sources?: Source[];
  think?: string; // Add this field for the "Think" section
}

export interface Source {
  title: string;
  content: string;
  similarity: number;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

export type Model = 'gpt-3.5' | 'gpt-4' | 'claude-2';

export interface Settings {
  model: Model;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  similarityThreshold: number;
  maxSourcesPerQuery: number;
}
// TypeScript definitions for AI Assistant Chat Session

export type MessageRole = 'user' | 'assistant' | 'system' | 'data';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt?: Date;
  toolInvocations?: any[];
}

export interface ChatSession {
  userId: string;
  userType: 'CITIZEN' | 'ADMIN' | 'WORKER';
}

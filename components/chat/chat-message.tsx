'use client';

import React from 'react';
import { ChatMessage } from '@/types/chat';
import { ToolResultCard } from './tool-cards';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 text-xs md:text-sm ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {/* Bot/User Avatar */}
      {message.role !== 'user' && (
        <div className="size-6 rounded-full border bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Bot className="size-4" />
        </div>
      )}

      {/* Message content */}
      <div className="space-y-2 max-w-[80%]">
        {message.content && (
          <div
            className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-none'
                : 'bg-muted/80 text-foreground rounded-tl-none border border-border/30'
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Dynamic Tool Cards rendering */}
        {message.toolInvocations?.map((toolInvocation) => {
          const { toolCallId, toolName, state } = toolInvocation;

          if (state === 'call') {
            return (
              <div
                key={toolCallId}
                className="text-xs text-muted-foreground italic flex items-center gap-1.5 mt-1 bg-muted/40 p-2 rounded border border-dashed border-border"
              >
                <span className="animate-spin shrink-0 block size-3 border-2 border-primary border-t-transparent rounded-full" />
                Working on {toolName}...
              </div>
            );
          }

          // state === 'result'
          return (
            <div key={toolCallId} className="mt-2">
              <ToolResultCard toolName={toolName} result={toolInvocation.result} />
            </div>
          );
        })}
      </div>

      {message.role === 'user' && (
        <div className="size-6 rounded-full border bg-muted text-muted-foreground flex items-center justify-center shrink-0">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useUserStore } from '@/store';
import { ChatMessageItem } from './chat-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const ChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userId, userType } = useUserStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chips based on active role
  const citizenSuggestions = [
    'Check pickup schedule',
    'How do I segregate e-waste?',
    'Show my reward points',
    'File a complaint about overflowing bins',
  ];

  const adminSuggestions = [
    'Show delayed trucks',
    'Generate daily operational report',
    'Show complaint analytics',
    'Show ward cleanliness ratings',
  ];

  const suggestions = userType === 'ADMIN' ? adminSuggestions : citizenSuggestions;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    reload,
    stop,
    setMessages,
  } = useChat({
    api: '/api/chat',
    headers: {
      'x-user-id': userId || '',
      'x-user-type': userType || '',
    },
  });

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  const handleClearChat = () => {
    stop();
    setMessages([]);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="size-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
        >
          <MessageSquare className="size-6" />
        </Button>
      )}

      {/* Slide-out / Pop-up Chat Window */}
      {isOpen && (
        <Card className="w-[360px] md:w-[400px] h-[550px] flex flex-col shadow-2xl border bg-card transition-all duration-300 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <CardHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex flex-row items-center justify-between space-y-0">
            <div className="flex flex-col">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                WasteFlow Assistant
              </CardTitle>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Role: {userType?.toLowerCase()} session
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleClearChat}
                title="Reset conversation"
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Body Content */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-4 pt-10">
                <div className="size-10 rounded-full border bg-primary/10 text-primary flex items-center justify-center">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Welcome to WasteFlow AI Support</p>
                  <p className="text-xs text-muted-foreground px-4 mt-1 leading-relaxed">
                    Ask me anything about route timelines, schedules, rewards, or complaint statuses.
                  </p>
                </div>

                {/* Suggestions List */}
                <div className="w-full space-y-2 border-t pt-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">
                    Suggested queries
                  </p>
                  <div className="flex flex-col gap-1.5 text-left">
                    {suggestions.map((text, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(text)}
                        className="w-full text-left p-2.5 text-xs rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary transition border border-transparent hover:border-primary/20 text-muted-foreground leading-relaxed"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageItem key={message.id} message={message as any} />
              ))
            )}
          </CardContent>

          {/* Footer Input */}
          <CardFooter className="p-3 border-t bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="flex items-center gap-2 w-full"
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask assistant..."
                className="flex-1 text-xs md:text-sm h-9 rounded-xl border-input bg-muted/30 focus-visible:ring-1"
              />
              <Button type="submit" size="icon" className="size-9 rounded-xl shrink-0" disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

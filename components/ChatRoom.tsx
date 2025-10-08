'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  channel: string;
  post_id?: string;
  nickname: string;
  content: string;
  client_id: string;
  ip_hash?: string;
  created_at: string;
  is_deleted?: boolean;
  flagged?: boolean;
}

interface ChatRoomProps {
  channel?: string;
  title?: string;
  height?: string;
}

export default function ChatRoom({ channel = 'global', title = 'Chat', height }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState('');
  const [clientId, setClientId] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize client ID and check for saved nickname
  useEffect(() => {
    let id = localStorage.getItem('chat_client_id');
    if (!id) {
      id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chat_client_id', id);
    }
    setClientId(id);

    const savedNickname = localStorage.getItem('chat_nickname');
    if (savedNickname) {
      setNickname(savedNickname);
      setIsSetup(true);
    }
  }, []);

  // Load chat history when setup is complete
  useEffect(() => {
    if (isSetup) {
      loadHistory();
    }
  }, [isSetup, channel]);

  // Subscribe to realtime database changes for new messages
  useEffect(() => {
    if (!isSetup) return;

    let realtimeChannel: RealtimeChannel;

    const setupRealtime = async () => {
      // Subscribe to postgres changes on chat_messages table
      realtimeChannel = supabase
        .channel(`room:${channel}:messages`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `channel=eq.${channel}`,
          },
          (payload) => {
            console.log('Received realtime message:', payload);

            // payload.new contains the new row data
            const newMessage = payload.new as Message;

            // Add message to state if it doesn't already exist (deduplication)
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;

              // Only auto-scroll if message is from someone else
              if (newMessage.client_id !== clientId) {
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }

              return [...prev, newMessage];
            });
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${channel}:`, status);
        });
    };

    setupRealtime();

    // Cleanup: unsubscribe when component unmounts or channel changes
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [isSetup, channel, clientId]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/chat/history?channel=${encodeURIComponent(channel)}&limit=50`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load chat history');
      }

      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Error loading chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (nickname.trim().length >= 2 && nickname.trim().length <= 30 && guidelinesAccepted) {
      localStorage.setItem('chat_nickname', nickname.trim());
      setNickname(nickname.trim());
      setIsSetup(true);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          nickname,
          content: messageInput.trim(),
          client_id: clientId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add message to local state immediately (optimistic update)
      setMessages(prev => [...prev, data.data]);
      setMessageInput('');

      // Keep focus on input after sending
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleChangeNickname = () => {
    localStorage.removeItem('chat_nickname');
    setIsSetup(false);
    setNickname('');
  };

  if (!isSetup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4" style={{ minHeight: height || 'calc(100vh - 200px)' }}>
        <div className="w-full max-w-md">
          <h3 className="text-2xl font-bold mb-4 text-center">{title || 'Join Chat'}</h3>
          <p className="text-[var(--color-text-secondary)] mb-6 text-center">
            Choose a nickname to start chatting with others in real-time
          </p>
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="input w-full"
              minLength={2}
              maxLength={30}
              required
            />

            {/* Community Guidelines */}
            <div className="p-4 bg-[var(--color-surface-2)] rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Community Guidelines</h4>
              <ul className="text-xs text-[var(--color-text-secondary)] space-y-1 mb-3">
                <li>• Be respectful and kind to others</li>
                <li>• No spam, self-promotion, or offensive content</li>
                <li>• Stay on topic and contribute meaningfully</li>
                <li>• Help others learn and grow</li>
              </ul>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guidelinesAccepted}
                  onChange={(e) => setGuidelinesAccepted(e.target.checked)}
                  className="mt-0.5"
                  required
                />
                <span className="text-sm">I agree to follow the community guidelines</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!guidelinesAccepted}
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: height || 'calc(100vh - 180px)' }}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">
            No messages yet. Be the first to say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.client_id === clientId ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.client_id === clientId
                    ? 'bg-[var(--color-accent-1)] text-white'
                    : 'bg-[var(--color-surface-2)]'
                }`}
              >
                <div className="text-sm break-words">{msg.content}</div>
                <div className="text-xs opacity-60 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-2 py-2 px-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Message Input */}
      <div className="px-4 py-4 bg-[var(--color-surface-1)] border-t border-[var(--color-border)]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
            maxLength={2000}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-[var(--color-text-secondary)]">
            {messageInput.length}/2000 characters
          </p>
          <button
            onClick={handleChangeNickname}
            className="text-xs text-[var(--color-accent-1)] hover:underline"
          >
            Change Nickname ({nickname})
          </button>
        </div>
      </div>
    </div>
  );
}

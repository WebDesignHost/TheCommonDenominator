'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';

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
  channel: string;
  title?: string;
  height?: string;
}

export default function ChatRoom({ channel, title, height = '600px' }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState('');
  const [clientId, setClientId] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (nickname.trim().length >= 2 && nickname.trim().length <= 30) {
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
      <div className="card" style={{ minHeight: height }}>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <h3 className="text-2xl font-bold mb-4">{title || 'Join Chat'}</h3>
          <p className="text-[var(--color-text-secondary)] mb-6 text-center max-w-md">
            Choose a nickname to start chatting with others in real-time
          </p>
          <form onSubmit={handleSetupSubmit} className="w-full max-w-sm space-y-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="input"
              minLength={2}
              maxLength={30}
              required
            />
            <button type="submit" className="btn-primary w-full">
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col" style={{ height }}>
      {/* Chat Header */}
      <div className="pb-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{title || 'Chat Room'}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Chatting as <strong>{nickname}</strong>
          </p>
        </div>
        <button
          onClick={handleChangeNickname}
          className="text-sm text-[var(--color-accent-1)] hover:underline"
        >
          Change Nickname
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">
            No messages yet. Be the first to say hello! 👋
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
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {msg.nickname}
                </div>
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
        <div className="py-2 px-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Message Input */}
      <div className="pt-4 border-t border-[var(--color-border)]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
            maxLength={2000}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
          {messageInput.length}/2000 characters
        </p>
      </div>
    </div>
  );
}

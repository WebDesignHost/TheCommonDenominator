'use client';

import { useState, useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';

interface Message {
  id: string;
  channel_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface OnlineUser {
  id: string;
  username: string;
  last_seen: string;
  status: string;
}

const CHANNELS = [
  { id: 'general', name: 'General' },
  { id: 'weekly-discussion', name: 'Weekly Discussion' },
  { id: 'announcements', name: 'Announcements' },
  { id: 'questions', name: 'Questions' },
];

export default function ChatRoom() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showRules, setShowRules] = useState(true);
  const [mobileView, setMobileView] = useState<'channels' | 'chat' | 'members'>('chat');
  const [username, setUsername] = useState('');
  const [usernameSet, setUsernameSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load username from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('chat-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setUsernameSet(true);
    }
  }, []);

  // Fetch initial messages
  useEffect(() => {
    if (!usernameSet) return;

    async function fetchMessages() {
      try {
        const response = await fetch(`/api/chat/messages?channel_id=${activeChannel}`);
        const data = await response.json();

        if (response.ok) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [activeChannel, usernameSet]);

  // Fetch online users
  useEffect(() => {
    if (!usernameSet) return;

    async function fetchUsers() {
      try {
        const response = await fetch('/api/chat/users');
        const data = await response.json();

        if (response.ok) {
          setOnlineUsers(data.users || []);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    }

    fetchUsers();
    const interval = setInterval(fetchUsers, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [usernameSet]);

  // Update user presence
  useEffect(() => {
    if (!usernameSet || !username) return;

    async function updatePresence() {
      try {
        await fetch('/api/chat/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, status: 'online' }),
        });
      } catch (err) {
        console.error('Error updating presence:', err);
      }
    }

    updatePresence();
    const interval = setInterval(updatePresence, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [username, usernameSet]);

  // Subscribe to Pusher for real-time messages
  useEffect(() => {
    if (!usernameSet) return;

    const channel = pusherClient.subscribe(`chat-${activeChannel}`);

    channel.bind('new-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind('new-message');
      pusherClient.unsubscribe(`chat-${activeChannel}`);
    };
  }, [activeChannel, usernameSet]);

  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    localStorage.setItem('chat-username', username.trim());
    setUsernameSet(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !username) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: activeChannel,
          author_name: username,
          content: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      setError('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    }
  };

  const handleChannelChange = (channelId: string) => {
    setActiveChannel(channelId);
    setMobileView('chat');
    setLoading(true);
  };

  // Username setup screen
  if (!usernameSet) {
    return (
      <div className="pt-16 h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="card max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold mb-4">Welcome to Chat</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Choose a username to get started. No login required!
          </p>
          <form onSubmit={handleSetUsername}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="input mb-4"
              maxLength={20}
              required
            />
            <button type="submit" className="btn-primary w-full">
              Join Chat
            </button>
          </form>
          <div className="mt-6 p-4 bg-[var(--color-surface-2)] rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Community Guidelines</h3>
            <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <li>• Be respectful and kind</li>
              <li>• No spam or self-promotion</li>
              <li>• Stay on topic</li>
              <li>• Help others learn</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 h-screen flex flex-col">
      {/* Onboarding Banner */}
      {showRules && (
        <div className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] p-4">
          <div className="container flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Welcome, {username}!</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Be respectful, stay on topic, and help others learn.
              </p>
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="btn-secondary whitespace-nowrap"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <div className="lg:hidden border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
        <div className="flex">
          {['channels', 'chat', 'members'].map((view) => (
            <button
              key={view}
              onClick={() => setMobileView(view as typeof mobileView)}
              className={`flex-1 py-3 text-sm font-medium capitalize ${
                mobileView === view
                  ? 'text-[var(--color-accent-1)] border-b-2 border-[var(--color-accent-1)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Channels */}
        <aside
          className={`${
            mobileView === 'channels' ? 'block' : 'hidden'
          } lg:block w-full lg:w-64 bg-[var(--color-surface-1)] border-r border-[var(--color-border)] flex flex-col overflow-y-auto`}
        >
          <div className="p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface-1)] z-10">
            <h2 className="font-bold text-lg">Channels</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {CHANNELS.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelChange(channel.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeChannel === channel.id
                    ? 'bg-[var(--color-accent-1)] text-white'
                    : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium"># {channel.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Chat Panel */}
        <main
          className={`${
            mobileView === 'chat' ? 'flex' : 'hidden'
          } lg:flex flex-1 flex-col overflow-hidden`}
        >
          {/* Channel Header */}
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
            <h2 className="font-bold text-lg"># {activeChannel}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {onlineUsers.length} members online
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-[var(--color-text-secondary)]">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--color-text-secondary)]">
                  No messages yet. Be the first to say something!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent-1)] to-[var(--color-accent-2)] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {msg.author_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold">{msg.author_name}</span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-secondary)]">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-red-500/10 border-t border-red-500 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Message Composer */}
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-1)]">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="input flex-1"
                maxLength={500}
              />
              <button type="submit" className="btn-primary">
                Send
              </button>
            </form>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Press Enter to send
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('chat-username');
                  setUsernameSet(false);
                }}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-1)]"
              >
                Change username
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Members */}
        <aside
          className={`${
            mobileView === 'members' ? 'block' : 'hidden'
          } lg:block w-full lg:w-64 bg-[var(--color-surface-1)] border-l border-[var(--color-border)] flex flex-col overflow-y-auto`}
        >
          <div className="p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface-1)] z-10">
            <h2 className="font-bold text-lg">Members</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {onlineUsers.length} online
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-accent-1)] to-[var(--color-accent-2)] rounded-full flex items-center justify-center text-sm font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-surface-1)] ${
                      user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  ></div>
                </div>
                <span className="text-sm">{user.username}</span>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-center text-sm text-[var(--color-text-secondary)] py-8">
                No users online
              </p>
            )}
          </div>

          {/* Pinned Rules */}
          <div className="p-4 border-t border-[var(--color-border)]">
            <h3 className="font-semibold text-sm mb-2">Community Rules</h3>
            <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <li>• Be respectful</li>
              <li>• No spam</li>
              <li>• Stay on topic</li>
              <li>• Help others</li>
              <li>• No self-promotion</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

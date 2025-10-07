'use client';

import Link from 'next/link';
import ChatRoom from '@/components/ChatRoom';

export default function ChatPage() {
  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">Global Chat Lobby</h1>
            <Link href="/blog" className="text-sm text-[var(--color-accent-1)] hover:underline">
              ← Back to Blog
            </Link>
          </div>
          <p className="text-[var(--color-text-secondary)]">
            Connect with other readers in real-time. Share your thoughts, ask questions, and join the conversation.
          </p>
        </div>

        {/* Community Guidelines */}
        <div className="mb-8 p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
          <h3 className="font-semibold mb-2">Community Guidelines</h3>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
            <li>• Be respectful and kind to others</li>
            <li>• No spam, self-promotion, or offensive content</li>
            <li>• Stay on topic and contribute meaningfully</li>
            <li>• Help others learn and grow</li>
          </ul>
        </div>

        {/* Chat Component */}
        <ChatRoom channel="lobby" title="Global Lobby" height="700px" />
      </div>
    </div>
  );
}

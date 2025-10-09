'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on chat page
  if (pathname === '/chat') {
    return null;
  }

  return <Footer />;
}

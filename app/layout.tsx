import type { ReactNode } from 'react';

// The real HTML shell lives in app/[locale]/layout.tsx.
// This root layout is required by Next.js but stays minimal.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

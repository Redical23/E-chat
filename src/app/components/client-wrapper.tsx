'use client';

import { useEffect, useState } from "react";
import { SessionProvider } from 'next-auth/react';
export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Optional: Replace with a loading spinner

  return <>  <SessionProvider>
          {children}
        </SessionProvider></>;
}

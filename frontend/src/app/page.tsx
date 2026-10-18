'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Home() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    api<{ status: string }>('/health')
      .then((d) => setStatus(d.status))
      .catch((e) => setStatus('error: ' + e.message));
  }, []);

  return <main className="p-8 text-xl">Backend status: {status}</main>;
}
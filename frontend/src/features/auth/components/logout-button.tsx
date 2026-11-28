'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/features/auth/api';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await signOut().catch(() => undefined);
    window.location.assign('/login');
  }

  return (
    <Button variant="secondary" loading={loading} onClick={onClick}>
      Log out
    </Button>
  );
}

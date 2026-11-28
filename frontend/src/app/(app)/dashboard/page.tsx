import type { Metadata } from 'next';
import { LogoutButton } from '@/features/auth/components/logout-button';

export const metadata: Metadata = { title: 'Dashboard' };

// Temporary placeholder. The real dashboard comes in Step 23.
export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-ink-muted">
        You are logged in. The real dashboard comes in Step 23.
      </p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

export function ApiDemo() {
  const [output, setOutput] = useState('Nothing yet');
  const [loading, setLoading] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setLoading(true);
    try {
      setOutput(JSON.stringify(await action(), null, 2).slice(0, 700));
    } catch (error) {
      setOutput(
        error instanceof ApiError
          ? `ApiError ${error.status} ${error.code}: ${error.message}`
          : String(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="api-demo">
      <h2 id="api-demo" className="mb-3 text-xl font-semibold">API client</h2>
      <div className="flex flex-wrap gap-3">
        <Button loading={loading} onClick={() => run(() => api.get('/users/me'))}>
          Load my profile
        </Button>
        <Button
          variant="secondary"
          loading={loading}
          onClick={() => run(() => api.get('/skills', { query: { category: 'Frontend' } }))}
        >
          Frontend skills
        </Button>
        <Button
          variant="secondary"
          loading={loading}
          onClick={() => run(() => api.get('/projects', { query: { limit: 100 } }))}
        >
          Trigger a validation error
        </Button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface p-4 text-xs">
        {output}
      </pre>
    </section>
  );
}

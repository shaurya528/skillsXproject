const BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function api<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? 'Request failed');
  return body as T;
}
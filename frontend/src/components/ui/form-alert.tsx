// A form-level error, for problems that don't belong to one field
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger"
    >
      {message}
    </div>
  );
}

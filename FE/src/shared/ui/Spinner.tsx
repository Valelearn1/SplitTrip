export function Spinner({ label = 'Caricamento…' }: { label?: string }) {
  return <p className="spinner" role="status">{label}</p>
}

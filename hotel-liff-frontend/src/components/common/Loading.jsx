export default function Loading({ label = 'กำลังโหลด...' }) {
  return (
    <div className="loading-state">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

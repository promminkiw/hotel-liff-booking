export default function ErrorState({ message }) {
  return (
    <p className="error-text" role="alert">
      {message}
    </p>
  )
}

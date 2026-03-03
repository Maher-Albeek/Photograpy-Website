export default function Loading() {
  return (
    <div className="loaderPage" role="status" aria-live="polite">
      <div className="loaderWrap" aria-label="Loading">
        <div className="logoLine" />
        <div className="loader" />
      </div>
    </div>
  )
}

"use client"
import "./ErrorState.css"

const ErrorState = ({ message = "Đã xảy ra lỗi khi tải dữ liệu.", onRetry = null }) => {
  return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="error-retry-button" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  )
}

export default ErrorState


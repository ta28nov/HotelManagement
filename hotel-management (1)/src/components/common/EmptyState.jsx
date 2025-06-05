"use client"
import "./EmptyState.css"

const EmptyState = ({ message = "Không có dữ liệu để hiển thị.", actionLabel = null, onAction = null }) => {
  return (
    <div className="empty-container">
      <div className="empty-icon">📂</div>
      <p className="empty-message">{message}</p>
      {actionLabel && onAction && (
        <button className="empty-action-button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState


import "./LoadingState.css"

const LoadingState = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  )
}

export default LoadingState


// Import các thư viện cần thiết
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"

// Import các file CSS
import "react-toastify/dist/ReactToastify.css"
import "./assets/css/global.css"

// Render ứng dụng React vào DOM
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)


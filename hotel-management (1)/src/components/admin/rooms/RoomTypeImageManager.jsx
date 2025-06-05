"use client"

import { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { toast } from "react-toastify"
import { FaUpload, FaTrash, FaStar, FaTimes } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import roomService from "../../../services/roomService"
import ConfirmationModal from "../../common/ConfirmationModal"
import Spinner from "../../common/Spinner" // Assuming Spinner component exists
import "./RoomTypeImageManager.css"

const RoomTypeImageManager = ({ roomTypeId, roomTypeName, onClose }) => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null) // ID of image being deleted
  const [settingPrimaryId, setSettingPrimaryId] = useState(null) // ID of image being set as primary
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [imageToDelete, setImageToDelete] = useState(null)
  const fileInputRef = useRef(null)
  const isFetchingRef = useRef(false); // Ref to track if fetching is in progress

  // Use import.meta.env for Vite environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5093"; // Get base URL for images

  // Fetch images - Updated with ref check
  const fetchImages = async () => {
    // Prevent fetching if no ID or already fetching
    if (!roomTypeId || isFetchingRef.current) return

    isFetchingRef.current = true; // Mark as fetching
    setLoading(true)
    setError(null)
    try {
      const response = await roomService.getRoomTypeImages(roomTypeId)
      // Check response structure before setting images
      setImages(Array.isArray(response?.data) ? response.data : [])
    } catch (err) {
      console.error("Error fetching images:", err)
      setError("Không thể tải danh sách hình ảnh.")
      // toast.error("Lỗi tải danh sách hình ảnh."); // Avoid duplicate toast if error is set
    } finally {
      setLoading(false)
      isFetchingRef.current = false; // Mark fetch as complete
    }
  }

  useEffect(() => {
    fetchImages()
    // Optional: Add cleanup function if needed, though ref check might suffice
    // return () => { isFetchingRef.current = false; } // Example cleanup
  }, [roomTypeId])

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleUpload(file)
    }
    // Reset file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Handle image upload
  const handleUpload = async (file) => {
    setUploading(true)
    setError(null)
    try {
      // Check if it should be primary (only if no images exist yet)
      const shouldBePrimary = images.length === 0;
      const response = await roomService.uploadRoomTypeImage(roomTypeId, file, shouldBePrimary);
      toast.success(response?.data?.message || "Tải lên hình ảnh thành công!")
      await fetchImages() // Refresh the list
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Tải lên hình ảnh thất bại."
      console.error("Error uploading image:", err)
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  // Show delete confirmation
  const handleDeleteClick = (image) => {
    setImageToDelete(image)
    setShowDeleteConfirm(true)
  }

  // Confirm and delete image
  const confirmDelete = async () => {
    if (!imageToDelete) return
    setDeletingId(imageToDelete.id)
    setError(null)
    setShowDeleteConfirm(false)
    try {
      await roomService.deleteRoomTypeImage(imageToDelete.id)
      toast.success("Xóa hình ảnh thành công!")
      await fetchImages() // Refresh list
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Xóa hình ảnh thất bại."
      console.error("Error deleting image:", err)
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setDeletingId(null)
      setImageToDelete(null)
    }
  }

  // Handle setting primary image
  const handleSetPrimary = async (imageId) => {
    setSettingPrimaryId(imageId)
    setError(null)
    try {
      await roomService.setRoomTypeImagePrimary(imageId)
      toast.success("Đặt ảnh chính thành công!")
      await fetchImages() // Refresh list to show new primary
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đặt ảnh chính thất bại."
      console.error("Error setting primary image:", err)
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSettingPrimaryId(null)
    }
  }

  // Function to construct full image URL - Updated based on backend feedback
  const getImageUrl = (relativePath) => {
    if (!relativePath) return '' // Handle cases where path might be missing

    // 1. Get the base API URL (e.g., http://localhost:5225/api)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5093"; 
    
    // 2. Derive the server base URL by removing '/api' (or potential trailing slash)
    // This assumes '/api' is the standard path prefix. Adjust if needed.
    const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, ''); // Remove /api or /api/

    // 3. Ensure the relative path starts with a slash
    const imagePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

    // 4. Combine server base URL and image path
    return `${serverBaseUrl}${imagePath}`;
  }

  return (
    <div className="image-manager-modal-content">
      <div className="modal-header">
        <h2>Quản lý Ảnh: {roomTypeName || `Loại phòng #${roomTypeId}`}</h2>
        <button onClick={onClose} className="close-button" aria-label="Đóng"><FaTimes /></button>
      </div>

      <div className="image-manager-body">
        {error && <p className="error-message image-manager-error">{error}</p>}

        <div className="image-grid">
          {loading ? (
            <Spinner />
          ) : (
            <AnimatePresence>
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  className="image-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <img src={getImageUrl(image.value)} alt={`Ảnh loại phòng ${roomTypeId}`} className="image-thumbnail" />
                  {image.isPrimary && <FaStar className="primary-icon" title="Ảnh chính" />}
                  <div className="image-actions">
                    {!image.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(image.id)}
                        disabled={settingPrimaryId === image.id || deletingId}
                        className="action-button primary-button"
                        title="Đặt làm ảnh chính"
                      >
                        {settingPrimaryId === image.id ? <Spinner size="sm" /> : <FaStar />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(image)}
                      disabled={deletingId === image.id || settingPrimaryId}
                      className="action-button delete-button"
                      title="Xóa ảnh"
                    >
                       {deletingId === image.id ? <Spinner size="sm" /> : <FaTrash />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Upload Button/Area */} 
          {!loading && (
             <button 
                className="upload-area" 
                onClick={triggerFileInput} 
                disabled={uploading}
             >
                {uploading ? (
                   <Spinner />
                ) : (
                   <>
                     <FaUpload />
                     <span>Tải ảnh lên</span>
                   </>
                 )}
             </button>
          )}
        </div>

        {/* Hidden file input */} 
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/jpeg, image/png, image/gif" // Accept common image types
        />
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa Ảnh"
        message="Bạn có chắc chắn muốn xóa hình ảnh này không?"
        confirmText="Đồng ý Xóa"
        confirmButtonVariant="danger"
      />
    </div>
  )
}

RoomTypeImageManager.propTypes = {
  roomTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  roomTypeName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

export default RoomTypeImageManager 
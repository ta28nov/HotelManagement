/**
 * Các endpoint API phòng
 *
 * File này định nghĩa các endpoint liên quan đến quản lý phòng,
 * kiểm tra tình trạng phòng và lọc phòng theo các tiêu chí.
 */
import apiClient from "../apiClient"

const roomEndpoints = {
  // Các thao tác với phòng
  getAllRooms: () => apiClient.get("/rooms"),
  getRoomById: (id) => apiClient.get(`/rooms/${id}`),
  createRoom: (roomData) => apiClient.post("/rooms", roomData),
  updateRoom: (id, roomData) => apiClient.put(`/rooms/${id}`, roomData),
  deleteRoom: (id) => apiClient.delete(`/rooms/${id}`),

  // Lấy phòng có sẵn
  checkAvailability: (params) =>
    apiClient.get("/rooms/available", { params }),

  // Loại phòng (Moved from /rooms/types)
  getRoomTypes: () => apiClient.get("/roomtypes"),
  getRoomTypeById: (id) => apiClient.get(`/roomtypes/${id}`),
  createRoomType: (roomTypeData) => apiClient.post("/roomtypes", roomTypeData),
  updateRoomType: (id, roomTypeData) => apiClient.put(`/roomtypes/${id}`, roomTypeData),
  deleteRoomType: (id) => apiClient.delete(`/roomtypes/${id}`),

  // === Room Type Image Management (using /api/Images/RoomType/) ===
  getRoomTypeImages: (roomTypeId) => apiClient.get(`/Images/RoomType/${roomTypeId}`),
  uploadRoomTypeImage: (roomTypeId, formData) => apiClient.post(`/Images/RoomType/${roomTypeId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteRoomTypeImage: (featureId) => apiClient.delete(`/Images/RoomType/${featureId}`),
  setRoomTypeImagePrimary: (featureId) => apiClient.put(`/Images/RoomType/${featureId}/SetPrimary`),

  // Tiện nghi phòng (Path is correct per spec)
  getRoomAmenities: () => apiClient.get("/rooms/amenities"),
}

export default roomEndpoints


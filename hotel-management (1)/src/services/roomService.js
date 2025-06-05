/**
 * Dịch vụ phòng
 *
 * Dịch vụ này xử lý các thao tác liên quan đến phòng và loại phòng
 */

import { roomEndpoints } from "../api"

const roomService = {
  // === Room Operations ===

  getAllRooms: async () => {
    try {
      // Calls GET /api/rooms
      return await roomEndpoints.getAllRooms()
    } catch (error) {
      console.error("Lỗi lấy tất cả phòng:", error)
      throw error
    }
  },

  getRoomById: async (id) => {
    try {
      // Calls GET /api/rooms/{id}
      return await roomEndpoints.getRoomById(id)
    } catch (error) {
      console.error(`Lỗi lấy phòng ${id}:`, error)
      throw error
    }
  },

  /**
   * Creates a new room.
   * @param {object} roomData - Object containing { roomNumber, roomTypeId, status, floor }
   */
  createRoom: async (roomData) => {
    try {
      // Validate required fields (basic check)
      if (!roomData.roomNumber || !roomData.roomTypeId || !roomData.status || !roomData.floor) {
          throw new Error("Thiếu thông tin bắt buộc để tạo phòng.");
      }
      // Prepare payload exactly as spec requires
      const payload = {
        roomNumber: String(roomData.roomNumber),
        roomTypeId: Number(roomData.roomTypeId),
        status: String(roomData.status),
        floor: Number(roomData.floor),
      }
      // Calls POST /api/rooms
      return await roomEndpoints.createRoom(payload)
    } catch (error) {
      console.error("Lỗi tạo phòng:", error)
      throw error
    }
  },

  /**
   * Updates an existing room.
   * @param {number|string} id - The ID of the room to update.
   * @param {object} roomData - Object containing optional fields { roomNumber, roomTypeId, status, floor }
   */
  updateRoom: async (id, roomData) => {
    try {
      // Prepare payload with only the fields allowed by the spec
      // Only include fields that are provided in roomData
      const payload = {}
      if (roomData.hasOwnProperty('roomNumber')) payload.roomNumber = String(roomData.roomNumber);
      if (roomData.hasOwnProperty('roomTypeId')) payload.roomTypeId = Number(roomData.roomTypeId);
      if (roomData.hasOwnProperty('status')) payload.status = String(roomData.status);
      if (roomData.hasOwnProperty('floor')) payload.floor = Number(roomData.floor);

      // Calls PUT /api/rooms/{id}
      return await roomEndpoints.updateRoom(id, payload)
    } catch (error) {
      console.error(`Lỗi cập nhật phòng ${id}:`, error)
      throw error
    }
  },

  deleteRoom: async (id) => {
    try {
      // Calls DELETE /api/rooms/{id}
      return await roomEndpoints.deleteRoom(id)
    } catch (error) {
      console.error(`Lỗi xóa phòng ${id}:`, error)
      throw error
    }
  },

  // === Availability Check ===

  /**
   * Checks room availability for given dates.
   * @param {string} checkIn - Check-in date/time in ISO 8601 format.
   * @param {string} checkOut - Check-out date/time in ISO 8601 format.
   */
  checkAvailability: async (checkIn, checkOut) => {
    try {
       // Calls GET /api/rooms/available
       const params = { checkIn, checkOut };
      return await roomEndpoints.checkAvailability(params)
    } catch (error) {
      console.error("Lỗi kiểm tra tình trạng phòng:", error)
      throw error
    }
  },

  // === Room Type and Amenities (Used for Forms/Display) ===

  getRoomTypes: async () => {
    try {
      // Calls GET /api/roomtypes
      return await roomEndpoints.getRoomTypes()
    } catch (error) {
      console.error("Lỗi lấy loại phòng:", error)
      throw error
    }
  },

  // ADDED: Get Room Type Details by ID
  getRoomTypeById: async (id) => {
     try {
       // Calls GET /api/roomtypes/{id}
       // This should return details including the images array
       return await roomEndpoints.getRoomTypeById(id);
     } catch (error) {
       console.error(`Lỗi lấy chi tiết loại phòng ${id}:`, error);
       throw error;
     }
  },

  // ADDED: Create Room Type
  createRoomType: async (roomTypeData) => {
    try {
      // Calls POST /api/roomtypes
      return await roomEndpoints.createRoomType(roomTypeData);
    } catch (error) {
      console.error("Lỗi tạo loại phòng:", error);
      throw error;
    }
  },

  // ADDED: Update Room Type
  updateRoomType: async (id, roomTypeData) => {
    try {
      // Calls PUT /api/roomtypes/{id}
      return await roomEndpoints.updateRoomType(id, roomTypeData);
    } catch (error) {
      console.error(`Lỗi cập nhật loại phòng ${id}:`, error);
      throw error;
    }
  },

  // ADDED: Delete Room Type
  deleteRoomType: async (id) => {
    try {
      // Calls DELETE /api/roomtypes/{id}
      return await roomEndpoints.deleteRoomType(id);
    } catch (error) {
      console.error(`Lỗi xóa loại phòng ${id}:`, error);
      // Important: Rethrow the error so the UI can check for 409 Conflict etc.
      throw error;
    }
  },

  getRoomAmenities: async () => {
    try {
      // Calls GET /api/rooms/amenities
      return await roomEndpoints.getRoomAmenities()
    } catch (error) {
      console.error("Lỗi lấy tiện nghi phòng:", error)
      throw error
    }
  },

  // === Room Type Image Management (using new endpoints) ===
  getRoomTypeImages: async (roomTypeId) => {
    try {
      return await roomEndpoints.getRoomTypeImages(roomTypeId);
    } catch (error) {
      console.error(`Lỗi lấy hình ảnh cho loại phòng ${roomTypeId}:`, error);
      throw error;
    }
  },

  uploadRoomTypeImage: async (roomTypeId, file, isPrimary = false) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Only append isPrimary if it's explicitly true, as default is false
      if (isPrimary === true) {
        formData.append('isPrimary', 'true'); 
      }
      return await roomEndpoints.uploadRoomTypeImage(roomTypeId, formData);
    } catch (error) {
      console.error(`Lỗi tải lên hình ảnh cho loại phòng ${roomTypeId}:`, error);
      throw error;
    }
  },

  deleteRoomTypeImage: async (featureId) => {
    try {
      return await roomEndpoints.deleteRoomTypeImage(featureId);
    } catch (error) {
      console.error(`Lỗi xóa hình ảnh ${featureId}:`, error);
      throw error;
    }
  },

  setRoomTypeImagePrimary: async (featureId) => {
    try {
      return await roomEndpoints.setRoomTypeImagePrimary(featureId);
    } catch (error) {
      console.error(`Lỗi đặt ảnh ${featureId} làm ảnh chính:`, error);
      throw error;
    }
  },

  // === Amenity Management ===
  getRoomAmenities: async () => {
    try {
      // Calls GET /api/rooms/amenities
      return await roomEndpoints.getRoomAmenities()
    } catch (error) {
      console.error("Lỗi lấy tiện nghi phòng:", error)
      throw error
    }
  },

}

export default roomService


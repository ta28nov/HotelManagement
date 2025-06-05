/**
 * Dịch vụ đặt phòng
 *
 * Dịch vụ này xử lý các thao tác liên quan đến đặt phòng
 */

import { bookingEndpoints } from "../api"

const bookingService = {
  // Các thao tác đặt phòng
  getAllBookings: async (params) => {
    try {
      return await bookingEndpoints.getAllBookings(params)
    } catch (error) {
      console.error("Lỗi lấy danh sách đặt phòng:", error)
      throw error
    }
  },

  getBookingById: async (id) => {
    try {
      const response = await bookingEndpoints.getBookingById(id)
      return response.data // Assuming the backend wraps the DTO in a 'data' field
    } catch (error) {
      console.error(`Lỗi lấy đặt phòng ${id}:`, error)
      throw error
    }
  },

  createBooking: async (bookingData) => {
    try {
      // Định dạng dữ liệu đặt phòng theo yêu cầu của API (README.md)
      const formattedData = {
        customerId: Number(bookingData.customerId), // Đảm bảo là số
        roomId: Number(bookingData.roomId),         // Đảm bảo là số
        checkInDate: bookingData.checkInDate,       // ISO 8601 format string
        checkOutDate: bookingData.checkOutDate,     // ISO 8601 format string
        adults: Number(bookingData.adults),         // Đảm bảo là số
        children: Number(bookingData.children),       // Đảm bảo là số
      }
      // Các trường như totalAmount, status, paymentStatus sẽ do backend xử lý

      return await bookingEndpoints.createBooking(formattedData)
    } catch (error) {
      console.error("Lỗi tạo đặt phòng:", error)
      throw error // Re-throw để component có thể xử lý
    }
  },

  updateBooking: async (id, bookingData) => {
    try {
      // Chỉ gửi những trường cần cập nhật, backend sẽ xử lý phần còn lại
      // Ví dụ: checkInDate, checkOutDate, adults, children, status, paymentStatus
      return await bookingEndpoints.updateBooking(id, bookingData)
    } catch (error) {
      console.error(`Lỗi cập nhật đặt phòng ${id}:`, error)
      throw error
    }
  },

  deleteBooking: async (id) => {
    try {
      return await bookingEndpoints.deleteBooking(id)
    } catch (error) {
      console.error(`Lỗi xóa đặt phòng ${id}:`, error)
      throw error
    }
  },

  // Quản lý trạng thái đặt phòng
  updateBookingStatus: async (id, statusData) => {
    // API này dường như không tồn tại riêng, việc cập nhật trạng thái
    // được thực hiện thông qua updateBooking hoặc các hành động cụ thể (check-in/out)
    // Tạm thời comment out hoặc loại bỏ nếu không dùng đến
    // try {
    //   return await bookingEndpoints.updateBookingStatus(id, statusData);
    // } catch (error) {
    //   console.error(`Lỗi cập nhật trạng thái đặt phòng ${id}:`, error);
    //   throw error;
    // }
    console.warn("updateBookingStatus không được định nghĩa rõ trong API spec, sử dụng updateBooking thay thế.")
    // Hoặc gọi updateBooking nếu statusData chỉ chứa { status: 'newStatus' }
    try {
        return await bookingEndpoints.updateBooking(id, statusData); // Giả sử statusData là { status: "..." }
    } catch (error) {
        console.error(`Lỗi cập nhật trạng thái đặt phòng ${id} qua updateBooking:`, error);
        throw error;
    }
  },

  checkIn: async (id) => {
    try {
      return await bookingEndpoints.checkIn(id)
    } catch (error) {
      console.error(`Lỗi check-in đặt phòng ${id}:`, error)
      throw error
    }
  },

  checkOut: async (id) => {
    try {
      return await bookingEndpoints.checkOut(id)
    } catch (error) {
      console.error(`Lỗi check-out đặt phòng ${id}:`, error)
      throw error
    }
  },

  cancelBooking: async (id) => {
    // API này không được định nghĩa rõ, có thể thực hiện qua updateBooking với status="cancelled"
    console.warn("cancelBooking không được định nghĩa rõ trong API spec, sử dụng updateBooking với status='cancelled'.")
     try {
        return await bookingEndpoints.updateBooking(id, { status: "cancelled" });
    } catch (error) {
        console.error(`Lỗi hủy đặt phòng ${id} qua updateBooking:`, error);
        throw error;
    }
    // Hoặc nếu có endpoint riêng:
    // try {
    //   return await bookingEndpoints.cancelBooking(id);
    // } catch (error) {
    //   console.error("Lỗi hủy đặt phòng:", error);
    //   throw error;
    // }
  },

  // Lọc đặt phòng
  filterBookings: async (filters) => {
    try {
      // Định dạng lại các tham số lọc để phù hợp với API (README.md)
      const formattedFilters = {
        fromDate: filters.fromDate || undefined,           // Sửa tên tham số
        toDate: filters.toDate || undefined,             // Sửa tên tham số
        status: filters.status || undefined,
        paymentStatus: filters.paymentStatus || undefined,
        customerId: filters.customerId || undefined,     // Thêm tham số
        roomId: filters.roomId || undefined,             // Thêm tham số
      }

      // Loại bỏ các key có giá trị undefined để không gửi chúng trong query params
      Object.keys(formattedFilters).forEach(key => formattedFilters[key] === undefined && delete formattedFilters[key]);


      return await bookingEndpoints.filterBookings(formattedFilters)
    } catch (error) {
      console.error("Lỗi lọc đặt phòng:", error)
      throw error
    }
  },

  // Đặt phòng của người dùng hiện tại
  getMyBookings: async () => {
    try {
      // API này trả về mảng BookingDto trực tiếp hoặc trong một cấu trúc data
      // Cần kiểm tra response thực tế từ backend
      const response = await bookingEndpoints.getMyBookings()
      // Giả sử response có dạng { data: [...] } hoặc trả về mảng trực tiếp
      return response.data || response;
    } catch (error) {
      console.error("Lỗi lấy danh sách đặt phòng của tôi:", error)
      throw error
    }
  },

  // Liên quan đến thanh toán
  updatePaymentStatus: async (id, paymentData) => { // Tham số thứ hai là object paymentData
    try {
      // Gửi object JSON theo yêu cầu của API (README.md)
      // paymentData nên có dạng { paymentStatus: "...", paymentMethod: "..." }
      if (!paymentData || !paymentData.paymentStatus) {
          throw new Error("paymentStatus là bắt buộc khi cập nhật trạng thái thanh toán.");
      }
      return await bookingEndpoints.updatePaymentStatus(id, paymentData)
    } catch (error) {
      console.error(`Lỗi cập nhật trạng thái thanh toán đặt phòng ${id}:`, error)
      throw error
    }
  },

  processPayment: async (bookingId, paymentData) => {
    try {
       // paymentData nên có dạng { paymentMethod: "...", paymentToken: "..." } theo README
      if (!paymentData || !paymentData.paymentMethod || !paymentData.paymentToken) {
          throw new Error("paymentMethod và paymentToken là bắt buộc khi xử lý thanh toán.");
      }
      return await bookingEndpoints.processPayment(bookingId, paymentData)
    } catch (error) {
      console.error(`Lỗi xử lý thanh toán cho đặt phòng ${bookingId}:`, error)
      throw error
    }
  },

  // Dịch vụ cho đặt phòng
  addServiceToBooking: async (bookingId, serviceData) => {
     try {
      // serviceData nên có dạng { serviceId: ..., quantity: ... } theo README
      if (!serviceData || !serviceData.serviceId || !serviceData.quantity) {
          throw new Error("serviceId và quantity là bắt buộc khi thêm dịch vụ.");
      }
      // Đảm bảo quantity là số > 0
      serviceData.quantity = Number(serviceData.quantity);
       if (isNaN(serviceData.quantity) || serviceData.quantity <= 0) {
           throw new Error("Số lượng dịch vụ phải là số lớn hơn 0.");
       }
       // Đảm bảo serviceId là số
        serviceData.serviceId = Number(serviceData.serviceId);
        if (isNaN(serviceData.serviceId)) {
           throw new Error("ID dịch vụ không hợp lệ.");
       }

      return await bookingEndpoints.addServiceToBooking(bookingId, serviceData)
    } catch (error) {
      console.error(`Lỗi thêm dịch vụ vào đặt phòng ${bookingId}:`, error)
      throw error
    }
  },

  removeServiceFromBooking: async (bookingId, bookingServiceId) => { // Đổi tên tham số thành bookingServiceId
    try {
       // Đảm bảo bookingServiceId là số
       const idToRemove = Number(bookingServiceId);
        if (isNaN(idToRemove)) {
           throw new Error("ID dịch vụ đặt phòng (bookingServiceId) không hợp lệ.");
       }
      // URL endpoint yêu cầu bookingServiceId ở cuối
      return await bookingEndpoints.removeServiceFromBooking(bookingId, idToRemove)
    } catch (error) {
      console.error(`Lỗi xóa dịch vụ (ID: ${bookingServiceId}) khỏi đặt phòng ${bookingId}:`, error)
      throw error
    }
  },

  getBookingServices: async (bookingId) => {
    try {
      // API trả về mảng các đối tượng dịch vụ
      const response = await bookingEndpoints.getBookingServices(bookingId)
       // Giả sử response có dạng { data: [...] } hoặc trả về mảng trực tiếp
      return response.data || response;
    } catch (error) {
      console.error(`Lỗi lấy dịch vụ của đặt phòng ${bookingId}:`, error)
      throw error
    }
  },

  // Tạo hóa đơn (Không có trong README cung cấp, giữ nguyên hoặc xem xét lại nếu API khác)
  createInvoice: async (bookingId) => {
    console.warn("API createInvoice không được mô tả trong README.md cung cấp.");
    try {
      return await bookingEndpoints.createInvoice(bookingId)
    } catch (error) {
      console.error(`Lỗi tạo hóa đơn cho đặt phòng ${bookingId}:`, error)
      throw error
    }
  },

  // Lấy hóa đơn (Không có trong README cung cấp, giữ nguyên hoặc xem xét lại nếu API khác)
  getInvoice: async (bookingId) => {
     console.warn("API getInvoice không được mô tả trong README.md cung cấp.");
    try {
      return await bookingEndpoints.getInvoice(bookingId)
    } catch (error) {
      console.error(`Lỗi lấy hóa đơn cho đặt phòng ${bookingId}:`, error)
      throw error
    }
  },

  // Tải hóa đơn (Không có trong README cung cấp, giữ nguyên hoặc xem xét lại nếu API khác)
  downloadInvoice: async (bookingId) => {
     console.warn("API downloadInvoice không được mô tả trong README.md cung cấp.");
    try {
      const response = await bookingEndpoints.downloadInvoice(bookingId) // Giả sử endpoint này trả về blob

      // Xử lý tải xuống file PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })); // Chỉ định type
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `invoice-${bookingId}.pdf`) // Đặt tên file
      document.body.appendChild(link)
      link.click()
      link.remove() // Xóa link sau khi click
      window.URL.revokeObjectURL(url); // Giải phóng bộ nhớ

      return { message: "Tải hóa đơn thành công" }; // Trả về thông báo thay vì response axios
    } catch (error) {
      console.error(`Lỗi tải hóa đơn cho đặt phòng ${bookingId}:`, error)
      // Cung cấp thông tin lỗi rõ ràng hơn nếu có thể
      if (error.response) {
        // Lỗi từ server (ví dụ: 404 Not Found, 500 Internal Server Error)
        console.error("Server response:", error.response.status, error.response.data);
        throw new Error(`Không thể tải hóa đơn: ${error.response.statusText || 'Lỗi không xác định từ server'}`);
      } else if (error.request) {
         // Request được gửi nhưng không nhận được response
         console.error("No response received:", error.request);
         throw new Error("Không nhận được phản hồi từ server khi tải hóa đơn.");
      } else {
         // Lỗi khác khi thiết lập request
         console.error("Error setting up request:", error.message);
         throw new Error(`Lỗi khi yêu cầu tải hóa đơn: ${error.message}`);
      }
    }
  },
}

export default bookingService


/**
 * Các endpoint API báo cáo
 *
 * File này định nghĩa các endpoint liên quan đến báo cáo doanh thu,
 * công suất phòng, dịch vụ và xuất báo cáo.
 */
import apiClient from "../apiClient"

const reportEndpoints = {
  /**
   * Lấy dữ liệu báo cáo doanh thu theo tháng.
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Dữ liệu báo cáo
   */
  getMonthlyRevenue: (startDate, endDate) => {
    return apiClient.get("/reports/monthly-revenue", { params: { startDate, endDate } });
  },

  /**
   * Lấy dữ liệu báo cáo công suất phòng theo ngày.
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Dữ liệu báo cáo
   */
  getOccupancy: (startDate, endDate) => {
    return apiClient.get("/reports/occupancy", { params: { startDate, endDate } });
  },

  // Không cần API cho service report và export nữa

  // Thống kê dashboard
  getDashboardStatistics: () => apiClient.get("/reports/dashboard"),
}

export default reportEndpoints


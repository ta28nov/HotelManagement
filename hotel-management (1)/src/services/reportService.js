/**
 * Dịch vụ báo cáo
 *
 * Dịch vụ này xử lý các thao tác liên quan đến báo cáo doanh thu,
 * công suất phòng và xuất báo cáo
 */

import { reportEndpoints } from "../api"

const reportService = {
  /**
   * Lấy dữ liệu báo cáo doanh thu theo tháng.
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Dữ liệu báo cáo
   */
  getRevenueReport: async (startDate, endDate) => {
    try {
      return await reportEndpoints.getMonthlyRevenue(startDate, endDate)
    } catch (error) {
      console.error("Lỗi lấy báo cáo doanh thu:", error)
      throw error
    }
  },

  /**
   * Lấy dữ liệu báo cáo công suất phòng theo ngày.
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Dữ liệu báo cáo
   */
  getOccupancyReport: async (startDate, endDate) => {
    try {
      return await reportEndpoints.getOccupancy(startDate, endDate)
    } catch (error) {
      console.error("Lỗi lấy báo cáo công suất phòng:", error)
      throw error
    }
  },

  // Báo cáo dịch vụ
  getServiceReport: async (groupBy) => {
    try {
      return await reportEndpoints.getServiceReport(groupBy)
    } catch (error) {
      console.error("Lỗi lấy báo cáo dịch vụ:", error)
      throw error
    }
  },

  // Xuất báo cáo
  exportRevenueReport: async (period, format) => {
    try {
      return await reportEndpoints.exportRevenueReport(period, format)
    } catch (error) {
      console.error("Lỗi xuất báo cáo doanh thu:", error)
      throw error
    }
  },

  exportOccupancyReport: async (period, format) => {
    try {
      return await reportEndpoints.exportOccupancyReport(period, format)
    } catch (error) {
      console.error("Lỗi xuất báo cáo công suất phòng:", error)
      throw error
    }
  },

  exportServiceReport: async (groupBy, format) => {
    try {
      return await reportEndpoints.exportServiceReport(groupBy, format)
    } catch (error) {
      console.error("Lỗi xuất báo cáo dịch vụ:", error)
      throw error
    }
  },

  // Thống kê dashboard
  getDashboardStatistics: async () => {
    try {
      return await reportEndpoints.getDashboardStatistics()
    } catch (error) {
      console.error("Lỗi lấy thống kê dashboard:", error)
      throw error
    }
  },
}

export default reportService


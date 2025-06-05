"use client"

/**
 * Hook tùy chỉnh để gọi API
 *
 * Hook này giúp đơn giản hóa việc gọi API và quản lý trạng thái
 * loading, error và data
 */

import { useState, useEffect, useCallback } from "react"

/**
 * Hook tùy chỉnh để gọi API và quản lý trạng thái
 *
 * @param {Function} apiFunction - Hàm API cần gọi
 * @param {Array} dependencies - Mảng các phụ thuộc để quyết định khi nào gọi lại API
 * @param {boolean} immediate - Có gọi API ngay lập tức khi component mount hay không
 * @param {Array} initialArgs - Các tham số ban đầu cho apiFunction
 * @returns {Object} - Trạng thái và hàm để gọi API
 */
const useApi = (apiFunction, dependencies = [], immediate = true, initialArgs = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  // Hàm gọi API
  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiFunction(...args)
        setData(response.data)
        return response.data
      } catch (error) {
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [apiFunction],
  )

  // Gọi API khi component mount nếu immediate = true
  useEffect(() => {
    if (immediate) {
      execute(...initialArgs)
    }
  }, [...dependencies, execute])

  return { data, loading, error, execute }
}

export default useApi


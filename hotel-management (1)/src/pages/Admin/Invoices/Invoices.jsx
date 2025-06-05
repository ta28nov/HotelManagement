"use client"

/**
 * Invoices.jsx
 *
 * Vai trò: Trang quản lý hóa đơn cho admin và nhân viên.
 * Chức năng:
 * - Hiển thị danh sách hóa đơn (dựa trên booking)
 * - Lọc hóa đơn
 * - Cập nhật trạng thái thanh toán
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect, useMemo } from "react"
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table"
import { motion } from "framer-motion"
import { FaSearch, FaFilter } from "react-icons/fa"
import { format } from "date-fns"
import { toast } from "react-toastify"
import bookingService from "../../../services/bookingService"
import { PAYMENT_STATUS, formatCurrency } from "../../../config/constants"
import "./Invoices.css"

const Invoices = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null)
  const [filters, setFilters] = useState({
    paymentStatus: "",
    startDate: "",
    endDate: "",
  })

  // Fetch bookings data (which will be used to generate invoices)
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingService.getAllBookings()
      setBookings(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách đặt phòng")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Handle invoice filtering
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = async () => {
    try {
      setLoading(true)
      const response = await bookingService.filterBookings(filters)
      setBookings(response.data)
      toast.success("Lọc hóa đơn thành công")
    } catch (error) {
      toast.error("Không thể lọc hóa đơn")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      paymentStatus: "",
      startDate: "",
      endDate: "",
    })
    fetchBookings()
  }

  // Handle updating payment status
  const handleUpdatePaymentStatus = async (bookingId, newStatus) => {
    setIsUpdatingStatus(bookingId)
    try {
      await bookingService.updatePaymentStatus(bookingId, { paymentStatus: newStatus })
      toast.success("Cập nhật trạng thái thanh toán thành công!")
      fetchBookings()
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái thanh toán.")
      console.error("Error updating payment status:", error)
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        Header: "Mã đặt phòng",
        accessor: "id",
        Cell: ({ value }) => `#${value}`,
      },
      {
        Header: "Khách hàng",
        accessor: "customerName",
      },
      {
        Header: "Phòng",
        accessor: "roomNumber",
      },
      {
        Header: "Ngày nhận phòng",
        accessor: "checkInDate",
        Cell: ({ value }) => (value ? format(new Date(value), "dd/MM/yyyy") : "N/A"),
      },
      {
        Header: "Ngày trả phòng",
        accessor: "checkOutDate",
        Cell: ({ value }) => (value ? format(new Date(value), "dd/MM/yyyy") : "N/A"),
      },
      {
        Header: "Tổng tiền",
        accessor: "totalAmount",
        Cell: ({ value }) => formatCurrency(value),
      },
      {
        Header: "Trạng thái thanh toán",
        accessor: "paymentStatus",
        Cell: ({ value, row }) => {
          const bookingId = row.original.id

          return (
            <div className="payment-status-cell">
              <select
                value={value || ''}
                onChange={(e) => handleUpdatePaymentStatus(bookingId, e.target.value)}
                disabled={isUpdatingStatus === bookingId}
                className={`status-select payment-status-${value}`}
              >
                {PAYMENT_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {isUpdatingStatus === bookingId && <span className="status-updating-spinner"></span>}
            </div>
          )
        },
      },
    ],
    [isUpdatingStatus],
  )

  // React Table hooks
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
  } = useTable(
    {
      columns,
      data: bookings,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
  )

  const { globalFilter, pageIndex, pageSize } = state

  return (
    <div className="invoices-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="page-header"
      >
        <h1>Quản lý hóa đơn</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="filter-section"
      >
        <div className="search-box">
          <FaSearch />
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm hóa đơn..."
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Trạng thái thanh toán:</label>
            <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange}>
              <option value="">Tất cả</option>
              {PAYMENT_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Từ ngày:</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label>Đến ngày:</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>

          <button className="filter-button" onClick={applyFilters}>
            <FaFilter /> Lọc
          </button>
          <button className="reset-button" onClick={resetFilters}>
            Đặt lại
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="loading-spinner">Đang tải dữ liệu...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="table-container"
        >
          <table {...getTableProps()} className="invoices-table">
            <thead>
              {headerGroups.map((headerGroup) => {
                // Extract key for header group row
                const { key: hgKey, ...hgProps } = headerGroup.getHeaderGroupProps();
                return (
                  <tr key={hgKey} {...hgProps}>
                    {headerGroup.headers.map((column) => {
                      // Extract key for header cell
                      const { key: hKey, ...hProps } = column.getHeaderProps(column.getSortByToggleProps());
                      return (
                        <th
                          key={hKey}
                          {...hProps}
                          className={column.isSorted ? (column.isSortedDesc ? "sort-desc" : "sort-asc") : ""}
                        >
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' 🔽'
                                : ' 🔼'
                              : ''}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                // Extract key for body row
                const { key: rKey, ...rProps } = row.getRowProps();
                return (
                  <tr key={rKey} {...rProps}>
                    {row.cells.map((cell) => {
                      // Extract key for body cell
                      const { key: cKey, ...cProps } = cell.getCellProps();
                      return (
                        <td key={cKey} {...cProps}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination">
            <div>
              <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {"<<"}
              </button>
              <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                {"<"}
              </button>
              <button onClick={() => nextPage()} disabled={!canNextPage}>
                {">"}
              </button>
              <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {">>"}
              </button>
            </div>
            <span>
              Trang{" "}
              <strong>
                {pageIndex + 1} / {pageOptions.length}
              </strong>
            </span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Hiển thị {size}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Invoices


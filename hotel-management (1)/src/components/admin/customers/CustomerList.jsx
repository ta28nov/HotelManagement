"use client"

/**
 * CustomerList.jsx
 *
 * Vai trò: Component hiển thị danh sách khách hàng và các chức năng quản lý khách hàng.
 * Chức năng:
 * - Hiển thị danh sách khách hàng dưới dạng bảng
 * - Tìm kiếm khách hàng
 * - Thêm, sửa, xóa khách hàng
 * - Xem lịch sử đặt phòng của khách hàng
 * - Phân trang danh sách khách hàng
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect, useMemo, useCallback } from "react"
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table"
import { motion } from "framer-motion"
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import { debounce } from "lodash"

import customerService from "../../../services/customerService"
import ConfirmationModal from "../../common/ConfirmationModal"
import CustomerForm from "./CustomerForm"
import TableSkeleton from "../../common/TableSkeleton"
import { useAuth } from "../../../context/AuthContext" // Corrected path again (3 levels up)
import "./CustomerList.css"

const CustomerList = () => {
  console.log('CustomerList component function executing'); // Add log at the very top
  const { currentUser: user } = useAuth() // Destructure currentUser and rename to user for consistency
  console.log('User in CustomerList:', user); // Keep this log too
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Permissions using the user from context (Case-insensitive check)
  const userRole = user?.role?.toLowerCase(); // Convert role to lowercase
  const canAdd = userRole === 'admin' || userRole === 'employee';
  const canEdit = userRole === 'admin' || userRole === 'employee';
  const canDelete = userRole === 'admin'; // Only Admin can delete

  // Fetch customers function
  const fetchCustomers = async (search = "") => {
    try {
      setLoading(true)
      setError(null)
      const response = await customerService.getAllCustomers(search)
      setCustomers(response.data || []) // Ensure data is an array
    } catch (err) {
      setError("Failed to load customers.")
      toast.error("Không thể tải danh sách khách hàng.")
      console.error("Error fetching customers:", err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search handler
  const debouncedFetchCustomers = useCallback(debounce(fetchCustomers, 300), [])

  // Initial fetch and fetch on search term change
  useEffect(() => {
    debouncedFetchCustomers(searchTerm)
    // Cleanup function for debounce
    return () => {
        debouncedFetchCustomers.cancel()
    }
  }, [searchTerm, debouncedFetchCustomers])

  // Handle opening the Add/Edit modal
  const handleOpenModal = (customer = null) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  // Handle closing the Add/Edit modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
  }

  // Handle opening the Delete confirmation modal
  const handleOpenDeleteModal = (customer) => {
    setCustomerToDelete(customer)
    setIsDeleteModalOpen(true)
  }

  // Handle closing the Delete confirmation modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setCustomerToDelete(null)
  }

  // Handle saving customer (Add/Edit)
  const handleSaveCustomer = async (customerData) => {
    setIsSubmitting(true)
    try {
      if (selectedCustomer) {
        // Update existing customer
        await customerService.updateCustomer(selectedCustomer.id, customerData)
        toast.success("Cập nhật khách hàng thành công!")
      } else {
        // Create new customer
        await customerService.createCustomer(customerData)
        toast.success("Thêm khách hàng thành công!")
      }
      handleCloseModal()
      fetchCustomers(searchTerm) // Refresh list
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : (selectedCustomer ? "Cập nhật khách hàng thất bại." : "Thêm khách hàng thất bại.")
      toast.error(errorMessage)
      console.error("Error saving customer:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return
    setIsSubmitting(true)
    try {
      await customerService.deleteCustomer(customerToDelete.id)
      toast.success("Xóa khách hàng thành công!")
      handleCloseDeleteModal()
      fetchCustomers(searchTerm) // Refresh list
    } catch (err) {
      toast.error("Xóa khách hàng thất bại.")
      console.error("Error deleting customer:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Table columns configuration
  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      {
        Header: "Tên đầy đủ",
        accessor: "fullName",
        Cell: ({ row }) => row.original.fullName || `${row.original.lastName} ${row.original.firstName}`
      },
      { Header: "Email", accessor: "email" },
      { Header: "Số điện thoại", accessor: "phoneNumber" },
      { Header: "Số CCCD/HC", accessor: "idNumber", Cell: ({ value }) => value || "N/A" },
      { Header: "Quốc tịch", accessor: "nationality", Cell: ({ value }) => value || "N/A" },
      {
        Header: "Hành động",
        accessor: "actions",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="action-buttons">
            {canEdit && (
              <button onClick={() => handleOpenModal(row.original)} className="action-btn edit-btn" title="Sửa">
                <FaEdit />
              </button>
            )}
            {canDelete && (
                <button onClick={() => handleOpenDeleteModal(row.original)} className="action-btn delete-btn" title="Xóa">
                  <FaTrash />
                </button>
            )}
          </div>
        ),
      },
    ],
    [canEdit, canDelete] // Remove canViewHistory from dependencies
  )

  // React Table instance
  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow, state, setGlobalFilter: setTableGlobalFilter, nextPage, previousPage, canNextPage, canPreviousPage, pageOptions, gotoPage, pageCount, setPageSize } = useTable(
    {
      columns,
      data: customers,
      initialState: { pageIndex: 0, pageSize: 10 },
      manualGlobalFilter: true, // We handle filtering server-side
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  const { pageIndex, pageSize } = state

  // Update table filter state based on search input
  // Note: We don't use react-table's filtering directly as it's server-side
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="customer-list-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="controls-header"
      >
        <h2>Danh sách Khách hàng</h2>
        <div className="controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm (Tên, Email, SĐT)..."
            />
          </div>
          {canAdd && (
            <button className="add-button" onClick={() => handleOpenModal()}> <FaPlus /> Thêm Khách hàng </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <TableSkeleton columns={columns.length} />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="table-wrapper"
        >
          <table {...getTableProps()} className="data-table customer-table">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
                    <th
                      key={column.id}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={column.isSorted ? (column.isSortedDesc ? "sort-desc" : "sort-asc") : ""}
                    >
                      {column.render("Header")}
                      <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.length === 0 ? (
                <tr><td colSpan={columns.length} className="no-data">Không tìm thấy khách hàng.</td></tr>
              ) : (
                page.map((row) => {
                  prepareRow(row)
                  return (
                    <tr {...row.getRowProps()} key={row.original.id}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} key={`${row.original.id}_${cell.column.id}`}>{cell.render("Cell")}</td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {customers.length > pageSize && (
             <div className="pagination">
                 <div>
                   <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
                   <button onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</button>
                   <button onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</button>
                   <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</button>
                 </div>
                 <span> Trang <strong> {pageIndex + 1} / {pageOptions.length} </strong> </span>
                 <select
                   value={pageSize}
                   onChange={e => setPageSize(Number(e.target.value))}
                   aria-label="Số mục hiển thị trên mỗi trang"
                 >
                   {[10, 20, 30, 40, 50].map(size => (
                     <option key={size} value={size}> Hiện {size} </option>
                   ))}
                 </select>
             </div>
           )}
        </motion.div>
      )}

      {/* Add/Edit Modal */} {isModalOpen && (
        <CustomerForm
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveCustomer}
            customerData={selectedCustomer} // Pass null for Add, customer object for Edit
            isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */} {customerToDelete && (
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDeleteCustomer}
            title="Xác nhận xóa khách hàng"
            message={`Bạn có chắc chắn muốn xóa khách hàng ${customerToDelete.fullName} (${customerToDelete.email || customerToDelete.phoneNumber})? Hành động này không thể hoàn tác.`}
            confirmText="Xóa"
            cancelText="Hủy"
            isConfirming={isSubmitting}
        />
      )}
    </div>
  )
}

export default CustomerList


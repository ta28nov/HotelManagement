"use client"

/**
 * Users.jsx
 *
 * Vai trò: Trang quản lý người dùng cho admin.
 * Chức năng:
 * - Hiển thị danh sách người dùng
 * - Thêm, sửa, xóa người dùng
 * - Phân quyền người dùng
 *
 * Quyền truy cập: Admin
 */

import { useState, useEffect, useMemo } from "react"
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table"
import { motion } from "framer-motion"
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa"
import { toast } from "react-toastify"
import authService from "../../../services/authService"
import { ROLES } from "../../../config/constants"
import UserForm from "./UserForm"
import ConfirmationModal from "../../../components/common/ConfirmationModal"
import "./Users.css"
// import { useAuth } from '../../../context/AuthContext'; // << GIẢ SỬ: Import hook quản lý Auth

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // ----- BEGIN: Logic Lấy và Kiểm tra Quyền Thực tế -----
  // const { user } = useAuth(); // << GIẢ SỬ: Lấy thông tin user từ Auth Context

  // const isAdmin = user && user.role === ROLES.ADMIN;
  
  // !!! QUAN TRỌNG: Bỏ comment các dòng trên và đảm bảo `useAuth` hoạt động đúng
  // !!!           Hoặc thay thế bằng cơ chế quản lý Auth của bạn.
  // Tạm thời vẫn giữ giá trị true để UI hiển thị đầy đủ cho việc phát triển
  const isAdmin = true; 
  // ----- END: Logic Lấy và Kiểm tra Quyền Thực tế -----

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await authService.getAllUsers()
      setUsers(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle user operations
  const handleAddUser = () => {
    setCurrentUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user) => {
    setCurrentUser(user)
    setShowForm(true)
  }

  const handleSaveUser = async (userData, userId) => {
    setIsSubmitting(true)
    try {
      if (userId) {
        await authService.updateUser(userId, userData)
        toast.success("Cập nhật người dùng thành công!")
      } else {
        await authService.createUser(userData)
        toast.success("Thêm người dùng mới thành công!")
      }
      setShowForm(false)
        fetchUsers()
      } catch (error) {
      const errorMsg = userId ? "Cập nhật người dùng thất bại" : "Thêm người dùng mới thất bại"
      const backendError = error.response?.data?.message || error.message
      toast.error(`${errorMsg}: ${backendError}`)
        console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await authService.deleteUser(userToDelete.id)
      toast.success(`Xóa người dùng "${userToDelete.name}" thành công!`)
      fetchUsers()
    } catch (error) {
      const backendError = error.response?.data?.message || error.message
      toast.error(`Không thể xóa người dùng: ${backendError}`)
      console.error(error)
    } finally {
      setShowDeleteConfirm(false)
      setUserToDelete(null)
    }
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        Header: "Họ tên",
        accessor: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Vai trò",
        accessor: "role",
        Cell: ({ value }) => {
          const roleLabel = value === ROLES.ADMIN ? "Admin" : value === ROLES.EMPLOYEE ? "Nhân viên" : "Khách hàng"

          return <span className={`role-badge role-${value}`}>{roleLabel}</span>
        },
      },
      {
        Header: "Ngày tạo",
        accessor: "createdAt",
        Cell: ({ value }) => new Date(value).toLocaleDateString("vi-VN"),
      },
      {
        Header: "Thao tác",
        Cell: ({ row }) => (
          <div className="action-buttons">
            {isAdmin && (
            <button className="edit-button" onClick={() => handleEditUser(row.original)} title="Chỉnh sửa">
              <FaEdit />
            </button>
            )}
            {isAdmin && (
              <button className="delete-button" onClick={() => handleDeleteUser(row.original)} title="Xóa">
              <FaTrash />
            </button>
            )}
          </div>
        ),
      },
    ],
    [isAdmin],
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
      data: users,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
  )

  const { globalFilter, pageIndex, pageSize } = state

  // Render skeleton rows khi đang loading
  const renderSkeleton = (rowCount = 10) => {
    return Array.from({ length: rowCount }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="skeleton-row">
        <td className="skeleton-cell"><div className="skeleton-item"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item actions"></div></td>
      </tr>
    ));
  };

  return (
    <div className="users-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="page-header"
      >
        <h1>Quản lý người dùng</h1>
        {isAdmin && (
        <button className="add-button" onClick={handleAddUser}>
          <FaPlus /> Thêm người dùng mới
        </button>
        )}
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
            placeholder="Tìm kiếm người dùng..."
          />
        </div>
      </motion.div>

      {showForm && (
        <div className="user-form-modal-overlay">
          <div className="user-form-modal-content">
            <UserForm
              initialData={currentUser}
              onSave={handleSaveUser}
              onCancel={() => setShowForm(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteUser}
        title="Xác nhận Xóa Người Dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Đồng ý Xóa"
      />

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="table-container"
        >
          <table {...getTableProps()} className="users-table">
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
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {loading
                ? renderSkeleton(pageSize)
                : page.map((row) => {
                prepareRow(row)
                return (
                  <tr {...row.getRowProps()} key={row.original.id}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} key={`${row.original.id}_${cell.column.id}`}>
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {"<<"}
            </button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {"<"}
            </button>
            <span>
              Trang{" "}
              <strong>
                {pageIndex + 1} / {pageOptions.length}
              </strong>
            </span>
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              {">"}
            </button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
              {">>"}
            </button>
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

export default Users


"use client"

/**
 * RoomTypeManagement.jsx
 *
 * Component quản lý Loại phòng (dùng trong Tabs của trang Rooms)
 */

import { useState, useEffect, useMemo } from "react"
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table"
import { motion } from "framer-motion"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaImages } from "react-icons/fa"
import { toast } from "react-toastify"
import roomService from "../../../services/roomService"
import { formatCurrency, ROLES } from "../../../config/constants"
import { useAuth } from "../../../context/AuthContext"
import RoomTypeForm from "./RoomTypeForm" // Form trong cùng thư mục
import RoomTypeImageManager from "./RoomTypeImageManager" // Import component quản lý ảnh
import ConfirmationModal from "../../common/ConfirmationModal"
import "./RoomTypeManagement.css" // CSS riêng cho component này

const RoomTypeManagement = () => {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [currentRoomType, setCurrentRoomType] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [roomTypeToDelete, setRoomTypeToDelete] = useState(null)
  const [showImageManager, setShowImageManager] = useState(false)
  const [selectedRoomTypeForImages, setSelectedRoomTypeForImages] = useState(null)

  const { currentUser } = useAuth()

  // Permissions based on user role
  const isAdmin = currentUser?.role === ROLES.ADMIN
  const canEdit = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.EMPLOYEE

  // Fetch Room Types Data
  const fetchData = async () => {
    setLoading(true)
    setLoadingError(null)
    try {
      const response = await roomService.getRoomTypes()
      setRoomTypes(Array.isArray(response?.data) ? response.data : [])
    } catch (error) {
      console.error("Fetch room types error:", error)
      toast.error("Không thể tải danh sách loại phòng.")
      setLoadingError("Lỗi tải dữ liệu. Vui lòng thử lại.")
      setRoomTypes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handlers for CRUD operations
  const handleAdd = () => {
    if (!canEdit) return
    setCurrentRoomType(null)
    setIsEditMode(false)
    setShowFormModal(true)
  }

  const handleEdit = (roomType) => {
    if (!canEdit) return
    setCurrentRoomType(roomType)
    setIsEditMode(true)
    setShowFormModal(true)
  }

  const handleSave = async (formData, roomTypeId) => {
    if (!canEdit) return
    setIsSubmitting(true)
    const apiCall = roomTypeId
      ? roomService.updateRoomType(roomTypeId, formData)
      : roomService.createRoomType(formData)
    const successMsg = roomTypeId ? "Cập nhật loại phòng thành công!" : "Thêm loại phòng mới thành công!"
    const errorMsgBase = roomTypeId ? "Cập nhật loại phòng thất bại" : "Thêm loại phòng mới thất bại"

    try {
      await apiCall
      toast.success(successMsg)
      setShowFormModal(false)
      setCurrentRoomType(null)
      fetchData()
    } catch (error) {
      const backendError = error.response?.data?.message || error.message || "Lỗi không xác định"
      toast.error(`${errorMsgBase}: ${backendError}`)
      console.error("Save room type error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (roomType) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền xóa loại phòng.")
      return
    }
    setRoomTypeToDelete(roomType)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!roomTypeToDelete || !isAdmin) return
    try {
      await roomService.deleteRoomType(roomTypeToDelete.id)
      toast.success(`Xóa loại phòng "${roomTypeToDelete.name}" thành công!`)
      fetchData()
    } catch (error) {
      let errorMsg = "Không thể xóa loại phòng."
      if (error.response?.status === 409) {
        errorMsg = `Không thể xóa loại phòng "${roomTypeToDelete.name}" vì vẫn còn phòng thuộc loại này.`
      } else {
        errorMsg = error.response?.data?.message || error.message || errorMsg
      }
      toast.error(errorMsg)
      console.error("Delete room type error:", error)
    } finally {
      setShowDeleteConfirm(false)
      setRoomTypeToDelete(null)
    }
  }

  // Handlers for Image Manager Modal
  const handleOpenImageManager = (roomType) => {
    setSelectedRoomTypeForImages(roomType)
    setShowImageManager(true)
  }

  const handleCloseImageManager = () => {
    setShowImageManager(false)
    setSelectedRoomTypeForImages(null)
    // Optionally refetch data if images might affect table display (e.g., primary image shown)
    // fetchData(); 
  }

  // Table columns configuration
  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id", minWidth: 50, maxWidth: 70 },
      { Header: "Tên loại phòng", accessor: "name", minWidth: 150 },
      {
        Header: "Mô tả",
        accessor: "description",
        Cell: ({ value }) => <div className="description-cell" title={value}>{value || "-"}</div>,
        minWidth: 200,
        maxWidth: 350,
      },
      {
        Header: "Giá cơ bản",
        accessor: "basePrice",
        Cell: ({ value }) => formatCurrency(value),
        minWidth: 100,
        maxWidth: 120,
      },
      {
        Header: "Sức chứa",
        accessor: "capacity",
        Cell: ({ value }) => `${value} người`,
        minWidth: 80,
        maxWidth: 100,
      },
      // Add Image Management Column
      {
        Header: "Ảnh",
        id: 'images',
        disableSortBy: true,
        minWidth: 80,
        maxWidth: 80,
        Cell: ({ row }) => (
           <button 
              className="manage-images-button action-button" // Reuse action-button styles
              onClick={() => handleOpenImageManager(row.original)}
              title="Quản lý hình ảnh"
           >
              <FaImages /> {/* Replace text with Icon */}
           </button>
        )
      },
      {
        Header: "Thao tác",
        id: 'actions',
        disableSortBy: true,
        minWidth: 100,
        maxWidth: 120,
        Cell: ({ row }) => (
          <div className="action-buttons">
            {canEdit && (
              <button className="edit-button" onClick={() => handleEdit(row.original)} title="Chỉnh sửa">
                <FaEdit />
              </button>
            )}
            {isAdmin && (
              <button className="delete-button" onClick={() => handleDelete(row.original)} title="Xóa">
                <FaTrash />
              </button>
            )}
          </div>
        ),
      },
    ],
    [isAdmin, canEdit]
  )

  // React Table instance
  const { 
    getTableProps, 
    getTableBodyProps, 
    headerGroups, 
    page, 
    prepareRow, 
    state: { globalFilter, pageIndex, pageSize }, 
    setGlobalFilter, 
    nextPage, previousPage, canNextPage, canPreviousPage, pageOptions, gotoPage, pageCount, setPageSize
  } = useTable(
    { columns, data: roomTypes, initialState: { pageIndex: 0, pageSize: 10, sortBy: [{ id: 'id', desc: false }] } },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  // Skeleton Loader component
  const renderSkeleton = (rowCount = 10) => {
    return Array.from({ length: rowCount }).map((_, index) => (
      <tr key={`skeleton-rt-${index}`} className="skeleton-row">
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item medium"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item long"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item actions"></div></td>
      </tr>
    ))
  }

  return (
    <div className="room-type-management-container">
      {/* Header Controls: Search and Add Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="list-header-controls" // Reuse class if styles are similar
      >
        <div className="search-box">
          <FaSearch />
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={`Tìm kiếm trong ${roomTypes.length} loại phòng...`}
            disabled={loading}
          />
        </div>
        {canEdit && (
          <button className="add-new-button" onClick={handleAdd} disabled={loading || isSubmitting}>
            <FaPlus /> Thêm Loại phòng
          </button>
        )}
      </motion.div>

      {/* Form Modal */} 
      {showFormModal && (
        <div className="form-modal-overlay">
          <RoomTypeForm
            roomType={currentRoomType}
            isEditMode={isEditMode}
            onSave={handleSave}
            onClose={() => setShowFormModal(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */} 
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa Loại phòng"
        message={
          `Bạn có chắc chắn muốn xóa loại phòng "${roomTypeToDelete?.name}"? 
          Lưu ý: Hành động này sẽ thất bại nếu vẫn còn phòng thuộc loại này.`
        }
        confirmText="Đồng ý Xóa"
        confirmButtonVariant="danger"
      />

      {/* Image Manager Modal */} 
      {showImageManager && selectedRoomTypeForImages && (
        <div className="form-modal-overlay">
          <RoomTypeImageManager
            roomTypeId={selectedRoomTypeForImages.id}
            roomTypeName={selectedRoomTypeForImages.name}
            onClose={handleCloseImageManager}
          />
        </div>
      )}

      {/* Loading Error Message */} 
      {loadingError && !loading ? (
        <div className="loading-error-message">{loadingError}</div>
      ) : (
        /* Table Section */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="table-container"
        >
          <table {...getTableProps()} className="data-table">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}
                        className={column.isSorted ? (column.isSortedDesc ? "sort-desc" : "sort-asc") : ""}
                        style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
                    >
                      {column.render("Header")}
                      <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {loading ? renderSkeleton(pageSize) : (
                page.length > 0 ? page.map((row) => {
                  prepareRow(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        const { key, ...restCellProps } = cell.getCellProps();
                        return (
                          <td key={key} {...restCellProps} style={{ maxWidth: cell.column.maxWidth }}>
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={columns.length} className="no-data-message">
                      Không tìm thấy loại phòng nào.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Pagination Controls */} 
          {!loading && roomTypes.length > pageSize && (
            <div className="pagination-controls">
               <div className="page-info">
                 Trang {pageIndex + 1} / {pageOptions.length}
               </div>
               <div className="page-buttons">
                 <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} title="Trang đầu">{"«"}</button>
                 <button onClick={() => previousPage()} disabled={!canPreviousPage} title="Trang trước">{"‹"}</button>
                 <button onClick={() => nextPage()} disabled={!canNextPage} title="Trang sau">{"›"}</button>
                 <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} title="Trang cuối">{"»"}</button>
               </div>
               <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} title="Số hàng mỗi trang">
                 {[10, 20, 30, 50].map(size => (
                   <option key={size} value={size}> {size} / trang </option>
                 ))}
               </select>
               <span className="page-info">
                 Hiển thị {page.length} / {roomTypes.length} loại phòng
               </span>
             </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default RoomTypeManagement 
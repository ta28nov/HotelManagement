"use client"

/**
 * RoomList.jsx
 *
 * Vai trò: Component hiển thị danh sách phòng và các chức năng quản lý phòng.
 * Chức năng:
 * - Hiển thị danh sách phòng dưới dạng bảng
 * - Tìm kiếm phòng (toàn cục)
 * - Thêm, sửa, xóa phòng
 * - Phân trang danh sách phòng
 *
 * Quyền truy cập: Admin và Employee (Xóa chỉ Admin)
 */

import { useState, useEffect, useMemo } from "react"
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table"
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import roomService from "../../../services/roomService" // Corrected service
// Import AuthContext to check user role
import { useAuth } from "../../../context/AuthContext"
import { formatCurrency, ROLES } from "../../../config/constants" // Import directly if needed
import RoomForm from "./RoomForm" // Assuming RoomForm is updated
import ConfirmationModal from "../../common/ConfirmationModal" // Đường dẫn đúng?
import "./RoomList.css"

const RoomList = () => {
  const [rooms, setRooms] = useState([])
  const [roomTypes, setRoomTypes] = useState([]) // State cho loại phòng
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null) // For editing
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // State quản lý trạng thái submit form
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)

  // Get current user from AuthContext
  const { currentUser } = useAuth()

  // Check Permissions using actual user data
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const canEdit = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.EMPLOYEE;
  // Ensure ROLES.ADMIN and ROLES.EMPLOYEE match the values from your constants/backend

  // Fetch rooms and room types data
  const fetchData = async () => {
    setLoading(true)
    setLoadingError(null)
    try {
      const [roomsResponse, roomTypesResponse] = await Promise.all([
        roomService.getAllRooms(),
        roomService.getRoomTypes()
      ])
      setRooms(Array.isArray(roomsResponse.data) ? roomsResponse.data : [])
      setRoomTypes(Array.isArray(roomTypesResponse.data) ? roomTypesResponse.data : [])
    } catch (error) {
      toast.error("Không thể tải dữ liệu phòng hoặc loại phòng.")
      console.error("Fetch data error:", error)
      setLoadingError("Lỗi tải dữ liệu. Vui lòng thử lại.")
      setRooms([])
      setRoomTypes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle room operations
  const handleAddRoom = () => {
    setCurrentRoom(null) // Clear current room
    setIsEditMode(false)
    setShowForm(true) // Show the form in 'add' mode
  }

  const handleEditRoom = (room) => {
    setCurrentRoom(room) // Set the room to edit
    setIsEditMode(true)
    setShowForm(true) // Show the form in 'edit' mode
  }

  const handleDeleteRoom = (room) => { // Nhận cả object room
    if (!isAdmin) {
      toast.error("Bạn không có quyền xóa phòng.")
      return
    }
    setRoomToDelete(room)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteRoom = async () => {
    if (!roomToDelete || !isAdmin) return
    // Có thể thêm isSubmitting cho nút xóa nếu cần
    try {
      await roomService.deleteRoom(roomToDelete.id)
      toast.success(`Xóa phòng "${roomToDelete.roomNumber}" thành công!`)
      fetchData()
    } catch (error) {
      let errorMsg = "Không thể xóa phòng."
      // Check for specific 409 Conflict error (assuming backend returns 409)
      if (error.response?.status === 409) {
        errorMsg = `Không thể xóa phòng "${roomToDelete.roomNumber}" vì phòng này đang được sử dụng trong một đặt phòng.`
      } else {
        errorMsg = error.response?.data?.message || error.message || errorMsg
      }
      toast.error(errorMsg)
      console.error("Delete room error:", error)
    } finally {
      setShowDeleteConfirm(false)
      setRoomToDelete(null)
    }
  }

  // Hàm xử lý khi form được submit và validated thành công
  const handleSaveRoom = async (roomData, roomId) => {
    setIsSubmitting(true); // Bắt đầu submit
    const apiCall = roomId
      ? roomService.updateRoom(roomId, roomData)
      : roomService.createRoom(roomData);
    const successMsg = roomId ? "Cập nhật phòng thành công!" : "Thêm phòng mới thành công!";
    const errorMsgBase = roomId ? "Cập nhật phòng thất bại" : "Thêm phòng mới thất bại";

    try {
      await apiCall;
      toast.success(successMsg);
      setShowForm(false); // Đóng form
      setCurrentRoom(null);
      fetchData(); // Tải lại dữ liệu
    } catch (error) {
      const backendError = error.response?.data?.message || error.message || "Lỗi không xác định";
      toast.error(`${errorMsgBase}: ${backendError}`);
      console.error("Save room error:", error);
      // Không đóng form khi có lỗi để user sửa lại
    } finally {
      setIsSubmitting(false); // Kết thúc submit
    }
  };

  // Format Status Badge/Text
  const formatStatus = (status) => {
    const statusText = status || 'N/A'
    const statusClass = `status-${statusText.toLowerCase().replace(' ', '-')}`
    // Bạn có thể tùy chỉnh text hiển thị ở đây nếu muốn
    let displayText = statusText
    if (status === 'available') displayText = 'Available' 
    else if (status === 'occupied') displayText = 'Occupied'
    else if (status === 'cleaning') displayText = 'Cleaning'
    else if (status === 'maintenance') displayText = 'Maintenance'
    
    return <span className={`status-badge ${statusClass}`}>{displayText}</span>
  }

  // Table columns updated to match API spec response
  const columns = useMemo(
    () => [
      { Header: "Số phòng", accessor: "roomNumber" },
      { Header: "Loại phòng", accessor: "roomTypeName" }, // Check API response
      { Header: "Tầng", accessor: "floor" },
      {
        Header: "Giá Cơ Bản", // Check API response
        accessor: "basePrice",
        Cell: ({ value }) => formatCurrency(value),
      },
      {
        Header: "Sức chứa", // Check API response
        accessor: "capacity",
        Cell: ({ value }) => `${value} người`,
      },
      {
        Header: "Trạng thái",
        accessor: "status",
        Cell: ({ value }) => formatStatus(value),
      },
      {
        Header: "Thao tác",
        id: 'actions',
        Cell: ({ row }) => (
          <div className="action-buttons">
            {canEdit && (
              <button className="edit-button" onClick={() => handleEditRoom(row.original)} title="Chỉnh sửa">
                <FaEdit />
              </button>
            )}
            {isAdmin && (
              <button className="delete-button" onClick={() => handleDeleteRoom(row.original)} title="Xóa">
                <FaTrash />
              </button>
            )}
          </div>
        ),
      },
    ],
    [isAdmin, canEdit], // Dependencies remain
  )

  // React Table hooks (remain mostly the same)
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
      data: rooms, // Use the fetched rooms data
      initialState: { pageIndex: 0, pageSize: 10 },
      // Disable multi-sort, filters if not needed
      disableSortBy: false,
      disableFilters: true, // Global filter is separate
      disableGlobalFilter: false,
    },
    useGlobalFilter,
    useSortBy, // Keep sorting if desired
    usePagination,
  )

  const { globalFilter, pageIndex, pageSize } = state

  // Skeleton Loader
  const renderSkeleton = (rowCount = 10) => {
    // Giả sử có 7 cột như định nghĩa
    return Array.from({ length: rowCount }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="skeleton-row">
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item"></div></td> 
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item"></div></td> 
        <td className="skeleton-cell"><div className="skeleton-item actions"></div></td>
      </tr>
    ))
  }

  return (
    <div className="room-list-container">
      {/* Header and Search/Add Button */} 
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="list-header-controls"
      >
        <div className="search-box">
          <FaSearch />
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={`Tìm kiếm trong ${rooms.length} phòng...`}
          />
        </div>
        {canEdit && (
          <button 
             className="add-new-button" 
             onClick={handleAddRoom} 
             disabled={loading || isSubmitting} // Disable khi đang tải hoặc submit
           >
            <FaPlus /> Thêm phòng mới
          </button>
        )}
      </motion.div>

      {/* Room Form Modal */} 
      {showForm && (
        // Sử dụng class dùng chung cho overlay
        <div className="form-modal-overlay"> 
          <RoomForm
            room={currentRoom}
            isEditMode={isEditMode}
            // Truyền handleSaveRoom vào prop onSave
            onSave={handleSaveRoom} 
            onClose={() => setShowForm(false)}
            roomTypes={roomTypes}
            // Truyền isSubmitting xuống cho form
            isSubmitting={isSubmitting} 
          />
        </div>
      )}

      {/* Delete Confirmation Modal */} 
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteRoom}
        title="Xác nhận Xóa Phòng"
        message={`Bạn có chắc chắn muốn xóa phòng "${roomToDelete?.roomNumber}"? Hành động này không thể hoàn tác.`}
        confirmText="Đồng ý Xóa"
      />

      {/* Table Section */} 
      {loadingError && !loading ? ( // Chỉ hiển thị lỗi khi không loading
         <div className="loading-error-message">{loadingError}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="table-container"
        >
          <table {...getTableProps()} className="data-table">
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            <tbody {...getTableBodyProps()}>
              {/* Hiển thị skeleton khi loading, bất kể form có mở hay không */} 
              {loading ? renderSkeleton(pageSize) : page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination - Chỉ hiển thị khi không loading */} 
          {!loading && rooms.length > 0 && (
             <div className="pagination-controls">
               <div className="page-info"> {/* Thêm thông tin số lượng */} 
                 Hiển thị {page.length} / {rooms.length} phòng
               </div>
               <div className="page-buttons"> {/* Nhóm các nút điều khiển trang */} 
                  <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} title="Trang đầu">{"«"}</button>
                  <button onClick={() => previousPage()} disabled={!canPreviousPage} title="Trang trước">{"‹"}</button>
                  {/* Có thể thêm input nhảy trang ở đây nếu muốn */}
                  <button onClick={() => nextPage()} disabled={!canNextPage} title="Trang sau">{"›"}</button>
                  <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} title="Trang cuối">{"»"}</button>
               </div>
                <select 
                    value={pageSize} 
                    onChange={e => setPageSize(Number(e.target.value))}
                    title="Số hàng mỗi trang"
                 >
                    {[5, 10, 20, 30, 50].map(size => (
                        <option key={size} value={size}> {size} / trang </option>
                    ))}
                </select>
                <span className="page-info"> {/* Hiển thị trang hiện tại */} 
                   Trang {pageIndex + 1}/{pageOptions.length}
                 </span>
             </div>
          )}
          {/* Message khi không có dữ liệu và không loading */} 
          {!loading && rooms.length === 0 && !loadingError && (
             <div className="no-data-message">Không tìm thấy phòng nào.</div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RoomList;


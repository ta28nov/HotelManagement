"use client"

/**
 * Bookings.jsx
 *
 * Vai trò: Trang quản lý đặt phòng cho admin và nhân viên.
 * Chức năng:
 * - Hiển thị danh sách đặt phòng
 * - Thêm, sửa, xóa đặt phòng
 * - Cập nhật trạng thái đặt phòng
 * - Xem chi tiết đặt phòng
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect, useMemo } from "react"
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table"
import { motion } from "framer-motion"
import { FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaPlus } from "react-icons/fa"
import { format, formatISO, parseISO } from "date-fns"
import { toast } from "react-toastify"
import bookingService from "../../../services/bookingService"
import roomService from "../../../services/roomService"
import customerService from "../../../services/customerService"
import { BOOKING_STATUS, PAYMENT_STATUS, formatCurrency } from "../../../config/constants"
import "./Bookings.css"
// Import Modals
import BookingDetailModal from "../../../components/admin/bookings/BookingDetailModal" // Đường dẫn tới modal chi tiết

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    fromDate: "",
    toDate: "",
    customerId: "",
    roomId: "",
  })

  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState(null)
  const [bookingFormData, setBookingFormData] = useState({
    customerId: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
  })

  // State cho Modal Chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingBookingId, setViewingBookingId] = useState(null)

  // State cho danh sách phòng và khách hàng
  const [roomsList, setRoomsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [initialDataLoading, setInitialDataLoading] = useState(true); // Loading riêng cho dữ liệu ban đầu (room, customer)

  // State cho Form thêm khách hàng nhanh
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '', // Email là tùy chọn
  });
  const [addCustomerLoading, setAddCustomerLoading] = useState(false); // Loading riêng cho việc tạo KH

  // Fetch bookings, rooms, and customers data
  const fetchInitialData = async () => {
    setInitialDataLoading(true);
    try {
      // Gọi song song bookings, rooms, customers
      const [bookingsRes, roomsRes, customersRes] = await Promise.all([
        bookingService.getAllBookings(),
        roomService.getAllRooms(),
        customerService.getAllCustomers(),
      ]);

      setBookings(bookingsRes.data || bookingsRes || []);
      setRoomsList(roomsRes.data || roomsRes || []);
      setCustomersList(customersRes.data || customersRes || []);

    } catch (error) {
      console.error("Lỗi tải dữ liệu ban đầu:", error);
      toast.error("Không thể tải dữ liệu cần thiết (phòng, khách hàng). Vui lòng thử lại.");
      // Có thể setBookings([]) để tránh lỗi render nếu cần
    } finally {
      setLoading(false); // Loading chính (cho bảng)
      setInitialDataLoading(false); // Loading dữ liệu phụ trợ
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []); // Chỉ chạy một lần khi mount

  // Hàm fetchBookings riêng để refresh chỉ bảng bookings sau khi lọc/thêm/sửa/xóa
   const fetchOnlyBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAllBookings();
      setBookings(response.data || response || []);
    } catch (error) {
      toast.error("Không thể tải danh sách đặt phòng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy lại danh sách khách hàng (ví dụ: sau khi thêm mới thành công)
  const fetchCustomersList = async () => {
    try {
      const customersRes = await customerService.getAllCustomers();
      setCustomersList(customersRes.data || customersRes || []);
    } catch (error) {
       console.error("Lỗi tải lại danh sách khách hàng:", error);
       // Không cần toast ở đây vì người dùng có thể không nhận thấy
    }
  };

  // Handle booking filtering
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await bookingService.filterBookings(filters)
      setBookings(response.data || response) // Cập nhật với dữ liệu đã lọc
      toast.success("Lọc đặt phòng thành công")
    } catch (error) {
      toast.error("Không thể lọc đặt phòng")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      status: "", fromDate: "", toDate: "", customerId: "", roomId: "",
    })
    fetchOnlyBookings() // Fetch lại chỉ bookings khi reset filter
  }

  // --- Modal and Form Handling ---

  const handleOpenAddModal = () => {
    setIsEditMode(false)
    setCurrentBookingId(null)
    // Reset form data với giá trị mặc định
    setBookingFormData({
      customerId: "",
      roomId: "",
      checkInDate: format(new Date(), 'yyyy-MM-dd'), // Gợi ý ngày hiện tại
      checkOutDate: "",
      adults: 1,
      children: 0,
    })
    setIsModalOpen(true)
  }

  // Hàm mở Modal ở chế độ Edit
  const handleOpenEditModal = (booking) => {
    setIsEditMode(true)
    setCurrentBookingId(booking.id)
    setBookingFormData({
      customerId: booking.customerId,
      roomId: booking.roomId,
      // Định dạng lại ngày từ ISO string (hoặc datetime) sang YYYY-MM-DD cho input type="date"
      checkInDate: format(parseISO(booking.checkInDate), 'yyyy-MM-dd'), 
      checkOutDate: format(parseISO(booking.checkOutDate), 'yyyy-MM-dd'),
      adults: booking.adults,
      children: booking.children,
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleFormChange = (e) => {
    const { name, value, type } = e.target
    setBookingFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value, // Cho phép xóa số trong input
    }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!bookingFormData.customerId || !bookingFormData.roomId || !bookingFormData.checkInDate || !bookingFormData.checkOutDate || bookingFormData.adults <= 0 || bookingFormData.children < 0) {
      toast.error("Vui lòng điền đầy đủ thông tin hợp lệ.")
      return
    }

    if (new Date(bookingFormData.checkOutDate) <= new Date(bookingFormData.checkInDate)) {
        toast.error("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
    }
    
    // Chuyển đổi customerId và roomId về kiểu số trước khi gửi đi
    const customerIdNum = parseInt(bookingFormData.customerId, 10);
    const roomIdNum = parseInt(bookingFormData.roomId, 10);

    if (isNaN(customerIdNum) || isNaN(roomIdNum)) {
       toast.error("ID Khách hàng và ID Phòng phải là số.");
       return;
    }

    const apiData = {
      // Không gửi id trong body khi tạo hoặc cập nhật
      customerId: customerIdNum,
      roomId: roomIdNum,
      checkInDate: formatISO(new Date(bookingFormData.checkInDate + 'T14:00:00')), 
      checkOutDate: formatISO(new Date(bookingFormData.checkOutDate + 'T12:00:00')),
      adults: Number(bookingFormData.adults),
      children: Number(bookingFormData.children),
      // Các trường không có trong form này như status, paymentStatus sẽ không được gửi
      // khi update nếu chỉ dựa vào bookingFormData. Backend sẽ giữ nguyên giá trị cũ.
      // Hoặc API PUT có thể yêu cầu đủ các trường? --> Hiện tại gửi các trường có trong form.
    };

    setLoading(true)

    try {
      if (isEditMode) {
        // Gọi API Update
        await bookingService.updateBooking(currentBookingId, apiData)
        toast.success(`Cập nhật đặt phòng #${currentBookingId} thành công!`)
      } else {
        // Gọi API Create
        await bookingService.createBooking(apiData)
        toast.success("Tạo đặt phòng thành công!")
      }
      handleCloseModal()
      fetchOnlyBookings() // Làm mới danh sách sau khi Thêm hoặc Sửa
    } catch (error) {
      // Cố gắng hiển thị lỗi từ backend nếu có
      const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || "Đã xảy ra lỗi khi lưu đặt phòng.";
      toast.error(errorMsg);
      console.error("Lỗi lưu đặt phòng:", error.response || error)
    } finally {
      setLoading(false)
    }
  }

  // --- End Modal and Form Handling ---

  // --- Detail Modal Handling ---
  const handleViewBooking = (id) => {
    setViewingBookingId(id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setViewingBookingId(null)
  }

  const handleDataChangeFromDetail = () => {
      fetchOnlyBookings(); // Fetch lại chỉ bookings khi có thay đổi từ detail
  }

  // --- End Detail Modal Handling ---

  // Handle booking operations
  const handleDeleteBooking = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đặt phòng này?")) {
      try {
        await bookingService.deleteBooking(id)
        toast.success("Xóa đặt phòng thành công")
        fetchOnlyBookings() // Fetch lại chỉ bookings sau khi xóa
      } catch (error) {
        toast.error("Không thể xóa đặt phòng")
        console.error(error)
      }
    }
  }

  // --- Add New Customer Mini-Form Handlers ---
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancelAddCustomer = () => {
    setShowAddCustomerForm(false);
    setNewCustomerData({ firstName: '', lastName: '', phoneNumber: '', email: '' }); // Reset form
  };

  const handleCreateNewCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newCustomerData.firstName || !newCustomerData.lastName || !newCustomerData.phoneNumber) {
      toast.warn("Vui lòng nhập Tên, Họ và Số điện thoại khách hàng.");
      return;
    }

    setAddCustomerLoading(true);
    try {
      // API POST /api/customers trả về CustomerDto của khách hàng mới
      const response = await customerService.createCustomer(newCustomerData);
      const newCustomer = response.data; // Giả sử response trả về { data: CustomerDto }
      
      if (newCustomer && newCustomer.id) {
        toast.success(`Đã thêm khách hàng mới: ${newCustomer.fullName}`);
        await fetchCustomersList(); // Cập nhật lại dropdown khách hàng
        // Tự động chọn khách hàng vừa tạo trong form đặt phòng chính
        setBookingFormData(prev => ({ ...prev, customerId: newCustomer.id.toString() })); 
        handleCancelAddCustomer(); // Đóng form thêm KH
      } else {
         throw new Error("Phản hồi từ API tạo khách hàng không hợp lệ.");
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Lỗi khi thêm khách hàng mới.";
      toast.error(errorMsg);
      console.error("Lỗi tạo khách hàng mới:", error.response || error);
    } finally {
      setAddCustomerLoading(false);
    }
  };

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
        Cell: ({ value }) => format(new Date(value), "dd/MM/yyyy"),
      },
      {
        Header: "Ngày trả phòng",
        accessor: "checkOutDate",
        Cell: ({ value }) => format(new Date(value), "dd/MM/yyyy"),
      },
      {
        Header: "Trạng thái",
        accessor: "status",
        Cell: ({ value }) => {
          const status = BOOKING_STATUS.find((status) => status.value === value)
          return <span className={`status-badge status-${value}`}>{status?.label || value}</span>
        },
      },
      {
        Header: "Tổng tiền",
        accessor: "totalAmount",
        Cell: ({ value }) => formatCurrency(value),
      },
      {
        Header: "Thao tác",
        Cell: ({ row }) => (
          <div className="action-buttons">
            <button className="view-button" onClick={() => handleViewBooking(row.original.id)} title="Xem chi tiết">
              <FaEye />
            </button>
            <button className="edit-button" onClick={() => handleOpenEditModal(row.original)} title="Chỉnh sửa">
              <FaEdit />
            </button>
            <button className="delete-button" onClick={() => handleDeleteBooking(row.original.id)} title="Xóa">
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [],
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
    <div className="bookings-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="page-header"
      >
        <h1>Quản lý đặt phòng</h1>
        <button className="add-button" onClick={handleOpenAddModal}>
          <FaPlus /> Thêm đặt phòng mới
        </button>
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
            placeholder="Tìm kiếm đặt phòng..."
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Tất cả</option>
              {BOOKING_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Từ ngày:</label>
            <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label>Đến ngày:</label>
            <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label>Khách hàng:</label>
            <select name="customerId" value={filters.customerId} onChange={handleFilterChange} disabled={initialDataLoading}>
              <option value="">Tất cả khách hàng</option>
              {customersList.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName} (ID: {customer.id})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Phòng:</label>
            <select name="roomId" value={filters.roomId} onChange={handleFilterChange} disabled={initialDataLoading}>
              <option value="">Tất cả phòng</option>
              {roomsList.map((room) => (
                <option key={room.id} value={room.id}>
                  Phòng {room.roomNumber} (Loại: {room.roomType?.name || 'N/A'}, ID: {room.id})
                </option>
              ))}
            </select>
          </div>

          <button className="filter-button" onClick={applyFilters} disabled={loading || initialDataLoading}>
            <FaFilter /> Lọc
          </button>
          <button className="reset-button" onClick={resetFilters} disabled={loading || initialDataLoading}>
            Xóa bộ lọc
          </button>
        </div>
      </motion.div>

      {loading || initialDataLoading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="table-container"
        >
          <table {...getTableProps()} className="bookings-table">
            <thead>
              {headerGroups.map((headerGroup) => {
                // Lấy props cho header row, tách key ra
                const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                return (
                  // Gán key trực tiếp
                  <tr key={key} {...restHeaderGroupProps}>
                    {headerGroup.headers.map((column) => {
                      // Lấy props cho header cell, tách key ra
                      const { key: columnKey, ...restColumnHeaderProps } = column.getHeaderProps(column.getSortByToggleProps());
                      return (
                        // Gán key trực tiếp
                        <th
                          key={columnKey}
                          {...restColumnHeaderProps}
                          className={column.isSorted ? (column.isSortedDesc ? "sort-desc" : "sort-asc") : ""}
                        >
                          {column.render("Header")}
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row)
                // Lấy props cho data row, tách key ra
                const { key, ...restRowProps } = row.getRowProps();
                return (
                  // Gán key trực tiếp
                  <tr key={key} {...restRowProps}>
                    {row.cells.map((cell) => {
                       // Lấy props cho data cell, tách key ra
                      const { key: cellKey, ...restCellProps } = cell.getCellProps();
                      return (
                        // Gán key trực tiếp
                        <td key={cellKey} {...restCellProps}>
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

      {/* --- Modals --- */}
      {/* Modal Thêm/Sửa */} 
      {isModalOpen && (
        <motion.div 
          className="modal-backdrop" // Lớp phủ nền
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal} // Đóng khi click nền
        >
          <motion.div 
            className="modal-content" // Nội dung modal
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click nội dung
          >
            <h2>{isEditMode ? "Chỉnh sửa đặt phòng" : "Thêm đặt phòng mới"}</h2>
            <form onSubmit={handleFormSubmit} className="booking-form">
              {/* Customer ID - Select and Add Button */} 
              <div className="form-group customer-select-group">
                <label htmlFor="customerId">Khách hàng *</label>
                <div className="select-with-button">
                  <select
                    id="customerId"
                    name="customerId"
                    value={bookingFormData.customerId}
                    onChange={handleFormChange}
                    required
                    disabled={initialDataLoading || addCustomerLoading}
                  >
                    <option value="" disabled>-- Chọn khách hàng --</option>
                    {customersList.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fullName} (ID: {customer.id})
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="add-inline-button" 
                    onClick={() => setShowAddCustomerForm(true)}
                    disabled={initialDataLoading || addCustomerLoading}
                    title="Thêm khách hàng mới"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Mini-Form Thêm Khách hàng (hiển thị có điều kiện) */} 
              {showAddCustomerForm && (
                <motion.div 
                  className="add-customer-inline-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h5>Thêm khách hàng mới</h5>
                  <div className="form-group">
                    <label htmlFor="newFirstName">Tên *</label>
                    <input type="text" id="newFirstName" name="firstName" value={newCustomerData.firstName} onChange={handleNewCustomerChange} required disabled={addCustomerLoading} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newLastName">Họ *</label>
                    <input type="text" id="newLastName" name="lastName" value={newCustomerData.lastName} onChange={handleNewCustomerChange} required disabled={addCustomerLoading} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPhoneNumber">Số điện thoại *</label>
                    <input type="tel" id="newPhoneNumber" name="phoneNumber" value={newCustomerData.phoneNumber} onChange={handleNewCustomerChange} required disabled={addCustomerLoading} />
                  </div>
                   <div className="form-group">
                    <label htmlFor="newEmail">Email</label>
                    <input type="email" id="newEmail" name="email" value={newCustomerData.email} onChange={handleNewCustomerChange} disabled={addCustomerLoading} />
                  </div>
                  <div className="form-actions inline-actions">
                    <button type="button" className="save-button small-button" onClick={handleCreateNewCustomerSubmit} disabled={addCustomerLoading}>
                      {addCustomerLoading ? "Đang lưu..." : "Lưu KH"}
                    </button>
                    <button type="button" className="cancel-button small-button" onClick={handleCancelAddCustomer} disabled={addCustomerLoading}>
                      Hủy
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Room ID - Select */}
              <div className="form-group">
                <label htmlFor="roomId">Phòng *</label>
                <select
                  id="roomId"
                  name="roomId"
                  value={bookingFormData.roomId}
                  onChange={handleFormChange}
                  required
                  disabled={initialDataLoading}
                >
                  <option value="" disabled>-- Chọn phòng --</option>
                   {roomsList.map((room) => (
                    <option key={room.id} value={room.id}>
                      Phòng {room.roomNumber} (Loại: {room.roomType?.name || 'N/A'}, ID: {room.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Check-in Date Input */}
              <div className="form-group">
                <label htmlFor="checkInDate">Ngày nhận phòng *</label>
                <input
                  type="date"
                  id="checkInDate"
                  name="checkInDate"
                  value={bookingFormData.checkInDate}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Check-out Date Input */}
              <div className="form-group">
                <label htmlFor="checkOutDate">Ngày trả phòng *</label>
                <input
                  type="date"
                  id="checkOutDate"
                  name="checkOutDate"
                  value={bookingFormData.checkOutDate}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Adults Input */}
              <div className="form-group">
                <label htmlFor="adults">Số người lớn *</label>
                <input
                  type="number"
                  id="adults"
                  name="adults"
                  value={bookingFormData.adults}
                  onChange={handleFormChange}
                  required
                  min="1"
                />
              </div>

              {/* Children Input */}
              <div className="form-group">
                <label htmlFor="children">Số trẻ em</label>
                <input
                  type="number"
                  id="children"
                  name="children"
                  value={bookingFormData.children}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button" disabled={loading}> 
                  {loading ? "Đang lưu..." : "Lưu đặt phòng"}
                </button>
                <button type="button" className="cancel-button" onClick={handleCloseModal} disabled={loading}>
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Chi tiết */} 
      <BookingDetailModal
        bookingId={viewingBookingId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onDataChange={handleDataChangeFromDetail} // Truyền hàm để refresh list
      />
      {/* --- End Modals --- */}
    </div>
  )
}

export default Bookings


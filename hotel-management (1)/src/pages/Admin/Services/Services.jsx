"use client"

/**
 * Services.jsx
 *
 * Vai trò: Trang quản lý dịch vụ cho admin và nhân viên.
 * Chức năng:
 * - Hiển thị danh sách dịch vụ
 * - Thêm, sửa, xóa dịch vụ
 * - Lọc dịch vụ theo danh mục
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect, useMemo } from "react"
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table"
import { motion } from "framer-motion"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaFolderPlus } from "react-icons/fa"
import { toast } from "react-toastify"
import serviceService from "../../../services/serviceService"
import { SERVICE_CATEGORIES, formatCurrency, ROLES } from "../../../config/constants"
import { useAuth } from "../../../context/AuthContext"
import ServiceForm from "../../../components/admin/services/ServiceForm"
import CategoryForm from "../../../components/admin/services/CategoryForm"
import ConfirmationModal from "../../../components/common/ConfirmationModal"
import "./Services.css"

const Services = () => {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(null)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [currentService, setCurrentService] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState("")

  const { currentUser } = useAuth()

  // Permissions
  const isAdmin = currentUser?.role === ROLES.ADMIN
  const canEdit = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.EMPLOYEE

  // Fetch Services and Categories Data
  const fetchData = async () => {
    setLoading(true)
    setLoadingError(null)
    try {
      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceService.getAllServices(),
        serviceService.getAllCategories()
      ])
      setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : [])
      setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [])
    } catch (error) {
      toast.error("Không thể tải dữ liệu dịch vụ hoặc danh mục.")
      console.error("Fetch data error:", error)
      setLoadingError("Lỗi tải dữ liệu. Vui lòng thử lại.")
      setServices([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handlers for Service CRUD
  const handleAddService = () => {
    setCurrentService(null)
    setIsEditMode(false)
    setShowServiceForm(true)
  }

  const handleEditService = (service) => {
    setCurrentService(service)
    setIsEditMode(true)
    setShowServiceForm(true)
  }

  const handleSaveService = async (serviceData, serviceId) => {
    if (!canEdit) return
    setIsSubmitting(true)
    const apiCall = serviceId
      ? serviceService.updateService(serviceId, serviceData)
      : serviceService.createService(serviceData)
    const successMsg = serviceId ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ mới thành công!"
    const errorMsgBase = serviceId ? "Cập nhật dịch vụ thất bại" : "Thêm dịch vụ mới thất bại"

    try {
      await apiCall
      toast.success(successMsg)
      setShowServiceForm(false)
      setCurrentService(null)
      fetchData()
    } catch (error) {
      const backendError = error.response?.data?.message || error.message || "Lỗi không xác định"
      toast.error(`${errorMsgBase}: ${backendError}`)
      console.error("Save service error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = (service) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền xóa dịch vụ.")
      return
    }
    setServiceToDelete(service)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteService = async () => {
    if (!serviceToDelete || !isAdmin) return
    try {
      await serviceService.deleteService(serviceToDelete.id)
      toast.success(`Xóa dịch vụ "${serviceToDelete.name}" thành công!`)
      fetchData()
    } catch (error) {
      const backendError = error.response?.data?.message || "Không thể xóa dịch vụ"
      toast.error(backendError)
      console.error("Delete service error:", error)
    } finally {
      setShowDeleteConfirm(false)
      setServiceToDelete(null)
    }
  }

  // Handlers for Category Form
  const handleAddCategory = () => {
    if (!canEdit) return
    setShowCategoryForm(true)
  }

  const handleCategoryFormSuccess = () => {
    setShowCategoryForm(false)
    fetchData()
  }

  // Helper to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : "Không xác định"
  }

  // Filtered Services based on categoryFilter and globalFilter
  const filteredServices = useMemo(() => {
    let result = services
    if (categoryFilter) {
      result = result.filter(service => service.categoryId === parseInt(categoryFilter, 10))
    }
    // Note: Global filter is handled by useTable's setGlobalFilter
    return result
  }, [services, categoryFilter])

  // Table columns configuration
  const columns = useMemo(
    () => [
      { Header: "Tên dịch vụ", accessor: "name", minWidth: 150 },
      {
        Header: "Danh mục",
        accessor: "categoryId",
        Cell: ({ value }) => getCategoryName(value),
        minWidth: 120,
      },
      {
        Header: "Mô tả",
        accessor: "description",
        Cell: ({ value }) => <div className="description-cell" title={value}>{value}</div>,
        minWidth: 200,
        maxWidth: 300,
      },
      {
        Header: "Giá",
        accessor: "price",
        Cell: ({ value }) => formatCurrency(value),
        minWidth: 100,
        maxWidth: 120,
      },
      {
        Header: "Trạng thái",
        accessor: "isAvailable",
        Cell: ({ value }) => (
          <span className={`status-badge ${value ? "status-active" : "status-inactive"}`}>
            {value ? "Hoạt động" : "Ngừng"}
          </span>
        ),
         minWidth: 100,
         maxWidth: 120,
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
              <button className="edit-button" onClick={() => handleEditService(row.original)} title="Chỉnh sửa">
                <FaEdit />
              </button>
            )}
            {isAdmin && (
              <button className="delete-button" onClick={() => handleDeleteService(row.original)} title="Xóa">
                <FaTrash />
              </button>
            )}
          </div>
        ),
      },
    ],
    [categories, isAdmin, canEdit]
  )

  // React Table hooks
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
    { columns, data: filteredServices, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  // Skeleton Loader function
  const renderSkeleton = (rowCount = 10) => {
    // 6 columns
    return Array.from({ length: rowCount }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="skeleton-row">
        <td className="skeleton-cell"><div className="skeleton-item"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item long"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item short"></div></td>
        <td className="skeleton-cell"><div className="skeleton-item actions"></div></td>
      </tr>
    ))
  }

  return (
    <div className="services-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="page-header"
      >
        <h1>Quản lý dịch vụ</h1>
        <div className="header-actions">
           {canEdit && (
             <button className="add-button" onClick={handleAddCategory}>
                <FaFolderPlus /> Thêm danh mục
            </button>
           )} 
          {canEdit && (
            <button className="add-button" onClick={handleAddService}>
              <FaPlus /> Thêm dịch vụ mới
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3 }}
         className="filter-section"
      >
        <div className="search-box">
          <FaSearch />
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm dịch vụ..."
          />
        </div>
        <div className="filters">
            <div className="filter-group">
                <label>Lọc theo danh mục:</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        </div>
      </motion.div>

      {loadingError && <div className="error-message">{loadingError}</div>}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="table-container"
      >
        <table {...getTableProps()} className="services-table">
          <thead>
            {headerGroups.map((headerGroup) => {
              // Lấy props cho header row
              const headerGroupProps = headerGroup.getHeaderGroupProps();
              return (
                // Gán key trực tiếp
                <tr key={headerGroupProps.key} {...headerGroupProps}>
                  {headerGroup.headers.map((column) => {
                    // Lấy props cho header cell
                    const columnHeaderProps = column.getHeaderProps(column.getSortByToggleProps());
                    // Thiết lập style từ minWidth/maxWidth nếu có
                    const style = {
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                        width: column.width,
                    };
                    return (
                       // Gán key trực tiếp
                      <th 
                        key={columnHeaderProps.key} 
                        {...columnHeaderProps} 
                        style={style} 
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
            {loading 
              ? renderSkeleton(pageSize) 
              : page.map((row) => {
                prepareRow(row)
                // Lấy props cho data row
                const rowProps = row.getRowProps();
                return (
                  // Gán key trực tiếp
                  <tr key={row.original.id} {...rowProps}>
                    {row.cells.map((cell) => {
                      // Lấy props cho data cell
                      const cellProps = cell.getCellProps();
                      // Thiết lập style từ minWidth/maxWidth của column nếu có
                      const style = {
                          minWidth: cell.column.minWidth,
                          maxWidth: cell.column.maxWidth,
                           width: cell.column.width,
                      };
                      return (
                        // Gán key trực tiếp
                        <td key={`${row.original.id}_${cell.column.id}`} {...cellProps} style={style}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {!loading && page.length === 0 && (
                  <tr>
                      <td colSpan={columns.length} className="no-data-message">
                          Không tìm thấy dịch vụ nào phù hợp.
                      </td>
                  </tr>
              )}
          </tbody>
        </table>
        {/* ... Pagination (nếu filteredServices.length > pageSize) ... */}
        {filteredServices.length > pageSize && (
           <div className="pagination">
            <div className="page-info">
              Hiển thị {page.length} / {filteredServices.length} dịch vụ (tổng {services.length})
            </div>
            <div className="page-buttons">
              <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} title="Trang đầu">{"«"}</button>
              <button onClick={() => previousPage()} disabled={!canPreviousPage} title="Trang trước">{"‹"}</button>
              <button onClick={() => nextPage()} disabled={!canNextPage} title="Trang sau">{"›"}</button>
              <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} title="Trang cuối">{"»"}</button>
            </div>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} title="Số hàng mỗi trang">
              {[10, 20, 30, 50, 100].map(size => (
                <option key={size} value={size}> {size} / trang </option>
              ))}
            </select>
            <span className="page-info">
              Trang {pageIndex + 1}/{pageOptions.length}
            </span>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showServiceForm && (
        <div className="form-modal-overlay"> {/* Lớp phủ */} 
          <div className="service-form-modal-content"> {/* Nội dung */} 
            <ServiceForm
              isOpen={showServiceForm} // isOpen có thể không cần nữa nếu render có điều kiện
              onClose={() => setShowServiceForm(false)}
              onSave={handleSaveService}
              serviceData={currentService}
              isEditMode={isEditMode}
              categories={categories}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
      {showCategoryForm && (
        <div className="form-modal-overlay"> {/* Lớp phủ */} 
          <div className="category-form-modal-content"> {/* Nội dung */} 
            <CategoryForm
              isOpen={showCategoryForm} // isOpen có thể không cần nữa
              onClose={() => setShowCategoryForm(false)}
              onSuccess={handleCategoryFormSuccess}
            />
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        // ConfirmationModal được giả định tự quản lý overlay của nó
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteService}
          title="Xác nhận xóa dịch vụ"
          message={`Bạn có chắc chắn muốn xóa dịch vụ \"${serviceToDelete?.name}\"?`}
        />
      )}
    </div>
  )
}

export default Services


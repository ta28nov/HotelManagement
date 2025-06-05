/**
 * Các hàm tiện ích
 *
 * File này chứa các hàm tiện ích được sử dụng trong toàn bộ ứng dụng
 */

/**
 * Định dạng ngày tháng
 *
 * @param {Date|string} date - Ngày cần định dạng
 * @param {string} format - Định dạng mong muốn (mặc định: dd/MM/yyyy)
 * @returns {string} - Chuỗi ngày đã định dạng
 */
export const formatDate = (date, format = "dd/MM/yyyy") => {
  if (!date) return ""

  const d = new Date(date)

  // Kiểm tra ngày hợp lệ
  if (isNaN(d.getTime())) return ""

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()

  // Thay thế các mẫu trong chuỗi định dạng
  return format
    .replace("dd", day)
    .replace("MM", month)
    .replace("yyyy", year.toString())
    .replace("yy", year.toString().slice(-2))
}

/**
 * Tạo ID duy nhất
 *
 * @returns {string} - ID duy nhất
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * Rút gọn văn bản nếu quá dài
 *
 * @param {string} text - Văn bản cần rút gọn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} - Văn bản đã rút gọn
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Chuyển đổi chuỗi thành slug
 *
 * @param {string} text - Chuỗi cần chuyển đổi
 * @returns {string} - Slug
 */
export const slugify = (text) => {
  if (!text) return ""

  // Chuyển đổi tiếng Việt có dấu thành không dấu
  const from = "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ"
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyy"

  let result = text.toLowerCase()

  // Thay thế ký tự có dấu
  for (let i = 0; i < from.length; i++) {
    result = result.replace(new RegExp(from.charAt(i), "g"), to.charAt(i))
  }

  return result
    .replace(/[^a-z0-9 -]/g, "") // Xóa ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-") // Xóa nhiều dấu gạch ngang liên tiếp
    .replace(/^-+/, "") // Xóa dấu gạch ngang ở đầu
    .replace(/-+$/, "") // Xóa dấu gạch ngang ở cuối
}

/**
 * Định dạng số điện thoại
 *
 * @param {string} phone - Số điện thoại cần định dạng
 * @returns {string} - Số điện thoại đã định dạng
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ""

  // Xóa tất cả ký tự không phải số
  const cleaned = phone.replace(/\D/g, "")

  // Định dạng số điện thoại Việt Nam
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  // Nếu không phải định dạng chuẩn, trả về số gốc
  return phone
}


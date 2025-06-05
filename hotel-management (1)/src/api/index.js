/**
 * Index các endpoint API
 *
 * File này xuất tất cả các endpoint API để dễ dàng import trong các component
 */

import apiClient from "./apiClient"
import authEndpoints from "./endpoints/authEndpoints"
import roomEndpoints from "./endpoints/roomEndpoints"
import bookingEndpoints from "./endpoints/bookingEndpoints"
import customerEndpoints from "./endpoints/customerEndpoints"
import serviceEndpoints from "./endpoints/serviceEndpoints"
import reportEndpoints from "./endpoints/reportEndpoints"

// Xuất tất cả các endpoint
export {
  apiClient,
  authEndpoints,
  roomEndpoints,
  bookingEndpoints,
  customerEndpoints,
  serviceEndpoints,
  reportEndpoints,
}


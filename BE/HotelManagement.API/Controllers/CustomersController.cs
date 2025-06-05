using HotelManagement.API.Models; // Namespace chứa DTOs
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper; // Added AutoMapper
using Microsoft.EntityFrameworkCore; // Added for DbUpdateConcurrencyException

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize(Policy = "EmployeeAndAdmin")] // Yêu cầu Admin hoặc Employee
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ILogger<CustomersController> _logger;
        private readonly IMapper _mapper; // Added AutoMapper

        public CustomersController(
            ICustomerRepository customerRepository,
            ILogger<CustomersController> logger,
            IMapper mapper) // Inject IMapper
        {
            _customerRepository = customerRepository;
            _logger = logger;
            _mapper = mapper;
        }

        // GET: api/customers?searchTerm=...
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CustomerDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers([FromQuery] string? searchTerm)
        {
            try
            {
                _logger.LogInformation("Attempting to get customers with search term: {SearchTerm}", searchTerm);
                var customers = await _customerRepository.SearchAsync(searchTerm ?? string.Empty);

                // Use AutoMapper
                var customerDtos = _mapper.Map<IEnumerable<CustomerDto>>(customers);

                _logger.LogInformation("Successfully retrieved {Count} customers.", customerDtos.Count()); // Use Count() for IEnumerable
                return Ok(customerDtos);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting customers.");
                return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi khi xử lý yêu cầu của bạn.");
            }
        }

        // GET: api/customers/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CustomerDto>> GetCustomerById(int id)
        {
            try
            {
                _logger.LogInformation("Attempting to get customer with ID: {CustomerId}", id);
                var customer = await _customerRepository.GetByIdAsync(id);

                if (customer == null)
                {
                    _logger.LogWarning("Customer with ID: {CustomerId} not found.", id);
                    return NotFound(new { message = $"Không tìm thấy khách hàng với ID: {id}" });
                }

                // Use AutoMapper
                var customerDto = _mapper.Map<CustomerDto>(customer);

                _logger.LogInformation("Successfully retrieved customer with ID: {CustomerId}", id);
                return Ok(customerDto);
            }
            catch (System.Exception ex)
            {
                 _logger.LogError(ex, "Error occurred while getting customer with ID: {CustomerId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi khi xử lý yêu cầu của bạn.");
            }
        }


        // POST: api/customers
        [HttpPost]
        [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerRequest request)
        {
            // ModelState validation is automatically handled by [ApiController]
            try
            {
                 _logger.LogInformation("Attempting to create a new customer with Email: {Email}, Phone: {Phone}", request.Email, request.PhoneNumber);

                // --- Validation Example ---
                 if (!string.IsNullOrEmpty(request.Email) && await _customerRepository.DoesEmailExistAsync(request.Email))
                 {
                     _logger.LogWarning("Attempted to create customer with existing email: {Email}", request.Email);
                     ModelState.AddModelError("Email", $"Email '{request.Email}' đã tồn tại.");
                     return ValidationProblem(ModelState);
                     //return BadRequest(new { message = $"Email '{request.Email}' đã tồn tại." });
                 }
                 if (await _customerRepository.DoesPhoneNumberExistAsync(request.PhoneNumber))
                 {
                     _logger.LogWarning("Attempted to create customer with existing phone number: {Phone}", request.PhoneNumber);
                     ModelState.AddModelError("PhoneNumber", $"Số điện thoại '{request.PhoneNumber}' đã tồn tại.");
                     return ValidationProblem(ModelState);
                     //return BadRequest(new { message = $"Số điện thoại '{request.PhoneNumber}' đã tồn tại." });
                 }
                 // --- End Validation ---

                 // Use AutoMapper
                 var customerEntity = _mapper.Map<Customer>(request);

                var newCustomerId = await _customerRepository.CreateAsync(customerEntity);
                 _logger.LogInformation("Successfully created customer with ID: {CustomerId}", newCustomerId);

                // Get the full entity back to return the DTO
                var createdCustomer = await _customerRepository.GetByIdAsync(newCustomerId);
                 if(createdCustomer == null)
                 {
                      _logger.LogError("Failed to retrieve newly created customer with ID: {CustomerId}", newCustomerId);
                     return StatusCode(StatusCodes.Status500InternalServerError, "Tạo khách hàng thành công nhưng không thể lấy lại thông tin.");
                 }

                 // Use AutoMapper
                 var customerDto = _mapper.Map<CustomerDto>(createdCustomer);

                // Return 201 Created with location header and the created resource
                return CreatedAtAction(nameof(GetCustomerById), new { id = newCustomerId }, customerDto);

            }
            catch (System.Exception ex)
            {
                 _logger.LogError(ex, "Error occurred while creating a customer.");
                 return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi khi xử lý yêu cầu của bạn.");
            }
        }

         // PUT: api/customers/5
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerRequest request)
        {
             // ModelState validation is automatically handled by [ApiController]
             try
            {
                _logger.LogInformation("Attempting to update customer with ID: {CustomerId}", id);
                 var existingCustomer = await _customerRepository.GetByIdAsync(id);
                 if (existingCustomer == null)
                 {
                     _logger.LogWarning("Customer with ID: {CustomerId} not found for update.", id);
                     return NotFound(new { message = $"Không tìm thấy khách hàng với ID: {id}" });
                 }

                 // --- Validation Example ---
                 if (!string.IsNullOrEmpty(request.Email) && request.Email != existingCustomer.Email && await _customerRepository.DoesEmailExistAsync(request.Email, id))
                 {
                    _logger.LogWarning("Attempted to update customer {CustomerId} with existing email: {Email}", id, request.Email);
                    ModelState.AddModelError("Email", $"Email '{request.Email}' đã được sử dụng bởi khách hàng khác.");
                    return ValidationProblem(ModelState);
                    //return BadRequest(new { message = $"Email '{request.Email}' đã được sử dụng bởi khách hàng khác." });
                 }
                 if (!string.IsNullOrEmpty(request.PhoneNumber) && request.PhoneNumber != existingCustomer.PhoneNumber && await _customerRepository.DoesPhoneNumberExistAsync(request.PhoneNumber, id))
                 {
                    _logger.LogWarning("Attempted to update customer {CustomerId} with existing phone number: {Phone}", id, request.PhoneNumber);
                     ModelState.AddModelError("PhoneNumber", $"Số điện thoại '{request.PhoneNumber}' đã được sử dụng bởi khách hàng khác.");
                    return ValidationProblem(ModelState);
                    //return BadRequest(new { message = $"Số điện thoại '{request.PhoneNumber}' đã được sử dụng bởi khách hàng khác." });
                 }
                // --- End Validation ---

                 // Use AutoMapper to update the existing entity from the request
                 // The mapping profile is configured to ignore nulls in the request DTO
                 _mapper.Map(request, existingCustomer);

                 await _customerRepository.UpdateAsync(existingCustomer);
                 _logger.LogInformation("Successfully updated customer with ID: {CustomerId}", id);

                 return NoContent(); // Standard successful PUT response (204)
             }
            catch (DbUpdateConcurrencyException ex)
            {
                // Log concurrency error specifically
                _logger.LogError(ex, "Concurrency error occurred while updating customer ID: {CustomerId}.", id);
                 return StatusCode(StatusCodes.Status409Conflict, "Dữ liệu khách hàng có thể đã bị thay đổi bởi người khác. Vui lòng tải lại và thử lại.");
            }
            catch (System.Exception ex)
            {
                 // Log generic errors
                 _logger.LogError(ex, "Error occurred while updating customer with ID: {CustomerId}", id);
                 return StatusCode(StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi khi xử lý yêu cầu của bạn.");
            }
        }

         // DELETE: api/customers/5 (Implement if needed)
         // [HttpDelete("{id}")]
         // public async Task<IActionResult> DeleteCustomer(int id) { ... }

    }
} 
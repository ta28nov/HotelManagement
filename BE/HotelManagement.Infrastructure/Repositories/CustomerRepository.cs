using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Infrastructure.Repositories;

/// <summary>
/// Repository xử lý các thao tác với khách hàng
/// </summary>
public class CustomerRepository : ICustomerRepository
{
    private readonly HotelDbContext _context;
    private readonly ILogger<CustomerRepository> _logger;

    public CustomerRepository(HotelDbContext context, ILogger<CustomerRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Lấy tất cả khách hàng
    /// </summary>
    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        _logger.LogInformation("Fetching all customers from database.");
        return await _context.Customers
                             .Include(c => c.User)
                             .AsNoTracking()
                             .ToListAsync();
    }

    /// <summary>
    /// Lấy khách hàng theo ID
    /// </summary>
    public async Task<Customer?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Fetching customer by ID: {CustomerId}", id);
        return await _context.Customers
                             .Include(c => c.User)
                             .FirstOrDefaultAsync(c => c.Id == id);
    }

    /// <summary>
    /// Lấy khách hàng theo ID người dùng
    /// </summary>
    public async Task<Customer?> GetByUserIdAsync(int userId)
    {
        return await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Addresses)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    /// <summary>
    /// Lấy khách hàng theo email
    /// </summary>
    public async Task<Customer?> GetByEmailAsync(string email)
    {
        return await _context.Customers
            .Include(c => c.User)
            .Include(c => c.Addresses)
            .FirstOrDefaultAsync(c => c.Email == email);
    }

    /// <summary>
    /// Tạo khách hàng mới
    /// </summary>
    public async Task<int> CreateAsync(Customer customer)
    {
        _logger.LogInformation("Adding new customer to database: {FirstName} {LastName}", customer.FirstName, customer.LastName);
        try
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully added customer with ID: {CustomerId}", customer.Id);
            return customer.Id;
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error saving new customer to database.");
            throw;
        }
    }

    /// <summary>
    /// Cập nhật khách hàng
    /// </summary>
    public async Task UpdateAsync(Customer customer)
    {
        _logger.LogInformation("Updating customer in database with ID: {CustomerId}", customer.Id);
        _context.Entry(customer).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully updated customer with ID: {CustomerId}", customer.Id);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Concurrency error updating customer ID: {CustomerId}.", customer.Id);
            throw;
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error updating customer ID: {CustomerId} in database.", customer.Id);
            throw;
        }
    }

    /// <summary>
    /// Xóa khách hàng
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer != null)
        {
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Thêm địa chỉ cho khách hàng
    /// </summary>
    public async Task AddAddressAsync(CustomerAddress address)
    {
        _context.CustomerAddresses.Add(address);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa địa chỉ của khách hàng
    /// </summary>
    public async Task RemoveAddressAsync(int addressId)
    {
        var address = await _context.CustomerAddresses.FindAsync(addressId);
        if (address != null)
        {
            _context.CustomerAddresses.Remove(address);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Customer>> SearchAsync(string searchTerm)
    {
        _logger.LogInformation("Searching customers with term: {SearchTerm}", searchTerm);
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return await GetAllAsync();
        }

        var lowerCaseTerm = searchTerm.Trim().ToLower();

        return await _context.Customers
                             .Include(c => c.User)
                             .AsNoTracking()
                             .Where(c => c.FirstName.ToLower().Contains(lowerCaseTerm) ||
                                         c.LastName.ToLower().Contains(lowerCaseTerm) ||
                                         (c.Email != null && c.Email.ToLower().Contains(lowerCaseTerm)) ||
                                         c.PhoneNumber.Contains(searchTerm))
                             .ToListAsync();
    }

    public async Task<bool> DoesEmailExistAsync(string email, int? excludeCustomerId = null)
    {
        if (string.IsNullOrEmpty(email)) return false;
        _logger.LogDebug("Checking if email exists: {Email}, excluding CustomerId: {ExcludeId}", email, excludeCustomerId);
        return await _context.Customers.AnyAsync(c => c.Email == email && (!excludeCustomerId.HasValue || c.Id != excludeCustomerId.Value));
    }

    public async Task<bool> DoesPhoneNumberExistAsync(string phoneNumber, int? excludeCustomerId = null)
    {
        if (string.IsNullOrEmpty(phoneNumber)) return false;
        _logger.LogDebug("Checking if phone number exists: {Phone}, excluding CustomerId: {ExcludeId}", phoneNumber, excludeCustomerId);
        return await _context.Customers.AnyAsync(c => c.PhoneNumber == phoneNumber && (!excludeCustomerId.HasValue || c.Id != excludeCustomerId.Value));
    }
}

using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.SqlServer.Metadata.Internal; // Needed for SqlServerAnnotationNames
using HotelManagement.Application.Common.Models; // Added for DTOs

namespace HotelManagement.Infrastructure.Data;

/// <summary>
/// DbContext cho cơ sở dữ liệu quản lý khách sạn
/// </summary>
public class HotelDbContext : DbContext
{
    public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options)
    {
    }

    // Định nghĩa các DbSet cho các entity
    public DbSet<User> Users { get; set; }
    public DbSet<RoomType> RoomTypes { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<CustomerAddress> CustomerAddresses { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingHistory> BookingHistories { get; set; }
    public DbSet<ServiceCategory> ServiceCategories { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<RoomFeature> RoomFeatures { get; set; }
    public DbSet<BookingService> BookingServices { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceItem> InvoiceItems { get; set; }
    public DbSet<Review> Reviews { get; set; }

    // Add DbSets for Report DTOs (used for mapping SP results)
    public DbSet<MonthlyRevenueReportDto> MonthlyRevenueReports { get; set; }
    public DbSet<OccupancyReportDto> OccupancyReports { get; set; }

    /// <summary>
    /// Cấu hình mô hình dữ liệu và mối quan hệ giữa các entity
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cấu hình User
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Role).HasMaxLength(20).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        // Cấu hình RoomType
        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.ToTable("RoomTypes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            entity.Property(e => e.BasePrice).HasColumnType("decimal(10, 2)").IsRequired();
            entity.Property(e => e.Capacity).IsRequired();
        });

        // Cấu hình Room
        modelBuilder.Entity<Room>(entity =>
        {
            entity.ToTable("Rooms");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RoomNumber).HasMaxLength(10).IsRequired();
            entity.HasIndex(e => e.RoomNumber).IsUnique();
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Floor).IsRequired();
            
            // Mối quan hệ với RoomType
            entity.HasOne(e => e.RoomType)
                .WithMany(rt => rt.Rooms)
                .HasForeignKey(e => e.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Cấu hình Customer
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("Customers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20).IsRequired();
            entity.Property(e => e.IdNumber).HasMaxLength(50);
            entity.Property(e => e.Nationality).HasMaxLength(50);
            
            // Mối quan hệ với User
            entity.HasOne(e => e.User)
                .WithMany(u => u.Customers)
                .HasForeignKey(e => e.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Cấu hình CustomerAddress
        modelBuilder.Entity<CustomerAddress>(entity =>
        {
            entity.ToTable("CustomerAddresses");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AddressType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Address).HasMaxLength(255).IsRequired();
            entity.Property(e => e.City).HasMaxLength(100).IsRequired();
            entity.Property(e => e.State).HasMaxLength(100);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.Country).HasMaxLength(100).IsRequired();
            entity.Property(e => e.IsDefault).HasDefaultValue(false);
            
            // Mối quan hệ với Customer
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Addresses)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Cấu hình Booking
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("Bookings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CheckInDate).IsRequired();
            entity.Property(e => e.CheckOutDate).IsRequired();
            entity.Property(e => e.Adults).HasDefaultValue(1);
            entity.Property(e => e.Children).HasDefaultValue(0);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)").IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            entity.Property(e => e.PaymentStatus).HasMaxLength(20).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            // Mối quan hệ với Customer
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Bookings)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Mối quan hệ với Room
            entity.HasOne(e => e.Room)
                .WithMany(r => r.Bookings)
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Cấu hình BookingHistory
        modelBuilder.Entity<BookingHistory>(entity =>
        {
            entity.ToTable("BookingHistory");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            entity.Property(e => e.PaymentStatus).HasMaxLength(20);
            entity.Property(e => e.ChangedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.Notes).HasMaxLength(255);
            
            // Mối quan hệ với Booking
            entity.HasOne(e => e.Booking)
                .WithMany(b => b.BookingHistories)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Mối quan hệ với User
            entity.HasOne(e => e.User)
                .WithMany(u => u.BookingHistories)
                .HasForeignKey(e => e.ChangedBy)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Cấu hình ServiceCategory
        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.ToTable("ServiceCategories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(255);
        });

        // Cấu hình Service
        modelBuilder.Entity<Service>(entity =>
        {
            entity.ToTable("Services");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)").IsRequired();
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            
            // Mối quan hệ với ServiceCategory
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Services)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Cấu hình RoomFeature
        modelBuilder.Entity<RoomFeature>(entity =>
        {
            entity.ToTable("RoomFeatures");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FeatureType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Value).HasMaxLength(255);
            entity.Property(e => e.IsPrimary).HasDefaultValue(false);
            
            // Mối quan hệ với RoomType
            entity.HasOne(e => e.RoomType)
                .WithMany(rt => rt.RoomFeatures)
                .HasForeignKey(e => e.RoomTypeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Cấu hình BookingService
        modelBuilder.Entity<BookingService>(entity =>
        {
            entity.ToTable("BookingServices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasDefaultValue(1);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)").IsRequired();
            entity.Property(e => e.ServiceDate).HasDefaultValueSql("GETDATE()");

            // Mối quan hệ với Booking
            entity.HasOne(e => e.Booking)
                .WithMany(b => b.BookingServices)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Mối quan hệ với Service
            entity.HasOne(e => e.Service)
                .WithMany(s => s.BookingServices)
                .HasForeignKey(e => e.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Cấu hình Invoice
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("Invoices");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InvoiceNumber).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            entity.Property(e => e.IssuedDate).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)").IsRequired();
            entity.Property(e => e.Tax).HasColumnType("decimal(10, 2)").HasDefaultValue(0);
            entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
            
            // Mối quan hệ với Booking
            entity.HasOne(e => e.Booking)
                .WithOne(b => b.Invoice)
                .HasForeignKey<Invoice>(e => e.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Cấu hình InvoiceItem
        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.ToTable("InvoiceItems");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ItemType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Quantity).HasDefaultValue(1);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(10, 2)").IsRequired();
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(10, 2)").IsRequired();
            
            // Mối quan hệ với Invoice
            entity.HasOne(e => e.Invoice)
                .WithMany(i => i.InvoiceItems)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Cấu hình Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("Reviews");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Rating).IsRequired();
            entity.Property(e => e.Comment).HasMaxLength(500);
            entity.Property(e => e.ReviewDate).HasDefaultValueSql("GETDATE()");
            
            // Mối quan hệ với Booking
            entity.HasOne(e => e.Booking)
                .WithMany(b => b.Reviews)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Report DTOs as Keyless Entity Types
        modelBuilder.Entity<MonthlyRevenueReportDto>().HasNoKey();
        modelBuilder.Entity<OccupancyReportDto>().HasNoKey();

        // Apply configurations from assembly (if any)
        // modelBuilder.ApplyConfigurationsFromAssembly(typeof(HotelDbContext).Assembly);
    }
}

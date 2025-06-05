using AutoMapper;
using HotelManagement.API.Models;
using HotelManagement.Domain.Entities;

namespace HotelManagement.API.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        
        // Customer mappings (NEW)
        CreateMap<Customer, CustomerDto>()
            .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null));
        CreateMap<CreateCustomerRequest, Customer>(); // Map request to entity for creation
        CreateMap<UpdateCustomerRequest, Customer>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)); // Ignore nulls during update mapping
        
        // Room mappings
        CreateMap<Room, RoomDto>()
            .ForMember(dest => dest.RoomTypeName, opt => opt.MapFrom(src => src.RoomType!.Name))
            .ForMember(dest => dest.BasePrice, opt => opt.MapFrom(src => src.RoomType!.BasePrice))
            .ForMember(dest => dest.Capacity, opt => opt.MapFrom(src => src.RoomType!.Capacity))
            .ForMember(dest => dest.Features, opt => opt.MapFrom(src => src.RoomType!.RoomFeatures));
            
        CreateMap<RoomFeature, RoomFeatureDto>();
        
        // RoomType mappings
        CreateMap<RoomType, RoomTypeDto>()
            .ForMember(dest => dest.Features, opt => opt.MapFrom(src => src.RoomFeatures));
        
        // Booking mappings
        CreateMap<Booking, BookingDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => 
                $"{src.Customer!.FirstName} {src.Customer.LastName}"))
            .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Room!.RoomNumber))
            .ForMember(dest => dest.RoomTypeName, opt => opt.MapFrom(src => src.Room!.RoomType!.Name));
            
        CreateMap<BookingService, BookingServiceDto>()
            .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service!.Name));
            
        CreateMap<BookingHistory, BookingHistoryDto>()
            .ForMember(dest => dest.ChangedByName, opt => opt.MapFrom(src => 
                src.User != null ? src.User.Name : null));
                
        // Service mappings
        CreateMap<Service, ServiceDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category!.Name));
            
        CreateMap<ServiceCategory, ServiceCategoryDto>();
        
        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>();
        CreateMap<InvoiceItem, InvoiceItemDto>();
        
        // Review mappings
        CreateMap<Review, ReviewDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => 
                $"{src.Booking!.Customer!.FirstName} {src.Booking.Customer.LastName}"))
            .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Booking!.Room!.RoomNumber));
    }
}

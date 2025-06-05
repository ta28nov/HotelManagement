using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models
{
    public class ImageUploadRequest
    {
        public IFormFile File { get; set; }
        public bool IsPrimary { get; set; } = false;
    }

    public class ImageUploadResponse
    {
        public string Message { get; set; }
        public string ImagePath { get; set; }
        public int? FeatureId { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ImageViewModel
    {
        public int Id { get; set; }
        public string ImagePath { get; set; }
        public bool IsPrimary { get; set; }
    }
}

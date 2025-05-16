using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Styleza.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        // This field is auto-generated and not required for form submission
        public int ProductId { get; set; } = 0;
        
        [Required(ErrorMessage = "Product name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters")]
        public string Name { get; set; }
        
        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        public bool IsInStock { get; set; }
        public bool IsNew { get; set; }
        public bool IsOnSale { get; set; }
        public bool IsBestSeller { get; set; }

        public string Color { get; set; }

        [Range(0, 10000, ErrorMessage = "Stock quantity must be between 0 and 10000")]
        public int StockQuantity { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public int CategoryId { get; set; }

        public decimal? OldPrice { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(1, 10000, ErrorMessage = "Price must be greater than 0 and less than 10000")]
        public decimal Price { get; set; }
        
        // Not required as we're now uploading images
        [RegularExpression(@"^.*$", ErrorMessage = "Please enter a valid image URL")]
        public string ImageUrl { get; set; }
        public string Tags { get; set; }
        
        public decimal CurrentPrice => Price;
        
        // Navigation property for product images
        public List<ProductImage> Images { get; set; } = new List<ProductImage>();
        
        // Navigation property for category
        public Category Category { get; set; }
    }
}
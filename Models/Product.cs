using System.Collections.Generic;

namespace Styleza.Models
{
    public class Product
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public bool IsInStock { get; set; }

        public string Color { get; set; }

        public int StockQuantity { get; set; }

        public int CategoryId { get; set; }

        public decimal? OldPrice { get; set; }

        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public string Tags { get; set; }
        
        // Navigation property for product images
        public List<ProductImage> Images { get; set; } = new List<ProductImage>();
        
        // Navigation property for category
        public Category Category { get; set; }
    }
}
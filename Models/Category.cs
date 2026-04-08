using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Styleza.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int? ParentCategoryId { get; set; }
        
        // Navigation properties
        public List<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
        public List<Product> Products { get; set; } = new List<Product>();
    }
}
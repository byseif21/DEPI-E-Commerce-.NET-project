using System.Collections.Generic;

namespace Styleza.Models
{
    public class Category
    {
        public int Id { get; set; }

        public int? ParentCategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public List<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
    }
}
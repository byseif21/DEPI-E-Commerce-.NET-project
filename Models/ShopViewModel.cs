using System.Collections.Generic;

namespace Styleza.Models
{
    public class ShopViewModel
    {
        public List<Product> Products { get; set; } = new List<Product>();
        public FilterOptions Filters { get; set; } = new FilterOptions();
        public List<CategoryCount> Categories { get; set; } = new List<CategoryCount>();
        public List<TagCount> Tags { get; set; } = new List<TagCount>();
        public int TotalItems { get; set; }
        public int CurrentPage { get; set; } = 1;
        public int TotalPages { get; set; } = 1;
    }

    public class FilterOptions
    {
        public string Category { get; set; } = "all";
        public List<string> Colors { get; set; } = new List<string>();
        public List<string> Sizes { get; set; } = new List<string>();
        public List<string> Tags { get; set; } = new List<string>();
        public decimal? PriceMin { get; set; }
        public decimal? PriceMax { get; set; }
        public string Sort { get; set; } = "default";
    }

    public class CategoryCount
    {
        public Category Category { get; set; }
        public int Count { get; set; }
    }

    public class TagCount
    {
        public string Name { get; set; }
        public int Count { get; set; }
    }
}
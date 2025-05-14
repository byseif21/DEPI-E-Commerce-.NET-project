using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Styleza.Data;
using Styleza.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Styleza.Controllers
{
    public class ProductsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Shop(string category = null, string tags = null, decimal? minPrice = null, decimal? maxPrice = null, string color = null, string sizes = null, string sort = "default", int page = 1)
        {
            var viewModel = new ShopViewModel();
            var productsQuery = _context.Products.Include(p => p.Category).AsQueryable();
            
            // Set up filter options
            viewModel.Filters.Category = category ?? "all";
            viewModel.Filters.PriceMin = minPrice;
            viewModel.Filters.PriceMax = maxPrice;
            viewModel.Filters.Sort = sort;
            viewModel.CurrentPage = page;
            
            // Parse filter strings
            if (!string.IsNullOrEmpty(tags))
            {
                viewModel.Filters.Tags = tags.Split(',').ToList();
                productsQuery = productsQuery.Where(p => p.Tags != null && viewModel.Filters.Tags.Any(t => p.Tags.Contains(t)));
            }
            
            if (!string.IsNullOrEmpty(color))
            {
                viewModel.Filters.Colors = color.Split(',').ToList();
                productsQuery = productsQuery.Where(p => p.Color != null && viewModel.Filters.Colors.Contains(p.Color.ToLower()));
            }
            
            if (!string.IsNullOrEmpty(sizes))
            {
                viewModel.Filters.Sizes = sizes.Split(',').ToList();
                // Note: This would require a Size property on Product or a related table
                // This is a placeholder for the filter functionality
            }
            
            // Apply category filter
            if (!string.IsNullOrEmpty(category) && category.ToLower() != "all")
            {
                var categoryObj = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == category.ToLower());
                if (categoryObj != null)
                {
                    productsQuery = productsQuery.Where(p => p.CategoryId == categoryObj.Id);
                }
            }
            
            // Apply price filters
            if (minPrice.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price >= minPrice.Value);
            }
            
            if (maxPrice.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price <= maxPrice.Value);
            }
            
            // Apply sorting
            switch (sort)
            {
                case "price-low-to-high":
                    productsQuery = productsQuery.OrderBy(p => p.Price);
                    break;
                case "price-high-to-low":
                    productsQuery = productsQuery.OrderByDescending(p => p.Price);
                    break;
                case "latest":
                    productsQuery = productsQuery.OrderByDescending(p => p.Id); // Assuming Id is a proxy for creation date
                    break;
                case "popularity":
                    // This would require a popularity metric, using a placeholder
                    productsQuery = productsQuery.OrderByDescending(p => p.Id);
                    break;
                default:
                    productsQuery = productsQuery.OrderBy(p => p.Name);
                    break;
            }
            
            // Get total count for pagination
            viewModel.TotalItems = await productsQuery.CountAsync();
            
            // Calculate total pages (9 items per page)
            viewModel.TotalPages = (int)Math.Ceiling(viewModel.TotalItems / 9.0);
            
            // Apply pagination
            var products = await productsQuery
                .Skip((page - 1) * 9)
                .Take(9)
                .ToListAsync();
            
            viewModel.Products = products;
            
            // Load categories with counts for the sidebar
            var categories = await _context.Categories.ToListAsync();
            viewModel.Categories = categories.Select(c => new CategoryCount
            {
                Category = c,
                Count = _context.Products.Count(p => p.CategoryId == c.Id)
            }).ToList();
            
            // Create tag counts (simplified approach)
            var allTags = products
                .Where(p => !string.IsNullOrEmpty(p.Tags))
                .SelectMany(p => p.Tags.Split(','))
                .GroupBy(t => t.Trim())
                .Select(g => new TagCount { Name = g.Key, Count = g.Count() })
                .ToList();
            
            viewModel.Tags = allTags;
            
            return View(viewModel);
        }

        public async Task<IActionResult> Details(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            return View(product);
        }


    }
}
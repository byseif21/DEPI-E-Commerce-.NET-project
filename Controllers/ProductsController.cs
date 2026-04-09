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

        public async Task<IActionResult> Shop(string category = null, string tags = null, decimal? priceMin = null, decimal? priceMax = null, string colors = null, string sizes = null, string sort = "default", int page = 1, string search = null)
        {
            var viewModel = new ShopViewModel();
            var productsQuery = _context.Products.Include(p => p.Category).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                productsQuery = productsQuery.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
            }
            
            // Set up filter options
            viewModel.Filters.Category = (category ?? "all").ToLower();
            
            // Get absolute total items (for "All Products" count)
            viewModel.TotalItems = await _context.Products.CountAsync();
            viewModel.Filters.PriceMin = priceMin;
            viewModel.Filters.PriceMax = priceMax;
            viewModel.Filters.Sort = sort;
            viewModel.CurrentPage = page;
            
            // Parse filter strings
            if (!string.IsNullOrEmpty(tags))
            {
                viewModel.Filters.Tags = tags.Split(',').ToList();
                productsQuery = productsQuery.Where(p => p.Tags != null && viewModel.Filters.Tags.Any(t => p.Tags.Contains(t)));
            }
            
            if (!string.IsNullOrEmpty(colors))
            {
                viewModel.Filters.Colors = colors.Split(',').ToList();
                // We'll normalize the colors to handle both name and hex (case-insensitive)
                var colorList = viewModel.Filters.Colors.Select(c => c.ToLower()).ToList();
                productsQuery = productsQuery.Where(p => p.Color != null && colorList.Any(cl => p.Color.ToLower().Contains(cl)));
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
            if (priceMin.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price >= priceMin.Value);
            }
            
            if (priceMax.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price <= priceMax.Value);
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
            
            // Get total count for pagination (only items in current filter)
            var filteredCount = await productsQuery.CountAsync();
            viewModel.TotalPages = (int)Math.Ceiling(filteredCount / 9.0);
            
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
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            return View("Preview", product);
        }


    }
}
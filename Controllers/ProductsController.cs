using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Styleza.Data;
using Styleza.Models;
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

        public async Task<IActionResult> Shop(string category = null, string tags = null)
        {
            var products = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                var categoryObj = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == category.ToLower());
                if (categoryObj != null)
                {
                    products = products.Where(p => p.CategoryId == categoryObj.Id);
                }
            }

            if (!string.IsNullOrEmpty(tags))
            {
                // Simple tag filtering - could be enhanced with a proper Tags model
                products = products.Where(p => p.Description.Contains(tags));
            }

            return View(await products.ToListAsync());
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
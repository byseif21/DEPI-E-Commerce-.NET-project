using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Styleza.Models;
using Styleza.Data;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Styleza.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context, UserManager<IdentityUser> userManager)
        {
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            var products = _context.Products
                .Include(p => p.Images)
                .OrderBy(p => Guid.NewGuid())
                .Take(4)
                .ToList();

            return View(products);
        }

        public IActionResult About()
        {
            return View();
        }
        public IActionResult Contact()
        {
            return View();
        }

        public async Task<IActionResult> Wishlist()
        {
            var userId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login", "Account");
            }

            var wishlistItems = await _context.Wishlists
                .Include(w => w.Product)
                .ThenInclude(p => p.Images)
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return View(wishlistItems);
        }


        public IActionResult Privacy()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AddToWishlist(int productId)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                // If user is not logged in, return JSON for client-side localStorage handling
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    return Json(new { success = true, useLocalStorage = true });
                }
                return RedirectToAction("Login", "Account", new { returnUrl = Url.Action("Index", "Home") });
            }

            // Check if product already exists in wishlist
            var existingItem = _context.Wishlists.FirstOrDefault(w => w.UserId == userId && w.ProductId == productId);
            if (existingItem == null)
            {
                // Add new wishlist item
                var wishlistItem = new Wishlist
                {
                    UserId = userId,
                    ProductId = productId,
                    AddedDate = DateTime.Now
                };

                _context.Wishlists.Add(wishlistItem);
                await _context.SaveChangesAsync();
            }

            // If it's an AJAX request, return JSON result
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                var product = await _context.Products.FindAsync(productId);
                return Json(new { 
                    success = true, 
                    message = product != null ? $"{product.Name} added to wishlist!" : "Product added to wishlist!",
                    useLocalStorage = false
                });
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        public async Task<IActionResult> RemoveFromWishlist(int wishlistItemId)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login", "Account");
            }

            var wishlistItem = await _context.Wishlists.FindAsync(wishlistItemId);
            if (wishlistItem != null && wishlistItem.UserId == userId)
            {
                _context.Wishlists.Remove(wishlistItem);
                await _context.SaveChangesAsync();
            }

            // If it's an AJAX request, return JSON result
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return Json(new { success = true });
            }
            
            return RedirectToAction(nameof(Wishlist));
        }

        [HttpGet]
        public async Task<IActionResult> SyncWishlist(List<int> productIds)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { success = false, message = "User not logged in" });
            }

            // Get existing wishlist items for this user
            var existingItems = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .Select(w => w.ProductId)
                .ToListAsync();

            // Add items from localStorage that aren't already in the database
            foreach (var productId in productIds)
            {
                if (!existingItems.Contains(productId))
                {
                    var wishlistItem = new Wishlist
                    {
                        UserId = userId,
                        ProductId = productId,
                        AddedDate = DateTime.Now
                    };

                    _context.Wishlists.Add(wishlistItem);
                }
            }

            await _context.SaveChangesAsync();
            return Json(new { success = true, message = "Wishlist synchronized successfully" });
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

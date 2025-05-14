using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Styleza.Data;
using Styleza.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Styleza.Controllers
{
    public class CartController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public CartController(ApplicationDbContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login", "Account", new { returnUrl = Url.Action("Index", "Cart") });
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);


            return View(cart ?? new Cart { Items = new List<CartItem>() });
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart(int productId, int quantity = 1)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                {
                    return Json(new { success = false, message = "Please login to add items to cart" });
                }
                return RedirectToAction("Login", "Account", new { returnUrl = Url.Action("Index", "Home") });
            }

            // Get or create cart
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Check if product already in cart
            var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == productId);
            if (cartItem != null)
            {
                // Update quantity
                cartItem.Quantity += quantity;
            }
            else
            {
                // Add new item
                cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = productId,
                    Quantity = quantity
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            
            // If it's an AJAX request, return JSON result
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                var product = await _context.Products.FindAsync(productId);
                return Json(new { 
                    success = true, 
                    message = product != null ? $"{product.Name} added to cart!" : "Product added to cart!",
                    cartCount = await _context.CartItems.CountAsync(c => c.UserId == userId)
                });
            }
            
            // Otherwise redirect to home page
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem != null)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
            }

            // If it's an AJAX request, return JSON result
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return Json(new { success = true });
            }
            
            // Otherwise redirect to cart page
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> UpdateQuantity(int cartItemId, int quantity)
        {
            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem != null && quantity > 0)
            {
                cartItem.Quantity = quantity;
                await _context.SaveChangesAsync();
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> GetCartItems()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { items = new List<object>() });
            }

            var cartItems = await _context.CartItems
                .Where(ci => ci.Cart.UserId == userId)
                .Include(ci => ci.Product)
                .Select(ci => new
                {
                    id = ci.Id,
                    name = ci.Product.Name,
                    price = ci.Product.Price,
                    quantity = ci.Quantity,
                    imageUrl = ci.Product.ImageUrl
                })
                .ToListAsync();

            return Json(new { items = cartItems });
        }

        [HttpGet]
        public async Task<IActionResult> GetCartTotal()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { total = 0.0 });
            }

            var total = await _context.CartItems
                .Where(ci => ci.Cart.UserId == userId)
                .Include(ci => ci.Product)
                .SumAsync(ci => ci.Quantity * ci.Product.Price);

            return Json(new { total });
        }
        
        [HttpGet]
        public async Task<IActionResult> GetCartCount()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Json(new { count = 0 });
            }

            var count = await _context.CartItems
                .Where(ci => ci.Cart.UserId == userId)
                .SumAsync(ci => ci.Quantity);

            return Json(new { count });
        }
    }
}
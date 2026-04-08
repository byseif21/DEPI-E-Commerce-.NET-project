using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Styleza.Data;
using Styleza.Models;
using Microsoft.AspNetCore.Authorization;

namespace Styleza.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(ApplicationDbContext context, 
                              UserManager<IdentityUser> userManager,
                              RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IActionResult> Index()
        {
            // Get statistics for the admin dashboard
            ViewBag.ProductCount = await _context.Products.CountAsync();
            ViewBag.OrderCount = await _context.Orders.CountAsync();
            ViewBag.UserCount = await _userManager.Users.CountAsync();
            ViewBag.TotalRevenue = await _context.Orders.SumAsync(o => o.TotalAmount);
            
            return View();
        }

        #region User Management
        public async Task<IActionResult> UserManagement()
        {
            var users = await _userManager.Users.ToListAsync();
            var userViewModels = new List<UserRoleViewModel>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userViewModels.Add(new UserRoleViewModel
                {
                    UserId = user.Id,
                    Email = user.Email,
                    Roles = roles.ToList()
                });
            }

            return View(userViewModels);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AssignAdminRole(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            // Check if Admin role exists, if not create it
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            // Add user to Admin role if not already in it
            if (!await _userManager.IsInRoleAsync(user, "Admin"))
            {
                await _userManager.AddToRoleAsync(user, "Admin");
            }

            return RedirectToAction(nameof(UserManagement));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RemoveAdminRole(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound($"User with ID {userId} not found");
            }

            if (await _userManager.IsInRoleAsync(user, "Admin"))
            {
                await _userManager.RemoveFromRoleAsync(user, "Admin");
            }

            return RedirectToAction(nameof(UserManagement));
        }
        #endregion

        #region Product Management
        public async Task<IActionResult> ProductManagement()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .ToListAsync();
            return View(products);
        }

        public async Task<IActionResult> EditProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            ViewBag.Categories = await _context.Categories.ToListAsync();
            return View(product);
        }

        [HttpPost]
        public async Task<IActionResult> EditProduct(Product product, IFormFile? ProductImage)
        {
            // Remove navigation properties from validation
            ModelState.Remove("Category");
            ModelState.Remove("Images");

            if (!ModelState.IsValid)
            {
                ViewBag.Categories = await _context.Categories.ToListAsync();
                return View(product);
            }

            try
            {
                // Fetch existing product from the database to preserve non-form fields
                var existingProduct = await _context.Products.FindAsync(product.Id);
                if (existingProduct == null)
                {
                    return NotFound();
                }

                // Update only the fields that are present in the form
                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.CategoryId = product.CategoryId;
                existingProduct.StockQuantity = product.StockQuantity;
                existingProduct.Color = product.Color;
                existingProduct.Tags = product.Tags;
                existingProduct.OldPrice = product.OldPrice;
                existingProduct.AverageRating = product.AverageRating;
                existingProduct.ReviewCount = product.ReviewCount;
                
                // Boolean status flags
                existingProduct.IsInStock = product.IsInStock;
                existingProduct.IsNew = product.IsNew;
                existingProduct.IsBestSeller = product.IsBestSeller;
                
                // Auto-set IsOnSale if OldPrice is present and greater than current price
                existingProduct.IsOnSale = product.IsOnSale || (product.OldPrice.HasValue && product.OldPrice > product.Price);

                // Handle file upload
                if (ProductImage != null && ProductImage.Length > 0)
                {
                    if (ProductImage.Length > 5 * 1024 * 1024)
                    {
                        ModelState.AddModelError("ProductImage", "File size cannot exceed 5MB.");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }

                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var fileExtension = Path.GetExtension(ProductImage.FileName).ToLowerInvariant();
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        ModelState.AddModelError("ProductImage", "Only JPG, PNG, and GIF files are allowed.");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                    
                    try
                    {
                        string fileName = $"{Guid.NewGuid()}{fileExtension}";
                        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "asset", "img", "products", fileName);
                        
                        var directory = Path.GetDirectoryName(filePath);
                        if (!Directory.Exists(directory))
                        {
                            Directory.CreateDirectory(directory);
                        }
                        
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await ProductImage.CopyToAsync(fileStream);
                        }
                        
                        existingProduct.ImageUrl = $"/asset/img/products/{fileName}";
                        
                        // Update the images collection
                        var existingImages = await _context.ProductImages
                            .Where(i => i.ProductId == existingProduct.Id)
                            .ToListAsync();
                            
                        // Mark existing primary images as non-primary
                        foreach (var img in existingImages)
                        {
                            img.IsPrimary = false;
                        }
                        
                        // Add new primary image
                        _context.ProductImages.Add(new ProductImage
                        {
                            ImageUrl = existingProduct.ImageUrl,
                            ProductId = existingProduct.Id,
                            IsPrimary = true
                        });
                    }
                    catch (Exception ex)
                    {
                        ModelState.AddModelError("ProductImage", $"Error saving image: {ex.Message}");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                }
                else
                {
                    // If no new image was uploaded, preserve the existing one in the returned model (for the view on error)
                    product.ImageUrl = existingProduct.ImageUrl;
                }
                
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(ProductManagement));
            }
            catch (Exception ex)
            {
                var fullError = ex.Message + (ex.InnerException != null ? " | Inner: " + ex.InnerException.Message : "");
                Console.WriteLine($"Error updating product: {fullError}");
                ModelState.AddModelError("", $"A database error occurred: {fullError}");
                ViewBag.Categories = await _context.Categories.ToListAsync();
                return View(product);
            }
        }

        public IActionResult CreateProduct()
        {
            ViewBag.Categories = _context.Categories.ToList();
            // Initialize a new Product with default values
            var product = new Product
            {
                IsInStock = true,
                StockQuantity = 1,
                Images = new List<ProductImage>(),
                ProductId = Math.Abs(Guid.NewGuid().GetHashCode()) // Collision-safe unique ProductId
            };
            return View(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct(Product product, IFormFile? ProductImage)
        {
            // Initial validation checks
            if (product.CategoryId <= 0)
            {
                ModelState.AddModelError("CategoryId", "Please select a valid category");
            }
            
            // Remove Category navigation property from validation if it's null (it will be populated later if needed)
            ModelState.Remove("Category");

            if (!ModelState.IsValid)
            {
                ViewBag.Categories = await _context.Categories.ToListAsync();
                ViewBag.ErrorMessage = "Please correct the validation errors below.";
                return View(product);
            }

            try
            {
                // Generate a collision-safe ProductId
                product.ProductId = Math.Abs(Guid.NewGuid().GetHashCode());
                product.Id = 0; // Ensure it's treated as a new product

                // Auto-set IsOnSale if OldPrice is present
                if (product.OldPrice.HasValue && product.OldPrice > product.Price)
                {
                    product.IsOnSale = true;
                }

                // Handle file upload
                if (ProductImage != null && ProductImage.Length > 0)
                {
                    if (ProductImage.Length > 5 * 1024 * 1024)
                    {
                        ModelState.AddModelError("ProductImage", "File size cannot exceed 5MB.");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }

                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var fileExtension = Path.GetExtension(ProductImage.FileName).ToLowerInvariant();
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        ModelState.AddModelError("ProductImage", "Only JPG, PNG, and GIF files are allowed.");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                    
                    try
                    {
                        string fileName = $"{Guid.NewGuid()}{fileExtension}";
                        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "asset", "img", "products", fileName);
                        
                        var directory = Path.GetDirectoryName(filePath);
                        if (!Directory.Exists(directory))
                        {
                            Directory.CreateDirectory(directory);
                        }
                        
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await ProductImage.CopyToAsync(fileStream);
                        }
                        
                        product.ImageUrl = $"/asset/img/products/{fileName}";
                        
                        // Add to Images collection
                        product.Images.Add(new ProductImage
                        {
                            ImageUrl = product.ImageUrl,
                            IsPrimary = true
                        });
                    }
                    catch (Exception ex)
                    {
                        ModelState.AddModelError("ProductImage", $"Error saving image: {ex.Message}");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                }
                else if (string.IsNullOrEmpty(product.ImageUrl) || product.ImageUrl == "/asset/img/products/placeholder.jpg")
                {
                    product.ImageUrl = "/asset/img/products/placeholder.jpg";
                    product.Images.Add(new ProductImage
                    {
                        ImageUrl = product.ImageUrl,
                        IsPrimary = true
                    });
                }
                
                // Final check for Category existence
                var category = await _context.Categories.FindAsync(product.CategoryId);
                if (category == null)
                {
                    ModelState.AddModelError("CategoryId", "Selected category does not exist");
                    ViewBag.Categories = await _context.Categories.ToListAsync();
                    return View(product);
                }

                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                
                return RedirectToAction(nameof(ProductManagement));
            }
            catch (Exception ex)
            {
                // Log the exception (in a real app, use a logger)
                Console.WriteLine($"Error saving product: {ex.Message}");
                
                ModelState.AddModelError("", $"A database error occurred: {ex.Message}");
                ViewBag.Categories = await _context.Categories.ToListAsync();
                ViewBag.ErrorMessage = "An unexpected error occurred while saving the product.";
                return View(product);
            }
        }

        [HttpPost]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(ProductManagement));
        }
        #endregion

        #region Order Management
        public async Task<IActionResult> OrderManagement()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
            return View(orders);
        }

        public async Task<IActionResult> OrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return View(order);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateOrderStatus(int id, string status)
        {
            // Validate order status against whitelist to prevent persistence of arbitrary strings
            var validStatuses = new[] { "Processing", "Shipped", "Delivered", "Cancelled", "Completed" };
            if (!validStatuses.Contains(status))
            {
                return BadRequest("Invalid order status");
            }

            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                order.Status = status;
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(OrderManagement));
        }
        #endregion

        #region Category Management
        public async Task<IActionResult> CategoryManagement()
        {
            var categories = await _context.Categories
                .Include(c => c.SubCategories)
                .ToListAsync();
            return View(categories);
        }

        public IActionResult CreateCategory()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory(Category category)
        {
            if (ModelState.IsValid)
            {
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(CategoryManagement));
            }
            return View(category);
        }

        public async Task<IActionResult> EditCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            return View(category);
        }

        [HttpPost]
        public async Task<IActionResult> EditCategory(Category category)
        {
            if (ModelState.IsValid)
            {
                _context.Update(category);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(CategoryManagement));
            }
            return View(category);
        }

        [HttpPost]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(CategoryManagement));
        }
        #endregion
    }

    public class UserRoleViewModel
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
}

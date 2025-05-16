using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Styleza.Data;
using Styleza.Models;
using Microsoft.AspNetCore.Authorization;
//using System;
//using System.Threading.Tasks;
//using System.Collections.Generic;
//using System.Linq;
//using System.IO;
//using Microsoft.AspNetCore.Http;

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
        public async Task<IActionResult> EditProduct(Product product, IFormFile ProductImage)
        {
            if (ModelState.IsValid)
            {
                // Handle file upload if a new image is provided
                if (ProductImage != null && ProductImage.Length > 0)
                {
                    // Validate file type
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var fileExtension = Path.GetExtension(ProductImage.FileName).ToLowerInvariant();
                    string fileName = string.Empty; // Declare fileName outside the try block
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        ModelState.AddModelError("ProductImage", "Only JPG, PNG, and GIF files are allowed.");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                    
                    try
                    {
                        // Create a unique filename
                        fileName = $"{Guid.NewGuid()}{fileExtension}";
                        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "asset", "img", "products", fileName);
                        
                        // Ensure directory exists
                        var directory = Path.GetDirectoryName(filePath);
                        if (!Directory.Exists(directory))
                        {
                            Directory.CreateDirectory(directory);
                        }
                        
                        // Save the file
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await ProductImage.CopyToAsync(fileStream);
                        }
                        
                        // Set the ImageUrl property to the relative path
                        product.ImageUrl = $"/asset/img/products/{fileName}";
                    }
                    catch (Exception ex)
                    {
                        // Log the error
                        Console.WriteLine($"Error saving image: {ex.Message}");
                        ModelState.AddModelError("ProductImage", $"Error saving image: {ex.Message}");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                    
                    // Set the ImageUrl property to the relative path
                    product.ImageUrl = $"/asset/img/products/{fileName}";
                    
                    // Create a ProductImage entry if it doesn't exist
                    var existingProduct = await _context.Products
                        .Include(p => p.Images)
                        .FirstOrDefaultAsync(p => p.Id == product.Id);
                    
                    if (existingProduct != null)
                    {
                        // Update existing primary image or add a new one
                        var primaryImage = existingProduct.Images.FirstOrDefault(i => i.IsPrimary);
                        if (primaryImage != null)
                        {
                            primaryImage.ImageUrl = product.ImageUrl;
                        }
                        else
                        {
                            existingProduct.Images.Add(new ProductImage
                            {
                                ImageUrl = product.ImageUrl,
                                ProductId = product.Id,
                                IsPrimary = true
                            });
                        }
                    }
                }
                // If no new image is uploaded, keep the existing image
                // The product.ImageUrl will already contain the existing image URL from the form
                
                _context.Update(product);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(ProductManagement));
            }
            ViewBag.Categories = await _context.Categories.ToListAsync();
            return View(product);
        }

        public IActionResult CreateProduct()
        {
            ViewBag.Categories = _context.Categories.ToList();
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct(Product product, IFormFile ProductImage)
        {
            // Ensure Images collection is initialized
            if (product.Images == null)
            {
                product.Images = new List<ProductImage>();
            }
            
            // Check if the model is valid before proceeding
            if (!ModelState.IsValid)
            {
                // If model is invalid, log validation errors
                foreach (var modelState in ModelState.Values)
                {
                    foreach (var error in modelState.Errors)
                    {
                        Console.WriteLine($"Validation error: {error.ErrorMessage}");
                    }
                }
                
                // Return to the form with validation errors
                ViewBag.Categories = await _context.Categories.ToListAsync();
                ViewBag.ErrorMessage = "Please correct the validation errors and try again.";
                return View(product);
            }

            try
            {
                // Handle color field - if it's not a hex color code, it might be a color name
                if (!string.IsNullOrEmpty(product.Color) && !product.Color.StartsWith("#"))
                {
                    // Map common color names to hex values if needed
                    // For now, we'll just accept the color name as is
                    // This allows users to enter "White" instead of "#FFFFFF"
                }
                
                // Handle file upload
                if (ProductImage != null && ProductImage.Length > 0)
                {
                    // Validate file type
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var fileExtension = Path.GetExtension(ProductImage.FileName).ToLowerInvariant();
                    string fileName = string.Empty; // Declare fileName outside the try block
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        ModelState.AddModelError("ProductImage", "Only JPG, PNG, and GIF files are allowed.");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                    
                    try
                    {
                        // Create a unique filename
                        fileName = $"{Guid.NewGuid()}{fileExtension}";
                        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "asset", "img", "products", fileName);
                        
                        // Ensure directory exists
                        var directory = Path.GetDirectoryName(filePath);
                        if (!Directory.Exists(directory))
                        {
                            Directory.CreateDirectory(directory);
                        }
                        
                        // Save the file
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await ProductImage.CopyToAsync(fileStream);
                        }
                        
                        // Set the ImageUrl property to the relative path
                        product.ImageUrl = $"/asset/img/products/{fileName}";
                    }
                    catch (Exception ex)
                    {
                        // Log the error
                        Console.WriteLine($"Error saving image: {ex.Message}");
                        ModelState.AddModelError("ProductImage", $"Error saving image: {ex.Message}");
                        ViewBag.Categories = await _context.Categories.ToListAsync();
                        return View(product);
                    }
                    
                    // Create a ProductImage entry
                    var productImage = new ProductImage
                    {
                        ImageUrl = product.ImageUrl,
                        IsPrimary = true
                    };
                    
                    product.Images.Add(productImage);
                }
                else if (string.IsNullOrEmpty(product.ImageUrl) || product.ImageUrl == "/asset/img/products/placeholder.jpg")
                {
                    // If no image is uploaded and no custom ImageUrl is provided, use a placeholder
                    product.ImageUrl = "/asset/img/products/placeholder.jpg";
                    
                    // Create a ProductImage entry for the placeholder
                    var productImage = new ProductImage
                    {
                        ImageUrl = product.ImageUrl,
                        IsPrimary = true
                    };
                    
                    product.Images.Add(productImage);
                }
                
                // The ProductId field is redundant with Id but required by the model
                // For new products, we'll generate a random value to ensure it's not 0
                product.ProductId = new Random().Next(1000, 999999);
                
                // Ensure required fields are set
                if (string.IsNullOrEmpty(product.Name))
                {
                    ModelState.AddModelError("Name", "Product name is required");
                }
                
                if (string.IsNullOrEmpty(product.Description))
                {
                    ModelState.AddModelError("Description", "Description is required");
                }
                
                if (product.Price <= 0)
                {
                    ModelState.AddModelError("Price", "Price must be greater than 0");
                }
                
                if (product.CategoryId <= 0)
                {
                    ModelState.AddModelError("CategoryId", "Please select a category");
                }
                
                // Check if there are any validation errors
                if (!ModelState.IsValid)
                {
                    ViewBag.Categories = await _context.Categories.ToListAsync();
                    return View(product);
                }
                
                // Add the product to the context
                _context.Products.Add(product);
                
                // Save changes to the database
                await _context.SaveChangesAsync();
                
                // Redirect to product management page on success
                return RedirectToAction(nameof(ProductManagement));
            }
            catch (Exception ex)
            {
                // Log the exception details
                Console.WriteLine($"Error saving product: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // Add error message to model state
                ModelState.AddModelError("", $"Unable to save the product: {ex.Message}");
                
                // Return to the form with the error
                ViewBag.Categories = await _context.Categories.ToListAsync();
                ViewBag.ErrorMessage = "An error occurred while saving the product. Please try again.";
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
        public async Task<IActionResult> UpdateOrderStatus(int id, string status)
        {
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
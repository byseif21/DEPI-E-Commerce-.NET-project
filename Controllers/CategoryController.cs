using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Styleza.Data;
using System.Linq;

public class CategoryController : Controller
{
    private readonly ApplicationDbContext _context;

    public CategoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    [Route("Category/{name}")]
    public IActionResult ViewCategory(string name)
    {
        var products = _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.Category.Name.ToLower() == name.ToLower())
                    .ToList();


        ViewBag.Category = name; // Optional for heading in the view
        return View("Shop", products);
    }
}

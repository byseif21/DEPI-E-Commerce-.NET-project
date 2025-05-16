using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Styleza.Data
{
    public class DbSeeder
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            // Check if Admin role exists, if not create it
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }
        }

        public static async Task SeedDefaultAdminAsync(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // Ensure roles are seeded first
            await SeedRolesAsync(roleManager);

            // Create a default admin user if needed (for testing purposes)
            // In production, you would want to create this admin through the UI
            const string adminEmail = "admin@styleza.com";
            const string adminPassword = "Admin123!";

            // Check if the admin user exists
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                // Create the admin user
                adminUser = new IdentityUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                await userManager.CreateAsync(adminUser, adminPassword);
                
                // Add the user to the Admin role
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
            else if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
            {
                // If the user exists but is not in the Admin role, add them
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}

# 🛍️ Styleza E-Commerce

**Styleza** is a modern e-commerce web application for selling clothes, developed as part of the **FULL STACK .NET DEPI PROGRAM**. It’s built using **ASP.NET Core MVC (.NET 8)** and features a smooth shopping experience for customers along with a robust admin panel for managing products and orders.

---

## 🎯 Project Objectives

- Develop a clean, user-friendly online store for clothing.
- Enable customer account management (registration, login, order tracking).
- Provide an admin dashboard for managing products and orders.
- Maintain clean, collaborative code using Git and GitHub.

---

## 🛠️ Tech Stack

| Layer        | Technology                                      |
|--------------|--------------------------------------------------|
| **Backend**  | ASP.NET Core MVC (.NET 8), Entity Framework Core |
| **Frontend** | Razor Views, Bootstrap (static files in `wwwroot/`) |
| **Database** | SQL Server (configured via `appsettings.json`)   |
| **Auth**     | ASP.NET Core Identity (Individual Accounts)       |
| **Version Control** | Git, GitHub                            |
| **CI/CD**    | GitHub Actions (`label-pr.yml`)                  |

---

## 📁 Folder Structure

```
Styleza/
├── Areas/Identity/Pages/   # User authentication (login, register)
├── Controllers/            # Application controllers (backend logic)
├── Models/                 # Data models (used with EF Core)
├── Views/                  # Razor views (UI templates)
├── wwwroot/                # Static frontend files (CSS, JS, images)
├── Data/                   # DB context and migrations
├── .github/workflows/      # GitHub Actions for CI/CD
│   └── label-pr.yml        # Auto-labeling pull requests
├── Program.cs              # App startup
├── appsettings.json        # Configurations (DB connection, etc.)
    └── appsettings.Development.json 
├── .gitignore              # Files/folders to exclude from Git
└── Styleza.sln             # Visual Studio solution file
```

> **Frontend**: `Views/`, `wwwroot/`, `Areas/Identity/Pages/`  
> **Backend**: `Controllers/`, `Models/`, `Data/`

---

## 🚀 Getting Started

### ✅ Prerequisites

- **Visual Studio 2022** with .NET 8 SDK
- **SQL Server Express** (or another SQL Server instance)
- **Git**: [Install Git](https://git-scm.com/)

> 🔐 To collaborate, share your GitHub username with `@byseif21` for write access.

---

### ⚙️ Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/byseif21/DEPI-E-Commerce-.NET-project.git
   cd Styleza
   ```

2. **Open in Visual Studio**
   - Open `Styleza.sln` in Visual Studio 2022
   - Ensure .NET 8 SDK is installed

3. **Configure the Database**
   - Rename any file ends with `.json1` to be just `.json `
   - Edit your connection string in `appsettings.json`:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=StylezaDb;Trusted_Connection=True;"
     }
     ```

5. **Apply Migrations**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

6. **Run the App**
   - Press **F5** in Visual Studio or run:
     ```bash
     dotnet run
     ```
   - Visit `https://localhost:5001` in your browser

---

## 👥 Team Workflow

### 🌿 Branching Strategy

| Type        | Prefix          | Example                            |
|-------------|------------------|------------------------------------|
| New Module  | `factor/`        | `factor/product-catalog`           |
| New Feature | `feat/`          | `feat/wishlist`                    |
| Bug Fix     | `fix/`           | `fix/42`                           |

```bash
git checkout -b factor/product-catalog
```

### ✅ Commit Convention

- `factor:` For building or UI layout structure (e.g., `factor: add login UI`)
- `feat:` For introducing new features (e.g., `feat: implement search`)
- `fix:` For bug fixes or resolving issues (e.g., `fix: cart total issue`)
- `refactor:` For code refactoring without changing behavior (e.g., `refactor: simplify cart logic`)
- `impr:` For performance, UX, or readability improvements (e.g., `impr: enhance checkout loading speed`)
- `doc:` For documentation updates or additions (e.g.,`doc: update README with setup instructions`)

---

### 📦 Pull Request Flow

1. **Push Your Branch**
   ```bash
   git push origin factor/product-catalog
   ```

2. **Create a PR**
   - Title: `factor: add product catalog`
   - Description: Include `closes #issue-number` if applicable

3. **Labels**
   - Auto-labeled by `label-pr.yml`:
     - `frontend`: Changes in UI files
     - `backend`: Changes in logic/data files

4. **Reviews**
   - At least 1 approval is required
   - Maintainer (`@byseif21`) will merge PRs

---

## 🧪 Example Contribution: Product Catalog

```bash
git checkout -b factor/product-catalog
# Add files: ProductsController.cs, Product.cs, Index.cshtml
git add .
git commit -m "factor: add product catalog"
git push origin factor/product-catalog
```

---

## 🌱 Contributor Tips

- 💬 **It’s okay to ask**: Don’t hesitate to drop a message in the group chat if you’re unsure about something.
- 🐞 **Start simple**: A small bug fix or a style tweak is a great way to get familiar with the project.
- 👀 **Take a look around**: Browsing through others' pull requests can help you understand how things are structured.
- 🌿 **Use branches**: Creating a feature branch helps keep things organized and avoids conflicts on the main branch.

---

## 🛠️ Troubleshooting

| Issue             | Solution                                      |
|------------------|-----------------------------------------------|
| Git errors       | Run `git status` and resolve conflicts         |
| Database issues  | Ensure SQL Server is running and configured    |
| Build problems   | Use `dotnet build` or check Visual Studio logs |
| Missing PR label | Ensure `label-pr.yml` exists or contact @byseif21 |

---

## 📬 Contact

- **Project Lead**: [@byseif21](https://github.com/byseif21)
- **Report Issues**: [GitHub Issues](https://github.com/byseif21/DEPI-E-Commerce-.NET-project/issues)

---

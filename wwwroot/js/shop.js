// DOM Elements
document.addEventListener('DOMContentLoaded', function () {
    // Navigation elements
    const navItems = document.querySelectorAll('.nav-item');
    const hamburger = document.querySelector('.hamburger');

    // Shop filter elements
    const categoryLinks = document.querySelectorAll('.category-list a');
    const priceFilterBtn = document.querySelector('.filter-btn');
    const colorFilters = document.querySelectorAll('.color-filter');
    const sizeFilters = document.querySelectorAll('.size-filter');
    const tagLinks = document.querySelectorAll('.tag');

    // Shop display elements
    const viewBtns = document.querySelectorAll('.view-btn');
    const sortSelect = document.querySelector('.shop-sort select');
    const productsGrid = document.querySelector('.products-grid');
    const paginationItems = document.querySelectorAll('.page-item');

    // Product elements
    const productCards = document.querySelectorAll('.product-card');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const wishlistBtns = document.querySelectorAll('.product-action .fa-heart');
    const quickViewBtns = document.querySelectorAll('.product-action .fa-eye');
    const compareProductBtns = document.querySelectorAll('.product-action .fa-sync-alt');

    // Cart elements
    const cartIcon = document.querySelector('.nav-icon .fa-shopping-bag');
    const cartCount = document.querySelector('.cart-count');

    // State variables
    let activeCategory = 'All Products';
    let activeFilters = {
        category: 'all',
        priceMin: 0,
        priceMax: 500,
        colors: [],
        sizes: ['M'], // Default active size
        tags: []
    };
    let currentView = 'grid';
    let currentSort = 'default';
    let currentPage = 1;
    let itemsPerPage = 9;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    let compareList = JSON.parse(localStorage.getItem('compareList')) || [];

    // ----- INITIALIZATION -----

    // Initialize cart count
    updateCartCount();

    // ----- EVENT LISTENERS -----

    // Mobile menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);

    // Category filter
    categoryLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.textContent.split(' ')[0].toLowerCase();
            activeFilters.category = category === 'all' ? 'all' : category;
            updateActiveCategory(this);
            filterProducts();
        });
    });

    // Price filter
    priceFilterBtn.addEventListener('click', function () {
        const minInput = document.querySelector('.price-input:first-child input');
        const maxInput = document.querySelector('.price-input:last-child input');

        activeFilters.priceMin = Number(minInput.value);
        activeFilters.priceMax = Number(maxInput.value);

        filterProducts();
    });

    // Color filters
    colorFilters.forEach(colorFilter => {
        colorFilter.addEventListener('click', function () {
            // Color filtering is now handled by the updateFilter function in Shop.cshtml
            // This event listener is kept for client-side filtering when needed
            this.classList.toggle('active');
            const colorStyle = this.getAttribute('style');
            const color = colorStyle.match(/background-color: (#[0-9A-F]{6}|[a-z]+)/i)?.[1];
            
            if (color) {
                if (this.classList.contains('active')) {
                    activeFilters.colors.push(color);
                } else {
                    activeFilters.colors = activeFilters.colors.filter(c => c !== color);
                }
                
                // Client-side filtering for immediate feedback
                filterProducts();
            }
        });
    });

    // Size filters
    sizeFilters.forEach(sizeFilter => {
        sizeFilter.addEventListener('click', function () {
            this.classList.toggle('active');
            const size = this.textContent;

            if (this.classList.contains('active')) {
                activeFilters.sizes.push(size);
            } else {
                activeFilters.sizes = activeFilters.sizes.filter(s => s !== size);
            }

            filterProducts();
        });
    });

    // Tag filters
    tagLinks.forEach(tag => {
        tag.addEventListener('click', function (e) {
            e.preventDefault();
            this.classList.toggle('active');
            const tagName = this.textContent.toLowerCase();

            if (this.classList.contains('active')) {
                activeFilters.tags.push(tagName);
            } else {
                activeFilters.tags = activeFilters.tags.filter(t => t !== tagName);
            }

            filterProducts();
        });
    });

    // View switcher (grid/list)
    if (viewBtns && viewBtns.length > 0) {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                viewBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const viewType = this.querySelector('i').classList.contains('fa-th') ? 'grid' : 'list';
                changeView(viewType);
            });
        });
    }

    // Sorting products
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            // use the direct value from the select element which matches the controller's expected format
            currentSort = this.value;
            sortProducts();
        });
    }

    // Pagination
    paginationItems.forEach(item => {
        item.addEventListener('click', function () {
            if (this.textContent === '') return; // Skip for arrow icons

            paginationItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            currentPage = parseInt(this.textContent);
            updatePagination();
        });
    });

    // Add to cart functionality
    addToCartBtns.forEach((btn, index) => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            addToCart(productCards[index]);
        });
    });

    // Wishlist functionality
    wishlistBtns.forEach((btn, index) => {
        btn.addEventListener('click', function () {
            toggleWishlist(productCards[index]);
        });
    });

    // Quick view functionality
    quickViewBtns.forEach((btn, index) => {
        btn.addEventListener('click', function () {
            openQuickView(productCards[index]);
        });
    });

    // Compare products functionality
    compareProductBtns.forEach((btn, index) => {
        btn.addEventListener('click', function () {
            toggleCompare(productCards[index]);
        });
    });

    // Cart icon click - show mini cart
    cartIcon.addEventListener('click', function (e) {
        e.preventDefault();
        showMiniCart();
    });

    // ----- FUNCTIONS -----

    // Mobile menu toggle function
    function toggleMobileMenu() {
        // Check if mobile nav already exists
        if (document.querySelector('.mobile-nav')) return;
        
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        mobileNav.innerHTML = `
            <div class="mobile-nav-header">
                <a href="/" class="logo">Style<span>Za</span></a>
                <div class="close-menu"><i class="fas fa-times"></i></div>
            </div>
            <ul class="mobile-nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/Products/Shop">Shop</a></li>
                <li><a href="/Home/About">About</a></li>
                <li><a href="/Home/Blog">Blog</a></li>
                <li><a href="/Home/Contact">Contact</a></li>
            </ul>
            <div class="mobile-nav-footer">
                <div class="mobile-nav-footer-icons">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-pinterest-p"></i></a>
                </div>
            </div>
        `;
        
        // Create overlay for closing when clicking outside
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(overlay);
        
        document.body.appendChild(mobileNav);
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            mobileNav.classList.add('active');
            overlay.classList.add('active');
        }, 10);

        // Close menu when clicking the close button
        const closeMenu = document.querySelector('.close-menu');
        closeMenu.addEventListener('click', function () {
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(mobileNav);
                document.body.removeChild(overlay);
                document.body.style.overflow = '';
            }, 300);
        });
        
        // Close menu when clicking outside
        overlay.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(mobileNav);
                document.body.removeChild(overlay);
                document.body.style.overflow = '';
            }, 300);
        });


    }

    // Update active category
    function updateActiveCategory(clickedCategory) {
        categoryLinks.forEach(link => {
            link.classList.remove('active');
        });
        clickedCategory.classList.add('active');

        // Update category name display if needed
        activeCategory = clickedCategory.textContent.split(' ')[0];
    }

    // Filter products based on all active filters
    function filterProducts() {
        // In the actual implementation, filtering is handled server-side via URL parameters
        // This function is kept for client-side filtering when needed
        // The updateFilter() function in Shop.cshtml handles the server-side filtering
        
        let filteredProducts = Array.from(productCards);

        // Category filter
        if (activeFilters.category !== 'all') {
            filteredProducts = filteredProducts.filter(product => {
                const productCategory = product.querySelector('.product-category').textContent.toLowerCase();
                return productCategory.includes(activeFilters.category.toLowerCase());
            });
        }

        // Price filter
        filteredProducts = filteredProducts.filter(product => {
            const priceText = product.querySelector('.current-price').textContent;
            const price = parseFloat(priceText.replace('$', ''));
            return price >= activeFilters.priceMin && price <= activeFilters.priceMax;
        });

        // Update display
        productCards.forEach(card => {
            card.style.display = 'none';
        });

        filteredProducts.forEach(card => {
            card.style.display = 'block';
        });

        // Update products found count if element exists
        const productsFound = document.querySelector('.products-found');
        if (productsFound) {
            productsFound.textContent = `Showing 1–${Math.min(filteredProducts.length, itemsPerPage)} of ${filteredProducts.length} results`;
        }

        // Reset pagination if needed
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            if (filteredProducts.length <= itemsPerPage) {
                // Hide pagination if only one page
                pagination.style.display = 'none';
            } else {
                pagination.style.display = 'flex';
                // Reset to page 1
                currentPage = 1;
                paginationItems.forEach((item, index) => {
                    if (index === 0) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        }
    }

    // Change view (grid/list)
    function changeView(viewType) {
        currentView = viewType;

        if (productsGrid) {
            if (viewType === 'grid') {
                productsGrid.classList.remove('list-view');
                productsGrid.classList.add('grid-view');
            } else {
                productsGrid.classList.remove('grid-view');
                productsGrid.classList.add('list-view');

                // In list view, we might need to adjust the product cards styling
                productCards.forEach(card => {
                    if (!card.classList.contains('list-view-processed')) {
                        const productImg = card.querySelector('.product-img-container');
                        const productInfo = card.querySelector('.product-info');

                        if (productImg && productInfo) {
                            card.style.display = 'flex';
                            productImg.style.width = '30%';
                            productImg.style.height = '220px';
                            productInfo.style.width = '70%';
                            productInfo.style.padding = '20px 30px';

                            // Add a short description in list view
                            const descElement = document.createElement('div');
                            descElement.className = 'product-description';
                            descElement.innerHTML = '<p>Premium quality product crafted with the finest materials. Perfect for any occasion.</p>';

                            // Insert after price and before add to cart button
                            const addToCartBtn = card.querySelector('.add-to-cart');
                            if (addToCartBtn) {
                                productInfo.insertBefore(descElement, addToCartBtn);
                            } else {
                                productInfo.appendChild(descElement);
                            }

                            card.classList.add('list-view-processed');
                        }
                    }
                });
            }
        }
    }

    // Sort products
    function sortProducts() {
        const products = Array.from(productCards);

        switch (currentSort) {
            case 'popularity':
                // Simulated popularity (would typically come from backend data)
                // Here we'll use a data attribute or just randomize for demo
                products.sort(() => Math.random() - 0.5);
                break;

            case 'rating':
                // Simulated ratings (would typically come from backend data)
                products.sort(() => Math.random() - 0.5);
                break;

            case 'latest':
                // Assuming newer products have "New" label
                products.sort((a, b) => {
                    const aIsNew = a.querySelector('.product-label')?.textContent === 'New' ? 1 : 0;
                    const bIsNew = b.querySelector('.product-label')?.textContent === 'New' ? 1 : 0;
                    return bIsNew - aIsNew;
                });
                break;

            case 'price-low-to-high':
                products.sort((a, b) => {
                    const aPrice = parseFloat(a.querySelector('.current-price').textContent.replace('$', ''));
                    const bPrice = parseFloat(b.querySelector('.current-price').textContent.replace('$', ''));
                    return aPrice - bPrice;
                });
                break;

            case 'price-high-to-low':
                products.sort((a, b) => {
                    const aPrice = parseFloat(a.querySelector('.current-price').textContent.replace('$', ''));
                    const bPrice = parseFloat(b.querySelector('.current-price').textContent.replace('$', ''));
                    return bPrice - aPrice;
                });
                break;

            default:
                // Default sorting (category-based)
                products.sort((a, b) => {
                    return a.querySelector('.product-category').textContent
                        .localeCompare(b.querySelector('.product-category').textContent);
                });
        }

        // Reappend sorted products
        products.forEach(product => {
            productsGrid.appendChild(product);
        });
    }

    // Update pagination
    function updatePagination() {
        // Note: In the actual implementation, pagination is handled server-side
        // This function is kept for client-side pagination when needed
        // The updatePage() function in Shop.cshtml handles the server-side pagination
        
        const visibleProducts = Array.from(productCards).filter(
            card => card.style.display !== 'none'
        );

        const totalPages = Math.ceil(visibleProducts.length / itemsPerPage);

        // Show only products for current page
        visibleProducts.forEach((product, index) => {
            const shouldShow =
                index >= (currentPage - 1) * itemsPerPage &&
                index < currentPage * itemsPerPage;

            product.style.display = shouldShow ? 'block' : 'none';
        });

        // Update products found text
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, visibleProducts.length);
        const productsFound = document.querySelector('.products-found');
        if (productsFound) {
            productsFound.textContent = `Showing ${startItem}–${endItem} of ${visibleProducts.length} results`;
        }
    }

    // Add to cart functionality
    function addToCart(productCard) {
        if (!productCard) return;
        
        const title = productCard.querySelector('.product-title')?.textContent;
        const price = productCard.querySelector('.current-price')?.textContent;
        const img = productCard.querySelector('.product-img')?.src;
        const category = productCard.querySelector('.product-category')?.textContent;
        const productId = productCard.querySelector('.add-to-cart')?.getAttribute('data-product-id');
        
        if (!title || !price || !img || !category) return;

        // Check if product is already in cart
        const existingProductIndex = cart.findIndex(item => item.title === title);

        if (existingProductIndex !== -1) {
            // Increase quantity if product already in cart
            cart[existingProductIndex].quantity += 1;
        } else {
            // Add new product to cart
            cart.push({
                id: productId,
                title,
                price,
                img,
                category,
                quantity: 1
            });
        }

        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart icon
        updateCartCount();

        // Show added to cart notification
        showNotification(`${title} added to cart!`);
    }

    // Update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }
    
    // Show notification
    function showNotification(message) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            document.body.removeChild(existingNotification);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Toggle wishlist
    function toggleWishlist(productCard) {
        const title = productCard.querySelector('.product-title').textContent;
        const existingIndex = wishlist.findIndex(item => item.title === title);

        if (existingIndex !== -1) {
            // Remove from wishlist
            wishlist.splice(existingIndex, 1);
            showNotification(`${title} removed from wishlist!`);
        } else {
            // Add to wishlist
            const price = productCard.querySelector('.current-price').textContent;
            const img = productCard.querySelector('.product-img').src;
            const category = productCard.querySelector('.product-category').textContent;

            wishlist.push({
                title,
                price,
                img,
                category
            });

            showNotification(`${title} added to wishlist!`);
        }

        // Save wishlist to localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    // Open quick view modal
    function openQuickView(productCard) {
        const title = productCard.querySelector('.product-title').textContent;
        const price = productCard.querySelector('.current-price').textContent;
        const oldPrice = productCard.querySelector('.old-price')?.textContent || '';
        const img = productCard.querySelector('.product-img').src;
        const category = productCard.querySelector('.product-category').textContent;

        // Create quick view modal
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="quick-view-overlay"></div>
            <div class="quick-view-content">
                <div class="quick-view-close"><i class="fas fa-times"></i></div>
                <div class="quick-view-container">
                    <div class="product-image">
                        <img src="${img}" alt="${title}">
                    </div>
                    <div class="product-details">
                        <div class="product-category">${category}</div>
                        <h2 class="product-title">${title}</h2>
                        <div class="product-price">
                            <span class="current-price">${price}</span>
                            ${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}
                        </div>
                        <div class="product-description">
                            <p>Premium quality product crafted with the finest materials. This ${category.toLowerCase()} piece is designed to provide both comfort and style for any occasion.</p>
                        </div>
                        <div class="product-meta">
                            <div class="product-size">
                                <h4>Size:</h4>
                                <div class="size-options">
                                    <span class="size-option">S</span>
                                    <span class="size-option active">M</span>
                                    <span class="size-option">L</span>
                                    <span class="size-option">XL</span>
                                </div>
                            </div>
                            <div class="product-color">
                                <h4>Color:</h4>
                                <div class="color-options">
                                    <span class="color-option" style="background-color: #000000;"></span>
                                    <span class="color-option active" style="background-color: #4682B4;"></span>
                                    <span class="color-option" style="background-color: #8B4513;"></span>
                                </div>
                            </div>
                        </div>
                        <div class="product-quantity">
                            <h4>Quantity:</h4>
                            <div class="quantity-selector">
                                <span class="qty-btn minus">-</span>
                                <input type="text" value="1" class="qty-input">
                                <span class="qty-btn plus">+</span>
                            </div>
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart-btn">Add to Cart</button>
                            <button class="wishlist-btn"><i class="far fa-heart"></i></button>
                            <button class="compare-btn"><i class="fas fa-sync-alt"></i></button>
                        </div>
                        <div class="product-info-extra">
                            <p><strong>SKU:</strong> ${category.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 10000)}</p>
                            <p><strong>Categories:</strong> ${category}, Fashion</p>
                            <p><strong>Tags:</strong> Trendy, ${category}, Style</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Set up close functionality
        const closeBtn = modal.querySelector('.quick-view-close');
        const overlay = modal.querySelector('.quick-view-overlay');

        [closeBtn, overlay].forEach(el => {
            el.addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                    document.body.style.overflow = '';
                }, 300);
            });
        });

        // Set up quantity buttons
        const minusBtn = modal.querySelector('.qty-btn.minus');
        const plusBtn = modal.querySelector('.qty-btn.plus');
        const qtyInput = modal.querySelector('.qty-input');

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value);
            if (currentValue > 1) {
                qtyInput.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(qtyInput.value);
            qtyInput.value = currentValue + 1;
        });

        // Set up add to cart functionality in the modal
        const addToCartBtn = modal.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(qtyInput.value);

            // Find if product is already in cart
            const existingProductIndex = cart.findIndex(item => item.title === title);

            if (existingProductIndex !== -1) {
                // Increase quantity if product already in cart
                cart[existingProductIndex].quantity += quantity;
            } else {
                // Add new product to cart
                cart.push({
                    title,
                    price,
                    img,
                    category,
                    quantity
                });
            }

            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Update cart icon
            updateCartCount();

            // Show added to cart notification
            if (typeof showNotification === 'function') {
                showNotification(`${title} added to cart!`);
            }

            // Close modal
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        });

        // Set up other buttons (wishlist, compare)
        const wishlistBtn = modal.querySelector('.wishlist-btn');
        wishlistBtn.addEventListener('click', () => {
            toggleWishlist(productCard);
        });

        const compareBtn = modal.querySelector('.compare-btn');
        compareBtn.addEventListener('click', () => {
            toggleCompare(productCard);
        });

        // Set up size and color options
        const sizeOptions = modal.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', function () {
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });

        const colorOptions = modal.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function () {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Toggle compare list
    function toggleCompare(productCard) {
        if (!productCard) return;
        
        const title = productCard.querySelector('.product-title')?.textContent;
        if (!title) return;
        
        const existingIndex = compareList.findIndex(item => item.title === title);

        if (existingIndex !== -1) {
            // Remove from compare list
            compareList.splice(existingIndex, 1);
            if (typeof showNotification === 'function') {
                showNotification(`${title} removed from compare list!`);
            }
        } else {
            // Add to compare list (limit to 4 items)
            if (compareList.length >= 4) {
                if (typeof showNotification === 'function') {
                    showNotification('Compare list is full! Remove an item first.');
                }
                return;
            }

            const price = productCard.querySelector('.current-price')?.textContent;
            const img = productCard.querySelector('.product-img')?.src;
            const category = productCard.querySelector('.product-category')?.textContent;
            const productId = productCard.querySelector('.add-to-cart')?.getAttribute('data-product-id');
            
            if (!price || !img || !category) return;

            compareList.push({
                id: productId,
                title,
                price,
                img,
                category
            });

            if (typeof showNotification === 'function') {
                showNotification(`${title} added to compare list!`);
            }
        }

        // Save compare list to localStorage
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }

    // Show mini cart
    function showMiniCart() {
        // Implementation of mini cart display
        if (cart.length === 0) {
            // If cart is empty, show message
            const miniCart = document.createElement('div');
            miniCart.className = 'mini-cart';
            miniCart.innerHTML = `
                <div class="mini-cart-header">
                    <h3>Your Cart</h3>
                    <div class="close-mini-cart"><i class="fas fa-times"></i></div>
                </div>
                <div class="mini-cart-body">
                    <p class="empty-cart-message">Your cart is empty</p>
                </div>
            `;
            document.body.appendChild(miniCart);
            
            // Add close functionality
            const closeBtn = miniCart.querySelector('.close-mini-cart');
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(miniCart);
            });
            
            return;
        }
        
        // Create mini cart with items
        const miniCart = document.createElement('div');
        miniCart.className = 'mini-cart';
        
        let cartItemsHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemPrice = parseFloat(item.price.replace('$', ''));
            const itemTotal = itemPrice * item.quantity;
            total += itemTotal;
            
            cartItemsHTML += `
                <div class="mini-cart-item">
                    <div class="item-image">
                        <img src="${item.img}" alt="${item.title}">
                    </div>
                    <div class="item-details">
                        <h4>${item.title}</h4>
                        <p>${item.quantity} x ${item.price}</p>
                    </div>
                    <div class="item-remove" data-title="${item.title}">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
            `;
        });
        
        miniCart.innerHTML = `
            <div class="mini-cart-header">
                <h3>Your Cart (${cart.length} items)</h3>
                <div class="close-mini-cart"><i class="fas fa-times"></i></div>
            </div>
            <div class="mini-cart-body">
                ${cartItemsHTML}
            </div>
            <div class="mini-cart-footer">
                <div class="mini-cart-total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="mini-cart-buttons">
                    <a href="/Cart" class="view-cart-btn">View Cart</a>
                    <a href="/Checkout" class="checkout-btn">Checkout</a>
                </div>
            </div>
        `;

        document.body.appendChild(miniCart);

        setTimeout(() => {
            miniCart.classList.add('active');
        }, 10);

        // Close mini cart
        const closeBtn = miniCart.querySelector('.mini-cart-close');
        const overlay = miniCart.querySelector('.mini-cart-overlay');

        [closeBtn, overlay].forEach(el => {
            el.addEventListener('click', () => {
                miniCart.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(miniCart);
                }, 300);
            });
        });

        // Remove item from cart
        const removeButtons = miniCart.querySelectorAll('.cart-item-remove');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const title = this.getAttribute('data-title');
                removeFromCart(title);

                // Remove item from DOM
                this.closest('.cart-item').remove();

                // Update cart count
                updateCartCount();

                // Update cart total
                updateMiniCartTotal(miniCart);

                // Update cart items count in header
                const cartHeader = miniCart.querySelector('.mini-cart-header h3');
                cartHeader.textContent = `Shopping Cart (${cart.length})`;

                // Show empty cart message if needed
                if (cart.length === 0) {
                    const cartItems = miniCart.querySelector('.mini-cart-items');
                    cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
                }
            });
        });
    }

    // Remove item from cart
    function removeFromCart(title) {
        const index = cart.findIndex(item => item.title === title);
        if (index !== -1) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            showNotification(`${title} removed from cart!`);
        }
    }

    // Update mini cart total
    function updateMiniCartTotal(miniCart) {
        const totalElement = miniCart.querySelector('.mini-cart-total span:last-child');
        const cartTotal = cart.reduce((total, item) => {
            return total + (parseFloat(item.price.replace('$', '')) * item.quantity);
        }, 0);

        totalElement.textContent = `$${cartTotal.toFixed(2)}`;
    }

    // Show notification
    function showNotification(message) {
        if (document.querySelector('.notification')) {
            document.querySelector('.notification').remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Initialize product ratings
    function initProductRatings() {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            if (!card.querySelector('.product-rating')) {
                const ratingDiv = document.createElement('div');
                ratingDiv.className = 'product-rating';

                // Random rating between 3 and 5 stars
                const rating = (Math.random() * 2 + 3).toFixed(1);
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;

                let ratingHTML = '';

                // Add full stars
                for (let i = 0; i < fullStars; i++) {
                    ratingHTML += '<i class="fas fa-star"></i>';
                }

                // Add half star if needed
                if (hasHalfStar) {
                    ratingHTML += '<i class="fas fa-star-half-alt"></i>';
                }

                // Add empty stars
                const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                for (let i = 0; i < emptyStars; i++) {
                    ratingHTML += '<i class="far fa-star"></i>';
                }

                ratingHTML += `<span class="rating-value">(${rating})</span>`;
                ratingDiv.innerHTML = ratingHTML;

                // Insert after product title
                const productTitle = card.querySelector('.product-title');
                productTitle.insertAdjacentElement('afterend', ratingDiv);
            }
        });
    }

    // Search functionality
    function initSearchFunctionality() {
        const searchToggle = document.getElementById('search-toggle');
        const searchOverlay = document.querySelector('.search-overlay');
        const searchClose = document.querySelector('.search-close');
        const searchInput = document.querySelector('.search-form input');
        const searchButton = document.querySelector('.search-form button');

        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    searchInput.focus();
                }, 300);
            });
        }

        if (searchClose) {
            searchClose.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                const searchTerm = searchInput.value.trim().toLowerCase();

                if (searchTerm) {
                    // Filter products based on search term
                    const productCards = document.querySelectorAll('.product-card');
                    let matchCount = 0;

                    productCards.forEach(card => {
                        const title = card.querySelector('.product-title').textContent.toLowerCase();
                        const category = card.querySelector('.product-category').textContent.toLowerCase();

                        if (title.includes(searchTerm) || category.includes(searchTerm)) {
                            card.style.display = 'block';
                            matchCount++;
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    // Update products found count
                    const productsFound = document.querySelector('.products-found');
                    if (productsFound) {
                        productsFound.textContent = `Showing ${matchCount} results for "${searchTerm}"`;
                    }

                    // Close search overlay
                    searchOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // Handle "Out of Stock" products
    function handleOutOfStock() {
        // For demo purposes, randomly mark some products as out of stock
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach((card, index) => {
            // Mark every 5th product as out of stock (just for demo)
            if (index % 5 === 4) {
                const imgContainer = card.querySelector('.product-img-container');
                const addToCartBtn = card.querySelector('.add-to-cart');

                // Add out of stock overlay
                const outOfStockOverlay = document.createElement('div');
                outOfStockOverlay.className = 'out-of-stock-overlay';
                outOfStockOverlay.textContent = 'Out of Stock';
                imgContainer.appendChild(outOfStockOverlay);

                // Update add to cart button
                addToCartBtn.textContent = 'Out of Stock';
                addToCartBtn.classList.add('disabled');
                addToCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showNotification('Sorry, this product is currently out of stock.');
                });
            }
        });
    }



    // Call new functions
    initProductRatings();
    initSearchFunctionality();
    handleOutOfStock();

    // Additional initialization for new features can be added here

});
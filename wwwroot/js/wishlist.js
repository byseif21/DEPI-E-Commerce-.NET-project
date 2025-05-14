document.addEventListener('DOMContentLoaded', function() {
    // Initialize wishlist from localStorage if user is not logged in
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isLoggedIn = document.body.classList.contains('logged-in');
    
    // Sync wishlist with server if user is logged in
    if (isLoggedIn && wishlist.length > 0) {
        syncWishlistWithServer(wishlist);
    }
    
    // Add event listeners to wishlist buttons on product pages
    const wishlistBtns = document.querySelectorAll('.wishlist-btn, .product-action .fa-heart');
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productId = productCard ? productCard.dataset.productId : this.dataset.productId;
            
            if (!productId) return;
            
            if (isLoggedIn) {
                // Send to server
                addToWishlistServer(productId);
            } else {
                // Store in localStorage
                toggleWishlistLocal(productId, productCard);
            }
        });
    });
    
    // Function to add item to wishlist on server
    async function addToWishlistServer(productId) {
        try {
            const response = await fetch('/Home/AddToWishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ productId: parseInt(productId) })
            });
            
            const result = await response.json();
            
            if (result.success) {
                if (result.useLocalStorage) {
                    // Server indicated we should use localStorage (user not authenticated)
                    toggleWishlistLocal(productId);
                } else {
                    showNotification(result.message || 'Item added to wishlist');
                }
            } else {
                showNotification(result.message || 'Failed to add item to wishlist');
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            showNotification('Failed to add item to wishlist. Please try again.');
        }
    }
    
    // Function to toggle item in localStorage wishlist
    function toggleWishlistLocal(productId, productCard) {
        const existingIndex = wishlist.findIndex(item => item.productId === parseInt(productId));
        
        if (existingIndex !== -1) {
            // Remove from wishlist
            wishlist.splice(existingIndex, 1);
            showNotification('Item removed from wishlist');
            
            // Update UI if on wishlist page
            if (window.location.pathname.includes('/Home/Wishlist') && productCard) {
                productCard.remove();
                
                // Check if there are any items left
                if (document.querySelectorAll('.product-card').length === 0) {
                    const container = document.querySelector('.container');
                    container.innerHTML = `
                        <h2>My Wishlist</h2>
                        <p>Your wishlist is empty.</p>
                        <div class="empty-wishlist-actions">
                            <a href="/Products/Shop" class="btn btn-primary">Continue Shopping</a>
                        </div>
                    `;
                }
            }
        } else {
            // Add to wishlist
            const productName = productCard ? 
                productCard.querySelector('h3')?.textContent || 'Product' : 
                'Product';
                
            wishlist.push({
                productId: parseInt(productId),
                name: productName,
                addedDate: new Date().toISOString()
            });
            
            showNotification(`${productName} added to wishlist!`);
        }
        
        // Save wishlist to localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Update UI
        updateWishlistUI();
    }
    
    // Function to sync localStorage wishlist with server
    async function syncWishlistWithServer(localWishlist) {
        if (!isLoggedIn || localWishlist.length === 0) return;
        
        try {
            const productIds = localWishlist.map(item => item.productId);
            
            const response = await fetch(`/Home/SyncWishlist?${productIds.map(id => `productIds=${id}`).join('&')}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Clear localStorage wishlist after successful sync
                localStorage.removeItem('wishlist');
                wishlist = [];
            }
        } catch (error) {
            console.error('Error syncing wishlist with server:', error);
        }
    }
    
    // Function to update wishlist UI
    function updateWishlistUI() {
        // Update wishlist count if element exists
        const wishlistCount = document.querySelector('.wishlist-count');
        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
        
        // Update wishlist button states
        wishlistBtns.forEach(btn => {
            const productCard = btn.closest('.product-card');
            const productId = productCard ? productCard.dataset.productId : btn.dataset.productId;
            
            if (!productId) return;
            
            const inWishlist = wishlist.some(item => item.productId === parseInt(productId));
            
            if (inWishlist) {
                btn.classList.add('in-wishlist');
                if (btn.tagName === 'I') {
                    btn.classList.remove('far');
                    btn.classList.add('fas');
                }
            } else {
                btn.classList.remove('in-wishlist');
                if (btn.tagName === 'I') {
                    btn.classList.remove('fas');
                    btn.classList.add('far');
                }
            }
        });
    }
    
    // Helper function to show notifications
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Initialize UI
    updateWishlistUI();
});
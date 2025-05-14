document.addEventListener('DOMContentLoaded', function () {
    // Get cart icon elements
    const cartIcons = document.querySelectorAll('.cart-icon a');
    
    // Add click event to cart icons
    cartIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent navigation to cart page
            showMiniCart();
        });
    });
    
    // Show mini cart function
    function showMiniCart() {
        // If mini-cart already exists, don't create another one
        if (document.querySelector('.mini-cart')) return;
        
        // Create mini-cart element
        const miniCart = document.createElement('div');
        miniCart.className = 'mini-cart';
        
        // Fetch cart data from server
        fetch('/Cart/GetCartItems')
            .then(response => response.json())
            .then(data => {
                let cartItemsHTML = '';
                let cartTotal = 0;
                
                if (data.items.length === 0) {
                    cartItemsHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
                } else {
                    data.items.forEach(item => {
                        const itemTotal = item.price * item.quantity;
                        cartTotal += itemTotal;
                        
                        cartItemsHTML += `
                            <div class="cart-item">
                                <div class="cart-item-img">
                                    <img src="${item.imageUrl}" alt="${item.name}">
                                </div>
                                <div class="cart-item-info">
                                    <h4 class="cart-item-title">${item.name}</h4>
                                    <div class="cart-item-price">${item.quantity} × $${item.price.toFixed(2)}</div>
                                </div>
                                <div class="cart-item-remove" data-id="${item.id}">
                                    <i class="fas fa-times"></i>
                                </div>
                            </div>
                        `;
                    });
                }
                
                miniCart.innerHTML = `
                    <div class="mini-cart-overlay"></div>
                    <div class="mini-cart-content">
                        <div class="mini-cart-header">
                            <h3>Shopping Cart (${data.items.length})</h3>
                            <div class="mini-cart-close"><i class="fas fa-times"></i></div>
                        </div>
                        <div class="mini-cart-items">
                            ${cartItemsHTML}
                        </div>
                        <div class="mini-cart-footer">
                            <div class="mini-cart-total">
                                <span>Total:</span>
                                <span>$${cartTotal.toFixed(2)}</span>
                            </div>
                            <div class="mini-cart-buttons">
                                <a href="/Cart" class="view-cart-btn">View Cart</a>
                                <a href="/Checkout" class="checkout-btn">Checkout</a>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(miniCart);
                
                // Add active class after a small delay for animation
                setTimeout(() => {
                    miniCart.classList.add('active');
                }, 10);
                
                // Setup close functionality
                setupMiniCartClose(miniCart);
                
                // Setup remove item functionality
                setupRemoveItemFunctionality(miniCart);
            })
            .catch(error => {
                console.error('Error fetching cart data:', error);
                showNotification('Failed to load cart. Please try again.');
            });
    }
    
    // Setup mini cart close functionality
    function setupMiniCartClose(miniCart) {
        const closeBtn = miniCart.querySelector('.mini-cart-close');
        const overlay = miniCart.querySelector('.mini-cart-overlay');
        
        [closeBtn, overlay].forEach(el => {
            el.addEventListener('click', () => {
                miniCart.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(miniCart);
                }, 300); // CSS transition time
            });
        });
    }
    
    // Setup remove item functionality
    function setupRemoveItemFunctionality(miniCart) {
        const removeButtons = miniCart.querySelectorAll('.cart-item-remove');
        
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                removeFromCart(itemId, this.closest('.cart-item'), miniCart);
            });
        });
    }
    
    // Remove item from cart
    function removeFromCart(itemId, cartItemElement, miniCart) {
        fetch(`/Cart/RemoveFromCart?cartItemId=${itemId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (response.ok) {
                // Remove item from DOM
                cartItemElement.remove();
                
                // Update cart count in header
                updateCartCount();
                
                // Show notification
                showNotification('Item removed from cart!');
                
                // Check if cart is empty
                const cartItems = miniCart.querySelectorAll('.cart-item');
                if (cartItems.length === 0) {
                    const cartItemsContainer = miniCart.querySelector('.mini-cart-items');
                    cartItemsContainer.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
                    
                    // Update cart header
                    const cartHeader = miniCart.querySelector('.mini-cart-header h3');
                    cartHeader.textContent = 'Shopping Cart (0)';
                    
                    // Update cart total
                    const totalElement = miniCart.querySelector('.mini-cart-total span:last-child');
                    totalElement.textContent = '$0.00';
                } else {
                    // Update cart total
                    updateMiniCartTotal(miniCart);
                    
                    // Update cart header
                    const cartHeader = miniCart.querySelector('.mini-cart-header h3');
                    cartHeader.textContent = `Shopping Cart (${cartItems.length})`;
                }
            } else {
                showNotification('Failed to remove item. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error removing item:', error);
            showNotification('Failed to remove item. Please try again.');
        });
    }
    
    // Update cart count in header
    function updateCartCount() {
        fetch('/Cart/GetCartCount')
            .then(response => response.json())
            .then(data => {
                const cartCountElements = document.querySelectorAll('.cart-count');
                cartCountElements.forEach(el => {
                    el.textContent = data.count;
                });
            })
            .catch(error => {
                console.error('Error updating cart count:', error);
            });
    }
    
    // Update mini cart total
    function updateMiniCartTotal(miniCart) {
        fetch('/Cart/GetCartTotal')
            .then(response => response.json())
            .then(data => {
                const totalElement = miniCart.querySelector('.mini-cart-total span:last-child');
                totalElement.textContent = `$${data.total.toFixed(2)}`;
            })
            .catch(error => {
                console.error('Error updating cart total:', error);
            });
    }
    
    // Show notification
    function showNotification(message) {
        // Remove existing notification if any
        if (document.querySelector('.notification')) {
            document.querySelector('.notification').remove();
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
});
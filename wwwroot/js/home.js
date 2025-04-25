// Navigation and Header Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Header scroll effect
    const header = document.querySelector('header');
    const headerContainer = document.querySelector('.header-container');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
            headerContainer.style.height = '60px';
        } else {
            header.classList.remove('scrolled');
            headerContainer.style.height = '80px';
        }
    });

    // Search overlay functionality
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');

    if (searchToggle && searchOverlay && searchClose) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const searchInput = document.querySelector('.search-form input');
                if (searchInput) searchInput.focus();
            }, 300);
        });

        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileClose = document.querySelector('.mobile-close');
    const mobileNavToggles = document.querySelectorAll('.mobile-nav-toggle');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (mobileNavToggles.length > 0) {
        mobileNavToggles.forEach(toggle => {
            toggle.addEventListener('click', function (e) {
                // Prevent default if it's a toggle element (chevron)
                if (e.target.tagName === 'I' || e.target === this) {
                    e.preventDefault();
                }

                const subnav = this.parentElement.querySelector('.mobile-submenu');
                if (subnav) {
                    this.querySelector('i').classList.toggle('fa-chevron-down');
                    this.querySelector('i').classList.toggle('fa-chevron-up');
                    subnav.classList.toggle('active');
                }
            });
        });
    }

    // Close mobile menu and search overlay on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            const mobileMenuResized = document.querySelector('.mobile-menu');
            if (mobileMenuResized && mobileMenuResized.classList.contains('active')) {
                mobileMenuResized.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (event) {
        if (searchOverlay && searchOverlay.classList.contains('active') &&
            !event.target.closest('.search-overlay') &&
            !event.target.closest('#search-toggle')) {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Escape key functionality
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            if (searchOverlay && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            const mobileMenuEsc = document.querySelector('.mobile-menu');
            if (mobileMenuEsc && mobileMenuEsc.classList.contains('active')) {
                mobileMenuEsc.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Hero Slider
    const sliderDots = document.querySelectorAll('.slider-dot');
    const heroSlider = document.querySelector('.hero-slider');

    if (heroSlider && sliderDots.length > 0) {
        sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                heroSlider.style.transform = `translateX(-${index * 100}%)`;
                sliderDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });

        // Auto slide functionality
        let currentSlide = 0;
        const slideCount = document.querySelectorAll('.hero-slide').length;

        function autoSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            heroSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
            sliderDots.forEach(d => d.classList.remove('active'));
            sliderDots[currentSlide].classList.add('active');
        }

        let slideInterval = setInterval(autoSlide, 5000);

        // Pause auto slide on hover
        heroSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        heroSlider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(autoSlide, 5000);
        });
    }

    // Testimonial Slider
    const testimonialSlides = document.querySelector('.testimonial-slides');
    const prevArrow = document.querySelector('.prev');
    const nextArrow = document.querySelector('.next');

    if (testimonialSlides && prevArrow && nextArrow) {
        let currentTestimonial = 0;
        const testimonialCount = document.querySelectorAll('.testimonial-slide').length;

        prevArrow.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial - 1 + testimonialCount) % testimonialCount;
            testimonialSlides.style.transform = `translateX(-${currentTestimonial * 100}%)`;
        });

        nextArrow.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial + 1) % testimonialCount;
            testimonialSlides.style.transform = `translateX(-${currentTestimonial * 100}%)`;
        });

        // Auto slide for testimonials
        function autoSlideTestimonial() {
            currentTestimonial = (currentTestimonial + 1) % testimonialCount;
            testimonialSlides.style.transform = `translateX(-${currentTestimonial * 100}%)`;
        }

        let testimonialInterval = setInterval(autoSlideTestimonial, 6000);

        // Pause on hover
        testimonialSlides.addEventListener('mouseenter', () => {
            clearInterval(testimonialInterval);
        });

        testimonialSlides.addEventListener('mouseleave', () => {
            testimonialInterval = setInterval(autoSlideTestimonial, 6000);
        });
    }

    // Product Quick View
    const quickViewButtons = document.querySelectorAll('.quick-view-btn');
    const quickViewModal = document.querySelector('.quick-view-modal');
    const quickViewClose = document.querySelector('.quick-view-close');

    if (quickViewButtons.length > 0 && quickViewModal) {
        quickViewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                quickViewModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        if (quickViewClose) {
            quickViewClose.addEventListener('click', () => {
                quickViewModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close modal on outside click
        quickViewModal.addEventListener('click', (e) => {
            if (e.target === quickViewModal) {
                quickViewModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Product Image Gallery
    const mainImage = document.querySelector('.product-main-image img');
    const thumbnails = document.querySelectorAll('.product-thumbnail');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function () {
                const imgSrc = this.getAttribute('data-src');
                if (imgSrc) mainImage.src = imgSrc;
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Product Quantity Control
    const quantityMinus = document.querySelector('.quantity-minus');
    const quantityPlus = document.querySelector('.quantity-plus');
    const quantityInput = document.querySelector('.quantity-input');

    if (quantityMinus && quantityPlus && quantityInput) {
        quantityMinus.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        quantityPlus.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            quantityInput.value = value + 1;
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (value < 1 || isNaN(value)) {
                quantityInput.value = 1;
            }
        });
    }

    // Product Color and Size Selection
    const colorOptions = document.querySelectorAll('.color-option');
    const sizeOptions = document.querySelectorAll('.size-option');

    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function () {
                colorOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }

    if (sizeOptions.length > 0) {
        sizeOptions.forEach(option => {
            option.addEventListener('click', function () {
                sizeOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }

    // Product Tabs
    const tabButtons = document.querySelectorAll('.product-tab-btn');
    const tabContents = document.querySelectorAll('.product-tab-content');

    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach((button, index) => {
            button.addEventListener('click', function () {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                this.classList.add('active');
                if (tabContents[index]) {
                    tabContents[index].classList.add('active');
                }
            });
        });
    }

    // Newsletter Popup
    const newsletterPopup = document.querySelector('.newsletter-popup');
    const newsletterClose = document.querySelector('.newsletter-close');

    if (newsletterPopup) {
        // Show popup after 5 seconds
        if (!localStorage.getItem('newsletterShown')) {
            setTimeout(() => {
                newsletterPopup.classList.add('active');
            }, 5000);
        }

        if (newsletterClose) {
            newsletterClose.addEventListener('click', () => {
                newsletterPopup.classList.remove('active');
                localStorage.setItem('newsletterShown', 'true');
            });
        }
    }

    // Add to Cart Animation
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartIcon = document.querySelector('.cart-icon');

    if (addToCartButtons.length > 0 && cartIcon) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();

                // Update cart count
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    let count = parseInt(cartCount.textContent);
                    cartCount.textContent = count + 1;

                    // Animation
                    cartIcon.classList.add('pulse');
                    setTimeout(() => {
                        cartIcon.classList.remove('pulse');
                    }, 500);
                }

                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'add-to-cart-success';
                successMessage.textContent = 'Added to cart!';
                document.body.appendChild(successMessage);

                setTimeout(() => {
                    successMessage.classList.add('show');
                }, 100);

                setTimeout(() => {
                    successMessage.classList.remove('show');
                    setTimeout(() => {
                        document.body.removeChild(successMessage);
                    }, 300);
                }, 2000);
            });
        });
    }

    // Back to Top Button
    const backToTopBtn = document.querySelector('.back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Lazy Load Images
    const lazyImages = document.querySelectorAll('img.lazy');

    if (lazyImages.length > 0) {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        if (image.dataset.src) {
                            image.src = image.dataset.src;
                            image.classList.remove('lazy');
                            imageObserver.unobserve(image);
                        }
                    }
                });
            });

            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            let lazyLoadThrottleTimeout;

            function lazyLoad() {
                if (lazyLoadThrottleTimeout) {
                    clearTimeout(lazyLoadThrottleTimeout);
                }

                lazyLoadThrottleTimeout = setTimeout(() => {
                    const scrollTop = window.scrollY;

                    lazyImages.forEach(img => {
                        if (img.offsetTop < (window.innerHeight + scrollTop)) {
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.classList.remove('lazy');
                            }
                        }
                    });

                    if (document.querySelectorAll('img.lazy').length === 0) {
                        document.removeEventListener('scroll', lazyLoad);
                        window.removeEventListener('resize', lazyLoad);
                        window.removeEventListener('orientationChange', lazyLoad);
                    }
                }, 20);
            }

            document.addEventListener('scroll', lazyLoad);
            window.addEventListener('resize', lazyLoad);
            window.addEventListener('orientationChange', lazyLoad);

            // Initial load
            lazyLoad();
        }
    }
});
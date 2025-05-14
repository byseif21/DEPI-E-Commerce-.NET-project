document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.styleza-loader-container');
    
    // Initially hide loader to prevent it from showing when not needed
    hideLoader();
    
    // Show loader on initial page load
    if (document.readyState !== 'complete') {
        showLoader();
    }
    
    // Hide loader when page is fully loaded
    window.addEventListener('load', function() {
        hideLoader();
    });
    
    // Show loader before unload (when navigating to another page)
    window.addEventListener('beforeunload', function() {
        showLoader();
    });
    
    // Handle AJAX requests in ASP.NET MVC
    $(document).ready(function() {
        // Show loader for all AJAX requests
        $(document).ajaxStart(function() {
            showLoader();
        });
        
        $(document).ajaxStop(function() {
            hideLoader();
        });
        
        // For non-jQuery AJAX requests
        const originalXHR = window.XMLHttpRequest;
        let activeRequests = 0;
        
        function newXHR() {
            const xhr = new originalXHR();
            
            xhr.addEventListener('loadstart', function() {
                activeRequests++;
                showLoader();
            });
            
            xhr.addEventListener('loadend', function() {
                activeRequests--;
                if (activeRequests === 0) {
                    hideLoader();
                }
            });
            
            return xhr;
        }
        
        window.XMLHttpRequest = newXHR;
    });
    
    // Intercept form submissions
    document.addEventListener('submit', function(e) {
        // Don't show loader for forms with data-no-loader attribute
        if (!e.target.hasAttribute('data-no-loader')) {
            showLoader();
        }
    });
    
    // Intercept link clicks for page navigation
    document.addEventListener('click', function(e) {
        // Check if the clicked element is a link that navigates to a new page
        const link = e.target.closest('a');
        if (link && link.href && !link.hasAttribute('data-no-loader') && 
            !link.target && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            // Only show loader for links to the same origin
            const url = new URL(link.href);
            if (url.origin === window.location.origin) {
                showLoader();
            }
        }
    });
    
    // Helper functions
    function showLoader() {
        if (loader) {
            loader.classList.remove('hidden');
        }
    }
    
    function hideLoader() {
        if (loader) {
            loader.classList.add('hidden');
        }
    }
});
/**
 * Styleza Global Loader Module
 * Explicitly exposes window.showLoader and window.hideLoader
 */
(function() {
    console.log('[Styleza Loader] Module Loading...');

    // Core loader display elements
    const getLoader = () => document.querySelector('.styleza-loader-container');
    
    // Safety check: Create loader if it doesn't exist (fallback)
    function ensureLoader() {
        if (getLoader()) return getLoader();
        
        console.warn('[Styleza Loader] Loader element not found, creating dynamic fallback');
        const l = document.createElement('div');
        l.className = 'styleza-loader-container';
        l.innerHTML = '<div class="styleza-loader"><div class="loader-circle"></div></div>';
        document.body.appendChild(l);
        return l;
    }

    // Export show function
    window.showLoader = function(reason = 'unknown') {
        console.log('[Styleza Loader] Showing. Reason:', reason);
        const l = ensureLoader();
        if (l) {
            l.classList.remove('hidden');
            l.style.display = 'flex';
            
            // Safety timeout: Never stay visible more than 5 seconds unless it's a real navigation (beforeunload)
            if (reason !== 'beforeunload_event') {
                setTimeout(() => {
                    const currentLoader = getLoader();
                    if (currentLoader && !currentLoader.classList.contains('hidden')) {
                        console.warn('[Styleza Loader] Safety timeout triggered for:', reason);
                        window.hideLoader('safety_timeout');
                    }
                }, 5000);
            }
        }
    };

    // Export hide function
    window.hideLoader = function(reason = 'unknown') {
        console.log('[Styleza Loader] Hiding. Reason:', reason);
        const l = getLoader();
        if (l) {
            l.classList.add('hidden');
            // Support both class-based and display-based hiding for maximum compatibility
            setTimeout(() => {
                if (l.classList.contains('hidden')) {
                    l.style.display = 'none';
                }
            }, 300);
        }
    };

    // Initialize click listeners - ONLY for actual page navigations
    function initListeners() {
        console.log('[Styleza Loader] Initializing listeners...');
        
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            
            // Ignore if not a link or has no href
            if (!link || !link.href) return;

            // IGNORE if the event was already handled/prevented by another script (e.g., client-side tabs, modal triggers)
            if (e.defaultPrevented) return;

            // Ignore modifier-key navigation (opens in new tab/window, doesn't navigate current page)
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
            
            const href = link.getAttribute('href');
            
            // IGNORE MOCK LINKS, non-HTTP schemes (mailto:, tel:, etc.) and same-page links
            if (!href || 
                href === '#' || 
                href.startsWith('#') || 
                href.startsWith('javascript:') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                link.classList.contains('no-loader') ||
                link.getAttribute('target') === '_blank') {
                return;
            }

            // If we reached here, it's a real navigation
            window.showLoader('link_navigation');
        });

        // Hide loader when page is restored from cache (back button)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                window.hideLoader('pageshow_persisted');
            }
        });

        // Fallback hide on window load
        window.addEventListener('load', () => window.hideLoader('window_load'));
        
        // Final safety: hide after a delay if still showing
        setTimeout(() => window.hideLoader('initial_init'), 1000);
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initListeners);
    } else {
        initListeners();
    }

    // Also catch form submissions
    document.addEventListener('submit', (e) => {
        if (e.defaultPrevented) return;
        
        if (!e.target.classList.contains('no-loader')) {
            window.showLoader('form_submission');
        }
    });

})();
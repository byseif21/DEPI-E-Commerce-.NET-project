/**
 * Styleza Error Handler Module
 * Provides consistent error handling for AJAX requests and form submissions
 */

const StylezaErrorHandler = {
    /**
     * Handle AJAX errors consistently
     * @param {Object} xhr - The XMLHttpRequest object
     * @param {string} status - The error status
     * @param {string} error - The error message
     * @param {HTMLElement} container - Optional container to display errors in
     */
    handleAjaxError: function(xhr, status, error, container) {
        console.error('AJAX Error:', status, error);
        
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        // Try to parse the response for more specific error messages
        if (xhr.responseJSON) {
            if (xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            }
            
            // Handle validation errors
            if (xhr.responseJSON.errors) {
                const errors = xhr.responseJSON.errors;
                if (typeof errors === 'object') {
                    // If we have a form, display field-specific errors
                    if (container && container.tagName === 'FORM') {
                        StylezaValidation.displayServerErrors(errors, container);
                        return;
                    }
                    
                    // Otherwise, build an error message list
                    errorMessage = 'Please correct the following errors:';
                    const errorList = document.createElement('ul');
                    
                    for (const field in errors) {
                        const li = document.createElement('li');
                        li.textContent = errors[field];
                        errorList.appendChild(li);
                    }
                    
                    if (container) {
                        this.showErrorInContainer(errorMessage, container, errorList);
                        return;
                    }
                }
            }
        }
        
        // Display the error message
        if (container) {
            this.showErrorInContainer(errorMessage, container);
        } else {
            this.showErrorNotification(errorMessage);
        }
    },
    
    /**
     * Show an error message in a specified container
     * @param {string} message - The error message
     * @param {HTMLElement} container - The container to display the error in
     * @param {HTMLElement} additionalContent - Optional additional content to append
     */
    showErrorInContainer: function(message, container, additionalContent) {
        // Create error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mb-3';
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-circle me-2';
        alertDiv.appendChild(icon);
        
        // Add message
        const messageText = document.createTextNode(message);
        alertDiv.appendChild(messageText);
        
        // Add additional content if provided
        if (additionalContent) {
            alertDiv.appendChild(document.createElement('br'));
            alertDiv.appendChild(additionalContent);
        }
        
        // Clear previous errors and add the new one
        const existingAlerts = container.querySelectorAll('.alert-danger');
        existingAlerts.forEach(alert => alert.remove());
        
        // Insert at the beginning of the container
        if (container.firstChild) {
            container.insertBefore(alertDiv, container.firstChild);
        } else {
            container.appendChild(alertDiv);
        }
        
        // Scroll to the error
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    
    /**
     * Show an error notification that disappears after a few seconds
     * @param {string} message - The error message
     */
    showErrorNotification: function(message) {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-circle';
        notification.appendChild(icon);
        
        // Add message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'notification-message';
        messageDiv.textContent = message;
        notification.appendChild(messageDiv);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
        notification.appendChild(closeBtn);
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            notification.classList.add('notification-hiding');
            setTimeout(function() {
                notification.remove();
            }, 500);
        }, 5000);
    }
};

// Add global AJAX error handler if jQuery is available
document.addEventListener('DOMContentLoaded', function() {
    if (window.jQuery) {
        jQuery(document).ajaxError(function(event, xhr, settings, error) {
            StylezaErrorHandler.handleAjaxError(xhr, xhr.status, error);
        });
    }
});
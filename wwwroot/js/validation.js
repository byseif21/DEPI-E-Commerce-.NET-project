/**
 * Styleza Form Validation Module
 * Provides consistent client-side validation for all forms in the application
 */

const StylezaValidation = {
    /**
     * Initialize form validation for a specific form
     * @param {string} formSelector - The CSS selector for the form
     * @param {Object} rules - Validation rules object
     * @param {Function} onSuccess - Callback function to execute on successful validation
     */
    initFormValidation: function(formSelector, rules, onSuccess) {
        const form = document.querySelector(formSelector);
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            const isValid = StylezaValidation.validateForm(form, rules);
            
            if (!isValid) {
                e.preventDefault();
                return false;
            }
            
            if (typeof onSuccess === 'function') {
                onSuccess(form);
            }
            
            return true;
        });
    },
    
    /**
     * Validate a form based on provided rules
     * @param {HTMLElement} form - The form element to validate
     * @param {Object} rules - Validation rules object
     * @returns {boolean} - Whether the form is valid
     */
    validateForm: function(form, rules) {
        let isValid = true;
        
        // Reset previous validation states
        const errorElements = form.querySelectorAll('.is-invalid');
        errorElements.forEach(el => el.classList.remove('is-invalid'));
        
        const errorMessages = form.querySelectorAll('[data-valmsg-for]');
        errorMessages.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        // Apply validation rules
        for (const fieldName in rules) {
            const fieldRules = rules[fieldName];
            const field = form.querySelector(`#${fieldName}`);
            
            if (!field) continue;
            
            const errorElement = form.querySelector(`[data-valmsg-for='${fieldName}']`);
            const value = field.value;
            
            // Apply each rule for the field
            for (const ruleName in fieldRules) {
                const ruleValue = fieldRules[ruleName];
                const errorMessage = typeof ruleValue === 'object' ? ruleValue.message : '';
                
                let isFieldValid = true;
                
                switch (ruleName) {
                    case 'required':
                        isFieldValid = value && value.trim() !== '';
                        break;
                    case 'min':
                        isFieldValid = parseFloat(value) >= ruleValue.value;
                        break;
                    case 'max':
                        isFieldValid = parseFloat(value) <= ruleValue.value;
                        break;
                    case 'email':
                        isFieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                        break;
                    case 'pattern':
                        isFieldValid = new RegExp(ruleValue.pattern).test(value);
                        break;
                    case 'custom':
                        if (typeof ruleValue.validator === 'function') {
                            isFieldValid = ruleValue.validator(value, field, form);
                        }
                        break;
                }
                
                if (!isFieldValid) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    
                    if (errorElement) {
                        errorElement.textContent = errorMessage;
                        errorElement.style.display = 'block';
                    }
                    
                    break; // Stop checking other rules for this field once one fails
                }
            }
        }
        
        return isValid;
    },
    
    /**
     * Common validation rules for product forms
     * @returns {Object} - Validation rules for product forms
     */
    getProductValidationRules: function() {
        return {
            'Name': {
                required: {
                    message: 'Product name is required'
                }
            },
            'Price': {
                required: {
                    message: 'Price is required'
                },
                min: {
                    value: 0.01,
                    message: 'Price must be greater than 0'
                }
            },
            'CategoryId': {
                required: {
                    message: 'Please select a category'
                }
            },
            'StockQuantity': {
                required: {
                    message: 'Stock quantity is required'
                },
                min: {
                    value: 0,
                    message: 'Stock quantity cannot be negative'
                }
            }
        };
    },
    
    /**
     * Common validation rules for category forms
     * @returns {Object} - Validation rules for category forms
     */
    getCategoryValidationRules: function() {
        return {
            'Name': {
                required: {
                    message: 'Category name is required'
                }
            }
        };
    },
    
    /**
     * Display server-side validation errors
     * @param {Object} errors - Error object from server
     * @param {HTMLElement} form - The form element
     */
    displayServerErrors: function(errors, form) {
        if (!errors || !form) return;
        
        for (const fieldName in errors) {
            const field = form.querySelector(`#${fieldName}`);
            const errorElement = form.querySelector(`[data-valmsg-for='${fieldName}']`);
            
            if (field && errorElement) {
                field.classList.add('is-invalid');
                errorElement.textContent = errors[fieldName];
                errorElement.style.display = 'block';
            }
        }
    }
};

// Initialize validation for product forms
document.addEventListener('DOMContentLoaded', function() {
    // Product form validation
    if (document.querySelector('form[action*="CreateProduct"]') || 
        document.querySelector('form[action*="EditProduct"]')) {
        
        StylezaValidation.initFormValidation(
            'form', 
            StylezaValidation.getProductValidationRules()
        );
    }
    
    // Category form validation
    if (document.querySelector('form[action*="CreateCategory"]') || 
        document.querySelector('form[action*="EditCategory"]')) {
        
        StylezaValidation.initFormValidation(
            'form', 
            StylezaValidation.getCategoryValidationRules()
        );
    }
});
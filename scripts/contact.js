// Contact page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    const checkboxes = document.querySelectorAll('.checkbox');
    
    // Handle URL parameters for pre-selecting form options
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('type');
    
    if (formType) {
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
            // Map URL parameter to form values
            const typeMapping = {
                'membership': 'membership',
                'partnership': 'partnership',
                'speaking': 'speaking',
                'collaboration': 'collaboration',
                'media': 'media'
            };
            
            if (typeMapping[formType]) {
                subjectSelect.value = typeMapping[formType];
            }
        }
    }
    
    // Form validation
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Validate based on field type
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'text':
                if (field.hasAttribute('required') && value.length < 2) {
                    isValid = false;
                    errorMessage = 'This field must be at least 2 characters long';
                }
                break;
                
            case 'textarea':
                if (field.hasAttribute('required') && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please provide a more detailed message (at least 10 characters)';
                }
                break;
                
            default:
                if (field.hasAttribute('required') && value === '') {
                    isValid = false;
                    errorMessage = 'This field is required';
                }
        }
        
        // Show error message if validation failed
        if (!isValid) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            field.parentNode.appendChild(errorDiv);
        }
        
        return isValid;
    }
    
    // Add real-time validation and touched state handling
    formInputs.forEach(input => {
        // Mark field as touched when user interacts with it
        input.addEventListener('blur', function() {
            this.classList.add('touched');
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Mark as touched on first input
            this.classList.add('touched');
            
            // Remove error styling on input
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
        
        // Also mark as touched on focus for better UX
        input.addEventListener('focus', function() {
            // Only add touched class if field has some content
            if (this.value.trim() !== '') {
                this.classList.add('touched');
            }
        });
    });
    
    // Handle checkbox interactions
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Add visual feedback for checkbox state
            const checkmark = this.nextElementSibling;
            if (this.checked) {
                checkmark.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    checkmark.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            let isFormValid = true;
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });
            
            // Check required checkboxes
            const privacyCheckbox = document.getElementById('privacy');
            if (!privacyCheckbox.checked) {
                isFormValid = false;
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'You must agree to the Privacy Policy';
                errorDiv.style.display = 'block';
                privacyCheckbox.closest('.form-group').appendChild(errorDiv);
            }
            
            if (isFormValid) {
                // Show loading state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                // Simulate form submission (replace with actual submission logic)
                setTimeout(() => {
                    // Show success message
                    const successDiv = document.createElement('div');
                    successDiv.className = 'success-message';
                    successDiv.textContent = 'Thank you for your message! We\'ll get back to you within 48 hours.';
                    successDiv.style.display = 'block';
                    
                    contactForm.insertBefore(successDiv, contactForm.firstChild);
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Reset button
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    
                    // Scroll to success message
                    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Hide success message after 10 seconds
                    setTimeout(() => {
                        successDiv.style.display = 'none';
                    }, 10000);
                    
                }, 2000);
            } else {
                // Scroll to first error
                const firstError = contactForm.querySelector('.error-message');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
    
    // FAQ interaction
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add visual feedback for FAQ interaction
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
    
    // Auto-resize textarea
    const textareas = document.querySelectorAll('.form-textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
    
    // Character counter for message field
    const messageField = document.getElementById('message');
    if (messageField) {
        const maxLength = 1000;
        
        // Create character counter
        const counterDiv = document.createElement('div');
        counterDiv.className = 'character-counter';
        counterDiv.style.textAlign = 'right';
        counterDiv.style.fontSize = '0.875rem';
        counterDiv.style.color = 'var(--text-light)';
        counterDiv.style.marginTop = 'var(--spacing-xs)';
        
        messageField.parentNode.appendChild(counterDiv);
        
        function updateCounter() {
            const remaining = maxLength - messageField.value.length;
            counterDiv.textContent = `${remaining} characters remaining`;
            
            if (remaining < 50) {
                counterDiv.style.color = '#e74c3c';
            } else if (remaining < 200) {
                counterDiv.style.color = 'var(--accent-gold)';
            } else {
                counterDiv.style.color = 'var(--text-light)';
            }
        }
        
        messageField.addEventListener('input', updateCounter);
        messageField.setAttribute('maxlength', maxLength);
        updateCounter(); // Initial call
    }
}); 
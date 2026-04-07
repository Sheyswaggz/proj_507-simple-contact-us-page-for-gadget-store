/**
 * Contact Form Validation and Interaction Handler
 * Provides real-time validation, sanitization, and user feedback
 */

(function() {
  'use strict';

  // DOM Elements
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const formStatus = document.getElementById('form-status');

  // Form Fields
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const subjectSelect = document.getElementById('subject');
  const messageTextarea = document.getElementById('message');
  const messageCounter = document.getElementById('message-counter');

  // Error Message Elements
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const phoneError = document.getElementById('phone-error');
  const subjectError = document.getElementById('subject-error');
  const messageError = document.getElementById('message-error');

  // Validation Patterns
  const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  const PHONE_PATTERN = /^[\d\s\-\(\)\+]+$/;

  // State
  let isSubmitting = false;

  /**
   * Initialize form handlers
   */
  function init() {
    // Scroll reveal animations
    initScrollReveal();

    // Real-time validation on input
    nameInput.addEventListener('blur', () => validateField(nameInput));
    emailInput.addEventListener('blur', () => validateField(emailInput));
    emailInput.addEventListener('input', () => validateEmailRealTime());
    phoneInput.addEventListener('blur', () => validateField(phoneInput));
    subjectSelect.addEventListener('change', () => validateField(subjectSelect));
    messageTextarea.addEventListener('blur', () => validateField(messageTextarea));

    // Character counter for message
    messageTextarea.addEventListener('input', updateCharCounter);

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Initialize character counter
    updateCharCounter();

    console.log('[Contact Form] Initialized successfully');
  }

  /**
   * Scroll-triggered reveal animations
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');

    if (!revealElements.length) return;

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation with delay
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 150);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => observer.observe(el));
  }

  /**
   * Update character counter for message field
   */
  function updateCharCounter() {
    const currentLength = messageTextarea.value.length;
    const maxLength = messageTextarea.getAttribute('maxlength') || 1000;
    messageCounter.textContent = `${currentLength} / ${maxLength}`;

    // Visual feedback when approaching limit
    if (currentLength > maxLength * 0.9) {
      messageCounter.style.color = 'var(--color-error)';
    } else if (currentLength > maxLength * 0.75) {
      messageCounter.style.color = 'var(--color-primary)';
    } else {
      messageCounter.style.color = 'var(--color-text-muted)';
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  function sanitizeInput(value) {
    if (typeof value !== 'string') return '';

    return value
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validate individual field
   */
  function validateField(field) {
    const fieldId = field.id;
    const value = sanitizeInput(field.value);
    let isValid = true;
    let errorMessage = '';

    // Reset error state
    clearFieldError(field);

    // Name validation
    if (fieldId === 'name') {
      if (!value) {
        isValid = false;
        errorMessage = 'Name is required';
      } else if (value.length < 2) {
        isValid = false;
        errorMessage = 'Name must be at least 2 characters';
      } else if (value.length > 100) {
        isValid = false;
        errorMessage = 'Name must be less than 100 characters';
      }
    }

    // Email validation
    if (fieldId === 'email') {
      if (!value) {
        isValid = false;
        errorMessage = 'Email is required';
      } else if (!EMAIL_PATTERN.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation (optional field)
    if (fieldId === 'phone' && value) {
      if (!PHONE_PATTERN.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      } else if (value.replace(/\D/g, '').length < 10) {
        isValid = false;
        errorMessage = 'Phone number must be at least 10 digits';
      }
    }

    // Subject validation
    if (fieldId === 'subject') {
      if (!value) {
        isValid = false;
        errorMessage = 'Please select a subject';
      }
    }

    // Message validation
    if (fieldId === 'message') {
      if (!value) {
        isValid = false;
        errorMessage = 'Message is required';
      } else if (value.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters';
      } else if (value.length > 1000) {
        isValid = false;
        errorMessage = 'Message must be less than 1000 characters';
      }
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    }

    return isValid;
  }

  /**
   * Real-time email validation (less strict during typing)
   */
  function validateEmailRealTime() {
    const value = emailInput.value.trim();

    if (value && value.length > 3 && !value.includes('@')) {
      showFieldError(emailInput, 'Email must contain @');
    } else {
      clearFieldError(emailInput);
    }
  }

  /**
   * Show error message for field
   */
  function showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.id}-error`);

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    field.setAttribute('aria-invalid', 'true');
    field.classList.add('error');
    field.classList.remove('success');
  }

  /**
   * Clear error message for field
   */
  function clearFieldError(field) {
    const errorElement = document.getElementById(`${field.id}-error`);

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    field.setAttribute('aria-invalid', 'false');
    field.classList.remove('error');

    // Show success state for valid filled fields
    if (field.value.trim()) {
      field.classList.add('success');
    }
  }

  /**
   * Validate entire form
   */
  function validateForm() {
    const fields = [nameInput, emailInput, phoneInput, subjectSelect, messageTextarea];
    let isValid = true;

    fields.forEach(field => {
      // Skip optional phone field if empty
      if (field.id === 'phone' && !field.value.trim()) {
        return;
      }

      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Show form status message
   */
  function showFormStatus(message, type = 'success') {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      formStatus.style.display = 'none';
    }, 5000);

    // Scroll to status message
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Set button loading state
   */
  function setLoadingState(loading) {
    isSubmitting = loading;
    submitBtn.disabled = loading;
    submitBtn.setAttribute('aria-busy', loading.toString());

    if (loading) {
      btnText.textContent = 'Sending...';
      btnLoader.style.display = 'block';
      submitBtn.classList.add('loading');
    } else {
      btnText.textContent = 'Send Message';
      btnLoader.style.display = 'none';
      submitBtn.classList.remove('loading');
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(event) {
    event.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Hide previous status messages
    formStatus.style.display = 'none';

    // Validate form
    if (!validateForm()) {
      showFormStatus('Please fix the errors above before submitting.', 'error');

      // Focus first error field
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.focus();
      }

      return;
    }

    // Set loading state
    setLoadingState(true);

    // Collect and sanitize form data
    const formData = {
      name: sanitizeInput(nameInput.value),
      email: sanitizeInput(emailInput.value),
      phone: sanitizeInput(phoneInput.value),
      subject: sanitizeInput(subjectSelect.value),
      message: sanitizeInput(messageTextarea.value),
      timestamp: new Date().toISOString()
    };

    console.log('[Contact Form] Submitting:', formData);

    try {
      // Simulate API call (replace with actual endpoint)
      await submitFormData(formData);

      // Success state
      setLoadingState(false);
      showFormStatus('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');

      // Reset form
      form.reset();
      updateCharCounter();

      // Clear success states
      [nameInput, emailInput, phoneInput, subjectSelect, messageTextarea].forEach(field => {
        field.classList.remove('success', 'error');
      });

    } catch (error) {
      console.error('[Contact Form] Submission error:', error);

      setLoadingState(false);
      showFormStatus('Sorry, there was an error sending your message. Please try again later.', 'error');
    }
  }

  /**
   * Submit form data to server
   * Replace this with actual API call
   */
  async function submitFormData(data) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Simulate successful submission (90% success rate for demo)
        if (Math.random() > 0.1) {
          resolve({ success: true, message: 'Form submitted successfully' });
        } else {
          reject(new Error('Network error'));
        }
      }, 2000);
    });

    // Actual implementation would be:
    /*
    const response = await fetch('/submit-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return await response.json();
    */
  }

  /**
   * Detect reduced motion preference
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

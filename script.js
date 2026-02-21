/**
 * Refundable Landing Page - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initCalculator();
    initFAQ();
    initScrollAnimations();
    initCounterAnimations();
    initMobileMenu();
    initSmoothScroll();
    initEmailSignup();
});

/**
 * Refund Calculator
 */
function initCalculator() {
    const amountInput = document.getElementById('tariff-amount');
    const slider = document.getElementById('tariff-slider');

    if (!amountInput || !slider) return;

    // Format number with commas
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Parse formatted number
    function parseNumber(str) {
        return parseInt(str.replace(/,/g, ''), 10) || 0;
    }

    // Calculate refund
    function calculateRefund(amount) {
        const recoveryRate = 0.85; // 85% recovery rate
        const feeRate = 0.15; // 15% fee

        const grossRefund = amount * recoveryRate;
        const fee = grossRefund * feeRate;
        const netRefund = grossRefund - fee;

        return {
            payment: amount,
            grossRefund: grossRefund,
            fee: fee,
            netRefund: netRefund
        };
    }

    // Update display
    function updateDisplay(amount) {
        const result = calculateRefund(amount);

        // Update main refund amount
        const refundEl = document.getElementById('refund-amount');
        if (refundEl) {
            animateNumber(refundEl, result.grossRefund);
        }

        // Update breakdown
        const paymentEl = document.getElementById('breakdown-payment');
        const netEl = document.getElementById('breakdown-net');
        const feeEl = document.getElementById('breakdown-fee');

        if (paymentEl) paymentEl.textContent = '$' + formatNumber(Math.round(result.payment));
        if (netEl) netEl.textContent = '$' + formatNumber(Math.round(result.netRefund));
        if (feeEl) feeEl.textContent = '$' + formatNumber(Math.round(result.fee));
    }

    // Animate number change
    function animateNumber(element, target) {
        const duration = 300;
        const start = parseNumber(element.textContent);
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * easeOut;

            element.textContent = formatNumber(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Sync input and slider
    function syncControls(value) {
        const numValue = Math.max(1000, Math.min(500000, value));
        amountInput.value = formatNumber(numValue);
        slider.value = numValue;
        updateDisplay(numValue);
    }

    // Input event
    amountInput.addEventListener('input', function(e) {
        const value = parseNumber(e.target.value);
        if (!isNaN(value)) {
            slider.value = value;
            updateDisplay(value);
        }
    });

    // Format on blur
    amountInput.addEventListener('blur', function(e) {
        const value = parseNumber(e.target.value);
        e.target.value = formatNumber(value);
    });

    // Slider event
    slider.addEventListener('input', function(e) {
        const value = parseInt(e.target.value, 10);
        amountInput.value = formatNumber(value);
        updateDisplay(value);
    });

    // Initial calculation
    updateDisplay(50000);
}

/**
 * FAQ Accordion
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation class to elements
    const animatedElements = document.querySelectorAll(
        '.step-card, .prop-card, .testimonial-card, .faq-item, .stat-item'
    );

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

/**
 * Counter Animations
 */
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length === 0) return;

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'), 10);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * easeOut);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Also animate hero card value
    const heroCardValue = document.querySelector('.card-value[data-count]');
    if (heroCardValue) {
        setTimeout(() => {
            const target = parseInt(heroCardValue.getAttribute('data-count'), 10);
            animateValue(heroCardValue, 0, target, 1500);
        }, 500);
    }

    function animateValue(element, start, end, duration) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOut);

            element.textContent = '$' + current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }
}

/**
 * Mobile Menu
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', function() {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');

        // Animate hamburger to X
        const spans = menuBtn.querySelectorAll('span');
        if (menuBtn.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
}

/**
 * Smooth Scroll for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Navbar scroll effect
 */
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

/**
 * Email Signup Form
 */
function initEmailSignup() {
    const form = document.getElementById('hero-email-form');
    
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        if (!email) {
            return;
        }

        // Disable button and show loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Show success state
            submitBtn.textContent = '✓ Submitted!';
            submitBtn.style.background = '#10b981';
            emailInput.value = '';
            
            // Reset after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }, 1000);
    });
}

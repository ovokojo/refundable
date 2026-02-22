// Authentication JavaScript

// Initialize auth pages
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    checkAuthStatus();
    prefillEmailFromURL();
});

// Initialize forms
function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Mock authentication
        if (email && password.length >= 8) {
            // Store user data
            const userData = {
                email: email,
                firstName: 'John',
                lastName: 'Doe',
                company: 'Company Inc.',
                isAuthenticated: true,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('refundable_user', JSON.stringify(userData));
            
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showToast('Invalid email or password', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 1500);
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Validate
    if (!firstName || !lastName || !email || !company || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (!terms) {
        showToast('Please agree to the Terms of Service', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Store user data
        const userData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            company: company,
            isAuthenticated: true,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('refundable_user', JSON.stringify(userData));
        
        showToast('Account created successfully!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }, 2000);
}

// Check authentication status
function checkAuthStatus() {
    const user = localStorage.getItem('refundable_user');
    const currentPage = window.location.pathname.split('/').pop();
    
    // If on auth pages and already logged in, redirect to dashboard
    if ((currentPage === 'login.html' || currentPage === 'signup.html') && user) {
        const userData = JSON.parse(user);
        if (userData.isAuthenticated) {
            window.location.href = 'index.html';
        }
    }
}

// Prefill email from URL parameter
function prefillEmailFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = emailParam;
        }
    }
}

// Logout
function logout() {
    localStorage.removeItem('refundable_user');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast active';
    
    if (type === 'success') {
        toast.classList.add('success');
    } else if (type === 'error') {
        toast.classList.add('error');
    }

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Social login handlers (mock)
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-social')) {
        const button = e.target.closest('.btn-social');
        const provider = button.textContent.trim();
        showToast(`${provider} login coming soon!`, 'info');
    }
});

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('refundable_user');
    return user ? JSON.parse(user) : null;
}

// Check if authenticated
function isAuthenticated() {
    const user = getCurrentUser();
    return user && user.isAuthenticated;
}

// Protect dashboard routes
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

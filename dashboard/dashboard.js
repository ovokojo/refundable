// Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserData();
    initializeUploadZone();
    loadDashboardData();
});

// Upload Modal Functions
function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    document.getElementById('uploadedFiles').innerHTML = '';
    document.getElementById('fileInput').value = '';
}

// Upload Zone Initialization
function initializeUploadZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Handle files
function handleFiles(files) {
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    Array.from(files).forEach(file => {
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                </svg>
                <span>${file.name}</span>
                <button class="file-remove" onclick="removeFile(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
            uploadedFiles.appendChild(fileItem);
        }
    });
}

// Remove file
function removeFile(button) {
    button.parentElement.remove();
}

// Submit invoices
function submitInvoices() {
    const uploadedFiles = document.getElementById('uploadedFiles');
    const fileItems = uploadedFiles.querySelectorAll('.file-item');
    
    if (fileItems.length === 0) {
        showToast('Please select at least one file', 'error');
        return;
    }

    // Simulate upload
    showToast(`Uploading ${fileItems.length} invoice(s)...`, 'info');
    
    setTimeout(() => {
        showToast('Invoices uploaded successfully!', 'success');
        closeUploadModal();
        addActivityItem('upload', 'Invoice uploaded', `${fileItems.length} file(s) - Processing`, 'Just now');
    }, 1500);
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

// Add activity item
function addActivityItem(icon, title, description, time) {
    const activityFeed = document.querySelector('.activity-feed');
    const newItem = document.createElement('div');
    newItem.className = 'activity-item';
    newItem.innerHTML = `
        <div class="activity-icon ${icon}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
        </div>
        <div class="activity-content">
            <strong>${title}</strong>
            <p>${description}</p>
            <span class="activity-time">${time}</span>
        </div>
    `;
    activityFeed.insertBefore(newItem, activityFeed.firstChild);
    
    // Keep only last 10 items
    const items = activityFeed.querySelectorAll('.activity-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

// Load dashboard data (mock)
function loadDashboardData() {
    // In production, this would fetch from API
    console.log('Dashboard data loaded');
}

// Load user data
function loadUserData() {
    const user = getCurrentUser();
    if (user) {
        // Update user avatar
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        const email = document.getElementById('userEmail');
        
        if (avatar) {
            const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
            avatar.textContent = initials;
        }
        
        if (name) {
            name.textContent = `${user.firstName} ${user.lastName}`;
        }
        
        if (email) {
            email.textContent = user.email;
        }
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Update stats
function updateStats(stats) {
    const statCards = document.querySelectorAll('.stat-card');
    // Update stat cards with new data
    console.log('Stats updated:', stats);
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('uploadModal');
    if (e.target === modal) {
        closeUploadModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeUploadModal();
    }
});

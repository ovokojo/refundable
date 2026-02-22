// Invoices Page JavaScript

// Initialize invoices page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserData();
    initializeUploadZone();
    loadInvoices();
    initializeSearch();
    initializeFilters();
});

// Mock Invoice Data
const mockInvoices = [
    { id: 'INV-2024-0892', date: '2024-02-20', vendor: 'Shanghai Electronics Co.', amount: 3450, tariffCode: 'HTS 8471.30.0100', status: 'pending' },
    { id: 'INV-2024-0891', date: '2024-02-19', vendor: 'Global Imports Ltd.', amount: 12500, tariffCode: 'HTS 8517.12.0050', status: 'processed' },
    { id: 'INV-2024-0890', date: '2024-02-18', vendor: 'China Manufacturing Inc.', amount: 8750, tariffCode: 'HTS 9403.00.0050', status: 'approved' },
    { id: 'INV-2024-0889', date: '2024-02-17', vendor: 'Pacific Trading Co.', amount: 5200, tariffCode: 'HTS 3926.90.9990', status: 'pending' },
    { id: 'INV-2024-0888', date: '2024-02-16', vendor: 'Import Solutions LLC', amount: 9800, tariffCode: 'HTS 8481.80.5090', status: 'processed' },
    { id: 'INV-2024-0887', date: '2024-02-15', vendor: 'Overseas Logistics Corp', amount: 6300, tariffCode: 'HTS 7326.90.8680', status: 'approved' },
    { id: 'INV-2024-0886', date: '2024-02-14', vendor: 'International Supply Co.', amount: 4100, tariffCode: 'HTS 8708.29.5080', status: 'pending' },
    { id: 'INV-2024-0885', date: '2024-02-13', vendor: 'Asian Exports Ltd.', amount: 7900, tariffCode: 'HTS 6110.20.2077', status: 'processed' },
    { id: 'INV-2024-0884', date: '2024-02-12', vendor: 'Worldwide Trading Inc.', amount: 11200, tariffCode: 'HTS 9031.80.9100', status: 'approved' },
    { id: 'INV-2024-0883', date: '2024-02-11', vendor: 'Pacific Manufacturing Co.', amount: 5600, tariffCode: 'HTS 8414.59.8520', status: 'pending' }
];

let currentPage = 1;
const itemsPerPage = 10;
let filteredInvoices = [...mockInvoices];

// Load Invoices
function loadInvoices() {
    const tableBody = document.getElementById('invoiceTableBody');
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageInvoices = filteredInvoices.slice(startIndex, endIndex);
    
    pageInvoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="invoice-checkbox" data-id="${invoice.id}"></td>
            <td><strong>${invoice.id}</strong></td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.vendor}</td>
            <td><strong>${formatCurrency(invoice.amount)}</strong></td>
            <td><code>${invoice.tariffCode}</code></td>
            <td><span class="status-badge ${invoice.status}">${capitalizeFirst(invoice.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn-icon" onclick="viewInvoice('${invoice.id}')" title="View">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="action-btn-icon" onclick="downloadInvoice('${invoice.id}')" title="Download">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    updatePagination();
}

// Search
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterInvoices(searchTerm);
    });
}

// Filters
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    statusFilter.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filterInvoices(searchTerm);
}

function filterInvoices(searchTerm) {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredInvoices = mockInvoices.filter(invoice => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            invoice.id.toLowerCase().includes(searchTerm) ||
            invoice.vendor.toLowerCase().includes(searchTerm) ||
            invoice.tariffCode.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = statusFilter === '' || invoice.status === statusFilter;
        
        // Date filter
        let matchesDate = true;
        if (dateFilter !== '') {
            const invoiceDate = new Date(invoice.date);
            const today = new Date();
            const daysAgo = parseInt(dateFilter);
            const cutoffDate = new Date(today.setDate(today.getDate() - daysAgo));
            matchesDate = invoiceDate >= cutoffDate;
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    currentPage = 1;
    loadInvoices();
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const pageInfo = document.querySelector('.page-info');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadInvoices();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadInvoices();
    }
}

// Select All
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.invoice-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

// Actions
function viewInvoice(invoiceId) {
    showToast(`Viewing invoice ${invoiceId}`, 'info');
    // In production, this would open a modal or navigate to invoice details
}

function downloadInvoice(invoiceId) {
    showToast(`Downloading invoice ${invoiceId}`, 'info');
    // In production, this would trigger a file download
}

// Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

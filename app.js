// VASTECH Construction Data Management Application

class ConstructionDataApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        
        // Application data from JSON
        this.categories = [
            "WATER BILL",
            "ROOM RENT", 
            "ELECTRICITY BILLS",
            "TOOLS AND CONSUMABLES",
            "BUS RENT",
            "OFFICE RENT", 
            "SITE EXPENSES",
            "STAFF MESS",
            "STATIONARY",
            "SALLERY",
            "ADVANCE"
        ];
        
        this.siteLocations = [
            "TATA PROJECT LIMITED RAJSTHAN DCU MECHANICAL",
            "TATA PROJECT LIMITED RAJSTHAN DCU ELECTRICAL", 
            "TATA PROJECT LIMITED RAJSTHAN CDU/VDU",
            "JEWAR INTERNATIONAL AIRPORT NOIDA",
            "ANMS HAZIRA",
            "ISGEC HEAVY ENGINEERING LIMITED ANGUL",
            "THERMAX BHARUCH"
        ];
        
        this.init();
    }
    
    init() {
        this.populateDropdowns();
        this.loadSampleData();
        this.bindEventListeners();
        this.setDefaultDate();
        this.renderTable();
        this.updateSummary();
    }
    
    populateDropdowns() {
        // Main form dropdowns
        this.populateSelect('category', this.categories);
        this.populateSelect('siteName', this.siteLocations);
        
        // Edit form dropdowns
        this.populateSelect('editCategory', this.categories);
        this.populateSelect('editSiteName', this.siteLocations);
        
        // Filter dropdowns
        this.populateSelect('filterCategory', this.categories);
        this.populateSelect('filterSite', this.siteLocations);
    }
    
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Keep existing first option
        const firstOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }
    
    loadSampleData() {
        // Load sample data
        const sampleData = [
            {
                id: 1,
                date: "2025-08-15",
                category: "ELECTRICITY BILLS", 
                partyName: "State Electricity Board",
                remarks: "Monthly electricity bill payment",
                siteName: "TATA PROJECT LIMITED RAJSTHAN DCU MECHANICAL",
                cashIn: 0,
                cashOut: 45000,
                comments: "Payment for August 2025"
            },
            {
                id: 2,
                date: "2025-08-20",
                category: "TOOLS AND CONSUMABLES",
                partyName: "Industrial Tools Pvt Ltd", 
                remarks: "Purchase of welding equipment",
                siteName: "JEWAR INTERNATIONAL AIRPORT NOIDA",
                cashIn: 0,
                cashOut: 125000,
                comments: "New welding machines and consumables"
            }
        ];
        
        this.data = sampleData;
        this.filteredData = [...this.data];
    }
    
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
        document.getElementById('date').max = today;
    }
    
    bindEventListeners() {
        // Form submission
        document.getElementById('dataForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.resetForm());
        
        // Edit form
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEdit());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeEditModal());
        document.getElementById('editModal').querySelector('.modal__backdrop').addEventListener('click', () => this.closeEditModal());
        
        // Delete confirmation
        document.getElementById('confirmDelete').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancelDelete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('deleteModal').querySelector('.modal__backdrop').addEventListener('click', () => this.closeDeleteModal());
        
        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header.dataset.sort));
        });
        
        // Filters
        document.getElementById('filterCategory').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterSite').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchText').addEventListener('input', () => this.applyFilters());
        document.getElementById('dateFrom').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateTo').addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        
        // Export and print
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('printBtn').addEventListener('click', () => this.printData());
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            const formData = new FormData(e.target);
            const entry = {
                id: this.generateId(),
                date: formData.get('date'),
                category: formData.get('category'),
                partyName: formData.get('partyName'),
                remarks: formData.get('remarks') || '',
                siteName: formData.get('siteName'),
                cashIn: parseFloat(formData.get('cashIn')) || 0,
                cashOut: parseFloat(formData.get('cashOut')) || 0,
                comments: formData.get('comments') || ''
            };
            
            this.data.push(entry);
            this.applyFilters();
            this.updateSummary();
            this.resetForm();
            this.showSuccessMessage();
        }
    }
    
    validateForm(isEdit = false) {
        const prefix = isEdit ? 'edit' : '';
        const requiredFields = ['date', 'category', 'partyName', 'siteName'];
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('show');
        });
        document.querySelectorAll('.form-control.error').forEach(field => {
            field.classList.remove('error');
        });
        
        requiredFields.forEach(field => {
            const fieldId = prefix + field.charAt(0).toUpperCase() + field.slice(1);
            const element = document.getElementById(fieldId) || document.getElementById(field);
            const errorElement = document.getElementById(field + 'Error');
            
            if (!element.value.trim()) {
                element.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                    errorElement.classList.add('show');
                }
                isValid = false;
            }
        });
        
        // Validate date is not in future
        const dateField = document.getElementById(prefix ? 'editDate' : 'date');
        const today = new Date().toISOString().split('T')[0];
        if (dateField.value > today) {
            dateField.classList.add('error');
            const errorElement = document.getElementById('dateError');
            if (errorElement) {
                errorElement.textContent = 'Date cannot be in the future';
                errorElement.classList.add('show');
            }
            isValid = false;
        }
        
        // Validate cash amounts
        const cashInField = document.getElementById(prefix ? 'editCashIn' : 'cashIn');
        const cashOutField = document.getElementById(prefix ? 'editCashOut' : 'cashOut');
        
        if (cashInField.value && parseFloat(cashInField.value) < 0) {
            cashInField.classList.add('error');
            const errorElement = document.getElementById('cashInError');
            if (errorElement) {
                errorElement.textContent = 'Amount must be positive';
                errorElement.classList.add('show');
            }
            isValid = false;
        }
        
        if (cashOutField.value && parseFloat(cashOutField.value) < 0) {
            cashOutField.classList.add('error');
            const errorElement = document.getElementById('cashOutError');
            if (errorElement) {
                errorElement.textContent = 'Amount must be positive';
                errorElement.classList.add('show');
            }
            isValid = false;
        }
        
        return isValid;
    }
    
    generateId() {
        return Math.max(...this.data.map(item => item.id), 0) + 1;
    }
    
    resetForm() {
        document.getElementById('dataForm').reset();
        this.setDefaultDate();
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('show');
        });
        document.querySelectorAll('.form-control.error').forEach(field => {
            field.classList.remove('error');
        });
    }
    
    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.add('hidden');
            successMessage.classList.remove('show');
        }, 3000);
    }
    
    renderTable() {
        const tableBody = document.getElementById('tableBody');
        const noDataRow = document.getElementById('noDataRow');
        
        if (this.filteredData.length === 0) {
            tableBody.innerHTML = '<tr id="noDataRow"><td colspan="9" class="no-data">No data entries found</td></tr>';
            return;
        }
        
        const rows = this.filteredData.map(entry => `
            <tr>
                <td>${this.formatDate(entry.date)}</td>
                <td>${entry.category}</td>
                <td>${entry.partyName}</td>
                <td>${entry.remarks}</td>
                <td>${entry.siteName}</td>
                <td class="cash-in">${this.formatCurrency(entry.cashIn)}</td>
                <td class="cash-out">${this.formatCurrency(entry.cashOut)}</td>
                <td>${entry.comments}</td>
                <td class="actions">
                    <button class="btn btn--secondary btn--sm" onclick="app.editEntry(${entry.id})">Edit</button>
                    <button class="btn btn--outline btn--sm" onclick="app.deleteEntry(${entry.id})">Delete</button>
                </td>
            </tr>
        `).join('');
        
        tableBody.innerHTML = rows;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    formatCurrency(amount) {
        if (amount === 0) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    updateSummary() {
        const totalCashIn = this.data.reduce((sum, entry) => sum + entry.cashIn, 0);
        const totalCashOut = this.data.reduce((sum, entry) => sum + entry.cashOut, 0);
        const netBalance = totalCashIn - totalCashOut;
        
        document.getElementById('totalCashIn').textContent = this.formatCurrency(totalCashIn);
        document.getElementById('totalCashOut').textContent = this.formatCurrency(totalCashOut);
        document.getElementById('netBalance').textContent = this.formatCurrency(netBalance);
        document.getElementById('totalEntries').textContent = this.data.length;
        
        // Update net balance color based on value
        const netBalanceElement = document.getElementById('netBalance');
        netBalanceElement.className = 'summary-card__value ' + (netBalance >= 0 ? 'cash-in' : 'cash-out');
    }
    
    handleSort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        // Update header indicators
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        
        const currentHeader = document.querySelector(`[data-sort="${column}"]`);
        currentHeader.classList.add(`sort-${this.sortDirection}`);
        
        // Sort data
        this.filteredData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            // Handle different data types
            if (column === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (column === 'cashIn' || column === 'cashOut') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            } else {
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.renderTable();
    }
    
    applyFilters() {
        const categoryFilter = document.getElementById('filterCategory').value;
        const siteFilter = document.getElementById('filterSite').value;
        const searchText = document.getElementById('searchText').value.toLowerCase();
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        
        this.filteredData = this.data.filter(entry => {
            const matchesCategory = !categoryFilter || entry.category === categoryFilter;
            const matchesSite = !siteFilter || entry.siteName === siteFilter;
            const matchesSearch = !searchText || 
                entry.partyName.toLowerCase().includes(searchText) ||
                entry.remarks.toLowerCase().includes(searchText) ||
                entry.comments.toLowerCase().includes(searchText);
            const matchesDateFrom = !dateFrom || entry.date >= dateFrom;
            const matchesDateTo = !dateTo || entry.date <= dateTo;
            
            return matchesCategory && matchesSite && matchesSearch && matchesDateFrom && matchesDateTo;
        });
        
        this.renderTable();
    }
    
    clearFilters() {
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterSite').value = '';
        document.getElementById('searchText').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        
        this.filteredData = [...this.data];
        this.renderTable();
    }
    
    editEntry(id) {
        const entry = this.data.find(item => item.id === id);
        if (!entry) return;
        
        this.currentEditId = id;
        
        // Populate edit form
        document.getElementById('editId').value = entry.id;
        document.getElementById('editDate').value = entry.date;
        document.getElementById('editCategory').value = entry.category;
        document.getElementById('editPartyName').value = entry.partyName;
        document.getElementById('editRemarks').value = entry.remarks;
        document.getElementById('editSiteName').value = entry.siteName;
        document.getElementById('editCashIn').value = entry.cashIn || '';
        document.getElementById('editCashOut').value = entry.cashOut || '';
        document.getElementById('editComments').value = entry.comments;
        
        // Set max date for edit form
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('editDate').max = today;
        
        document.getElementById('editModal').classList.remove('hidden');
    }
    
    saveEdit() {
        if (!this.validateForm(true)) return;
        
        const entry = this.data.find(item => item.id === this.currentEditId);
        if (!entry) return;
        
        // Update entry
        entry.date = document.getElementById('editDate').value;
        entry.category = document.getElementById('editCategory').value;
        entry.partyName = document.getElementById('editPartyName').value;
        entry.remarks = document.getElementById('editRemarks').value;
        entry.siteName = document.getElementById('editSiteName').value;
        entry.cashIn = parseFloat(document.getElementById('editCashIn').value) || 0;
        entry.cashOut = parseFloat(document.getElementById('editCashOut').value) || 0;
        entry.comments = document.getElementById('editComments').value;
        
        this.applyFilters();
        this.updateSummary();
        this.closeEditModal();
        this.showSuccessMessage();
    }
    
    closeEditModal() {
        document.getElementById('editModal').classList.add('hidden');
        this.currentEditId = null;
    }
    
    deleteEntry(id) {
        this.currentDeleteId = id;
        document.getElementById('deleteModal').classList.remove('hidden');
    }
    
    confirmDelete() {
        if (this.currentDeleteId) {
            this.data = this.data.filter(item => item.id !== this.currentDeleteId);
            this.applyFilters();
            this.updateSummary();
            this.closeDeleteModal();
        }
    }
    
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.currentDeleteId = null;
    }
    
    exportCSV() {
        const headers = ['Date', 'Category', 'Party Name', 'Remarks', 'Site Name', 'Cash In (₹)', 'Cash Out (₹)', 'Comments'];
        const csvContent = [
            headers.join(','),
            ...this.filteredData.map(entry => [
                entry.date,
                `"${entry.category}"`,
                `"${entry.partyName}"`,
                `"${entry.remarks}"`,
                `"${entry.siteName}"`,
                entry.cashIn,
                entry.cashOut,
                `"${entry.comments}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `vastech_construction_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    printData() {
        window.print();
    }
}

// Initialize the application
const app = new ConstructionDataApp();

// Handle escape key for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const editModal = document.getElementById('editModal');
        const deleteModal = document.getElementById('deleteModal');
        
        if (!editModal.classList.contains('hidden')) {
            app.closeEditModal();
        } else if (!deleteModal.classList.contains('hidden')) {
            app.closeDeleteModal();
        }
    }
});
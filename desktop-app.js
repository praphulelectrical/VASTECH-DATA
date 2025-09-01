// VASTECH Construction Data Management Application - Desktop Version
// Enhanced for Electron with native data persistence and desktop integration

class ConstructionDataApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.isDesktop = typeof window.electronAPI !== 'undefined';
        
        // Enhanced application data with icons and colors
        this.categories = [
            {name: "WATER BILL", icon: "fa-droplet", color: "#3182CE"},
            {name: "ROOM RENT", icon: "fa-home", color: "#38A169"},
            {name: "ELECTRICITY BILLS", icon: "fa-bolt", color: "#D69E2E"},
            {name: "TOOLS AND CONSUMABLES", icon: "fa-tools", color: "#805AD5"},
            {name: "BUS RENT", icon: "fa-bus", color: "#E53E3E"},
            {name: "OFFICE RENT", icon: "fa-building", color: "#319795"},
            {name: "SITE EXPENSES", icon: "fa-hard-hat", color: "#D53F8C"},
            {name: "STAFF MESS", icon: "fa-utensils", color: "#DD6B20"},
            {name: "STATIONARY", icon: "fa-pen", color: "#2B6CB0"},
            {name: "SALLERY", icon: "fa-money-bill", color: "#38A169"},
            {name: "ADVANCE", icon: "fa-credit-card", color: "#B794F6"}
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
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }
    
    async initializeApp() {
        try {
            this.populateDropdowns();
            await this.loadDataFromStorage();
            this.bindEventListeners();
            this.setDefaultDate();
            this.renderTable();
            this.updateSummary();
            
            if (this.isDesktop) {
                this.setupDesktopIntegration();
                this.loadExcelLibrary();
            }
            
            console.log('VASTECH Construction Data Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorMessage('Failed to initialize application');
        }
    }
    
    // Desktop integration setup
    setupDesktopIntegration() {
        if (!this.isDesktop) return;
        
        // Setup menu action listeners
        window.electronAPI.onMenuAction((event, data) => {
            switch (event.type || event) {
                case 'menu-new-entry':
                    this.focusNewEntryForm();
                    break;
                case 'menu-export-excel':
                    this.exportToExcel();
                    break;
                case 'menu-export-csv':
                    this.exportToCSV();
                    break;
                case 'menu-clear-filters':
                    this.clearFilters();
                    break;
                case 'menu-backup-data':
                    this.backupData(data);
                    break;
                case 'menu-restore-data':
                    this.restoreData(data);
                    break;
                case 'menu-clear-data':
                    this.clearAllData();
                    break;
            }
        });
        
        // Add desktop-specific UI elements
        this.addDesktopUI();
        
        // Setup auto-save
        this.setupAutoSave();
    }
    
    addDesktopUI() {
        // Add version info to footer if it doesn't exist
        const footer = document.querySelector('.footer') || this.createFooter();
        
        const versionInfo = document.createElement('div');
        versionInfo.className = 'version-info';
        versionInfo.innerHTML = `
            <span id="app-version">Desktop Version 1.0.0</span>
            <span class="platform-info">Platform: ${window.electronAPI.platform}</span>
        `;
        footer.appendChild(versionInfo);
    }
    
    createFooter() {
        const footer = document.createElement('footer');
        footer.className = 'footer';
        footer.style.cssText = `
            margin-top: 2rem;
            padding: 1rem;
            text-align: center;
            font-size: 0.875rem;
            color: #718096;
            border-top: 1px solid #E2E8F0;
        `;
        document.querySelector('.container').appendChild(footer);
        return footer;
    }
    
    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveDataToStorage();
        }, 30000);
        
        // Save on window beforeunload
        window.addEventListener('beforeunload', () => {
            this.saveDataToStorage();
        });
    }
    
    focusNewEntryForm() {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.focus();
            dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Enhanced data persistence methods
    async loadDataFromStorage() {
        try {
            if (this.isDesktop && window.electronAPI) {
                // Load from Electron store
                const savedData = await window.electronAPI.store.get('constructionData');
                if (savedData && Array.isArray(savedData)) {
                    this.data = savedData;
                } else {
                    this.loadSampleData();
                }
            } else {
                // Fallback to localStorage for web version
                const savedData = localStorage.getItem('vastech-construction-data');
                if (savedData) {
                    this.data = JSON.parse(savedData);
                } else {
                    this.loadSampleData();
                }
            }
            
            this.filteredData = [...this.data];
        } catch (error) {
            console.error('Error loading data:', error);
            this.loadSampleData();
        }
    }
    
    async saveDataToStorage() {
        try {
            if (this.isDesktop && window.electronAPI) {
                // Save to Electron store
                await window.electronAPI.store.set('constructionData', this.data);
            } else {
                // Fallback to localStorage
                localStorage.setItem('vastech-construction-data', JSON.stringify(this.data));
            }
        } catch (error) {
            console.error('Error saving data:', error);
            this.showErrorMessage('Failed to save data');
        }
    }
    
    loadSampleData() {
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
    
    populateDropdowns() {
        // Main form dropdowns
        this.populateSelect('category', this.categories.map(c => c.name), 'Select Category');
        this.populateSelect('siteName', this.siteLocations, 'Select Site Location');
        
        // Edit form dropdowns
        this.populateSelect('editCategory', this.categories.map(c => c.name), 'Select Category');
        this.populateSelect('editSiteName', this.siteLocations, 'Select Site Location');
        
        // Filter dropdowns
        this.populateSelect('filterCategory', this.categories.map(c => c.name), 'All Categories');
        this.populateSelect('filterSite', this.siteLocations, 'All Sites');
    }
    
    populateSelect(selectId, options, placeholder) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Keep existing placeholder option
        const placeholderOption = select.querySelector('option[value=""]');
        if (placeholderOption) {
            placeholderOption.textContent = placeholder;
        }
        
        // Remove existing options except placeholder
        const existingOptions = select.querySelectorAll('option:not([value=""])');
        existingOptions.forEach(option => option.remove());
        
        // Add new options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }
    
    bindEventListeners() {
        // Form submission
        const form = document.getElementById('dataForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Export buttons
        const exportExcelBtn = document.getElementById('exportExcel');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportToExcel());
        }
        
        const exportCSVBtn = document.getElementById('exportCSV');
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => this.exportToCSV());
        }
        
        // Filter inputs
        const filterInputs = ['searchInput', 'filterCategory', 'filterSite', 'filterDateFrom', 'filterDateTo'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters());
                element.addEventListener('change', () => this.applyFilters());
            }
        });
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Modal event listeners
        this.bindModalEventListeners();
    }
    
    bindModalEventListeners() {
        // Edit modal
        const editModal = document.getElementById('editModal');
        const editCloseBtn = document.getElementById('editCloseBtn');
        const editForm = document.getElementById('editForm');
        const editCancelBtn = document.getElementById('editCancelBtn');
        
        if (editCloseBtn) editCloseBtn.addEventListener('click', () => this.closeEditModal());
        if (editCancelBtn) editCancelBtn.addEventListener('click', () => this.closeEditModal());
        if (editForm) editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) this.closeEditModal();
            });
        }
        
        // Delete modal
        const deleteModal = document.getElementById('deleteModal');
        const deleteCloseBtn = document.getElementById('deleteCloseBtn');
        const deleteCancelBtn = document.getElementById('deleteCancelBtn');
        const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
        
        if (deleteCloseBtn) deleteCloseBtn.addEventListener('click', () => this.closeDeleteModal());
        if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', () => this.closeDeleteModal());
        if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', () => this.confirmDelete());
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) this.closeDeleteModal();
            });
        }
    }
    
    setDefaultDate() {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            dateInput.max = today; // Prevent future dates
        }
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const formData = new FormData(e.target);
        const entry = {
            id: Date.now(),
            date: formData.get('date'),
            category: formData.get('category'),
            partyName: formData.get('partyName'),
            remarks: formData.get('remarks') || '',
            siteName: formData.get('siteName'),
            cashIn: parseFloat(formData.get('cashIn')) || 0,
            cashOut: parseFloat(formData.get('cashOut')) || 0,
            comments: formData.get('comments') || ''
        };
        
        this.data.unshift(entry);
        await this.saveDataToStorage();
        this.applyFilters();
        this.updateSummary();
        this.resetForm();
        this.showSuccessMessage();
    }
    
    validateForm() {
        let isValid = true;
        const requiredFields = ['date', 'category', 'partyName', 'siteName'];
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const errorElement = document.getElementById(`${field}Error`);
            
            if (!input || !input.value.trim()) {
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                }
                isValid = false;
            }
        });
        
        // Validate cash amounts
        const cashIn = document.getElementById('cashIn');
        const cashOut = document.getElementById('cashOut');
        
        if (cashIn && cashIn.value && parseFloat(cashIn.value) < 0) {
            const errorElement = document.getElementById('cashInError');
            if (errorElement) {
                errorElement.textContent = 'Amount must be positive';
            }
            isValid = false;
        }
        
        if (cashOut && cashOut.value && parseFloat(cashOut.value) < 0) {
            const errorElement = document.getElementById('cashOutError');
            if (errorElement) {
                errorElement.textContent = 'Amount must be positive';
            }
            isValid = false;
        }
        
        // Validate date is not in future
        const dateInput = document.getElementById('date');
        if (dateInput && dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate > today) {
                const errorElement = document.getElementById('dateError');
                if (errorElement) {
                    errorElement.textContent = 'Date cannot be in the future';
                }
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    resetForm() {
        const form = document.getElementById('dataForm');
        if (form) {
            form.reset();
            this.setDefaultDate();
        }
    }
    
    showSuccessMessage(message = 'Data entry has been successfully added!') {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            const textElement = successMessage.querySelector('.alert__text');
            if (textElement) {
                textElement.textContent = message;
            }
            successMessage.classList.remove('hidden');
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 3000);
        }
    }
    
    showErrorMessage(message) {
        // Create or update error message element
        let errorMessage = document.getElementById('errorMessage');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.id = 'errorMessage';
            errorMessage.className = 'alert alert--error';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle alert__icon"></i>
                <span class="alert__text"></span>
            `;
            const container = document.querySelector('.container');
            const header = container.querySelector('.header');
            container.insertBefore(errorMessage, header.nextSibling);
        }
        
        const textElement = errorMessage.querySelector('.alert__text');
        if (textElement) {
            textElement.textContent = message;
        }
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }
    
    applyFilters() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('filterCategory')?.value || '';
        const siteFilter = document.getElementById('filterSite')?.value || '';
        const dateFromFilter = document.getElementById('filterDateFrom')?.value || '';
        const dateToFilter = document.getElementById('filterDateTo')?.value || '';
        
        this.filteredData = this.data.filter(item => {
            const matchesSearch = !searchTerm || 
                item.partyName.toLowerCase().includes(searchTerm) ||
                item.remarks.toLowerCase().includes(searchTerm) ||
                item.comments.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesSite = !siteFilter || item.siteName === siteFilter;
            
            const matchesDateFrom = !dateFromFilter || new Date(item.date) >= new Date(dateFromFilter);
            const matchesDateTo = !dateToFilter || new Date(item.date) <= new Date(dateToFilter);
            
            return matchesSearch && matchesCategory && matchesSite && matchesDateFrom && matchesDateTo;
        });
        
        this.renderTable();
    }
    
    clearFilters() {
        const filterInputs = ['searchInput', 'filterCategory', 'filterSite', 'filterDateFrom', 'filterDateTo'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
        
        this.applyFilters();
        this.showSuccessMessage('Filters cleared successfully');
    }
    
    renderTable() {
        const tableBody = document.getElementById('dataTableBody');
        if (!tableBody) return;
        
        if (this.filteredData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 2rem; color: #718096;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No data found. Add some entries to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = this.filteredData.map(item => {
            const categoryInfo = this.categories.find(c => c.name === item.category) || {icon: 'fa-tag', color: '#718096'};
            
            return `
                <tr onclick="app.editEntry(${item.id})" style="cursor: pointer;">
                    <td>${this.formatDate(item.date)}</td>
                    <td>
                        <span class="category-tag" style="background-color: ${categoryInfo.color};">
                            <i class="fas ${categoryInfo.icon}"></i>
                            ${item.category}
                        </span>
                    </td>
                    <td>${item.partyName}</td>
                    <td>${item.siteName}</td>
                    <td>${item.remarks}</td>
                    <td class="cash-amount ${item.cashIn > 0 ? 'cash-amount--in' : ''}">
                        ${item.cashIn > 0 ? '<i class="fas fa-arrow-up"></i>' : ''}
                        ${item.cashIn > 0 ? '₹' + this.formatCurrency(item.cashIn) : '-'}
                    </td>
                    <td class="cash-amount ${item.cashOut > 0 ? 'cash-amount--out' : ''}">
                        ${item.cashOut > 0 ? '<i class="fas fa-arrow-down"></i>' : ''}
                        ${item.cashOut > 0 ? '₹' + this.formatCurrency(item.cashOut) : '-'}
                    </td>
                    <td>${item.comments}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="event.stopPropagation(); app.editEntry(${item.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="event.stopPropagation(); app.deleteEntry(${item.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    updateSummary() {
        const totalCashIn = this.data.reduce((sum, item) => sum + item.cashIn, 0);
        const totalCashOut = this.data.reduce((sum, item) => sum + item.cashOut, 0);
        const balance = totalCashIn - totalCashOut;
        
        const summaryElements = {
            'totalCashIn': totalCashIn,
            'totalCashOut': totalCashOut,
            'totalBalance': balance
        };
        
        Object.entries(summaryElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '₹' + this.formatCurrency(Math.abs(value));
                if (id === 'totalBalance') {
                    element.style.color = value >= 0 ? '#38A169' : '#E53E3E';
                }
            }
        });
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN').format(amount);
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    editEntry(id) {
        const entry = this.data.find(item => item.id === id);
        if (!entry) return;
        
        this.currentEditId = id;
        
        // Populate edit form
        document.getElementById('editDate').value = entry.date;
        document.getElementById('editCategory').value = entry.category;
        document.getElementById('editPartyName').value = entry.partyName;
        document.getElementById('editRemarks').value = entry.remarks;
        document.getElementById('editSiteName').value = entry.siteName;
        document.getElementById('editCashIn').value = entry.cashIn || '';
        document.getElementById('editCashOut').value = entry.cashOut || '';
        document.getElementById('editComments').value = entry.comments;
        
        // Show modal
        document.getElementById('editModal').classList.add('show');
    }
    
    async handleEditSubmit(e) {
        e.preventDefault();
        
        if (!this.validateEditForm()) {
            return;
        }
        
        const formData = new FormData(e.target);
        const updatedEntry = {
            id: this.currentEditId,
            date: formData.get('editDate'),
            category: formData.get('editCategory'),
            partyName: formData.get('editPartyName'),
            remarks: formData.get('editRemarks') || '',
            siteName: formData.get('editSiteName'),
            cashIn: parseFloat(formData.get('editCashIn')) || 0,
            cashOut: parseFloat(formData.get('editCashOut')) || 0,
            comments: formData.get('editComments') || ''
        };
        
        const index = this.data.findIndex(item => item.id === this.currentEditId);
        if (index !== -1) {
            this.data[index] = updatedEntry;
            await this.saveDataToStorage();
            this.applyFilters();
            this.updateSummary();
            this.closeEditModal();
            this.showSuccessMessage('Entry updated successfully');
        }
    }
    
    validateEditForm() {
        let isValid = true;
        const requiredFields = ['editDate', 'editCategory', 'editPartyName', 'editSiteName'];
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const errorElement = document.getElementById(`${field}Error`);
            
            if (!input || !input.value.trim()) {
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                }
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    closeEditModal() {
        document.getElementById('editModal').classList.remove('show');
        this.currentEditId = null;
    }
    
    deleteEntry(id) {
        this.currentDeleteId = id;
        const entry = this.data.find(item => item.id === id);
        if (entry) {
            document.getElementById('deleteEntryDetails').textContent = 
                `${entry.partyName} - ${entry.category} - ₹${this.formatCurrency(entry.cashIn + entry.cashOut)}`;
        }
        document.getElementById('deleteModal').classList.add('show');
    }
    
    async confirmDelete() {
        if (this.currentDeleteId) {
            this.data = this.data.filter(item => item.id !== this.currentDeleteId);
            await this.saveDataToStorage();
            this.applyFilters();
            this.updateSummary();
            this.closeDeleteModal();
            this.showSuccessMessage('Entry deleted successfully');
        }
    }
    
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('show');
        this.currentDeleteId = null;
    }
    
    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        this.filteredData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            if (column === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (column === 'cashIn' || column === 'cashOut') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else {
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.renderTable();
        this.updateSortIcons();
    }
    
    updateSortIcons() {
        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.className = 'sort-icon fas fa-sort';
        });
        
        if (this.sortColumn) {
            const activeIcon = document.querySelector(`th[onclick*="'${this.sortColumn}'] .sort-icon"`);
            if (activeIcon) {
                activeIcon.className = `sort-icon fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
            }
        }
    }
    
    loadExcelLibrary() {
        // Check if XLSX library is already loaded
        if (typeof XLSX !== 'undefined') return;
        
        // Load SheetJS library
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => {
            console.log('Excel library loaded successfully');
        };
        script.onerror = () => {
            console.error('Failed to load Excel library');
        };
        document.head.appendChild(script);
    }
    
    async exportToExcel() {
        if (!window.XLSX && !this.isDesktop) {
            this.showErrorMessage('Excel export library not loaded. Please refresh the page and try again.');
            return;
        }
        
        try {
            let filename = `VASTECH_Construction_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            if (this.isDesktop && window.electronAPI) {
                // Desktop version - show save dialog
                const result = await window.electronAPI.dialog.showSaveDialog({
                    title: 'Export to Excel',
                    defaultPath: filename,
                    filters: [
                        { name: 'Excel Files', extensions: ['xlsx'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });
                
                if (result.canceled) return;
                filename = result.filePath;
            }
            
            // Prepare data for Excel
            const excelData = [
                // Company header
                ['VASTECH CONSTRUCTION COMPANY'],
                ['Construction Data Management System'],
                [''],
                // Table headers
                ['Date', 'Category', 'Party Name', 'Site Name', 'Remarks', 'Cash In (₹)', 'Cash Out (₹)', 'Comments'],
                // Data rows
                ...this.filteredData.map(item => [
                    this.formatDate(item.date),
                    item.category,
                    item.partyName,
                    item.siteName,
                    item.remarks,
                    item.cashIn || 0,
                    item.cashOut || 0,
                    item.comments
                ]),
                // Summary
                [''],
                ['Summary:', '', '', '', '', 
                 this.data.reduce((sum, item) => sum + item.cashIn, 0),
                 this.data.reduce((sum, item) => sum + item.cashOut, 0),
                 ''],
                ['Net Balance:', '', '', '', '', 
                 this.data.reduce((sum, item) => sum + item.cashIn, 0) - this.data.reduce((sum, item) => sum + item.cashOut, 0),
                 '', '']
            ];
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(excelData);
            
            // Set column widths
            ws['!cols'] = [
                {wch: 12}, // Date
                {wch: 20}, // Category
                {wch: 25}, // Party Name
                {wch: 35}, // Site Name
                {wch: 25}, // Remarks
                {wch: 15}, // Cash In
                {wch: 15}, // Cash Out
                {wch: 25}  // Comments
            ];
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Construction Data');
            
            if (this.isDesktop && filename.includes('/') || filename.includes('\\')) {
                // Desktop version - save to specific path
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                await window.electronAPI.fs.writeFile(filename, Buffer.from(excelBuffer));
                this.showSuccessMessage(`Data exported to ${filename}`);
            } else {
                // Web version or desktop fallback - download
                XLSX.writeFile(wb, filename);
                this.showSuccessMessage('Excel file downloaded successfully');
            }
            
        } catch (error) {
            console.error('Excel export error:', error);
            this.showErrorMessage('Error exporting to Excel. Please try again.');
        }
    }
    
    async exportToCSV() {
        try {
            const csvData = [
                ['Date', 'Category', 'Party Name', 'Site Name', 'Remarks', 'Cash In', 'Cash Out', 'Comments'],
                ...this.filteredData.map(item => [
                    item.date,
                    item.category,
                    item.partyName,
                    item.siteName,
                    item.remarks,
                    item.cashIn || 0,
                    item.cashOut || 0,
                    item.comments
                ])
            ];
            
            const csvContent = csvData.map(row => 
                row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
            ).join('\n');
            
            const today = new Date().toISOString().split('T')[0];
            let filename = `VASTECH_Construction_Data_${today}.csv`;
            
            if (this.isDesktop && window.electronAPI) {
                // Desktop version - show save dialog
                const result = await window.electronAPI.dialog.showSaveDialog({
                    title: 'Export to CSV',
                    defaultPath: filename,
                    filters: [
                        { name: 'CSV Files', extensions: ['csv'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });
                
                if (result.canceled) return;
                
                await window.electronAPI.fs.writeFile(result.filePath, csvContent);
                this.showSuccessMessage(`Data exported to ${result.filePath}`);
            } else {
                // Web version - download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
                this.showSuccessMessage('CSV file downloaded successfully');
            }
        } catch (error) {
            console.error('CSV export error:', error);
            this.showErrorMessage('Error exporting to CSV. Please try again.');
        }
    }
    
    // Desktop-specific methods
    async backupData(filePath) {
        if (!this.isDesktop || !window.electronAPI || !filePath) return;
        
        try {
            const backupData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: this.data,
                categories: this.categories,
                siteLocations: this.siteLocations
            };
            
            await window.electronAPI.fs.writeFile(filePath, JSON.stringify(backupData, null, 2));
            this.showSuccessMessage(`Data backed up to ${filePath}`);
        } catch (error) {
            console.error('Backup error:', error);
            this.showErrorMessage('Failed to backup data');
        }
    }
    
    async restoreData(filePath) {
        if (!this.isDesktop || !window.electronAPI || !filePath) return;
        
        try {
            const result = await window.electronAPI.fs.readFile(filePath);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const backupData = JSON.parse(result.data);
            
            if (backupData.data && Array.isArray(backupData.data)) {
                this.data = backupData.data;
                await this.saveDataToStorage();
                this.applyFilters();
                this.updateSummary();
                this.showSuccessMessage(`Data restored from ${filePath}`);
            } else {
                throw new Error('Invalid backup file format');
            }
        } catch (error) {
            console.error('Restore error:', error);
            this.showErrorMessage('Failed to restore data. Please check the backup file.');
        }
    }
    
    async clearAllData() {
        this.data = [];
        this.filteredData = [];
        await this.saveDataToStorage();
        this.renderTable();
        this.updateSummary();
        this.showSuccessMessage('All data cleared successfully');
    }
}

// Initialize the application
const app = new ConstructionDataApp();

// Make app globally available for onclick handlers
window.app = app;
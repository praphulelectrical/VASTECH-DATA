// VASTECH Construction Data Management Application with WORKING Excel Export

class ConstructionDataApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        
        // Application data from JSON with enhanced categories including icons
        this.categories = [
            { name: "WATER BILL", icon: "fa-droplet", color: "#3182CE" },
            { name: "ROOM RENT", icon: "fa-home", color: "#38A169" },
            { name: "ELECTRICITY BILLS", icon: "fa-bolt", color: "#D69E2E" },
            { name: "TOOLS AND CONSUMABLES", icon: "fa-tools", color: "#805AD5" },
            { name: "BUS RENT", icon: "fa-bus", color: "#E53E3E" },
            { name: "OFFICE RENT", icon: "fa-building", color: "#319795" },
            { name: "SITE EXPENSES", icon: "fa-hard-hat", color: "#D53F8C" },
            { name: "STAFF MESS", icon: "fa-utensils", color: "#DD6B20" },
            { name: "STATIONARY", icon: "fa-pen", color: "#2B6CB0" },
            { name: "SALLERY", icon: "fa-money-bill", color: "#38A169" },
            { name: "ADVANCE", icon: "fa-credit-card", color: "#B794F6" }
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
        // Wait for DOM and XLSX to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.initializeApp(), 200);
            });
        } else {
            setTimeout(() => this.initializeApp(), 200);
        }
    }
    
    initializeApp() {
        console.log('Initializing VASTECH Construction Data Management App');
        
        // Check if XLSX is available
        this.checkXLSXAvailability();
        
        // Load sample data first
        this.loadSampleData();
        
        // Populate dropdowns after DOM is ready
        this.populateDropdowns();
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Set default date
        this.setDefaultDate();
        
        // Render initial data
        this.renderTable();
        this.updateSummary();
        
        console.log('App initialized successfully');
        console.log('Categories loaded:', this.categories.length);
        console.log('Site locations loaded:', this.siteLocations.length);
    }
    
    checkXLSXAvailability() {
        if (typeof XLSX !== 'undefined') {
            console.log('SheetJS (XLSX) library loaded successfully');
            console.log('XLSX version:', XLSX.version);
        } else {
            console.warn('SheetJS (XLSX) library not available - Excel export will fall back to CSV');
        }
    }
    
    populateDropdowns() {
        console.log('Populating dropdowns...');
        
        // Extract category names
        const categoryNames = this.categories.map(cat => cat.name);
        
        // Main form dropdowns
        this.populateSelect('category', categoryNames);
        this.populateSelect('siteName', this.siteLocations);
        
        // Edit form dropdowns
        this.populateSelect('editCategory', categoryNames);
        this.populateSelect('editSiteName', this.siteLocations);
        
        // Filter dropdowns
        this.populateSelect('filterCategory', categoryNames);
        this.populateSelect('filterSite', this.siteLocations);
        
        console.log('Dropdowns populated successfully');
    }
    
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`Select element with id "${selectId}" not found`);
            return;
        }
        
        // Store the existing placeholder option
        const existingOptions = Array.from(select.options);
        const placeholderOption = existingOptions.find(opt => opt.value === "");
        
        // Clear all options
        select.innerHTML = '';
        
        // Add back the placeholder option if it existed
        if (placeholderOption) {
            select.appendChild(placeholderOption);
        }
        
        // Add new options
        options.forEach((option, index) => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            optionElement.setAttribute('data-index', index);
            select.appendChild(optionElement);
        });
        
        console.log(`Populated ${selectId} with ${options.length} options`);
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
        console.log('Sample data loaded:', this.data.length, 'entries');
    }
    
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('date');
        if (dateField) {
            dateField.value = today;
            dateField.max = today;
        }
    }
    
    bindEventListeners() {
        // Form submission
        const dataForm = document.getElementById('dataForm');
        if (dataForm) {
            dataForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetForm());
        }
        
        // Edit form
        const saveEdit = document.getElementById('saveEdit');
        if (saveEdit) {
            saveEdit.addEventListener('click', () => this.saveEdit());
        }
        
        const cancelEdit = document.getElementById('cancelEdit');
        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => this.closeEditModal());
        }
        
        // Modal controls
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeEditModal());
        }
        
        const editModalBackdrop = document.querySelector('#editModal .modal__backdrop');
        if (editModalBackdrop) {
            editModalBackdrop.addEventListener('click', () => this.closeEditModal());
        }
        
        // Delete confirmation
        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.confirmDelete());
        }
        
        const cancelDelete = document.getElementById('cancelDelete');
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.closeDeleteModal());
        }
        
        const deleteModalBackdrop = document.querySelector('#deleteModal .modal__backdrop');
        if (deleteModalBackdrop) {
            deleteModalBackdrop.addEventListener('click', () => this.closeDeleteModal());
        }
        
        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header.dataset.sort));
        });
        
        // Filters
        const filterCategory = document.getElementById('filterCategory');
        if (filterCategory) {
            filterCategory.addEventListener('change', () => this.applyFilters());
        }
        
        const filterSite = document.getElementById('filterSite');
        if (filterSite) {
            filterSite.addEventListener('change', () => this.applyFilters());
        }
        
        const searchText = document.getElementById('searchText');
        if (searchText) {
            searchText.addEventListener('input', () => this.applyFilters());
        }
        
        const dateFrom = document.getElementById('dateFrom');
        if (dateFrom) {
            dateFrom.addEventListener('change', () => this.applyFilters());
        }
        
        const dateTo = document.getElementById('dateTo');
        if (dateTo) {
            dateTo.addEventListener('change', () => this.applyFilters());
        }
        
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }
        
        // Export and print - CRITICAL: Excel Export Button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToExcel());
            console.log('Excel export button event listener attached');
        } else {
            console.error('Excel export button not found!');
        }
        
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportCSV());
        }
        
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printData());
        }
        
        // Export status modal close
        const closeExportModal = document.getElementById('closeExportModal');
        if (closeExportModal) {
            closeExportModal.addEventListener('click', () => this.closeExportStatusModal());
        }
        
        const exportModalBackdrop = document.querySelector('#exportStatusModal .modal__backdrop');
        if (exportModalBackdrop) {
            exportModalBackdrop.addEventListener('click', () => this.closeExportStatusModal());
        }
    }
    
    // CRITICAL: WORKING Excel Export Function
    async exportToExcel() {
        console.log('Excel export initiated');
        
        const exportBtn = document.getElementById('exportBtn');
        const originalContent = exportBtn.innerHTML;
        
        try {
            // Show loading state
            exportBtn.classList.add('loading');
            exportBtn.disabled = true;
            
            // Show export status modal
            this.showExportStatusModal('Preparing Excel file...');
            
            // Check if XLSX is available
            if (typeof XLSX === 'undefined') {
                console.warn('XLSX library not available, falling back to CSV');
                this.updateExportStatus('XLSX library not available. Falling back to CSV export...', 'warning');
                setTimeout(() => {
                    this.closeExportStatusModal();
                    this.exportCSV();
                }, 2000);
                return;
            }
            
            // Prepare data for Excel
            const exportData = this.prepareExcelData();
            
            // Update status
            this.updateExportStatus('Creating Excel workbook...', 'info');
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Create worksheet with company header
            const wsData = [
                ['VASTECH CONSTRUCTION COMPANY'],
                ['Construction Data Management System'],
                [''],
                ['Date', 'Category', 'Party Name', 'Remarks', 'Site Name', 'Cash In (₹)', 'Cash Out (₹)', 'Comments'],
                ...exportData.entries,
                [''],
                ['SUMMARY'],
                ['Total Cash In:', exportData.summary.totalCashIn],
                ['Total Cash Out:', exportData.summary.totalCashOut],
                ['Net Balance:', exportData.summary.netBalance],
                ['Total Entries:', exportData.summary.totalEntries],
                ['Export Date:', new Date().toLocaleString('en-IN')]
            ];
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Apply formatting
            this.formatExcelWorksheet(ws, wsData.length);
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Construction Data');
            
            // Update status
            this.updateExportStatus('Generating Excel file...', 'info');
            
            // Generate filename
            const filename = `VASTECH_Construction_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            // Write and download file
            XLSX.writeFile(wb, filename);
            
            // Success message
            this.updateExportStatus('✅ Excel file downloaded successfully!', 'success');
            console.log('Excel export completed successfully');
            
            // Close modal after delay
            setTimeout(() => {
                this.closeExportStatusModal();
            }, 2000);
            
        } catch (error) {
            console.error('Excel export error:', error);
            this.updateExportStatus(`❌ Excel export failed: ${error.message}. Trying CSV fallback...`, 'error');
            
            // Fallback to CSV
            setTimeout(() => {
                this.closeExportStatusModal();
                this.exportCSV();
            }, 2000);
            
        } finally {
            // Reset button state
            exportBtn.classList.remove('loading');
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalContent;
        }
    }
    
    prepareExcelData() {
        const entries = this.filteredData.map(entry => [
            this.formatDate(entry.date),
            entry.category,
            entry.partyName,
            entry.remarks,
            entry.siteName,
            entry.cashIn,
            entry.cashOut,
            entry.comments
        ]);
        
        const totalCashIn = this.data.reduce((sum, entry) => sum + entry.cashIn, 0);
        const totalCashOut = this.data.reduce((sum, entry) => sum + entry.cashOut, 0);
        const netBalance = totalCashIn - totalCashOut;
        
        return {
            entries,
            summary: {
                totalCashIn: totalCashIn.toFixed(2),
                totalCashOut: totalCashOut.toFixed(2),
                netBalance: netBalance.toFixed(2),
                totalEntries: this.data.length
            }
        };
    }
    
    formatExcelWorksheet(ws, totalRows) {
        try {
            // Set column widths
            ws['!cols'] = [
                { width: 15 }, // Date
                { width: 25 }, // Category
                { width: 30 }, // Party Name
                { width: 40 }, // Remarks
                { width: 50 }, // Site Name
                { width: 15 }, // Cash In
                { width: 15 }, // Cash Out
                { width: 40 }  // Comments
            ];
            
            // Set row heights for header
            ws['!rows'] = [
                { hpt: 25 }, // Company name
                { hpt: 20 }, // Subtitle
                { hpt: 15 }, // Empty row
                { hpt: 20 }  // Headers
            ];
            
            // Merge cells for company header
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Company name
                { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }  // Subtitle
            ];
            
            console.log('Excel worksheet formatted successfully');
        } catch (error) {
            console.warn('Excel formatting error (non-critical):', error);
        }
    }
    
    showExportStatusModal(message) {
        const modal = document.getElementById('exportStatusModal');
        const content = document.getElementById('exportStatusContent');
        
        if (modal && content) {
            content.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
            modal.classList.remove('hidden');
        }
    }
    
    updateExportStatus(message, type = 'info') {
        const content = document.getElementById('exportStatusContent');
        if (!content) return;
        
        let icon = 'fa-info-circle';
        let colorClass = 'text-info';
        
        switch (type) {
            case 'success':
                icon = 'fa-check-circle';
                colorClass = 'text-success';
                break;
            case 'error':
                icon = 'fa-exclamation-triangle';
                colorClass = 'text-error';
                break;
            case 'warning':
                icon = 'fa-exclamation-triangle';
                colorClass = 'text-warning';
                break;
        }
        
        content.innerHTML = `<i class="fas ${icon} ${colorClass}"></i> ${message}`;
    }
    
    closeExportStatusModal() {
        const modal = document.getElementById('exportStatusModal');
        if (modal) {
            modal.classList.add('hidden');
        }
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
            
            if (!element || !element.value.trim()) {
                if (element) element.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                    errorElement.classList.add('show');
                }
                isValid = false;
            }
        });
        
        // Validate date is not in future
        const dateField = document.getElementById(prefix ? 'editDate' : 'date');
        if (dateField) {
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
        }
        
        // Validate cash amounts
        const cashInField = document.getElementById(prefix ? 'editCashIn' : 'cashIn');
        const cashOutField = document.getElementById(prefix ? 'editCashOut' : 'cashOut');
        
        if (cashInField && cashInField.value && parseFloat(cashInField.value) < 0) {
            cashInField.classList.add('error');
            const errorElement = document.getElementById('cashInError');
            if (errorElement) {
                errorElement.textContent = 'Amount must be positive';
                errorElement.classList.add('show');
            }
            isValid = false;
        }
        
        if (cashOutField && cashOutField.value && parseFloat(cashOutField.value) < 0) {
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
        const form = document.getElementById('dataForm');
        if (form) {
            form.reset();
            this.setDefaultDate();
        }
        
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('show');
        });
        document.querySelectorAll('.form-control.error').forEach(field => {
            field.classList.remove('error');
        });
    }
    
    showSuccessMessage(message = 'Data entry has been successfully added!') {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            const textElement = successMessage.querySelector('.alert__text');
            if (textElement) {
                textElement.textContent = message;
            }
            successMessage.classList.remove('hidden');
            successMessage.classList.add('show');
            
            setTimeout(() => {
                successMessage.classList.add('hidden');
                successMessage.classList.remove('show');
            }, 4000);
        }
    }
    
    showErrorMessage(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            const textElement = document.getElementById('errorText');
            if (textElement) {
                textElement.textContent = message;
            }
            errorMessage.classList.remove('hidden');
            errorMessage.classList.add('show');
            
            setTimeout(() => {
                errorMessage.classList.add('hidden');
                errorMessage.classList.remove('show');
            }, 5000);
        }
    }
    
    renderTable() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;
        
        if (this.filteredData.length === 0) {
            tableBody.innerHTML = '<tr id="noDataRow"><td colspan="9" class="no-data"><i class="fas fa-inbox"></i> No data entries found</td></tr>';
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
                    <button class="btn btn--secondary btn--sm" onclick="app.editEntry(${entry.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="app.deleteEntry(${entry.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
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
        
        const totalCashInEl = document.getElementById('totalCashIn');
        const totalCashOutEl = document.getElementById('totalCashOut');
        const netBalanceEl = document.getElementById('netBalance');
        const totalEntriesEl = document.getElementById('totalEntries');
        
        if (totalCashInEl) totalCashInEl.textContent = this.formatCurrency(totalCashIn);
        if (totalCashOutEl) totalCashOutEl.textContent = this.formatCurrency(totalCashOut);
        if (netBalanceEl) {
            netBalanceEl.textContent = this.formatCurrency(netBalance);
            netBalanceEl.className = 'summary-card__value ' + (netBalance >= 0 ? 'cash-in' : 'cash-out');
        }
        if (totalEntriesEl) totalEntriesEl.textContent = this.data.length;
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
        if (currentHeader) {
            currentHeader.classList.add(`sort-${this.sortDirection}`);
        }
        
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
        const categoryFilter = document.getElementById('filterCategory')?.value || '';
        const siteFilter = document.getElementById('filterSite')?.value || '';
        const searchText = (document.getElementById('searchText')?.value || '').toLowerCase();
        const dateFrom = document.getElementById('dateFrom')?.value || '';
        const dateTo = document.getElementById('dateTo')?.value || '';
        
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
        const filterCategory = document.getElementById('filterCategory');
        const filterSite = document.getElementById('filterSite');
        const searchText = document.getElementById('searchText');
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        
        if (filterCategory) filterCategory.value = '';
        if (filterSite) filterSite.value = '';
        if (searchText) searchText.value = '';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        
        this.filteredData = [...this.data];
        this.renderTable();
    }
    
    editEntry(id) {
        const entry = this.data.find(item => item.id === id);
        if (!entry) return;
        
        this.currentEditId = id;
        
        // Populate edit form
        const fields = {
            'editId': entry.id,
            'editDate': entry.date,
            'editCategory': entry.category,
            'editPartyName': entry.partyName,
            'editRemarks': entry.remarks,
            'editSiteName': entry.siteName,
            'editCashIn': entry.cashIn || '',
            'editCashOut': entry.cashOut || '',
            'editComments': entry.comments
        };
        
        Object.entries(fields).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
            }
        });
        
        // Set max date for edit form
        const today = new Date().toISOString().split('T')[0];
        const editDate = document.getElementById('editDate');
        if (editDate) {
            editDate.max = today;
        }
        
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.classList.remove('hidden');
        }
    }
    
    saveEdit() {
        if (!this.validateForm(true)) return;
        
        const entry = this.data.find(item => item.id === this.currentEditId);
        if (!entry) return;
        
        // Update entry
        const fields = ['date', 'category', 'partyName', 'remarks', 'siteName', 'cashIn', 'cashOut', 'comments'];
        fields.forEach(field => {
            const element = document.getElementById('edit' + field.charAt(0).toUpperCase() + field.slice(1));
            if (element) {
                if (field === 'cashIn' || field === 'cashOut') {
                    entry[field] = parseFloat(element.value) || 0;
                } else {
                    entry[field] = element.value;
                }
            }
        });
        
        this.applyFilters();
        this.updateSummary();
        this.closeEditModal();
        this.showSuccessMessage('Entry updated successfully!');
    }
    
    closeEditModal() {
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.classList.add('hidden');
        }
        this.currentEditId = null;
    }
    
    deleteEntry(id) {
        this.currentDeleteId = id;
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.classList.remove('hidden');
        }
    }
    
    confirmDelete() {
        if (this.currentDeleteId) {
            this.data = this.data.filter(item => item.id !== this.currentDeleteId);
            this.applyFilters();
            this.updateSummary();
            this.closeDeleteModal();
            this.showSuccessMessage('Entry deleted successfully!');
        }
    }
    
    closeDeleteModal() {
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.classList.add('hidden');
        }
        this.currentDeleteId = null;
    }
    
    // CSV Export (Fallback)
    exportCSV() {
        console.log('CSV export initiated');
        
        try {
            const headers = ['Date', 'Category', 'Party Name', 'Remarks', 'Site Name', 'Cash In (₹)', 'Cash Out (₹)', 'Comments'];
            const csvContent = [
                '# VASTECH CONSTRUCTION COMPANY',
                '# Construction Data Management System',
                '',
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
                ].join(',')),
                '',
                '# SUMMARY',
                `Total Cash In,${this.data.reduce((sum, entry) => sum + entry.cashIn, 0)}`,
                `Total Cash Out,${this.data.reduce((sum, entry) => sum + entry.cashOut, 0)}`,
                `Net Balance,${this.data.reduce((sum, entry) => sum + entry.cashIn - entry.cashOut, 0)}`,
                `Total Entries,${this.data.length}`,
                `Export Date,${new Date().toLocaleString('en-IN')}`
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `VASTECH_Construction_Data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccessMessage('CSV file downloaded successfully!');
            console.log('CSV export completed successfully');
            
        } catch (error) {
            console.error('CSV export error:', error);
            this.showErrorMessage('CSV export failed: ' + error.message);
        }
    }
    
    printData() {
        window.print();
    }
}

// Initialize the application
let app;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    app = new ConstructionDataApp();
}

// Handle escape key for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && app) {
        const editModal = document.getElementById('editModal');
        const deleteModal = document.getElementById('deleteModal');
        const exportModal = document.getElementById('exportStatusModal');
        
        if (editModal && !editModal.classList.contains('hidden')) {
            app.closeEditModal();
        } else if (deleteModal && !deleteModal.classList.contains('hidden')) {
            app.closeDeleteModal();
        } else if (exportModal && !exportModal.classList.contains('hidden')) {
            app.closeExportStatusModal();
        }
    }
});

// Debug function to check XLSX availability
window.checkXLSX = function() {
    if (typeof XLSX !== 'undefined') {
        console.log('✅ XLSX is available');
        console.log('Version:', XLSX.version);
        console.log('Available methods:', Object.keys(XLSX.utils));
        return true;
    } else {
        console.log('❌ XLSX is NOT available');
        return false;
    }
};

// Test Excel export function
window.testExcelExport = function() {
    if (app) {
        console.log('Testing Excel export...');
        app.exportToExcel();
    } else {
        console.log('App not initialized yet');
    }
};

console.log('VASTECH Construction Data Management App loaded');
console.log('Use checkXLSX() to verify XLSX library availability');
console.log('Use testExcelExport() to test Excel export functionality');
// QBE (Query By Example) filtering for effective date and override level

const QBEFilter = {
    initQBEFiltering() {
        // Attach event listeners to QBE inputs
        const qbeInputs = document.querySelectorAll('.qbe-input');
        qbeInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                // Submit on Enter key
                if (e.key === 'Enter') {
                    this.submitQBEFilters();
                }
            });
        });
    },

    submitQBEFilters() {
        // Build QBE parameters from form inputs
        const qbeParams = new URLSearchParams();
        const qbeInputs = document.querySelectorAll('.qbe-input');

        qbeInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                // Use the input name as-is (already has "qbe." prefix from HTML)
                qbeParams.append(input.name, value);
            }
        });

        // Submit to backend
        if (qbeParams.toString()) {
            window.location.href = '/overrides?' + qbeParams.toString();
        } else {
            // No filters, redirect to browse page
            window.location.href = '/overrides';
        }
    },

    clearQBEFilters() {
        // Clear all QBE inputs
        const qbeInputs = document.querySelectorAll('.qbe-input');
        qbeInputs.forEach(input => {
            input.value = '';
        });

        // Redirect to clear filters
        window.location.href = '/overrides';
    },

    // Client-side filtering helper (for reference, uses backend filters)
    matchesNumericFilter(value, filter) {
        try {
            if (filter.startsWith('>=')) {
                const num = parseInt(filter.substring(2));
                return value >= num;
            } else if (filter.startsWith('<=')) {
                const num = parseInt(filter.substring(2));
                return value <= num;
            } else if (filter.startsWith('>')) {
                const num = parseInt(filter.substring(1));
                return value > num;
            } else if (filter.startsWith('<')) {
                const num = parseInt(filter.substring(1));
                return value < num;
            } else if (filter.startsWith('=')) {
                const num = parseInt(filter.substring(1));
                return value === num;
            } else {
                const num = parseInt(filter);
                return value === num;
            }
        } catch (e) {
            return false;
        }
    },

    matchesDateFilter(displayDate, filterInput) {
        try {
            // displayDate format: MM/dd/yyyy (from Freemarker formatting)
            // filterInput format: yyyy-MM-dd (from HTML date input)
            const parts = displayDate.split('/');
            if (parts.length !== 3) return false;
            const displayDateISO = `${parts[2]}-${parts[0]}-${parts[1]}`;
            
            if (filterInput.startsWith('>=')) {
                const filterDate = filterInput.substring(2);
                return displayDateISO >= filterDate;
            } else if (filterInput.startsWith('<=')) {
                const filterDate = filterInput.substring(2);
                return displayDateISO <= filterDate;
            } else if (filterInput.startsWith('>')) {
                const filterDate = filterInput.substring(1);
                return displayDateISO > filterDate;
            } else if (filterInput.startsWith('<')) {
                const filterDate = filterInput.substring(1);
                return displayDateISO < filterDate;
            } else {
                return displayDateISO === filterInput;
            }
        } catch (e) {
            return false;
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof QBEFilter !== 'undefined') {
        QBEFilter.initQBEFiltering();
    }
});

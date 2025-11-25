// QBE (Query By Example) - Build parameters and submit to backend

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
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof QBEFilter !== 'undefined') {
        QBEFilter.initQBEFiltering();
    }
});

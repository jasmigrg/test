// Main initialization file - Loads all modules and initializes on page load

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('override-browse.js loaded');

    // Initialize GridManager
    if (typeof GridManager !== 'undefined') {
        GridManager.initDropdowns();
        GridManager.initColumnToggle();
        GridManager.initColumnSearch();
    } else {
        console.error('GridManager not found!');
    }

    // Initialize row selection (from row-selection.js)
    if (typeof initRowSelection !== 'undefined') {
        initRowSelection();
    }

    // Add event listener for preference type selection
    const preferenceTypeRadios = document.querySelectorAll('input[name="preferenceType"]');
    preferenceTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const customInput = document.getElementById('customPreferenceName');
            const suggestedSelect = document.getElementById('suggestedPreferenceSelect');

            // Safely update custom input if it exists
            if (customInput) {
                customInput.disabled = e.target.value !== 'custom';
            }

            // Safely update suggested select if it exists
            if (suggestedSelect) {
                suggestedSelect.disabled = e.target.value !== 'suggested';
            }
        });
    });

    // Handle modal closing by clicking outside
    const modals = [
        { id: 'preferenceModal', close: () => GridManager?.closePreferenceModal?.() },
        { id: 'successModal', close: () => GridManager?.closeSuccessModal?.() },
        { id: 'appliedSuccessModal', close: () => GridManager?.closeAppliedSuccessModal?.() }
    ];

    modals.forEach(({ id, close }) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) close();
            });
        }
    });

    // Update suggestion names on modal open
    const preferenceModal = document.getElementById('preferenceModal');
    if (preferenceModal) {
        const observer = new MutationObserver(() => {
            if (preferenceModal.classList.contains('show')) {
                GridManager.updateSuggestionNames();
            }
        });
        observer.observe(preferenceModal, { attributes: true });
    }
});
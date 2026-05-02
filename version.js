// Central version configuration
const APP_VERSION = "0.9.4";

// Function to display version in footer
function displayVersion() {
    const footers = document.querySelectorAll('footer p');
    footers.forEach(footer => {
        if (footer.textContent.includes('©')) {
            footer.textContent = `© 2025 | Version ${APP_VERSION}`;
        }
    });
}

// Wire up close buttons on disclaimer alerts
function wireDisclaimerClose() {
    document.querySelectorAll('.disclaimer-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const alert = btn.closest('.disclaimer-alert');
            if (alert) alert.classList.add('is-hidden');
        });
    });
}

// Auto-execute when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    displayVersion();
    wireDisclaimerClose();
});
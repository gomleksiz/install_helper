// Central version configuration
const APP_VERSION = "1.4.1";

// Function to display version in footer
// The footer is a flex row of <span>s (.site-footer); the copyright span is the
// one containing ©. Older pages used <p>, so both are matched.
function displayVersion() {
    document.querySelectorAll('footer p, footer span').forEach(el => {
        if (el.textContent.includes('\u00a9')) {
            el.textContent = `\u00a9 2025 | Version ${APP_VERSION}`;
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
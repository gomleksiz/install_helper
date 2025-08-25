// Central version configuration
const APP_VERSION = "0.2";

// Function to display version in footer
function displayVersion() {
    const footers = document.querySelectorAll('footer p');
    footers.forEach(footer => {
        if (footer.textContent.includes('©')) {
            footer.textContent = `© 2025 | Version ${APP_VERSION}`;
        }
    });
}

// Auto-execute when DOM is loaded
document.addEventListener('DOMContentLoaded', displayVersion);
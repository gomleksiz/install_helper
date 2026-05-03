# Stonebranch Installation Command Generator

A web-based tool for generating installation commands for Stonebranch Universal Agent and Controller components. This tool simplifies the process of creating properly formatted installation commands with the correct parameters for your specific environment.

## 🌐 Live Demo

Visit the live application: [https://gomleksiz.github.io/install_helper/](https://gomleksiz.github.io/install_helper/)

## 📋 Features

### Environment Prerequisite Generator
- OS-specific setup scripts for Java, Tomcat, and database prerequisites
- Tomcat installation via package manager or manual download (tar.gz)
- Configurable Tomcat user and install folder for manual installs
- JVM memory configuration (setenv.sh/setenv.bat/tomcatw.exe) with customizable heap sizes
- Downloadable systemd service file for manual Tomcat installs with optional JAVA_HOME
- Windows support with installer (.exe) and ZIP download options
- Syntax-highlighted script output (comments vs commands)
- Database installation commands for MySQL, MariaDB, and PostgreSQL
- Agent prerequisite library installation (e.g., libxcrypt-compat for Amazon Linux)

### Universal Controller
- Database configuration with support for MySQL, PostgreSQL, Oracle, and SQL Server
- Automatic detection of Linux vs Windows environments based on Tomcat directory path
- Dynamic script extension selection (.sh for Linux, .bat for Windows)
- Always includes required database parameters (name, user, password)

### Universal Agent (Linux)
- Comprehensive parameter configuration including user options, directories, and security settings
- Dynamic field population based on user input
- Support for custom installation directories and user mode installation
- Advanced parameters including network configuration and TLS settings
- Additional command generation for PAM security and systemctl service registration

### Universal Agent (Windows)
- MSI installer parameter generation
- Agent cluster configuration
- Simplified parameter set focused on Windows-specific options

### Post Configuration
- Tabbed reference page for recommended post-install settings
- **UC Properties** tab with a two-column table of recommended Universal Controller properties and their values
- **SSL Configuration** tab with an interactive Tomcat SSL generator: pick from four certificate sources (no certificate, CA certificate, `.pem`/`.pkcs12` files, or existing keystore) and the form live-generates the matching `keytool`/`openssl` commands and the `server.xml` `<Connector>` snippet (TLS 1.2/1.3, port 443), plus a one-click `sudo systemctl restart tomcat` command

### General Features
- **Home page tool cards** including a dedicated Post Configuration card describing recommended UC properties and the Tomcat SSL setup guide
- **Header disclaimer banner** indicating reference-only information
- **Copy-to-clipboard functionality** with SVG icons
- **Responsive design** with Stonebranch branding
- **Form validation** and conditional field display
- **Parameter validation** to prevent configuration errors

## 🚀 Getting Started

### Prerequisites
- Any modern web browser
- No server-side dependencies required (static HTML/CSS/JavaScript)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/gomleksiz/install_helper.git
   cd install_helper
   ```

2. Open `index.html` in your web browser, or serve it using a local HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js
   npx serve .
   ```

3. Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
install_helper/
├── index.html              # Homepage with navigation and documentation links
├── environment.html        # Environment prerequisite setup form
├── environment.js          # Environment page logic and command generation
├── controller.html         # Controller installation form
├── agent_linux.html        # Linux Agent installation form
├── agent_windows.html      # Windows Agent installation form
├── script.js              # JavaScript for form handling and command generation
├── version.js             # Centralized version configuration
├── style.css              # Styling with Stonebranch branding
├── CLAUDE.md              # Development documentation
└── README.md              # This file
```

## 🛠️ How to Use

1. **Select Component**: Choose the component you want to install (Controller, Agent Linux, or Agent Windows)
2. **Configure Parameters**: Fill out the form with your environment-specific values
3. **Generate Command**: Click "Generate Command" to create the installation command
4. **Copy & Execute**: Use the copy button to copy the command and run it on your target system

## 📖 Documentation

For detailed installation instructions and requirements, refer to the official Stonebranch documentation:

- **Universal Controller**: [Installation and Applying Maintenance](https://docs.stonebranch.com/uac/uc/installation-and-applying-maintenance-overview)
- **Universal Agent**: [Universal Agent Installation Information](https://docs.stonebranch.com/uac/ua/universal-agent-installation-information)

## 🎨 Technical Details

### Controller Form Logic
- Detects Windows paths using regex pattern `/^[A-Za-z]:/` and backslashes
- Automatically selects appropriate script extension (.sh vs .bat)
- Always includes `--dbname`, `--dbpass`, and `--rdbms` parameters
- RDBMS dropdown auto-populates database URL field with correct JDBC format

### Agent Form Features
- Dynamic user/group field population with "ubroker" placeholder behavior
- Base directory auto-population for install, config, and data directories
- Conditional parameter inclusion based on user vs default values
- Special handling for network configuration and cluster settings

### Form Validation
- Directory validation ensures all three directories are specified together
- Port validation with default value handling
- Parameter quoting for values containing spaces
- Conditional command generation based on form state

## 🤝 Contributing

This project was developed with Claude Code assistance. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across different browsers
5. Submit a pull request

## 📄 License

This project is open source. Please refer to the repository license for specific terms.

## 🔧 Development Notes

- Built with vanilla HTML, CSS, and JavaScript for maximum compatibility
- No build process required - ready to deploy as static files
- Responsive design works on desktop and mobile devices
- Cross-browser compatible with modern browsers

---

**Stonebranch Installation Command Generator** - Simplifying Stonebranch deployments one command at a time.
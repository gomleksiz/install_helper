# Stonebranch Installation Command Generator

A web-based tool for generating installation commands for Stonebranch Universal Agent and Controller components. This tool simplifies the process of creating properly formatted installation commands with the correct parameters for your specific environment.

## ✨ What's new in 1.0.0 — full redesign

The whole site was rebuilt on a new design system. The generated commands and scripts are **unchanged** — the redesign was verified to produce byte-identical output to the previous version for the same inputs.

- **New look**: dark app header with compact nav, white cards, pill-style option buttons, IBM Plex Mono / Inter Tight typography
- **Side-by-side layout**: form on the left, generated script on the right (50/50 by default) with an **expand** button that widens the output to 60% and enlarges the code font
- **Wrapping terminal output** — no more horizontal scrolling to read a long command
- **Collapsible inline guidance** instead of a permanent reference column
- **Post Configuration** now uses the same two-column form/output layout on its SSL and UA Cert tabs
- **Sizing Calculator** rebuilt with the new design (workload cards, retention/deployment pills, spec table, storage breakdown, warnings, procurement summary, print-to-PDF) while keeping the **original sizing calculations** unchanged
- **Previous version archived** under [`v1/`](v1/) and still fully usable


## 🌐 Live Demo

Visit the live application: [https://gomleksiz.github.io/install_helper/](https://gomleksiz.github.io/install_helper/)

## 📋 Features

### Environment Prerequisite Generator
- One-click button selectors (instead of dropdowns) for OS, Java version/method, Tomcat method, and database type
- Java, Tomcat, and Database pre-selected by default, with the script generated live as you toggle options (no "Generate" button needed)
- OS-specific setup scripts for Java, Tomcat, and database prerequisites
- Tomcat installation via package manager or manual download (tar.gz)
- Configurable Tomcat user and install folder for manual installs
- JVM memory configuration (setenv.sh/setenv.bat/tomcatw.exe) with customizable heap sizes
- Downloadable systemd service file for manual Tomcat installs with optional JAVA_HOME
- Windows support with installer (.exe) and ZIP download options
- Syntax-highlighted script output (comments vs commands)
- Database installation commands for MySQL, MariaDB, and PostgreSQL
- Configurable Database Name, User, and Password fields that generate database/user creation and privilege-grant commands (including the PostgreSQL 15+ `public` schema grant)
- Correct `chown -R` handling for symlinked Tomcat install folders (uses a trailing slash so ownership applies to the real directory)
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
- **UA Cert Configuration** tab that generates the Universal Agent certificate workflow: pick one of three paths — *I don't have certs* (full self-signed CA + host cert), *I have a CA, create host cert* (sign a new host cert with an existing CA cert/key), or *I have certs* (just wire up existing files) — and the form live-builds the single-line `ucert` commands plus the `ubroker.conf`, `omss.conf`, `uags.conf`, and `uacl.conf` (with optional `cert_map` + `oms_cert_access`) snippets needed to make OMS reject agents without a valid certificate. Defaults the binary/cert paths to `/opt/universal/...`, runs as the `ubroker` user, names CA files after the organization, derives host filenames from the hostname, and finishes with an `openssl verify` validation step and a `sudo systemctl restart ubrokerd` command

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
├── index.html              # Homepage with deployment phases and tool cards
├── environment.html        # Environment prerequisite setup form
├── environment.js          # Environment page logic and script generation
├── controller.html         # Controller installation form
├── agent_linux.html        # Linux Agent installation form
├── agent_windows.html      # Windows Agent installation form
├── post_config.html        # Post-configuration reference + SSL / UA cert generators
├── post_config.css         # Post-configuration page styles
├── sizing.html             # Hardware sizing calculator
├── sizing.js               # Sizing calculations and rendering
├── sizing.css              # Sizing page styles (incl. print/PDF view)
├── script.js               # Shared form handling and command generation
├── version.js              # Centralized version configuration
├── style.css               # Shared design system (tokens, cards, pills, terminal)
├── v1/                     # Previous version of the site (archived, still usable)
├── new_design/             # Design prototypes the 1.0 redesign was built from
├── CLAUDE.md               # Development documentation
└── README.md               # This file
```

## 🛠️ How to Use

1. **Select Component**: Choose the component you want to install (Controller, Agent Linux, or Agent Windows)
2. **Configure Parameters**: Fill out the form with your environment-specific values — sensible defaults are pre-filled, so a usable command appears with zero clicks
3. **Watch it update live**: The command/script on the right regenerates as you type or toggle options (there is no "Generate" button)
4. **Copy & Execute**: Use the Copy button (or Download, where offered) and run it on your target system

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
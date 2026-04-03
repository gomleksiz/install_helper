// Environment Setup Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Only run on environment page
    const environmentForm = document.getElementById('environment-form');
    if (!environmentForm) return;

    // Setup checkbox toggle handlers
    setupCheckboxToggle('install_java', 'java-options');
    setupCheckboxToggle('install_tomcat', 'tomcat-options');
    setupCheckboxToggle('install_database', 'database-options');
    setupCheckboxToggle('install_agent_prereqs', 'agent-prereqs-info');
    setupCheckboxToggle('configure_setenv', 'setenv-options');
    setupCheckboxToggle('configure_systemd', 'systemd-options');

    // Show/hide manual options based on install method and OS
    const tomcatMethodSelect = document.getElementById('tomcat_method');
    const systemdWrapper = document.getElementById('systemd-checkbox-wrapper');
    const configureSystemd = document.getElementById('configure_systemd');
    const systemdOptions = document.getElementById('systemd-options');
    const manualOptionsWrapper = document.getElementById('manual-options-wrapper');
    const tomcatMethodWrapper = document.getElementById('tomcat-method-wrapper');
    const osSelect = document.getElementById('os_environment');

    function updateManualOptionsVisibility() {
        const isWindows = osSelect.value === 'windows';
        const isManual = tomcatMethodSelect.value === 'manual';
        if (tomcatMethodWrapper) tomcatMethodWrapper.style.display = 'block';
        const showManualOpts = isManual && !isWindows;
        if (manualOptionsWrapper) manualOptionsWrapper.style.display = showManualOpts ? 'block' : 'none';
        systemdWrapper.style.display = showManualOpts ? 'block' : 'none';
        if (!showManualOpts) {
            if (configureSystemd) configureSystemd.checked = false;
            if (systemdOptions) systemdOptions.style.display = 'none';
        }
    }

    if (tomcatMethodSelect) tomcatMethodSelect.addEventListener('change', updateManualOptionsVisibility);
    if (osSelect) osSelect.addEventListener('change', updateManualOptionsVisibility);

    // Show/hide Java method selector based on OS
    const javaMethodSelect = document.getElementById('java_method');
    const javaMethodWrapper = document.getElementById('java-method-wrapper');
    const javaManualOptions = document.getElementById('java-manual-options');

    function updateJavaMethodVisibility() {
        const isAws = osSelect.value === 'aws';
        if (javaMethodWrapper) javaMethodWrapper.style.display = isAws ? 'block' : 'none';
        if (!isAws && javaMethodSelect) {
            javaMethodSelect.value = 'package';
            if (javaManualOptions) javaManualOptions.style.display = 'none';
        }
        updateJavaManualOptionsVisibility();
    }

    function updateJavaManualOptionsVisibility() {
        const isManual = javaMethodSelect && javaMethodSelect.value === 'manual';
        const isAws = osSelect.value === 'aws';
        if (javaManualOptions) javaManualOptions.style.display = (isManual && isAws) ? 'block' : 'none';
    }

    if (javaMethodSelect) javaMethodSelect.addEventListener('change', updateJavaManualOptionsVisibility);
    if (osSelect) osSelect.addEventListener('change', updateJavaMethodVisibility);
    const installJavaCheckbox = document.getElementById('install_java');
    if (installJavaCheckbox) installJavaCheckbox.addEventListener('change', updateJavaMethodVisibility);

    // Auto-populate JAVA_HOME when OS/Java version changes
    const javaVersionSelect = document.getElementById('java_version');
    function updateSystemdDefaults() {
        const systemdJavaHome = document.getElementById('systemd_java_home');
        if (systemdJavaHome) {
            systemdJavaHome.value = getJavaHome(osSelect.value, javaVersionSelect.value);
        }
    }
    if (osSelect) osSelect.addEventListener('change', updateSystemdDefaults);
    if (javaVersionSelect) javaVersionSelect.addEventListener('change', updateSystemdDefaults);

    // No version selector needed since we only support Tomcat 10

    // Setup form submission
    environmentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        generateEnvironmentScript();
    });

    // Setup copy button
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const commandText = document.getElementById('generated-command').innerText;
            navigator.clipboard.writeText(commandText).then(() => {
                alert('Copied!');
            }, (err) => {
                console.error('Failed to copy command: ', err);
                alert('Copy failed.');
            });
        });
    }
});

function setupCheckboxToggle(checkboxId, sectionId) {
    const checkbox = document.getElementById(checkboxId);
    const section = document.getElementById(sectionId);
    if (checkbox && section) {
        checkbox.addEventListener('change', () => {
            section.style.display = checkbox.checked ? 'block' : 'none';
        });
    }
}

function generateEnvironmentScript() {
    const osEnvironment = document.getElementById('os_environment').value;
    const installJava = document.getElementById('install_java').checked;
    const installTomcat = document.getElementById('install_tomcat').checked;
    const installDatabase = document.getElementById('install_database').checked;
    const installAgentPrereqs = document.getElementById('install_agent_prereqs').checked;

    let commands = [];
    let downloadLinks = [];
    let showManualDownloads = false;

    // Windows - show only download links
    if (osEnvironment === 'windows') {
        if (installJava) {
            downloadLinks.push({
                title: 'Download Oracle JRE for Windows',
                url: 'http://www.oracle.com/technetwork/java/javase/downloads/index.html',
                description: 'Oracle Java Runtime Environment'
            });
            downloadLinks.push({
                title: 'Download OpenJDK for Windows',
                url: 'https://developers.redhat.com/products/openjdk/download/',
                description: 'Red Hat OpenJDK (Free and Open Source)'
            });
        }

        if (installTomcat) {
            const tomcatMethod = document.getElementById('tomcat_method').value;
            if (tomcatMethod === 'package') {
                downloadLinks.push({
                    title: 'Download Apache Tomcat 10.1.53 for Windows (Installer)',
                    url: 'https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.53/bin/apache-tomcat-10.1.53.exe',
                    description: 'Windows Service Installer (.exe)'
                });
            } else {
                downloadLinks.push({
                    title: 'Download Apache Tomcat 10.1.53 for Windows (ZIP)',
                    url: 'https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.53/bin/apache-tomcat-10.1.53.zip',
                    description: 'ZIP archive — for manual installation'
                });
            }
        }

        if (installDatabase) {
            downloadLinks.push({
                title: 'Stonebranch Database Installation Guide',
                url: 'https://stonebranchdocs.atlassian.net/wiki/spaces/UC79/pages/1614463314/Installing+a+Database',
                description: 'Complete database installation instructions for all supported databases'
            });
        }

        showManualDownloads = true;
        commands.push('# Windows Installation');
        commands.push('# Please download and install the required components using the links provided below.');
        commands.push('# Follow the installation wizards for each component.');

        if (installTomcat && document.getElementById('configure_setenv').checked) {
            const xms = (document.getElementById('env_xms').value.trim()) || '512m';
            const xmx = (document.getElementById('env_xmx').value.trim()) || '2048m';
            const tomcatMethod = document.getElementById('tomcat_method').value;
            commands.push('');
            if (tomcatMethod === 'package') {
                commands.push('# Configure JVM Memory via Tomcat Service Manager (tomcatw.exe):');
                commands.push('# Default path: C:\\Program Files\\Apache Software Foundation\\Tomcat 10.1\\bin\\tomcatw.exe');
                commands.push('# 1. Open tomcatw.exe from the Tomcat bin directory (or "Configure Tomcat" from Start Menu)');
                commands.push('# 2. Go to the "Java" tab');
                commands.push(`# 3. Set "Initial memory pool" to: ${xms}`);
                commands.push(`# 4. Set "Maximum memory pool" to: ${xmx}`);
                commands.push('# 5. Click "Apply" and restart the Tomcat service');
            } else {
                commands.push('# Create setenv.bat in Tomcat bin directory to configure JVM memory:');
                commands.push(`# echo set "CATALINA_OPTS=-Xms${xms} -Xmx${xmx}" > "<TOMCAT_DIR>\\bin\\setenv.bat"`);
            }
        }
    } else {
        // Linux - generate bash script
        // Add shebang and header
        commands.push('#!/bin/bash');
        commands.push('# Universal Controller Environment Setup Script');
        commands.push('# Generated by Installation Command Generator');
        commands.push('');

        // Agent Prerequisites
        if (installAgentPrereqs) {
            const agentPrereqsCommand = generateAgentPrereqsCommand(osEnvironment);
            if (agentPrereqsCommand) {
                commands.push('# Install Agent Prerequisites');
                commands.push(agentPrereqsCommand);
                commands.push('');
            }
        }

        // Java Installation
        if (installJava) {
            const javaVersion = document.getElementById('java_version').value;
            const javaMethod = document.getElementById('java_method') ? document.getElementById('java_method').value : 'package';

            if (osEnvironment === 'aws' && javaMethod === 'manual') {
                const isHeadless = document.getElementById('java_headless').checked;
                const javaManualCommands = generateJavaManualCommand(javaVersion, isHeadless);
                commands.push('# Install Amazon Corretto Java ' + javaVersion + ' (Manual RPM)');
                commands.push(...javaManualCommands);
                commands.push('');

                // Add download link
                const rpmUrl = getCorrettoRpmUrl(javaVersion, isHeadless);
                downloadLinks.push({
                    title: `Download Amazon Corretto ${javaVersion} RPM` + (isHeadless ? ' (Headless)' : ''),
                    url: rpmUrl,
                    description: 'Amazon Corretto ' + javaVersion + ' JDK for Linux x64' + (isHeadless ? ' — headless (no GUI/audio deps)' : '')
                });
                showManualDownloads = true;
            } else {
                const javaCommand = generateJavaCommand(osEnvironment, javaVersion);
                if (javaCommand) {
                    commands.push('# Install Java ' + javaVersion);
                    commands.push(javaCommand);
                    commands.push('');
                }
            }
        }

        // Tomcat Installation
        if (installTomcat) {
            const tomcatMethod = document.getElementById('tomcat_method').value;

            if (tomcatMethod === 'package') {
                const tomcatCommands = generateTomcatPackageCommand(osEnvironment);
                if (tomcatCommands.length > 0) {
                    commands.push('# Install Tomcat 10 via Package Manager');
                    commands.push(...tomcatCommands);
                    commands.push('');
                }
            } else {
                // Manual installation
                const tomcatUser = document.getElementById('tomcat_user').value.trim() || 'tomcat';
                const createUser = document.getElementById('create_tomcat_user').checked;
                const tomcatFolder = document.getElementById('tomcat_folder').value.trim() || '/opt/tomcat';
                const tomcatCommands = generateTomcatManualCommand(tomcatUser, createUser, tomcatFolder);
                commands.push('# Install Tomcat 10 Manually');
                commands.push(...tomcatCommands);
                commands.push('');

                // Add download link
                downloadLinks.push({
                    title: 'Download Tomcat 10 Manually',
                    url: getTomcatDownloadUrl(),
                    description: 'Apache Tomcat 10 tar.gz archive'
                });
                showManualDownloads = true;
            }
        }

        // JVM Memory Configuration (setenv)
        if (installTomcat && document.getElementById('configure_setenv').checked) {
            const xms = (document.getElementById('env_xms').value.trim()) || '512m';
            const xmx = (document.getElementById('env_xmx').value.trim()) || '2048m';
            const tomcatMethod = document.getElementById('tomcat_method').value;
            let binDir;
            if (tomcatMethod === 'manual') {
                const tomcatFolder = document.getElementById('tomcat_folder').value.trim() || '/opt/tomcat';
                binDir = `${tomcatFolder}/bin`;
            } else if (osEnvironment === 'ubuntu') {
                binDir = '/usr/share/tomcat10/bin';
            } else {
                binDir = '/usr/share/tomcat/bin';
            }
            commands.push('# Configure JVM Memory (setenv.sh)');
            commands.push(`cat > ${binDir}/setenv.sh << 'EOF'`);
            commands.push(`CATALINA_OPTS="-Xms${xms} -Xmx${xmx}"`);
            commands.push('EOF');
            commands.push(`chmod +x ${binDir}/setenv.sh`);
            commands.push('');
        }

        // systemd Service File (manual install only)
        if (installTomcat && document.getElementById('tomcat_method').value === 'manual' && document.getElementById('configure_systemd').checked) {
            commands.push('# Install systemd service file for Tomcat');
            commands.push('# (Use the downloaded "tomcat.service" file from above)');
            commands.push('sudo cp tomcat.service /etc/systemd/system/tomcat.service');
            commands.push('sudo systemctl daemon-reload');
            commands.push('sudo systemctl enable tomcat');
            commands.push('sudo systemctl start tomcat');
            commands.push('');
        }

        // Database Installation
        if (installDatabase) {
            const databaseType = document.getElementById('database_type').value;
            const dbCommands = generateDatabaseCommand(osEnvironment, databaseType);
            if (dbCommands.length > 0) {
                commands.push('# Install ' + capitalizeFirst(databaseType));
                commands.push(...dbCommands);
                commands.push('');
            }

            // Always add database documentation link
            downloadLinks.push({
                title: 'Stonebranch Database Installation Guide',
                url: 'https://stonebranchdocs.atlassian.net/wiki/spaces/UC79/pages/1614463314/Installing+a+Database',
                description: 'Detailed database setup and configuration instructions'
            });
            showManualDownloads = true;
        }

        // Add verification section
        if (installJava || installTomcat || installDatabase) {
            commands.push('# Verify Installations');
            const javaMethod = document.getElementById('java_method') ? document.getElementById('java_method').value : 'package';
            if (installJava && !(osEnvironment === 'aws' && javaMethod === 'manual')) {
                commands.push('java -version');
            }
            if (installTomcat && document.getElementById('tomcat_method').value === 'package') {
                if (osEnvironment === 'ubuntu') {
                    commands.push('systemctl status tomcat10');
                } else {
                    commands.push('systemctl status tomcat');
                }
            }
            if (installDatabase) {
                const dbType = document.getElementById('database_type').value;
                if (dbType === 'postgres') {
                    commands.push('psql --version');
                } else {
                    commands.push('mysql --version');
                }
            }
        }
    }

    // Display generated commands
    const commandOutput = document.getElementById('command-output');
    const generatedCommand = document.getElementById('generated-command');
    generatedCommand.innerHTML = highlightScript(commands);
    commandOutput.style.display = 'block';

    // Display systemd unit file download if applicable
    const systemdDownloadSection = document.getElementById('systemd-download-section');
    const systemdDownloadButton = document.getElementById('systemd-download-button');
    const showSystemd = osEnvironment !== 'windows'
        && installTomcat
        && document.getElementById('tomcat_method').value === 'manual'
        && document.getElementById('configure_systemd').checked;

    if (showSystemd) {
        const javaHome = document.getElementById('systemd_java_home').value.trim();
        const catalinaHome = document.getElementById('tomcat_folder').value.trim() || '/opt/tomcat';
        const catalinaBase = catalinaHome;

        const tomcatUser = document.getElementById('tomcat_user').value.trim() || 'tomcat';
        const unitFileContent = generateSystemdUnitFile(javaHome, catalinaHome, catalinaBase, tomcatUser).join('\n') + '\n';

        // Populate the collapsible content panel
        document.getElementById('systemd-unit-content').textContent = unitFileContent;
        document.getElementById('systemd-unit-details').removeAttribute('open');

        // Wire up copy button for unit file content
        const copyBtn = document.getElementById('systemd-copy-button');
        const newCopyBtn = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
        newCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(unitFileContent).then(() => {
                alert('Copied!');
            }, () => {
                alert('Copy failed.');
            });
        });

        // Replace download click handler each time to capture current unit file content
        const newButton = systemdDownloadButton.cloneNode(true);
        systemdDownloadButton.parentNode.replaceChild(newButton, systemdDownloadButton);
        newButton.addEventListener('click', () => {
            const blob = new Blob([unitFileContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tomcat.service';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        systemdDownloadSection.style.display = 'block';
    } else {
        systemdDownloadSection.style.display = 'none';
    }

    // Display manual download links if needed
    const manualDownloadSection = document.getElementById('manual-download-section');
    const downloadLinksDiv = document.getElementById('download-links');

    if (showManualDownloads && downloadLinks.length > 0) {
        downloadLinksDiv.innerHTML = downloadLinks.map(link =>
            `<p><a href="${link.url}" target="_blank" class="download-link">${link.title}</a>${link.description ? '<br><span style="font-size: 12px; color: #666;">' + link.description + '</span>' : ''}</p>`
        ).join('');
        manualDownloadSection.style.display = 'block';
    } else {
        manualDownloadSection.style.display = 'none';
    }

    // Scroll to output
    setTimeout(() => {
        commandOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function generateJavaCommand(osEnvironment, javaVersion) {
    switch (osEnvironment) {
        case 'aws':
            return `sudo yum install java-${javaVersion}-amazon-corretto-headless -y`;
        case 'rhel':
            return `sudo yum install java-${javaVersion}-openjdk-headless -y`;
        case 'ubuntu':
            return `sudo apt-get update && sudo apt-get install openjdk-${javaVersion}-jdk-headless -y`;
    }
    return '';
}

function getCorrettoRpmUrl(javaVersion, isHeadless) {
    const headlessSuffix = isHeadless ? '-headless' : '';
    return `https://corretto.aws/downloads/latest/amazon-corretto-${javaVersion}-x64-linux${headlessSuffix}-jdk.rpm`;
}

function generateJavaManualCommand(javaVersion, isHeadless) {
    const rpmUrl = getCorrettoRpmUrl(javaVersion, isHeadless);
    const filename = rpmUrl.split('/').pop();
    const commands = [];

    commands.push('# Step 1: Download the RPM');
    commands.push(`wget ${rpmUrl}`);
    commands.push('');
    commands.push('# Step 2: Install the RPM');
    commands.push(`sudo yum localinstall -y ${filename}`);
    commands.push('');
    commands.push('# Step 3: Verify');
    commands.push('java -version');

    return commands;
}

function generateTomcatPackageCommand(osEnvironment) {
    const commands = [];

    switch (osEnvironment) {
        case 'aws':
        case 'rhel':
            commands.push('sudo yum install tomcat10 -y');
            break;
        case 'ubuntu':
            commands.push('sudo apt-get update && sudo apt-get install tomcat10 -y');
            break;
        default:
            return [];
    }

    // Add service management commands
    commands.push('sudo systemctl enable tomcat10');
    commands.push('sudo systemctl start tomcat10');
    commands.push('sudo systemctl status tomcat10');
    commands.push('curl localhost:8080');

    return commands;
}

function generateTomcatManualCommand(tomcatUser, createUser, tomcatFolder) {
    const commands = [];
    const downloadUrl = getTomcatDownloadUrl();
    const filename = downloadUrl.split('/').pop();
    const dirname = filename.replace('.tar.gz', '');
    const parentDir = tomcatFolder.substring(0, tomcatFolder.lastIndexOf('/')) || '/opt';

    commands.push('# Download Tomcat 10');
    commands.push(`wget ${downloadUrl}`);
    commands.push('');
    commands.push('# Extract Tomcat');
    commands.push(`tar -xvzf ${filename}`);
    commands.push('');
    commands.push('# Move to install directory and create symlink');
    commands.push(`sudo mv ${dirname} ${parentDir}/`);
    commands.push(`sudo ln -s ${parentDir}/${dirname} ${tomcatFolder}`);
    commands.push('');

    if (tomcatUser === 'root') {
        commands.push('# WARNING: Running Tomcat as root is not recommended.');
        commands.push('# Consider using a dedicated system user for improved security.');
        commands.push('');
    } else if (createUser) {
        commands.push('# Create Tomcat system user');
        commands.push(`sudo useradd -r -m -U -d ${tomcatFolder} -s /bin/false ${tomcatUser}`);
        commands.push('');
    }

    commands.push('# Set permissions');
    commands.push(`sudo chown -R ${tomcatUser}:${tomcatUser} ${tomcatFolder}`);
    commands.push(`sudo chmod +x ${tomcatFolder}/bin/*.sh`);

    return commands;
}

function getTomcatDownloadUrl() {
    return 'https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.53/bin/apache-tomcat-10.1.53.tar.gz';
}

function generateAgentPrereqsCommand(osEnvironment) {
    switch (osEnvironment) {
        case 'aws':
            return 'sudo yum install libxcrypt-compat -y';
        case 'rhel':
            return 'sudo yum install libxcrypt-compat -y';
        case 'ubuntu':
            // Ubuntu typically doesn't need this package
            return '';
    }
    return '';
}

function generateDatabaseCommand(osEnvironment, databaseType) {
    const commands = [];

    switch (osEnvironment) {
        case 'aws':
        case 'rhel':
            if (databaseType === 'mysql') {
                commands.push('sudo yum install mysql-server -y');
                commands.push('sudo systemctl start mysqld');
                commands.push('sudo systemctl enable mysqld');
            } else if (databaseType === 'mariadb') {
                commands.push('sudo yum install mariadb105-server -y');
                commands.push('sudo systemctl start mariadb');
                commands.push('sudo systemctl enable mariadb');
            } else if (databaseType === 'postgres') {
                commands.push('sudo yum install postgresql-server postgresql-contrib -y');
                commands.push('sudo postgresql-setup --initdb');
                commands.push('sudo systemctl start postgresql');
                commands.push('sudo systemctl enable postgresql');
            }
            break;
        case 'ubuntu':
            if (databaseType === 'mysql') {
                commands.push('sudo apt-get update && sudo apt-get install mysql-server -y');
                commands.push('sudo systemctl start mysql');
                commands.push('sudo systemctl enable mysql');
            } else if (databaseType === 'mariadb') {
                commands.push('sudo apt-get update && sudo apt-get install mariadb-server -y');
                commands.push('sudo systemctl start mariadb');
                commands.push('sudo systemctl enable mariadb');
            } else if (databaseType === 'postgres') {
                commands.push('sudo apt-get update && sudo apt-get install postgresql postgresql-contrib -y');
                commands.push('sudo systemctl start postgresql');
                commands.push('sudo systemctl enable postgresql');
            }
            break;
    }

    return commands;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getJavaHome(osEnvironment, javaVersion) {
    switch (osEnvironment) {
        case 'aws':
            return `/usr/lib/jvm/java-${javaVersion}-amazon-corretto`;
        case 'rhel':
            return `/usr/lib/jvm/jre-${javaVersion}-openjdk`;
        case 'ubuntu':
            return `/usr/lib/jvm/java-${javaVersion}-openjdk-amd64`;
        default:
            return '/usr/lib/jvm/jre';
    }
}

function generateSystemdUnitFile(javaHome, catalinaHome, catalinaBase, tomcatUser) {
    const lines = [
        '[Unit]',
        'Description=Apache Tomcat',
        'After=network.target',
        '',
        '[Service]',
        'Type=forking',
        `User=${tomcatUser}`,
        `Environment="CATALINA_HOME=${catalinaHome}"`,
        `Environment="CATALINA_BASE=${catalinaBase}"`,
        `Environment="CATALINA_PID=${catalinaHome}/temp/tomcat.pid"`,
    ];

    if (javaHome) {
        lines.push(`Environment="JAVA_HOME=${javaHome}"`);
    } else {
        lines.push('# Uncomment and adjust if needed:');
        lines.push('# Environment="JAVA_HOME=/usr/lib/jvm/jre-17-openjdk"');
    }

    lines.push(
        '',
        `PIDFile=${catalinaHome}/temp/tomcat.pid`,
        `ExecStart=${catalinaHome}/bin/startup.sh`,
        `ExecStop=${catalinaHome}/bin/shutdown.sh`,
        '',
        'TimeoutStopSec=20',
        'KillMode=mixed',
        '',
        '[Install]',
        'WantedBy=multi-user.target',
    );

    return lines;
}

function highlightScript(commands) {
    return commands.map(line => {
        const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (/^\s*#/.test(line)) {
            return `<span class="script-comment">${escaped}</span>`;
        } else if (escaped.trim() === '') {
            return escaped;
        } else {
            return `<span class="script-command">${escaped}</span>`;
        }
    }).join('\n');
}

// Helper function for copying code (can be called from HTML)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }, (err) => {
        console.error('Failed to copy: ', err);
        alert('Copy failed.');
    });
}

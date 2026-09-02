// Environment Setup Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Only run on environment page
    const environmentForm = document.getElementById('environment-form');
    if (!environmentForm) return;

    // Setup checkbox toggle handlers
    setupCheckboxToggle('configure_systemd', 'systemd-options');

    // Component sub-option panels are driven by their None/... button groups
    function updateComponentPanels() {
        const isWindows = document.getElementById('os_environment').value === 'windows';
        const javaOn = document.getElementById('java_version').value !== 'none';
        const tomcatOn = document.getElementById('tomcat_method').value !== 'none';
        const dbOn = document.getElementById('database_type').value !== 'none';
        const agentOn = document.getElementById('agent_prereqs').value === 'install';
        document.getElementById('java-options').style.display = javaOn ? 'block' : 'none';
        document.getElementById('tomcat-options').style.display = tomcatOn ? 'block' : 'none';
        document.getElementById('database-options').style.display = dbOn ? 'block' : 'none';
        document.getElementById('agent-prereqs-info').style.display = agentOn ? 'block' : 'none';

        // On Windows the Database Name/User fields never reach the output (only a
        // documentation link is produced), so hide them rather than collect input
        // that is silently discarded. Show a short explanation in their place.
        const dbNameGroup = document.getElementById('db-name-group');
        const dbUserGroup = document.getElementById('db-user-group');
        const dbPasswordGroup = document.getElementById('db-password-group');
        const dbPasswordNote = document.getElementById('db-password-note');
        const dbWindowsNote = document.getElementById('db-windows-note');
        if (dbNameGroup) dbNameGroup.style.display = isWindows ? 'none' : 'flex';
        if (dbUserGroup) dbUserGroup.style.display = isWindows ? 'none' : 'flex';
        if (dbPasswordGroup) dbPasswordGroup.style.display = isWindows ? 'none' : 'flex';
        if (dbPasswordNote) dbPasswordNote.style.display = isWindows ? 'none' : 'block';
        if (dbWindowsNote) dbWindowsNote.style.display = isWindows ? 'block' : 'none';

        // The Agent Prerequisites step is Linux-only; hide the whole card on Windows.
        const agentPrereqsCard = document.getElementById('agent-prereqs-card');
        if (agentPrereqsCard) agentPrereqsCard.style.display = isWindows ? 'none' : '';
    }

    // Show/hide manual options based on install method and OS
    const tomcatMethodSelect = document.getElementById('tomcat_method');
    const systemdWrapper = document.getElementById('systemd-checkbox-wrapper');
    const configureSystemd = document.getElementById('configure_systemd');
    const systemdOptions = document.getElementById('systemd-options');
    const manualOptionsWrapper = document.getElementById('manual-options-wrapper');
    const tomcatMethodWrapper = document.getElementById('tomcat-method-wrapper');
    const osSelect = document.getElementById('os_environment');

    // Wire button-group segmented controls: clicking a button updates its hidden input
    // and fires a change event so all existing listeners + live generation react.
    document.querySelectorAll('#environment-form .option-button').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            setButtonGroupValue(btn.dataset.target, btn.dataset.value);
        });
    });

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

    // No Tomcat 10 package exists on RHEL/Amazon Linux: force the manual method there
    const tomcatMethodPackageOption = document.getElementById('tomcat_method_package');
    const tomcatPackageUnavailableNote = document.getElementById('tomcat-package-unavailable');

    function updateTomcatMethodAvailability() {
        const noPackage = osSelect.value === 'aws' || osSelect.value === 'rhel';
        if (tomcatMethodPackageOption) {
            tomcatMethodPackageOption.disabled = noPackage;
            tomcatMethodPackageOption.setAttribute('aria-disabled', noPackage ? 'true' : 'false');
            if (noPackage) {
                tomcatMethodPackageOption.title = 'No Tomcat 10 package is available on RHEL/Amazon Linux — use Manual Download (tar.gz).';
            } else {
                tomcatMethodPackageOption.removeAttribute('title');
            }
        }
        if (tomcatPackageUnavailableNote) tomcatPackageUnavailableNote.style.display = noPackage ? 'block' : 'none';
        if (noPackage && tomcatMethodSelect.value === 'package') {
            setButtonGroupValue('tomcat_method', 'manual');
        }
    }

    // Agent Prerequisites default follows the OS: AWS (Amazon Linux) needs the
    // libxcrypt-compat prerequisite, so default it to "Install"; other systems default
    // to "None". Users can still override afterwards.
    function updateAgentPrereqsDefault() {
        const desired = osSelect.value === 'aws' ? 'install' : 'none';
        const agentPrereqs = document.getElementById('agent_prereqs');
        if (agentPrereqs && agentPrereqs.value !== desired) {
            setButtonGroupValue('agent_prereqs', desired);
        }
    }

    if (tomcatMethodSelect) tomcatMethodSelect.addEventListener('change', updateManualOptionsVisibility);
    if (osSelect) osSelect.addEventListener('change', () => {
        updateTomcatMethodAvailability();
        updateManualOptionsVisibility();
        updateAgentPrereqsDefault();
    });
    updateTomcatMethodAvailability();
    updateManualOptionsVisibility();
    updateAgentPrereqsDefault();

    // Show/hide Java method selector based on OS
    const javaMethodSelect = document.getElementById('java_method');
    const javaMethodWrapper = document.getElementById('java-method-wrapper');
    const javaManualOptions = document.getElementById('java-manual-options');

    function updateJavaMethodVisibility() {
        const javaOn = document.getElementById('java_version').value !== 'none';
        const isAws = osSelect.value === 'aws';
        if (javaMethodWrapper) javaMethodWrapper.style.display = (isAws && javaOn) ? 'block' : 'none';
        if (!isAws && javaMethodSelect) {
            setButtonGroupValue('java_method', 'package');
            if (javaManualOptions) javaManualOptions.style.display = 'none';
        }
        updateJavaManualOptionsVisibility();
    }

    function updateJavaManualOptionsVisibility() {
        const javaOn = document.getElementById('java_version').value !== 'none';
        const isManual = javaMethodSelect && javaMethodSelect.value === 'manual';
        const isAws = osSelect.value === 'aws';
        if (javaManualOptions) javaManualOptions.style.display = (isManual && isAws && javaOn) ? 'block' : 'none';
    }

    if (javaMethodSelect) javaMethodSelect.addEventListener('change', updateJavaManualOptionsVisibility);
    if (osSelect) osSelect.addEventListener('change', updateJavaMethodVisibility);

    // Auto-populate JAVA_HOME when OS/Java version changes
    const javaVersionSelect = document.getElementById('java_version');
    if (javaVersionSelect) javaVersionSelect.addEventListener('change', updateJavaMethodVisibility);
    function updateSystemdDefaults() {
        const systemdJavaHome = document.getElementById('systemd_java_home');
        if (systemdJavaHome) {
            const jv = javaVersionSelect.value;
            systemdJavaHome.value = jv === 'none' ? '' : getJavaHome(osSelect.value, jv);
        }
    }
    if (osSelect) osSelect.addEventListener('change', updateSystemdDefaults);
    if (javaVersionSelect) javaVersionSelect.addEventListener('change', updateSystemdDefaults);

    // No version selector needed since we only support Tomcat 10

    // Sync visibility with the pre-selected defaults on load
    updateComponentPanels();
    updateJavaMethodVisibility();
    updateSystemdDefaults();

    // Live generation: regenerate the script on any change instead of a Generate click
    environmentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        generateEnvironmentScript();
    });
    environmentForm.addEventListener('change', () => {
        updateComponentPanels();
        generateEnvironmentScript();
    });
    environmentForm.addEventListener('input', generateEnvironmentScript);
    generateEnvironmentScript();

    // Setup copy button (inline "Copied ✓" feedback instead of a blocking alert)
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const commandText = document.getElementById('generated-command').innerText;
            copyWithFeedback(copyButton, commandText);
        });
    }

    // Setup "Download setup.sh" button — offers the generated Linux script as a file.
    const downloadSetupButton = document.getElementById('download-setup-button');
    if (downloadSetupButton) {
        downloadSetupButton.addEventListener('click', () => {
            const scriptText = document.getElementById('generated-command').innerText;
            const blob = new Blob([scriptText + '\n'], { type: 'text/x-shellscript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'setup.sh';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});

// copyWithFeedback() is shared and defined in script.js.

// Set the value of a button-group segmented control: update the hidden input,
// move the active class to the matching button, and fire a change event so
// dependent listeners (visibility toggles, live generation) run.
function setButtonGroupValue(targetId, value) {
    const hidden = document.getElementById(targetId);
    if (!hidden) return;
    hidden.value = value;
    document.querySelectorAll(`.option-button[data-target="${targetId}"]`).forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
    hidden.dispatchEvent(new Event('change', { bubbles: true }));
}

function setupCheckboxToggle(checkboxId, sectionId) {
    const checkbox = document.getElementById(checkboxId);
    const section = document.getElementById(sectionId);
    if (checkbox && section) {
        checkbox.addEventListener('change', () => {
            section.style.display = checkbox.checked ? 'block' : 'none';
        });
    }
}

// JVM heap is configured only when a specific size is chosen; "default" means
// leave Tomcat's built-in memory settings unchanged (no setenv override).
function heapConfigured() {
    const el = document.getElementById('env_xmx');
    return !!(el && el.value && el.value !== 'default');
}

function generateEnvironmentScript() {
    const osEnvironment = document.getElementById('os_environment').value;
    const installJava = document.getElementById('java_version').value !== 'none';
    const installTomcat = document.getElementById('tomcat_method').value !== 'none';
    const installDatabase = document.getElementById('database_type').value !== 'none';
    const installAgentPrereqs = document.getElementById('agent_prereqs').value === 'install';

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
                url: 'https://docs.stonebranch.com/uac/uc/installing-a-database',
                description: 'Complete database installation instructions for all supported databases'
            });
        }

        showManualDownloads = true;
        commands.push('# Windows Installation');
        commands.push('# Please download and install the required components using the links provided below.');
        commands.push('# Follow the installation wizards for each component.');

        if (installTomcat && heapConfigured()) {
            const xms = '512m';
            const xmx = (document.getElementById('env_xmx').value.trim()) || '2G';
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
                const hardenPerms = document.getElementById('harden_tomcat_perms')?.checked || false;
                const tomcatCommands = generateTomcatManualCommand(tomcatUser, createUser, tomcatFolder, hardenPerms);
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
        if (installTomcat && heapConfigured()) {
            const xms = '512m';
            const xmx = (document.getElementById('env_xmx').value.trim()) || '2G';
            const tomcatMethod = document.getElementById('tomcat_method').value;
            let binDir;
            let setenvOwner = '';
            let setenvMode = '';
            if (tomcatMethod === 'manual') {
                const tomcatFolder = document.getElementById('tomcat_folder').value.trim() || '/opt/tomcat';
                binDir = `${tomcatFolder}/bin`;
                // The manual install chowns the whole tree to the Tomcat user, so the new
                // file has to be created with sudo and then handed to that user too —
                // unless hardening applies, where bin/ is root-owned and Tomcat only reads it.
                const tomcatUser = document.getElementById('tomcat_user').value.trim() || 'tomcat';
                if (tomcatUser !== 'root') {
                    if (document.getElementById('harden_tomcat_perms')?.checked) {
                        // bin/ is root-owned under hardening; Tomcat sources this file, never writes it.
                        setenvOwner = `root:${tomcatUser}`;
                        setenvMode = '640';
                    } else {
                        setenvOwner = `${tomcatUser}:${tomcatUser}`;
                    }
                }
            } else if (osEnvironment === 'ubuntu') {
                binDir = '/usr/share/tomcat10/bin';
            } else {
                binDir = '/usr/share/tomcat/bin';
            }
            commands.push('# Configure JVM Memory (setenv.sh)');
            // `sudo sh -c`, not a plain `sudo cat >` — the redirection has to happen in a
            // root shell, since the calling user no longer owns this directory after the
            // chown above. The \" escapes keep the quotes in the written file: without
            // them the inner shell strips them and CATALINA_OPTS loses its -Xmx value.
            commands.push(`sudo sh -c 'echo CATALINA_OPTS=\\"-Xms${xms} -Xmx${xmx}\\" > ${binDir}/setenv.sh'`);
            // 640 rather than +x when hardened: catalina.sh sources setenv.sh, it never execs it.
            commands.push(`sudo chmod ${setenvMode || '+x'} ${binDir}/setenv.sh`);
            if (setenvOwner) {
                commands.push(`sudo chown ${setenvOwner} ${binDir}/setenv.sh`);
            }
            if (tomcatMethod === 'package') {
                commands.push('# Restart Tomcat to apply the new JVM memory settings');
                commands.push('sudo systemctl restart tomcat10');
            }
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
        } else if (installTomcat && document.getElementById('tomcat_method').value === 'manual') {
            // No systemd unit requested: start Tomcat directly as the tomcat user
            const tomcatUser = document.getElementById('tomcat_user').value.trim() || 'tomcat';
            const tomcatFolder = document.getElementById('tomcat_folder').value.trim() || '/opt/tomcat';
            commands.push(`# Start Tomcat as the ${tomcatUser} user.`);
            commands.push('# For a permanent setup prefer the systemd unit option above.');
            commands.push(`sudo -u ${tomcatUser} ${tomcatFolder}/bin/startup.sh`);
            commands.push('# Verify Tomcat is responding (default port 8080) — allow time to boot');
            commands.push('sleep 10');
            commands.push('curl -I http://localhost:8080/');
            commands.push('');
        }

        // Database Installation
        if (installDatabase) {
            const databaseType = document.getElementById('database_type').value;
            const dbName = document.getElementById('db_name').value.trim() || 'uc';
            const dbUser = document.getElementById('db_user').value.trim() || 'ucuser';
            // Security: never accept a real password. Always emit the CHANGE_ME placeholder
            // so nothing secret is written into the script or copied to the clipboard.
            const dbPassword = 'CHANGE_ME';
            const dbCommands = generateDatabaseCommand(osEnvironment, databaseType, dbName, dbUser, dbPassword);
            if (dbCommands.length > 0) {
                commands.push('# Install ' + capitalizeFirst(databaseType));
                commands.push(...dbCommands);
                commands.push('');
            }

            // Always add database documentation link
            downloadLinks.push({
                title: 'Stonebranch Database Installation Guide',
                url: 'https://docs.stonebranch.com/uac/uc/installing-a-database',
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

    // The "Download setup.sh" button only makes sense for the Linux shell script;
    // on Windows the output is guidance + download links, not a runnable .sh file.
    const downloadSetupButton = document.getElementById('download-setup-button');
    if (downloadSetupButton) {
        downloadSetupButton.style.display = (osEnvironment === 'windows') ? 'none' : '';
    }

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
            copyWithFeedback(newCopyBtn, unitFileContent);
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
}

function generateJavaCommand(osEnvironment, javaVersion) {
    switch (osEnvironment) {
        case 'aws':
            return `sudo dnf install java-${javaVersion}-amazon-corretto-headless -y`;
        case 'rhel':
            return `sudo dnf install java-${javaVersion}-openjdk-headless -y`;
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
    commands.push(`sudo dnf install -y ./${filename}`);
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
            commands.push('sudo dnf install tomcat10 -y');
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

function generateTomcatManualCommand(tomcatUser, createUser, tomcatFolder, hardenPerms) {
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

    commands.push('# Set permissions (trailing slash dereferences the symlink so -R recurses into the real directory)');
    commands.push(`sudo chown -R ${tomcatUser}:${tomcatUser} ${tomcatFolder}/`);

    // Hardening keeps the blanket chown above as the base and takes back only the
    // executable/config surface. The install root itself has to stay owned by the
    // service account: Universal Controller creates uc_logs/ and uc_export/ under it.
    if (hardenPerms && tomcatUser !== 'root') {
        commands.push('# Tomcat creates its config base at startup; pre-create it so root can keep conf/');
        commands.push(`sudo mkdir -p ${tomcatFolder}/conf/Catalina/localhost`);
        commands.push('# Take back the directories Tomcat must not be able to modify at runtime');
        commands.push(`sudo chown -R root:${tomcatUser} ${tomcatFolder}/bin/ ${tomcatFolder}/lib/ ${tomcatFolder}/conf/`);
        commands.push(`sudo chmod -R g-w,o-rwx ${tomcatFolder}/conf/`);
    }

    commands.push(`sudo chmod +x ${tomcatFolder}/bin/*.sh`);

    return commands;
}

function getTomcatDownloadUrl() {
    return 'https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.53/bin/apache-tomcat-10.1.53.tar.gz';
}

function generateAgentPrereqsCommand(osEnvironment) {
    switch (osEnvironment) {
        case 'aws':
            return 'sudo dnf install libxcrypt-compat -y';
        case 'rhel':
            return 'sudo dnf install libxcrypt-compat -y';
        case 'ubuntu':
            // Ubuntu typically doesn't need this package
            return '';
    }
    return '';
}

function generateDatabaseCommand(osEnvironment, databaseType, dbName, dbUser, dbPassword) {
    const commands = [];
    dbName = dbName || 'uc';
    dbUser = dbUser || 'ucuser';
    dbPassword = dbPassword || 'CHANGE_ME';

    switch (osEnvironment) {
        case 'aws':
        case 'rhel':
            if (databaseType === 'mysql') {
                commands.push('sudo dnf install mysql-server -y');
                commands.push('sudo systemctl start mysqld');
                commands.push('sudo systemctl enable mysqld');
            } else if (databaseType === 'mariadb') {
                commands.push('sudo dnf install mariadb105-server -y');
                commands.push('sudo systemctl start mariadb');
                commands.push('sudo systemctl enable mariadb');
            } else if (databaseType === 'postgres') {
                commands.push('sudo dnf install postgresql-server postgresql-contrib -y');
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

    // Create the database/user first (root still has passwordless socket access on a
    // fresh install), then secure the installation
    if (databaseType === 'mysql' || databaseType === 'mariadb') {
        const client = databaseType === 'mariadb' ? 'mariadb' : 'mysql';
        const secureCmd = databaseType === 'mariadb' ? 'mariadb-secure-installation' : 'mysql_secure_installation';
        commands.push('');
        commands.push(`# Create database and user (replace the password below with a strong secret)`);
        commands.push(`sudo ${client} <<'EOF'`);
        commands.push(`CREATE DATABASE ${dbName} CHARACTER SET utf8 COLLATE utf8_bin;`);
        commands.push(`CREATE USER '${dbUser}'@'localhost' IDENTIFIED BY '${dbPassword}';`);
        commands.push(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost';`);
        commands.push(`FLUSH PRIVILEGES;`);
        commands.push(`EOF`);
        commands.push('');
        commands.push(`# Secure the installation (interactive: set root password, remove test DB, etc.)`);
        commands.push(`# Run this AFTER creating the database above, since it sets a root password.`);
        commands.push(`sudo ${secureCmd}`);
    } else if (databaseType === 'postgres') {
        commands.push('');
        commands.push(`# Create database and user (replace the password below with a strong secret)`);
        commands.push(`sudo -u postgres psql <<'EOF'`);
        commands.push(`CREATE DATABASE ${dbName};`);
        commands.push(`CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}';`);
        commands.push(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};`);
        commands.push(`\\c ${dbName}`);
        commands.push(`-- PostgreSQL 15+ requires granting privileges on the public schema:`);
        commands.push(`GRANT ALL ON SCHEMA public TO ${dbUser};`);
        commands.push(`EOF`);
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

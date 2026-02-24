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
    setupCheckboxToggle('configure_initd', 'initd-options');

    // Show/hide init.d option based on tomcat install method
    const tomcatMethodSelect = document.getElementById('tomcat_method');
    const initdWrapper = document.getElementById('initd-checkbox-wrapper');
    const configureInitd = document.getElementById('configure_initd');
    const initdOptions = document.getElementById('initd-options');

    const manualOptionsWrapper = document.getElementById('manual-options-wrapper');

    if (tomcatMethodSelect && initdWrapper) {
        tomcatMethodSelect.addEventListener('change', () => {
            const isManual = tomcatMethodSelect.value === 'manual';
            if (manualOptionsWrapper) manualOptionsWrapper.style.display = isManual ? 'block' : 'none';
            initdWrapper.style.display = isManual ? 'block' : 'none';
            if (!isManual) {
                if (configureInitd) configureInitd.checked = false;
                if (initdOptions) initdOptions.style.display = 'none';
            }
        });
    }

    // Auto-populate JAVA_HOME and CATALINA_HOME when OS/Java version changes
    const osSelect = document.getElementById('os_environment');
    const javaVersionSelect = document.getElementById('java_version');
    function updateInitdDefaults() {
        const initdJavaHome = document.getElementById('initd_java_home');
        if (initdJavaHome) {
            initdJavaHome.value = getJavaHome(osSelect.value, javaVersionSelect.value);
        }
    }
    if (osSelect) osSelect.addEventListener('change', updateInitdDefaults);
    if (javaVersionSelect) javaVersionSelect.addEventListener('change', updateInitdDefaults);

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
            downloadLinks.push({
                title: 'Download Apache Tomcat 10 for Windows',
                url: 'https://tomcat.apache.org/download-10.cgi',
                description: 'Apache Tomcat 10 Windows Service Installer or ZIP archive'
            });
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
            commands.push('');
            commands.push('# Create setenv.bat in Tomcat bin directory to configure JVM memory:');
            commands.push(`# echo set "CATALINA_OPTS=-Xms${xms} -Xmx${xmx}" > "<TOMCAT_DIR>\\bin\\setenv.bat"`);
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
            const javaCommand = generateJavaCommand(osEnvironment, javaVersion);
            if (javaCommand) {
                commands.push('# Install Java ' + javaVersion);
                commands.push(javaCommand);
                commands.push('');
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
                const tomcatCommands = generateTomcatManualCommand(tomcatUser, createUser);
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
                binDir = '/opt/tomcat/bin';
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

        // init.d Service Script (manual install only)
        if (installTomcat && document.getElementById('tomcat_method').value === 'manual' && document.getElementById('configure_initd').checked) {
            commands.push('# Install init.d service script for Tomcat');
            commands.push('# (Use the downloaded "tomcat" script from above)');
            commands.push('sudo cp tomcat /etc/init.d/tomcat');
            commands.push('sudo chmod +x /etc/init.d/tomcat');

            if (osEnvironment === 'ubuntu') {
                commands.push('sudo update-rc.d tomcat defaults');
            } else {
                commands.push('sudo chkconfig --add tomcat');
            }
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
            if (installJava) {
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
    generatedCommand.textContent = commands.join('\n');
    commandOutput.style.display = 'block';

    // Display init.d script download if applicable
    const initdDownloadSection = document.getElementById('initd-download-section');
    const initdDownloadButton = document.getElementById('initd-download-button');
    const showInitd = osEnvironment !== 'windows'
        && installTomcat
        && document.getElementById('tomcat_method').value === 'manual'
        && document.getElementById('configure_initd').checked;

    if (showInitd) {
        const javaHome = document.getElementById('initd_java_home').value.trim() || '/usr/lib/jvm/jre';
        const catalinaHome = document.getElementById('initd_catalina_home').value.trim() || '/opt/tomcat';
        const catalinaBase = document.getElementById('initd_catalina_base').value.trim() || catalinaHome;
        const tomcatUser = document.getElementById('tomcat_user').value.trim() || 'tomcat';
        const shutdownWait = document.getElementById('initd_shutdown_wait').value.trim() || '20';

        const scriptContent = generateInitdScript(javaHome, catalinaHome, catalinaBase, tomcatUser, shutdownWait).join('\n') + '\n';

        // Replace click handler each time to capture current script content
        const newButton = initdDownloadButton.cloneNode(true);
        initdDownloadButton.parentNode.replaceChild(newButton, initdDownloadButton);
        newButton.addEventListener('click', () => {
            const blob = new Blob([scriptContent], { type: 'text/x-shellscript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tomcat';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        initdDownloadSection.style.display = 'block';
    } else {
        initdDownloadSection.style.display = 'none';
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

function generateTomcatManualCommand(tomcatUser, createUser) {
    const commands = [];
    const downloadUrl = getTomcatDownloadUrl();
    const filename = downloadUrl.split('/').pop();
    const dirname = filename.replace('.tar.gz', '');

    if (createUser) {
        commands.push('# Create Tomcat system user');
        commands.push(`sudo useradd -r -m -U -d /opt/tomcat -s /bin/false ${tomcatUser}`);
        commands.push('');
    }

    commands.push('# Download Tomcat 10');
    commands.push(`wget ${downloadUrl}`);
    commands.push('');
    commands.push('# Extract Tomcat');
    commands.push(`tar -xvzf ${filename}`);
    commands.push('');
    commands.push('# Move to /opt and create symlink');
    commands.push(`sudo mv ${dirname} /opt/`);
    commands.push(`sudo ln -s /opt/${dirname} /opt/tomcat`);
    commands.push('');
    commands.push('# Set permissions');
    commands.push(`sudo chown -R ${tomcatUser}:${tomcatUser} /opt/tomcat`);
    commands.push('sudo chmod +x /opt/tomcat/bin/*.sh');

    return commands;
}

function getTomcatDownloadUrl() {
    return 'https://archive.apache.org/dist/tomcat/tomcat-10/v10.1.30/bin/apache-tomcat-10.1.30.tar.gz';
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

function generateInitdScript(javaHome, catalinaHome, catalinaBase, tomcatUser, shutdownWait) {
    return [
        '#!/bin/bash',
        '#',
        '# tomcat',
        '#',
        '# chkconfig: - 80 20',
        '# description: Apache Tomcat init.d service script',
        '# Based on: https://gist.github.com/miglen/5590986',
        '#',
        '',
        '### BEGIN INIT INFO',
        '# Provides: tomcat',
        '# Required-Start: $network $syslog',
        '# Required-Stop: $network $syslog',
        '# Default-Start: 2 3 4 5',
        '# Default-Stop: 0 1 6',
        '# Description: Apache Tomcat Service',
        '### END INIT INFO',
        '',
        `JAVA_HOME=${javaHome}`,
        `CATALINA_HOME=${catalinaHome}`,
        `CATALINA_BASE=${catalinaBase}`,
        `CATALINA_PID="${catalinaHome}/temp/tomcat.pid"`,
        `TOMCAT_USER=${tomcatUser}`,
        `SHUTDOWN_WAIT=${shutdownWait}`,
        '',
        'tomcat_pid() {',
        '  echo $(ps aux | grep "[o]rg.apache.catalina.startup.Bootstrap" | grep -v grep | awk \'{ print $2 }\')',
        '}',
        '',
        'start() {',
        '  pid=$(tomcat_pid)',
        '  if [ -n "$pid" ]; then',
        '    echo "Tomcat is already running (pid: $pid)"',
        '  else',
        '    echo "Starting Tomcat..."',
        '    if [ "$(id -u)" = "0" ]; then',
        '      su - $TOMCAT_USER -c "export JAVA_HOME=$JAVA_HOME; export CATALINA_HOME=$CATALINA_HOME; export CATALINA_BASE=$CATALINA_BASE; export CATALINA_PID=$CATALINA_PID; $CATALINA_HOME/bin/startup.sh"',
        '    else',
        '      export JAVA_HOME=$JAVA_HOME',
        '      export CATALINA_HOME=$CATALINA_HOME',
        '      export CATALINA_BASE=$CATALINA_BASE',
        '      export CATALINA_PID=$CATALINA_PID',
        '      $CATALINA_HOME/bin/startup.sh',
        '    fi',
        '  fi',
        '}',
        '',
        'stop() {',
        '  pid=$(tomcat_pid)',
        '  if [ -n "$pid" ]; then',
        '    echo "Stopping Tomcat..."',
        '    if [ "$(id -u)" = "0" ]; then',
        '      su - $TOMCAT_USER -c "export JAVA_HOME=$JAVA_HOME; export CATALINA_HOME=$CATALINA_HOME; export CATALINA_BASE=$CATALINA_BASE; export CATALINA_PID=$CATALINA_PID; $CATALINA_HOME/bin/shutdown.sh"',
        '    else',
        '      export JAVA_HOME=$JAVA_HOME',
        '      export CATALINA_HOME=$CATALINA_HOME',
        '      export CATALINA_BASE=$CATALINA_BASE',
        '      export CATALINA_PID=$CATALINA_PID',
        '      $CATALINA_HOME/bin/shutdown.sh',
        '    fi',
        '',
        '    let kwait=$SHUTDOWN_WAIT',
        '    count=0',
        '    until [ $(ps -p $pid | grep -c $pid) = "0" ] || [ $count -gt $kwait ]; do',
        '      echo "Waiting for process to exit. Timeout in $(($kwait - $count)) seconds..."',
        '      sleep 1',
        '      let count=$count+1',
        '    done',
        '',
        '    if [ $count -gt $kwait ]; then',
        '      echo "Killing process ($pid) which did not stop after $SHUTDOWN_WAIT seconds"',
        '      kill -9 $pid',
        '    fi',
        '  else',
        '    echo "Tomcat is not running"',
        '  fi',
        '}',
        '',
        'status() {',
        '  pid=$(tomcat_pid)',
        '  if [ -n "$pid" ]; then',
        '    echo "Tomcat is running with pid: $pid"',
        '  else',
        '    echo "Tomcat is not running"',
        '  fi',
        '}',
        '',
        'case $1 in',
        '  start)',
        '    start',
        '    ;;',
        '  stop)',
        '    stop',
        '    ;;',
        '  restart)',
        '    stop',
        '    start',
        '    ;;',
        '  status)',
        '    status',
        '    ;;',
        '  *)',
        '    echo "Usage: $0 {start|stop|restart|status}"',
        '    exit 1',
        'esac',
        'exit $?',
    ];
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

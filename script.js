document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize Button Selectors ---
    initializeButtonSelectors();
    
    // --- Initialize Task Slider (only on sizing page) ---
    const taskSlider = document.getElementById('tasks');
    if (taskSlider) {
        updateTaskFromSlider(taskSlider);
        updateCategorySelection();
        
        // --- Initialize Category Selector (only on sizing page) ---
        initializeCategorySelector();
    }
    // --- Form Definitions ---
    const forms = {
        'linux-form': {
            script: 'sh ./unvinst',
            prefix: 'sudo ',
            defaults: {
                user: '',
                group: '',
                unvport: '',
                oms_port: '',
                create_user: false,
                create_group: false,
                python: false,
                usermode_install: false,
                basedir: '',
                ac_agent_cluster: '',
                oms_autostart: false,
                opscli: false,
                use_tls1_3: false,
                register_ubrokerd: false,
                ubroker_start: true,
                security: 'appdef',
                ac_netname: '',
                additional_params: '',
                unvdir: '',
                unvcfgdir: '',
                unvdatadir: '',
                'no-root-install': false,
                'no-root-postinstall': false
            }
        },
        'windows-form': {
            script: 'sb-7.8.1.0-windows-x64.exe /w /s /v"/qn',
            prefix: '',
            defaults: {
                user: '',
                group: '',
                unvport: '',
                oms_port: '',
                create_user: false,
                create_group: false,
                python: false,
                usermode_install: false,
                basedir: '',
                ac_agent_cluster: '',
                oms_autostart: false,
                opscli: false,
                use_tls1_3: false,
                register_ubrokerd: false,
                ubroker_start: true,
                security: 'appdef',
                ac_netname: '',
                additional_params: '',
                unvdir: '',
                unvcfgdir: '',
                unvdatadir: ''
            }
        },
        'controller-form': {
            script: 'sh install-controller.sh',
            prefix: '',
            defaults: {
                tomcat_dir: '',
                controllerfile: 'universal-controller-N.N.N.N-build.N.war',
                rdbms: '',
                dburl: '',
                dbname: 'uc',
                dbuser: '',
                dbpass: '<dbpass>',
                port: '8080',
                additional_params: ''
            }
        }
    };

    // --- Initialize All Forms ---
    for (const formId in forms) {
        const form = document.getElementById(formId);
        if (form) {
            const { script, prefix, defaults } = forms[formId];
            setupForm(form, script, prefix, defaults);
        }
    }

    // --- Clipboard Buttons ---
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

    const copyAdditionalButton = document.getElementById('copy-additional-button');
    if (copyAdditionalButton) {
        copyAdditionalButton.addEventListener('click', () => {
            const commandText = document.getElementById('additional-command').innerText;
            navigator.clipboard.writeText(commandText).then(() => {
                alert('Copied!');
            }, (err) => {
                console.error('Failed to copy additional command: ', err);
                alert('Copy failed.');
            });
        });
    }

    // --- Conditional Logic for All Forms ---
    function setupVisibilityToggle(toggleId, sectionId) {
        const toggle = document.getElementById(toggleId);
        const section = document.getElementById(sectionId);
        if (toggle && section) {
            toggle.addEventListener('change', () => {
                section.style.display = toggle.checked ? 'block' : 'none';
            });
        }
    }

    setupVisibilityToggle('toggle-user-options', 'user-options');
    setupVisibilityToggle('toggle-user-mode', 'user-mode-parameters');
    setupVisibilityToggle('toggle-advanced-options', 'advanced-options');
    setupVisibilityToggle('toggle-additional-params', 'additional-params-section');
    
    // --- Root Privilege Options Logic ---
    const noRootInstallCheckbox = document.getElementById('no-root-install');
    const noRootPostinstallGroup = document.getElementById('no-root-postinstall-group');
    const toggleUserOptions = document.getElementById('toggle-user-options');
    const toggleUserMode = document.getElementById('toggle-user-mode');
    
    function handleNoRootInstall() {
        if (noRootInstallCheckbox && noRootPostinstallGroup) {
            const createUserCheckbox = document.getElementById('create_user');
            const createGroupCheckbox = document.getElementById('create_group');
            
            if (noRootInstallCheckbox.checked) {
                noRootPostinstallGroup.style.display = 'block';
                // Auto-select user and folder options
                if (toggleUserOptions && !toggleUserOptions.checked) {
                    toggleUserOptions.click();
                }
                if (toggleUserMode && !toggleUserMode.checked) {
                    toggleUserMode.click();
                }
                
                // Disable and uncheck Create User and Create Group options
                if (createUserCheckbox) {
                    createUserCheckbox.checked = false;
                    createUserCheckbox.disabled = true;
                }
                if (createGroupCheckbox) {
                    createGroupCheckbox.checked = false;
                    createGroupCheckbox.disabled = true;
                }
            } else {
                noRootPostinstallGroup.style.display = 'none';
                // Uncheck the post-install checkbox when hiding
                const noRootPostinstallCheckbox = document.getElementById('no-root-postinstall');
                if (noRootPostinstallCheckbox) {
                    noRootPostinstallCheckbox.checked = false;
                }
                
                // Re-enable Create User and Create Group options
                if (createUserCheckbox) {
                    createUserCheckbox.disabled = false;
                }
                if (createGroupCheckbox) {
                    createGroupCheckbox.disabled = false;
                }
            }
        }
    }

    if (noRootInstallCheckbox) {
        noRootInstallCheckbox.addEventListener('change', handleNoRootInstall);
        handleNoRootInstall();
    }

    const createUserCheckbox = document.getElementById('create_user');
    const userDirGroup = document.getElementById('userdir-group');
    const registerUBrokerdCheckbox = document.getElementById('register_ubrokerd');
    const uBrokerDIdGroup = document.getElementById('ubrokerd-id-group');

    function toggleUserDir() {
        if (createUserCheckbox && userDirGroup) {
            userDirGroup.style.display = createUserCheckbox.checked ? 'block' : 'none';
        }
    }

    function toggleUBrokerdId() {
        if (registerUBrokerdCheckbox && uBrokerDIdGroup) {
            uBrokerDIdGroup.style.display = registerUBrokerdCheckbox.checked ? 'block' : 'none';
        }
    }

    if (createUserCheckbox) {
        createUserCheckbox.addEventListener('change', toggleUserDir);
        toggleUserDir();
    }
    
    if (registerUBrokerdCheckbox) {
        registerUBrokerdCheckbox.addEventListener('change', toggleUBrokerdId);
        toggleUBrokerdId();
    }

    // --- User Field Dynamic Behavior ---
    const userField = document.getElementById('user');
    const groupField = document.getElementById('group');
    const userdirField = document.getElementById('userdir');

    if (userField && groupField && userdirField) {
        userField.addEventListener('input', function() {
            const userValue = this.value.trim();
            if (userValue) {
                groupField.value = userValue;
                // Check if this is Windows form
                const isWindows = window.location.pathname.includes('windows') || 
                                document.getElementById('windows-form') !== null;
                
                if (isWindows) {
                    userdirField.value = `C:\\Users\\${userValue}`;
                } else {
                    userdirField.value = `/home/${userValue}`;
                }
            } else {
                groupField.value = '';
                userdirField.value = '';
            }
        });
    }

    // --- Base Directory Dynamic Behavior ---
    const basedirField = document.getElementById('basedir');
    const unvdirField = document.getElementById('unvdir');
    const unvcfgdirField = document.getElementById('unvcfgdir');
    const unvdatadirField = document.getElementById('unvdatadir');

    if (basedirField && unvdirField && unvcfgdirField && unvdatadirField) {
        basedirField.addEventListener('input', function() {
            const basedirValue = this.value.trim();
            if (basedirValue) {
                // Check if this is Windows form based on current page or form structure
                const isWindows = window.location.pathname.includes('windows') || 
                                document.getElementById('windows-form') !== null;
                
                if (isWindows) {
                    unvdirField.value = `${basedirValue}\\ubroker`;
                    unvcfgdirField.value = `${basedirValue}\\etc`;
                    unvdatadirField.value = `${basedirValue}\\data`;
                } else {
                    unvdirField.value = `${basedirValue}/opt/universal`;
                    unvcfgdirField.value = `${basedirValue}/etc/universal`;
                    unvdatadirField.value = `${basedirValue}/var/opt/universal`;
                }
            } else {
                unvdirField.value = '';
                unvcfgdirField.value = '';
                unvdatadirField.value = '';
            }
        });
    }

    // --- RDBMS Dropdown Handler for Controller Form ---
    const rdbmsSelect = document.getElementById('rdbms');
    const dburlField = document.getElementById('dburl');
    const dbnameField = document.getElementById('dbname');

    function updateJdbcUrl() {
        if (!rdbmsSelect || !dburlField) return;
        
        const rdbmsValue = rdbmsSelect.value;
        const dbname = dbnameField ? dbnameField.value.trim() || 'uc' : 'uc';
        let defaultUrl = '';

        switch (rdbmsValue) {
            case 'mysql':
                defaultUrl = `jdbc:mysql://localhost:3306/${dbname}`;
                break;
            case 'postgres':
                defaultUrl = `jdbc:postgresql://localhost:5432/${dbname}`;
                break;
            case 'oracle':
                defaultUrl = 'jdbc:oracle:thin:@//localhost:1521/ServiceName';
                break;
            case 'sqlserver':
                defaultUrl = `jdbc:sqlserver://localhost:1433;DatabaseName=${dbname};trustServerCertificate=true`;
                break;
            case 'sqlserver-jtds':
                defaultUrl = `jdbc:jtds:sqlserver://localhost:1433/${dbname}`;
                break;
            default:
                defaultUrl = '';
        }

        dburlField.value = defaultUrl;
    }

    if (rdbmsSelect && dburlField) {
        rdbmsSelect.addEventListener('change', updateJdbcUrl);
        
        if (dbnameField) {
            dbnameField.addEventListener('input', function() {
                // Only update URL if an RDBMS is already selected
                if (rdbmsSelect.value) {
                    updateJdbcUrl();
                }
            });
        }
    }
});

// --- Form Submission Handler ---
function setupForm(form, script, prefix, defaults) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Check if this is Windows or Controller form - handle differently
        const isWindowsForm = form.id === 'windows-form';
        const isControllerForm = form.id === 'controller-form';
        
        if (isWindowsForm) {
            handleWindowsForm(form, script, prefix, defaults);
            return;
        }
        
        if (isControllerForm) {
            handleControllerForm(form, script, prefix, defaults);
            return;
        }
        
        // Check if no-root installation is selected
        const noRootInstall = document.getElementById('no-root-install')?.checked || false;
        const actualPrefix = noRootInstall ? '' : prefix;
        
        let command = actualPrefix + script;
        const elements = form.elements;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const name = element.name;

            if (!name || element.type === 'submit' || element.type === 'button') {
                continue;
            }
            
            if (element.offsetParent === null) {
                continue;
            }

            const value = element.type === 'checkbox' ? element.checked : element.value;
            const defaultValue = defaults[name];

            if (name === 'additional_params' && value) {
                command += ` ${value}`;
                continue;
            }

            // Special handling for user and group fields
            if (name === 'user' || name === 'group') {
                const trimmedValue = element.value.trim();
                if (trimmedValue && trimmedValue !== 'ubroker') {
                    command += ` --${name} ${trimmedValue}`;
                }
                continue;
            }

            // Special handling for create_user and create_group
            if (name === 'create_user' || name === 'create_group') {
                const userValue = document.getElementById('user').value.trim();
                const isUbrokerOrEmpty = !userValue || userValue === 'ubroker';
                
                if (element.checked && !isUbrokerOrEmpty) {
                    command += ` --${name} yes`;
                }
                continue;
            }

            // Skip basedir - it's only for easy data entry
            if (name === 'basedir') {
                continue;
            }

            // Skip toggle-user-mode - usermode_install will be handled by directory logic
            if (name === 'toggle-user-mode') {
                continue;
            }

            // Skip directory fields - they will be handled by directory validation logic
            if (name === 'unvdir' || name === 'unvcfgdir' || name === 'unvdatadir') {
                continue;
            }

            // Skip the new root privilege checkboxes - they're handled separately
            if (name === 'no-root-install' || name === 'no-root-postinstall') {
                continue;
            }

            // Special handling for ac_netname - also sets ubroker_id
            if (name === 'ac_netname') {
                const netnameValue = element.value.trim();
                if (netnameValue) {
                    command += ` --ac_netname ${netnameValue}`;
                    command += ` --ubroker_id ${netnameValue}`;
                }
                continue;
            }

            // Special handling for oms_port and unvport - will be handled after directory validation
            if (name === 'oms_port' || name === 'unvport') {
                continue;
            }

            // Special handling for ac_agent_cluster - needs quotes if contains spaces
            if (name === 'ac_agent_cluster') {
                const clusterValue = element.value.trim();
                if (clusterValue) {
                    if (clusterValue.includes(' ')) {
                        command += ` --uac_agent_cluster '${clusterValue}'`;
                    } else {
                        command += ` --uac_agent_cluster ${clusterValue}`;
                    }
                }
                continue;
            }

            if (value !== defaultValue) {
                 if (element.type === 'checkbox') {
                    command += ` --${name} ${element.checked ? 'yes' : 'no'}`;
                } else if (element.value.trim() !== '') {
                    command += ` --${name} ${element.value.trim()}`;
                }
            }
        }

        // Handle directory validation and usermode_install
        const unvdirValue = document.getElementById('unvdir')?.value.trim() || '';
        const unvcfgdirValue = document.getElementById('unvcfgdir')?.value.trim() || '';
        const unvdatadirValue = document.getElementById('unvdatadir')?.value.trim() || '';

        const dirValues = [unvdirValue, unvcfgdirValue, unvdatadirValue];
        const hasAnyDir = dirValues.some(dir => dir !== '');
        const hasAllDirs = dirValues.every(dir => dir !== '');
        const toggleUserModeChecked = document.getElementById('toggle-user-mode')?.checked || false;

        // Clear any previous validation errors
        clearDirectoryValidationErrors();

        // Check if "different folder" is selected but directories are not complete
        if (toggleUserModeChecked && !hasAllDirs) {
            showDirectoryValidationErrors('When "I want to install in a different folder" is selected, all three directories must have values.');
            return;
        }

        if (hasAnyDir && hasAllDirs) {
            // All three directories have values - add usermode_install and directories
            command += ` --usermode_install yes`;
            if (unvdirValue) command += ` --unvdir ${unvdirValue}`;
            if (unvcfgdirValue) command += ` --unvcfgdir ${unvcfgdirValue}`;
            if (unvdatadirValue) command += ` --unvdatadir ${unvdatadirValue}`;
        } else if (hasAnyDir && !hasAllDirs) {
            // Some but not all directories have values - show error
            showDirectoryValidationErrors('If you specify any directory (Install, Config, or Data), all three directories must have values.');
            return;
        }

        // Handle oms_port and unvport - always add when "I want to install in a different folder" is selected
        const omsPortValue = document.getElementById('oms_port')?.value.trim() || '';
        const unvPortValue = document.getElementById('unvport')?.value.trim() || '';
        const isUsermodeInstall = hasAnyDir && hasAllDirs;
        
        if (omsPortValue && (omsPortValue !== '7878' || toggleUserModeChecked)) {
            const portValue = omsPortValue || '7878';
            command += ` --oms_port ${portValue}`;
        } else if (toggleUserModeChecked) {
            // Always add default port when "different folder" is selected
            command += ` --oms_port 7878`;
        }
        
        if (unvPortValue && (unvPortValue !== '7887' || toggleUserModeChecked)) {
            const portValue = unvPortValue || '7887';
            command += ` --unvport ${portValue}`;
        } else if (toggleUserModeChecked) {
            // Always add default port when "different folder" is selected
            command += ` --unvport 7887`;
        }

        // Check if we need additional commands
        const securityValue = document.getElementById('security')?.value || 'appdef';
        const registerUbrokerd = document.getElementById('register_ubrokerd')?.checked || false;
        const noRootPostinstall = document.getElementById('no-root-postinstall')?.checked || false;
        
        // Check if this is Windows form
        const isWindows = window.location.pathname.includes('windows') || 
                        document.getElementById('windows-form') !== null;
        
        // Build additional commands
        let additionalCommands = [];
        
        // Add unvperms script if no-root-install is checked but no-root-postinstall is not checked
        if (noRootInstall && !noRootPostinstall) {
            const unvdirValue = document.getElementById('unvdir')?.value.trim() || '';
            if (unvdirValue) {
                additionalCommands.push(`sudo ${unvdirValue}/unvperms-3156.sh`);
            }
        }
        
        // PAM commands only for Linux (not Windows) and only if post-install can use root
        if (!isWindows && !noRootPostinstall) {
            const needsPamCommand = ['appdef', 'pam', 'pam_sessions'].includes(securityValue);
            if (needsPamCommand) {
                additionalCommands.push('sudo cp /etc/pam.d/login /etc/pam.d/ucmd');
            }
        }
        
        // Service registration commands
        if (registerUbrokerd) {
            if (isWindows) {
                additionalCommands.push('sc config ubrokerd start= auto');
            } else {
                additionalCommands.push('sudo systemctl enable ubrokerd');
            }
        }
        
        // Add broker start command LAST if "I want to install in a different folder" is selected
        if (toggleUserModeChecked) {
            const unvdirValue = document.getElementById('unvdir')?.value.trim() || '';
            if (unvdirValue) {
                additionalCommands.push(`${unvdirValue}/ubroker/ubrokerd start`);
            }
        }
        
        // Display main command
        const commandOutput = document.getElementById('command-output');
        const generatedCommand = document.getElementById('generated-command');
        generatedCommand.textContent = command;
        commandOutput.style.display = 'block';

        // Display additional commands if needed
        const additionalCommandOutput = document.getElementById('additional-command-output');
        const additionalCommand = document.getElementById('additional-command');
        
        if (additionalCommands.length > 0) {
            additionalCommand.textContent = additionalCommands.join('\n');
            additionalCommandOutput.style.display = 'block';
        } else {
            additionalCommandOutput.style.display = 'none';
        }

        // Scroll to the generated command
        setTimeout(() => {
            commandOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    });
}

// --- Windows Form Handler ---
function handleWindowsForm(form, script, prefix, defaults) {
    let command = prefix + script;
    const elements = form.elements;
    let msiParams = [];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const name = element.name;

        if (!name || element.type === 'submit' || element.type === 'button') {
            continue;
        }
        
        if (element.offsetParent === null) {
            continue;
        }

        // Skip toggle fields and non-MSI parameters
        if (name === 'toggle-additional-params') {
            continue;
        }

        const value = element.type === 'checkbox' ? element.checked : element.value;

        // Handle specific MSI parameters
        if (name === 'oms_servers' && value.trim()) {
            // Format: OMS_SERVERS=server (no port handling since port field is removed)
            msiParams.push(`OMS_SERVERS=${value.trim()}`);
        } else if (name === 'oms_autostart') {
            msiParams.push(`OMS_AUTOSTART=${value ? 'yes' : 'no'}`);
        } else if (name === 'python') {
            msiParams.push(`PYTHON=${value ? 'yes' : 'no'}`);
        } else if (name === 'ac_agent_cluster' && value.trim()) {
            // Windows agent cluster always needs escaped double quotes
            const clusterValue = value.trim();
            msiParams.push(`AC_AGENT_CLUSTER=\\"${clusterValue}\\"`);
        } else if (name === 'additional_params' && value.trim()) {
            // Add additional parameters directly
            msiParams.push(value.trim());
        }
    }

    // Close the /v" quote and add parameters
    if (msiParams.length > 0) {
        command += ' ' + msiParams.join(' ') + '"';
    } else {
        command += '"';
    }

    // Display main command
    const commandOutput = document.getElementById('command-output');
    const generatedCommand = document.getElementById('generated-command');
    generatedCommand.textContent = command;
    commandOutput.style.display = 'block';

    // Windows doesn't have additional commands in the same way
    const additionalCommandOutput = document.getElementById('additional-command-output');
    additionalCommandOutput.style.display = 'none';

    // Scroll to the generated command
    setTimeout(() => {
        commandOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// --- Controller Form Handler ---
function handleControllerForm(form, script, prefix, defaults) {
    // Detect script extension based on tomcat directory
    const tomcatDirElement = document.getElementById('tomcat_dir');
    const tomcatDir = tomcatDirElement ? tomcatDirElement.value.trim() : '';
    
    // Check if path is Windows-like (contains backslashes or drive letters like C:)
    const isWindowsPath = tomcatDir.includes('\\') || /^[A-Za-z]:/.test(tomcatDir);
    const scriptExtension = isWindowsPath ? 'install-controller.bat' : 'install-controller.sh';
    const scriptCommand = isWindowsPath ? scriptExtension : `sh ${scriptExtension}`;
    
    let command = prefix + scriptCommand;
    const elements = form.elements;

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const name = element.name;

        if (!name || element.type === 'submit' || element.type === 'button') {
            continue;
        }
        
        if (element.offsetParent === null) {
            continue;
        }

        // Skip toggle fields and RDBMS selector (not a command parameter)
        if (name.startsWith('toggle-') || name === 'rdbms') {
            continue;
        }

        const value = element.type === 'checkbox' ? element.checked : element.value.trim();
        const defaultValue = defaults[name];

        // Handle additional params separately
        if (name === 'additional_params' && value) {
            command += ` ${value}`;
            continue;
        }

        // Add parameters based on PDF documentation
        if (name === 'tomcat_dir' && value) {
            // Enclose in quotes for paths with spaces
            const quotedValue = value.includes(' ') ? `"${value}"` : value;
            command += ` --tomcat-dir ${quotedValue}`;
        } else if (name === 'controllerfile' && value && value !== defaultValue) {
            command += ` --controller-file ${value}`;
        } else if (name === 'dburl' && value) {
            // Get RDBMS type to check if we need to add trustServerCertificate
            const rdbmsElement = document.getElementById('rdbms');
            const rdbmsValue = rdbmsElement ? rdbmsElement.value.trim() : '';
            
            let dbUrlValue = value;
            // Add trustServerCertificate=true for SQL Server if not already present
            if ((rdbmsValue === 'sqlserver' || rdbmsValue === 'sqlserver-jtds') && 
                !dbUrlValue.includes('trustServerCertificate')) {
                // Add the parameter with appropriate separator
                if (dbUrlValue.includes('?')) {
                    dbUrlValue += '&trustServerCertificate=true';
                } else if (rdbmsValue === 'sqlserver-jtds') {
                    // For JTDS, parameters are separated by semicolons
                    dbUrlValue += ';trustServerCertificate=true';
                } else {
                    // For standard SQL Server JDBC, parameters are separated by semicolons
                    dbUrlValue += ';trustServerCertificate=true';
                }
            }
            
            command += ` --dburl ${dbUrlValue}`;
        } else if (name === 'dbuser' && value) {
            command += ` --dbuser ${value}`;
        } else if (name === 'port' && value && value !== '8080') {
            // Only add if different from default '8080'
            command += ` --port ${value}`;
        }
    }

    // Always add database name and password parameters
    const dbnameElement = document.getElementById('dbname');
    const dbpassElement = document.getElementById('dbpass');
    const rdbmsElement = document.getElementById('rdbms');
    
    const dbnameValue = dbnameElement ? dbnameElement.value.trim() || 'uc' : 'uc';
    const dbpassValue = dbpassElement ? dbpassElement.value.trim() : '<dbpass>';
    const rdbmsValue = rdbmsElement ? rdbmsElement.value.trim() : '';
    
    if (rdbmsValue) {
        command += ` --rdbms ${rdbmsValue}`;
    }
    command += ` --dbname ${dbnameValue}`;
    command += ` --dbpass ${dbpassValue}`;

    // Display main command
    const commandOutput = document.getElementById('command-output');
    const generatedCommand = document.getElementById('generated-command');
    generatedCommand.textContent = command;
    commandOutput.style.display = 'block';

    // Controller doesn't have additional commands
    const additionalCommandOutput = document.getElementById('additional-command-output');
    additionalCommandOutput.style.display = 'none';

    // Scroll to the generated command
    setTimeout(() => {
        commandOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// --- Sizing Calculator Functions ---
const sizingMatrix = [
    { 
      name: "Micro", 
      max_tasks: 100000,
      description: "Suitable for small environments or test systems",
      agent: { cpu: 2, memory: 4, disk: "SSD/GP3 50 GB" },
      controller: { 
        cpu: 2, memory: 8, jvm: 4, baseDisk: 50,
        aws: { instance: "t3.medium", cpu: 2, memory: 8 },
        azure: { instance: "D2s v5", cpu: 2, memory: 8 },
        onprem: { cpu: 2, memory: 8 },
        other: { cpu: 2, memory: 8 }
      },
      database: { 
        cpu: 2, memory: 8, iops: 1500,
        aws: { instance: "db.t4g.medium", cpu: 2, memory: 8 },
        azure: { instance: "GP_Gen5_2", cpu: 2, memory: 8 },
        onprem: { cpu: 2, memory: 8 },
        other: { cpu: 2, memory: 8 }
      },
      oms: { 
        size: "10 GB", 
        policy: "Auto growth",
        aws: { type: "EFS" },
        azure: { type: "Azure Files" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud File Storage" }
      },
      backup: { 
        size: "10 GB",
        aws: { type: "S3" },
        azure: { type: "Azure Storage" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud Object Storage" }
      },
      loadbalancer: { 
        aws: { type: "ALB/NLB" },
        azure: { type: "Azure Load Balancer" },
        onprem: { type: "Hardware Load Balancer" },
        other: { type: "Cloud Load Balancer" }
      }
    },
    { 
      name: "Small", 
      max_tasks: 500000,
      description: "Recommended for smaller production workloads",
      agent: { cpu: 2, memory: 8, disk: "SSD/GP3 50 GB" },
      controller: { 
        cpu: 4, memory: 8, jvm: 6, baseDisk: 50,
        aws: { instance: "t3.large", cpu: 4, memory: 8 },
        azure: { instance: "D2s v5", cpu: 2, memory: 8 },
        onprem: { cpu: 4, memory: 8 },
        other: { cpu: 4, memory: 8 }
      },
      database: { 
        cpu: 2, memory: 16, iops: 3000,
        aws: { instance: "db.t4g.large", cpu: 2, memory: 16 },
        azure: { instance: "GP_Gen5_4", cpu: 4, memory: 16 },
        onprem: { cpu: 2, memory: 16 },
        other: { cpu: 2, memory: 16 }
      },
      oms: { 
        size: "10 GB", 
        policy: "Auto growth",
        aws: { type: "EFS" },
        azure: { type: "Azure Files" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud File Storage" }
      },
      backup: { 
        size: "10 GB",
        aws: { type: "S3" },
        azure: { type: "Azure Storage" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud Object Storage" }
      },
      loadbalancer: { 
        aws: { type: "ALB/NLB" },
        azure: { type: "Azure Load Balancer" },
        onprem: { type: "Hardware Load Balancer" },
        other: { type: "Cloud Load Balancer" }
      }
    },
    { 
      name: "Medium", 
      max_tasks: 3000000,
      description: "Standard mid-size production environments",
      agent: { cpu: 2, memory: 8, disk: "SSD/GP3 100 GB" },
      controller: { 
        cpu: 4, memory: 16, jvm: 12, baseDisk: 100,
        aws: { instance: "m6i.large", cpu: 4, memory: 16 },
        azure: { instance: "D4s v5", cpu: 4, memory: 16 },
        onprem: { cpu: 4, memory: 16 },
        other: { cpu: 4, memory: 16 }
      },
      database: { 
        cpu: 4, memory: 32, iops: 6000,
        aws: { instance: "db.r6g.xlarge", cpu: 4, memory: 32 },
        azure: { instance: "GP_Gen5_8", cpu: 8, memory: 32 },
        onprem: { cpu: 4, memory: 32 },
        other: { cpu: 4, memory: 32 }
      },
      oms: { 
        size: "10 GB", 
        policy: "Auto growth",
        aws: { type: "EFS" },
        azure: { type: "Azure Files" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud File Storage" }
      },
      backup: { 
        size: "10 GB",
        aws: { type: "S3" },
        azure: { type: "Azure Storage" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud Object Storage" }
      },
      loadbalancer: { 
        aws: { type: "ALB/NLB" },
        azure: { type: "Azure Load Balancer" },
        onprem: { type: "Hardware Load Balancer" },
        other: { type: "Cloud Load Balancer" }
      }
    },
    { 
      name: "Large", 
      max_tasks: 15000000,
      description: "Enterprise-grade high-volume environments",
      agent: { cpu: 4, memory: 16, disk: "SSD/GP3 100 GB" },
      controller: { 
        cpu: 8, memory: 32, jvm: 24, baseDisk: 100,
        aws: { instance: "m6i.xlarge", cpu: 8, memory: 32 },
        azure: { instance: "D8s v5", cpu: 8, memory: 32 },
        onprem: { cpu: 8, memory: 32 },
        other: { cpu: 8, memory: 32 }
      },
      database: { 
        cpu: 8, memory: 64, iops: 12000,
        aws: { instance: "db.r6g.2xlarge", cpu: 8, memory: 64 },
        azure: { instance: "GP_Gen5_16", cpu: 16, memory: 64 },
        onprem: { cpu: 8, memory: 64 },
        other: { cpu: 8, memory: 64 }
      },
      oms: { 
        size: "10 GB", 
        policy: "Auto growth",
        aws: { type: "EFS" },
        azure: { type: "Azure Files" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud File Storage" }
      },
      backup: { 
        size: "10 GB",
        aws: { type: "S3" },
        azure: { type: "Azure Storage" },
        onprem: { type: "NAS/SAN" },
        other: { type: "Cloud Object Storage" }
      },
      loadbalancer: { 
        aws: { type: "ALB/NLB" },
        azure: { type: "Azure Load Balancer" },
        onprem: { type: "Hardware Load Balancer" },
        other: { type: "Cloud Load Balancer" }
      }
    }
];

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseFormattedNumber(str) {
    return parseInt(str.replace(/,/g, ''));
}

function liveFormatTasks(input) {
    const cursorPosition = input.selectionStart;
    const rawValue = input.value.replace(/,/g, '');

    if (!isNaN(rawValue) && rawValue !== "") {
      const formatted = formatNumber(Number(rawValue));
      input.value = formatted;

      const newCursorPosition = cursorPosition + (formatted.length - rawValue.length);
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
}

// Define the discrete task values
const taskValues = [10000, 25000, 40000, 100000, 250000, 300000, 400000, 500000, 1000000, 3000000, 5000000, 7000000, 10000000, 15000000];
const taskLabels = ['10K', '25K', '40K', '100K', '250K', '300K', '400K', '500K', '1M', '3M', '5M', '7M', '10M', '15M'];

function updateTaskFromSlider(slider) {
    const index = parseInt(slider.value);
    const value = taskValues[index];
    const label = taskLabels[index];
    const display = document.getElementById('task-display');
    
    display.textContent = label;
    // The slider itself now holds the actual task count value for calculations
    slider.setAttribute('data-value', value);
    
    // Update category selection
    updateCategorySelection();
}

// --- Category Selection Functions ---
function initializeCategorySelector() {
    const categoryBoxes = document.querySelectorAll('.category-box');
    categoryBoxes.forEach(box => {
        box.addEventListener('click', function() {
            const tasks = parseInt(this.dataset.tasks);
            setTaskSliderValue(tasks);
        });
        
        // Add cursor pointer style
        box.style.cursor = 'pointer';
    });
}

function setTaskSliderValue(targetTasks) {
    const slider = document.getElementById('tasks');
    
    // Find the closest slider index for the target tasks
    let closestIndex = 0;
    let minDiff = Math.abs(taskValues[0] - targetTasks);
    
    for (let i = 1; i < taskValues.length; i++) {
        const diff = Math.abs(taskValues[i] - targetTasks);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    }
    
    slider.value = closestIndex;
    updateTaskFromSlider(slider);
}

function updateCategorySelection() {
    const slider = document.getElementById('tasks');
    const currentTasks = taskValues[parseInt(slider.value)];
    
    // Find which category this task count belongs to
    let selectedCategory = null;
    for (const category of sizingMatrix) {
        if (currentTasks <= category.max_tasks) {
            selectedCategory = category;
            break;
        }
    }
    
    // If still null, use Large (for values above 15M)
    if (!selectedCategory) {
        selectedCategory = sizingMatrix.find(c => c.name === "Large");
    }
    
    // Update category box styling
    const categoryBoxes = document.querySelectorAll('.category-box');
    categoryBoxes.forEach(box => {
        const categoryName = box.dataset.category;
        if (categoryName === selectedCategory.name) {
            box.classList.add('selected');
            box.classList.remove('inactive');
        } else {
            box.classList.remove('selected');
            box.classList.add('inactive');
        }
    });
}

let currentResultHTML = "";

// --- Button Selector Functions ---
function initializeButtonSelectors() {
    // Add click handlers to all option buttons
    document.querySelectorAll('.option-button').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.dataset.target;
            const value = this.dataset.value;
            
            // Remove active class from siblings
            this.parentNode.querySelectorAll('.option-button').forEach(sibling => {
                sibling.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update hidden input value
            const hiddenInput = document.getElementById(target);
            if (hiddenInput) {
                hiddenInput.value = value;
            }
            
            // Handle deployment type changes
            if (target === 'deployment') {
                updateCloudProviderVisibility(value);
            }
        });
    });
    
    // Initialize cloud provider visibility (only on sizing page)
    const deploymentElement = document.getElementById('deployment');
    if (deploymentElement) {
        const deploymentValue = deploymentElement.value;
        updateCloudProviderVisibility(deploymentValue);
    }
}

function updateCloudProviderVisibility(deploymentType) {
    const cloudProviderGroup = document.getElementById('cloud-provider-group');
    const otherButton = document.querySelector('[data-target="cloud-provider"][data-value="other"]');
    
    if (deploymentType === 'on-prem') {
        cloudProviderGroup.style.display = 'none';
    } else {
        cloudProviderGroup.style.display = 'block';
        
        if (deploymentType === 'customer-cloud') {
            otherButton.style.display = 'inline-block';
        } else {
            otherButton.style.display = 'none';
            // If "Other" was selected, switch to AWS
            if (document.getElementById('cloud-provider').value === 'other') {
                document.querySelector('[data-target="cloud-provider"][data-value="aws"]').click();
            }
        }
    }
}

function calculateSizing() {
    const slider = document.getElementById("tasks");
    const index = parseInt(slider.value);
    const tasks = taskValues[index];
    const activity = parseInt(document.getElementById("activity").value);
    const history = parseInt(document.getElementById("history").value);
    const audit = parseInt(document.getElementById("audit").value);
    const deployment = document.getElementById("deployment").value;
    const cloudProvider = document.getElementById("cloud-provider").value;

    if (isNaN(tasks)) {
      alert("Please fill in task count correctly.");
      return;
    }

    let category = sizingMatrix.find(c => tasks <= c.max_tasks) || sizingMatrix[sizingMatrix.length - 1];

    // --- Storage Calculation ---
    const WAR_FILE_MB = 310;
    const TASK_EXEC_KB = 10;
    const AUDIT_PERCENT = 0.25;
    const RISK_FACTOR = 4;
    const KB_TO_MB = 1024;
    const MB_TO_GB = 1024;

    const task_kb = (tasks / 30) * TASK_EXEC_KB;
    const activity_kb = task_kb * activity;
    const history_kb = task_kb * history;
    const audit_kb = audit / history * (task_kb + activity_kb + history_kb) * AUDIT_PERCENT;

    const total_kb = task_kb + activity_kb + history_kb + audit_kb;
    const total_storage_mb = (total_kb / KB_TO_MB) + WAR_FILE_MB;
    const total_storage_mb_risk = total_storage_mb * RISK_FACTOR;
    const total_storage_gb = total_storage_mb_risk / MB_TO_GB;
    
    const baseBackupSize = 10;
    const backupSizeGB = total_storage_gb > baseBackupSize ? Math.ceil(total_storage_gb / 10) * 10 : baseBackupSize;

    let environmentKey = 'onprem';
    if (deployment !== 'on-prem') {
        environmentKey = cloudProvider;
    }

    const omsSizeGB = 10;
    const controllerDiskGB = category.controller.baseDisk + omsSizeGB + backupSizeGB;

    // --- Populate Server Specifications ---
    document.getElementById('agent-vcpu').textContent = category.agent.cpu;
    document.getElementById('agent-ram').textContent = `${category.agent.memory} GB`;
    document.getElementById('agent-disk').textContent = category.agent.disk;
    document.getElementById('controller-vcpu').textContent = category.controller.cpu;
    document.getElementById('controller-ram').textContent = `${category.controller.memory} GB`;
    document.getElementById('controller-jvm').textContent = `${category.controller.jvm} GB`;
    document.getElementById('controller-disk').textContent = `SSD/GP3 ${controllerDiskGB} GB`;
    document.getElementById('db-vcpu').textContent = category.database.cpu;
    document.getElementById('db-ram').textContent = `${category.database.memory} GB`;
    document.getElementById('db-iops').textContent = formatNumber(category.database.iops);
    document.getElementById('db-type').textContent = `MySQL, Oracle, SQL Server, Postgres`;

    // --- Populate Instance Types in Server Cards ---
    const controllerInstance = category.controller[environmentKey];
    const dbInstance = category.database[environmentKey];
    
    document.getElementById('controller-instance-rec').textContent = controllerInstance.instance;
    document.getElementById('db-instance-rec').textContent = dbInstance.instance;

    // --- Populate Additional Components ---
    const omsNotes = { onprem: 'Requires NFSv4 support', aws: 'Managed file storage service', azure: 'Managed file storage service', other: 'Use your cloud provider\'s file storage service' };
    const backupNotes = { onprem: 'Local storage solution', aws: 'Cloud object storage', azure: 'Cloud object storage', other: 'Use your cloud provider\'s object storage service' };
    const lbNotes = { onprem: 'Hardware or software-based', aws: 'Cloud-native load balancing', azure: 'Cloud-native load balancing', other: 'Use your cloud provider\'s load balancing service' };
    
    document.getElementById('oms-size').textContent = category.oms.size;
    document.getElementById('oms-type').textContent = category.oms[environmentKey].type;
    document.getElementById('oms-policy').textContent = category.oms.policy;
    document.getElementById('oms-note').textContent = omsNotes[environmentKey];
    
    document.getElementById('backup-size').textContent = `${backupSizeGB} GB`;
    document.getElementById('backup-type').textContent = category.backup[environmentKey].type;
    document.getElementById('backup-policy').textContent = 'Auto growth recommended';
    document.getElementById('backup-note').textContent = backupNotes[environmentKey];
    
    document.getElementById('lb-type').textContent = category.loadbalancer[environmentKey].type;
    document.getElementById('lb-purpose').textContent = 'High availability and traffic distribution';
    document.getElementById('lb-note').textContent = lbNotes[environmentKey];

    // --- Populate Storage Breakdown ---
    document.getElementById('storage-total').textContent = `${Math.ceil(total_storage_gb)} GB`;
    document.getElementById('storage-activity').textContent = `${Math.ceil(activity_kb / KB_TO_MB / MB_TO_GB * RISK_FACTOR)} GB`;
    document.getElementById('storage-history').textContent = `${Math.ceil(history_kb / KB_TO_MB / MB_TO_GB * RISK_FACTOR)} GB`;
    document.getElementById('storage-audit').textContent = `${Math.ceil(audit_kb / KB_TO_MB / MB_TO_GB * RISK_FACTOR)} GB`;

    // --- Show and Scroll to Results ---
    const resultContainer = document.getElementById("sizing-result");
    resultContainer.style.display = "block";
    setTimeout(() => {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function resetResults() {
    document.getElementById("sizing-result").innerHTML = "";
    document.getElementById("sizing-result").style.display = "none";
}

function exportResult() {
    const resultDiv = document.getElementById("sizing-result");
    if (!resultDiv.innerHTML.trim()) {
      alert("No data to export. Please calculate sizing first.");
      return;
    }

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head><!--[if gte mso 9]><xml>
          <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
            <x:Name>Hardware Sizing</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
        </xml><![endif]--></head>
        <body>${resultDiv.innerHTML}</body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'uac_hardware_sizing.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportAsPDF() {
    const resultDiv = document.getElementById("sizing-result");
    if (!resultDiv || resultDiv.style.display === 'none') {
        alert("No data to export. Please calculate sizing first.");
        return;
    }
    
    // Helper function to safely get element text content
    function safeGetText(elementId, defaultValue = 'N/A') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element with ID '${elementId}' not found`);
            return defaultValue;
        }
        const text = element.textContent || element.innerText || '';
        return text.trim() || defaultValue;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Helper function to draw table
    function drawTable(startX, startY, headers, rows, columnWidths) {
        const rowHeight = 8;
        let currentY = startY;
        
        // Draw headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(startX, currentY, columnWidths.reduce((a, b) => a + b), rowHeight, 'F');
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        
        let currentX = startX;
        headers.forEach((header, i) => {
            pdf.text(header, currentX + 2, currentY + 6);
            currentX += columnWidths[i];
        });
        
        currentY += rowHeight;
        
        // Draw rows
        pdf.setFont(undefined, 'normal');
        rows.forEach((row, rowIndex) => {
            // Alternate row colors
            if (rowIndex % 2 === 0) {
                pdf.setFillColor(250, 250, 250);
                pdf.rect(startX, currentY, columnWidths.reduce((a, b) => a + b), rowHeight, 'F');
            }
            
            currentX = startX;
            row.forEach((cell, i) => {
                pdf.text(String(cell), currentX + 2, currentY + 6);
                currentX += columnWidths[i];
            });
            currentY += rowHeight;
        });
        
        // Draw table borders
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(startX, startY, columnWidths.reduce((a, b) => a + b), (rows.length + 1) * rowHeight);
        
        // Draw vertical lines
        currentX = startX;
        columnWidths.forEach(width => {
            currentX += width;
            if (currentX < startX + columnWidths.reduce((a, b) => a + b)) {
                pdf.line(currentX, startY, currentX, startY + (rows.length + 1) * rowHeight);
            }
        });
        
        // Draw horizontal lines
        for (let i = 1; i <= rows.length; i++) {
            pdf.line(startX, startY + i * rowHeight, startX + columnWidths.reduce((a, b) => a + b), startY + i * rowHeight);
        }
        
        return currentY + 5;
    }
    
    // Add title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('UAC Hardware Sizing Report', 20, 20);
    
    // Get current date
    const date = new Date().toLocaleDateString();
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated on: ${date}`, 20, 35);
    
    let yPosition = 50;
    
    // Get input values
    const tasks = safeGetText('task-display');
    const activity = document.getElementById('activity')?.value || 'N/A';
    const history = document.getElementById('history')?.value || 'N/A';
    const audit = document.getElementById('audit')?.value || 'N/A';
    const deployment = document.getElementById('deployment')?.value || 'N/A';
    const cloudProvider = document.getElementById('cloud-provider')?.value || 'N/A';
    
    // Configuration Parameters Table
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Configuration Parameters', 20, yPosition);
    yPosition += 10;
    
    // Get the selected sizing category
    const selectedCategoryBox = document.querySelector('.category-box.selected');
    const sizingCategory = selectedCategoryBox ? selectedCategoryBox.getAttribute('data-category') : 'Not Selected';
    
    const configHeaders = ['Parameter', 'Value'];
    const configRows = [
        ['Sizing Category', sizingCategory],
        ['Task Executions', `${tasks}/month`],
        ['Activity Retention', `${activity} days`],
        ['History Retention', `${history} days`],
        ['Audit Retention', `${audit} days`],
        ['Deployment Type', deployment],
    ];
    
    if (deployment !== 'saas') {
        configRows.push(['Cloud Provider', cloudProvider]);
    }
    
    yPosition = drawTable(20, yPosition, configHeaders, configRows, [60, 100]);
    yPosition += 10;
    
    // Server Specifications Table
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Server Specifications', 20, yPosition);
    yPosition += 10;
    
    const serverHeaders = ['Component', 'Specification', 'Value'];
    const serverRows = [
        ['Universal Agent Server', 'vCPU', safeGetText('agent-vcpu')],
        ['', 'Memory', safeGetText('agent-ram')],
        ['', 'Disk', safeGetText('agent-disk')],
        ['Universal Controller Server', 'Instance Type', safeGetText('controller-instance-rec')],
        ['', 'vCPU', safeGetText('controller-vcpu')],
        ['', 'Memory', safeGetText('controller-ram')],
        ['', 'JVM Heap', safeGetText('controller-jvm')],
        ['', 'Disk', safeGetText('controller-disk')],
        ['Database Server', 'Instance Type', safeGetText('db-instance-rec')],
        ['', 'vCPU', safeGetText('db-vcpu')],
        ['', 'Memory', safeGetText('db-ram')],
        ['', 'Min IOPS', safeGetText('db-iops')],
        ['', 'Type', safeGetText('db-type')],
    ];
    
    yPosition = drawTable(20, yPosition, serverHeaders, serverRows, [70, 50, 50]);
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
    }
    
    // Additional Components Table
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Additional Components', 20, yPosition);
    yPosition += 10;
    
    const additionalHeaders = ['Component', 'Specification', 'Value'];
    const additionalRows = [
        ['OMS File Share', 'Size', safeGetText('oms-size')],
        ['', 'Type', safeGetText('oms-type')],
        ['', 'Policy', safeGetText('oms-policy')],
        ['Log & Backup Share', 'Size', safeGetText('backup-size')],
        ['', 'Type', safeGetText('backup-type')],
        ['', 'Policy', safeGetText('backup-policy')],
        ['Load Balancer', 'Type', safeGetText('lb-type')],
        ['', 'Purpose', safeGetText('lb-purpose')],
    ];
    
    yPosition = drawTable(20, yPosition, additionalHeaders, additionalRows, [70, 50, 50]);
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
    }
    
    // Database Storage Breakdown Table
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Database Storage Breakdown', 20, yPosition);
    yPosition += 10;
    
    const storageHeaders = ['Storage Component', 'Required Space'];
    const storageRows = [
        ['Total Required', safeGetText('storage-total')],
        ['Activity Database', safeGetText('storage-activity')],
        ['History Database', safeGetText('storage-history')],
        ['Audit Database', safeGetText('storage-audit')],
    ];
    
    yPosition = drawTable(20, yPosition, storageHeaders, storageRows, [80, 70]);
    
    // Add notes section
    if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
    } else {
        yPosition += 15;
    }
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Notes:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const notes = [
        '• All specifications are minimum requirements',
        '• Storage calculations include growth buffer',
        '• Cloud instance recommendations are optimized for performance',
        '• Database IOPS requirements may vary based on workload patterns',
    ];
    
    notes.forEach(note => {
        pdf.text(note, 25, yPosition);
        yPosition += 6;
    });
    
    // Save the PDF
    pdf.save('uac_hardware_sizing_report.pdf');
}

// --- Directory Validation Helper Functions ---
function clearDirectoryValidationErrors() {
    const directoryFields = ['unvdir', 'unvcfgdir', 'unvdatadir'];
    
    directoryFields.forEach(fieldId => {
        const fieldInput = document.getElementById(fieldId);
        const fieldGroup = document.getElementById(`${fieldId}-group`);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (fieldInput) {
            fieldInput.classList.remove('error');
        }
        if (fieldGroup) {
            fieldGroup.classList.remove('error');
        }
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    });
}

function showDirectoryValidationErrors(message) {
    const directoryFields = ['unvdir', 'unvcfgdir', 'unvdatadir'];
    
    directoryFields.forEach(fieldId => {
        const fieldInput = document.getElementById(fieldId);
        const fieldValue = fieldInput?.value.trim() || '';
        const fieldGroup = document.getElementById(`${fieldId}-group`);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        // Only highlight empty fields
        if (!fieldValue) {
            if (fieldInput) {
                fieldInput.classList.add('error');
            }
            if (fieldGroup) {
                fieldGroup.classList.add('error');
            }
            if (errorElement) {
                errorElement.textContent = 'This field is required';
                errorElement.classList.add('show');
            }
        }
    });
    
    // Scroll to the first error field
    const firstErrorField = document.querySelector('input.error, .form-group.error input');
    if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
    }
}
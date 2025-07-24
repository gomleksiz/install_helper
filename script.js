document.addEventListener('DOMContentLoaded', () => {
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
                unvdatadir: ''
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

    if (rdbmsSelect && dburlField) {
        rdbmsSelect.addEventListener('change', function() {
            const rdbmsValue = this.value;
            let defaultUrl = '';

            switch (rdbmsValue) {
                case 'mysql':
                    defaultUrl = 'jdbc:mysql://localhost:3306/';
                    break;
                case 'postgres':
                    defaultUrl = 'jdbc:postgresql://localhost:5432/';
                    break;
                case 'oracle':
                    defaultUrl = 'jdbc:oracle:thin:@//localhost:1521/ServiceName';
                    break;
                case 'sqlserver':
                    defaultUrl = 'jdbc:sqlserver://localhost:1433;DatabaseName=uc';
                    break;
                case 'sqlserver-jtds':
                    defaultUrl = 'jdbc:jtds:sqlserver://localhost:1433/uc';
                    break;
                default:
                    defaultUrl = '';
            }

            dburlField.value = defaultUrl;
        });
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
        
        let command = prefix + script;
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

            // Special handling for ac_netname - also sets ubroker_id
            if (name === 'ac_netname') {
                const netnameValue = element.value.trim();
                if (netnameValue) {
                    command += ` --ac_netname ${netnameValue}`;
                    command += ` --ubroker_id ${netnameValue}`;
                }
                continue;
            }

            // Special handling for oms_port and unvport - only add if not empty and not default
            if (name === 'oms_port') {
                const omsPortValue = element.value.trim();
                if (omsPortValue && omsPortValue !== '7878') {
                    command += ` --oms_port ${omsPortValue}`;
                }
                continue;
            }

            if (name === 'unvport') {
                const unvPortValue = element.value.trim();
                if (unvPortValue && unvPortValue !== '7887') {
                    command += ` --unvport ${unvPortValue}`;
                }
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

        if (hasAnyDir && hasAllDirs) {
            // All three directories have values - add usermode_install and directories
            command += ` --usermode_install yes`;
            if (unvdirValue) command += ` --unvdir ${unvdirValue}`;
            if (unvcfgdirValue) command += ` --unvcfgdir ${unvcfgdirValue}`;
            if (unvdatadirValue) command += ` --unvdatadir ${unvdatadirValue}`;
        } else if (hasAnyDir && !hasAllDirs) {
            // Some but not all directories have values - show error
            alert('If you specify any directory (Install, Config, or Data), all three directories must have values.');
            return;
        }

        // Check if we need additional commands
        const securityValue = document.getElementById('security')?.value || 'appdef';
        const registerUbrokerd = document.getElementById('register_ubrokerd')?.checked || false;
        
        // Check if this is Windows form
        const isWindows = window.location.pathname.includes('windows') || 
                        document.getElementById('windows-form') !== null;
        
        // Build additional commands
        let additionalCommands = [];
        
        // PAM commands only for Linux (not Windows)
        if (!isWindows) {
            const needsPamCommand = ['appdef', 'pam', 'pam_sessions'].includes(securityValue);
            if (needsPamCommand) {
                additionalCommands.push('cp /etc/pam.d/login /etc/pam.d/ucmd');
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
            // Handle spaces in cluster name with quotes
            const clusterValue = value.trim();
            if (clusterValue.includes(' ')) {
                msiParams.push(`AC_AGENT_CLUSTER="${clusterValue}"`);
            } else {
                msiParams.push(`AC_AGENT_CLUSTER=${clusterValue}`);
            }
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
            // Always quote database URLs
            command += ` --dburl '${value}'`;
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
}
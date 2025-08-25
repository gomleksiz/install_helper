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
        aws: { instance: "t3.large", cpu: 2, memory: 8 },
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
        aws: { instance: "m6i.large", cpu: 2, memory: 8 },
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
        aws: { instance: "m6i.xlarge", cpu: 4, memory: 16 },
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

    // --- Populate Summary ---
    document.getElementById('summary-category').textContent = category.name;
    document.getElementById('summary-tasks').textContent = `${taskLabels[index]}/month`;
    let deploymentText = deployment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (deployment !== 'on-prem') {
        deploymentText += ` (${cloudProvider.toUpperCase()})`;
    }
    document.getElementById('summary-deployment').textContent = deploymentText;

    // --- Populate Server Specifications ---
    // Agent
    document.getElementById('agent-vcpu').textContent = category.agent.cpu;
    document.getElementById('agent-ram').textContent = `${category.agent.memory} GB`;
    document.getElementById('agent-disk').textContent = category.agent.disk;
    // Controller
    document.getElementById('controller-vcpu').textContent = category.controller.cpu;
    document.getElementById('controller-ram').textContent = `${category.controller.memory} GB`;
    document.getElementById('controller-jvm').textContent = `${category.controller.jvm} GB`;
    document.getElementById('controller-disk').textContent = `SSD/GP3 ${controllerDiskGB} GB`;
    document.getElementById('controller-aws').textContent = category.controller.aws.instance;
    document.getElementById('controller-azure').textContent = category.controller.azure.instance;
    // Database
    document.getElementById('db-vcpu').textContent = category.database.cpu;
    document.getElementById('db-ram').textContent = `${category.database.memory} GB`;
    document.getElementById('db-iops').textContent = formatNumber(category.database.iops);
    document.getElementById('db-type').textContent = `MySQL/Oracle/SQL Server/Postgres`;
    document.getElementById('db-aws').textContent = category.database.aws.instance;
    document.getElementById('db-azure').textContent = category.database.azure.instance;

    // --- Populate Additional Components ---
    const omsNotes = {
        onprem: 'Requires NFSv4 support',
        aws: 'Managed file storage service',
        azure: 'Managed file storage service',
        other: 'Use your cloud provider\'s file storage service'
    };
    const backupNotes = {
        onprem: 'Local storage solution',
        aws: 'Cloud object storage',
        azure: 'Cloud object storage',
        other: 'Use your cloud provider\'s object storage service'
    };
    const lbNotes = {
        onprem: 'Hardware or software-based',
        aws: 'Cloud-native load balancing',
        azure: 'Cloud-native load balancing',
        other: 'Use your cloud provider\'s load balancing service'
    };
    // OMS
    document.getElementById('oms-size').textContent = category.oms.size;
    document.getElementById('oms-type').textContent = category.oms[environmentKey].type;
    document.getElementById('oms-policy').textContent = category.oms.policy;
    document.getElementById('oms-note').textContent = omsNotes[environmentKey];
    // Backup
    document.getElementById('backup-size').textContent = `${backupSizeGB} GB`;
    document.getElementById('backup-type').textContent = category.backup[environmentKey].type;
    document.getElementById('backup-policy').textContent = 'Auto growth recommended';
    document.getElementById('backup-note').textContent = backupNotes[environmentKey];
    // Load Balancer
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
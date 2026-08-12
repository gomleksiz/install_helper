// UAC Hardware Sizing — v2 (vanilla port of the new_design "Sizing Page" logic).
// Live-rendered estimation tool: pick a category / volume / retention / deployment and
// the server specs, database storage, shared services, warnings and a procurement
// summary update instantly. PDF export uses the browser print dialog + a print-only view.
(function () {
  const slider = document.getElementById('tasks');
  if (!slider) return; // only run on the sizing page

  // ---- style constants (mirror the design's inline pills) ------------------
  const PILL_ON = "padding:5px 10px;border:1px solid #12233d;background:#12233d;color:#fff;border-radius:6px;font-size:11.5px;font-family:inherit;cursor:pointer;white-space:nowrap";
  const PILL_OFF = "padding:5px 10px;border:1px solid #dfe3e8;background:#fff;color:#5a6472;border-radius:6px;font-size:11.5px;font-family:inherit;cursor:pointer;white-space:nowrap";
  const CAT_ON = "display:flex;flex-direction:column;gap:3px;align-items:flex-start;text-align:left;padding:11px 13px;border:1px solid #186CDA;background:#eef5fe;border-radius:9px;font-family:inherit;cursor:pointer";
  const CAT_OFF = "display:flex;flex-direction:column;gap:3px;align-items:flex-start;text-align:left;padding:11px 13px;border:1px solid #dfe3e8;background:#fff;border-radius:9px;font-family:inherit;cursor:pointer";
  const NUM = "font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:600;text-align:right;align-self:center;letter-spacing:-.01em";
  const ROW = "display:grid;grid-template-columns:minmax(150px,1.5fr) 82px 92px 108px minmax(120px,1.1fr);gap:12px;padding:13px 16px;border-bottom:1px solid #f0f2f5;align-items:center";

  const STEPS = [10000, 25000, 40000, 100000, 250000, 300000, 400000, 500000, 1000000, 3000000, 5000000, 7000000, 10000000, 15000000];
  // Category chips — labels/limits match the original sizing page.
  const CATEGORIES = [
    { name: "Micro", index: 1, limit: "≤ 100K / month", desc: "Small environments or test systems" },
    { name: "Small", index: 4, limit: "≤ 500K / month", desc: "Smaller production workloads" },
    { name: "Medium", index: 8, limit: "≤ 3M / month", desc: "Standard mid-size production" },
    { name: "Large", index: 12, limit: "≤ 15M / month", desc: "Enterprise high-volume" }
  ];
  // --- Original sizing matrix (carried over verbatim from script.js) ---------
  const SIZING_MATRIX = [
    {
      name: "Micro", max_tasks: 100000,
      agent: { cpu: 2, memory: 4, disk: "SSD/GP3 50 GB" },
      controller: { cpu: 2, memory: 8, jvm: 4, baseDisk: 50,
        aws: { instance: "t3.medium" }, azure: { instance: "D2s v5" }, onprem: { instance: "—" }, other: { instance: "—" } },
      database: { cpu: 2, memory: 8, iops: 1500,
        aws: { instance: "db.t4g.medium" }, azure: { instance: "GP_Gen5_2" }, onprem: { instance: "—" }, other: { instance: "—" } },
      oms: { size: "10 GB", policy: "Auto growth", aws: { type: "EFS" }, azure: { type: "Azure Files" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud File Storage" } },
      backup: { aws: { type: "S3" }, azure: { type: "Azure Storage" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud Object Storage" } },
      loadbalancer: { aws: { type: "ALB/NLB" }, azure: { type: "Azure Load Balancer" }, onprem: { type: "Hardware Load Balancer" }, other: { type: "Cloud Load Balancer" } }
    },
    {
      name: "Small", max_tasks: 500000,
      agent: { cpu: 2, memory: 8, disk: "SSD/GP3 50 GB" },
      controller: { cpu: 4, memory: 8, jvm: 6, baseDisk: 50,
        aws: { instance: "t3.large" }, azure: { instance: "D2s v5" }, onprem: { instance: "—" }, other: { instance: "—" } },
      database: { cpu: 2, memory: 16, iops: 3000,
        aws: { instance: "db.t4g.large" }, azure: { instance: "GP_Gen5_4" }, onprem: { instance: "—" }, other: { instance: "—" } },
      oms: { size: "10 GB", policy: "Auto growth", aws: { type: "EFS" }, azure: { type: "Azure Files" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud File Storage" } },
      backup: { aws: { type: "S3" }, azure: { type: "Azure Storage" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud Object Storage" } },
      loadbalancer: { aws: { type: "ALB/NLB" }, azure: { type: "Azure Load Balancer" }, onprem: { type: "Hardware Load Balancer" }, other: { type: "Cloud Load Balancer" } }
    },
    {
      name: "Medium", max_tasks: 3000000,
      agent: { cpu: 2, memory: 8, disk: "SSD/GP3 100 GB" },
      controller: { cpu: 4, memory: 16, jvm: 12, baseDisk: 100,
        aws: { instance: "m6i.large" }, azure: { instance: "D4s v5" }, onprem: { instance: "—" }, other: { instance: "—" } },
      database: { cpu: 4, memory: 32, iops: 6000,
        aws: { instance: "db.r6g.xlarge" }, azure: { instance: "GP_Gen5_8" }, onprem: { instance: "—" }, other: { instance: "—" } },
      oms: { size: "10 GB", policy: "Auto growth", aws: { type: "EFS" }, azure: { type: "Azure Files" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud File Storage" } },
      backup: { aws: { type: "S3" }, azure: { type: "Azure Storage" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud Object Storage" } },
      loadbalancer: { aws: { type: "ALB/NLB" }, azure: { type: "Azure Load Balancer" }, onprem: { type: "Hardware Load Balancer" }, other: { type: "Cloud Load Balancer" } }
    },
    {
      name: "Large", max_tasks: 15000000,
      agent: { cpu: 4, memory: 16, disk: "SSD/GP3 100 GB" },
      controller: { cpu: 8, memory: 32, jvm: 24, baseDisk: 100,
        aws: { instance: "m6i.xlarge" }, azure: { instance: "D8s v5" }, onprem: { instance: "—" }, other: { instance: "—" } },
      database: { cpu: 8, memory: 64, iops: 12000,
        aws: { instance: "db.r6g.2xlarge" }, azure: { instance: "GP_Gen5_16" }, onprem: { instance: "—" }, other: { instance: "—" } },
      oms: { size: "10 GB", policy: "Auto growth", aws: { type: "EFS" }, azure: { type: "Azure Files" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud File Storage" } },
      backup: { aws: { type: "S3" }, azure: { type: "Azure Storage" }, onprem: { type: "NAS/SAN" }, other: { type: "Cloud Object Storage" } },
      loadbalancer: { aws: { type: "ALB/NLB" }, azure: { type: "Azure Load Balancer" }, onprem: { type: "Hardware Load Balancer" }, other: { type: "Cloud Load Balancer" } }
    }
  ];

  const fmtTasks = n => (n >= 1000000 ? (n / 1000000) + "M" : (n / 1000) + "K");
  const gb = n => (n >= 1024 ? (Math.round(n / 102.4) / 10) + " TB" : Math.round(n) + " GB");

  const state = { taskIndex: 8, activity: 7, history: 60, audit: 90, deployment: "customer-cloud", provider: "aws", copied: false };

  // Category selection — original rule: first tier whose max_tasks covers the volume.
  function tierIndex() {
    const t = STEPS[state.taskIndex];
    const i = SIZING_MATRIX.findIndex(c => t <= c.max_tasks);
    return i === -1 ? SIZING_MATRIX.length - 1 : i;
  }
  function category() { return SIZING_MATRIX[tierIndex()]; }
  function categoryName() { return category().name; }
  function envKey() { return state.deployment === "on-prem" ? "onprem" : state.provider; }

  // --- Original storage calculation (carried over verbatim from script.js) ---
  const WAR_FILE_MB = 310;
  const TASK_EXEC_KB = 10;
  const AUDIT_PERCENT = 0.25;
  const RISK_FACTOR = 4;
  const KB_TO_MB = 1024;
  const MB_TO_GB = 1024;
  const OMS_SIZE_GB = 10;   // OMS share is fixed at 10 GB in the original model

  function storage() {
    const tasks = STEPS[state.taskIndex], s = state;
    const task_kb = (tasks / 30) * TASK_EXEC_KB;
    const activity_kb = task_kb * s.activity;
    const history_kb = task_kb * s.history;
    const audit_kb = s.audit / s.history * (task_kb + activity_kb + history_kb) * AUDIT_PERCENT;

    const total_kb = task_kb + activity_kb + history_kb + audit_kb;
    const total_storage_mb = (total_kb / KB_TO_MB) + WAR_FILE_MB;
    const total_storage_gb = total_storage_mb * RISK_FACTOR / MB_TO_GB;

    const baseBackupSize = 10;
    const backupGb = total_storage_gb > baseBackupSize ? Math.ceil(total_storage_gb / 10) * 10 : baseBackupSize;

    // Per-area figures use the same risk factor as the original breakdown.
    const toGb = kb => kb / KB_TO_MB / MB_TO_GB * RISK_FACTOR;
    return {
      activity: toGb(activity_kb), history: toGb(history_kb), audit: toGb(audit_kb),
      raw: toGb(activity_kb) + toGb(history_kb) + toGb(audit_kb),
      total: Math.ceil(total_storage_gb),
      backupGb
    };
  }

  function specs() {
    const c = category(), st = storage(), k = envKey();
    // Original: controller disk = baseDisk + OMS (10 GB) + backup share
    const controllerDisk = c.controller.baseDisk + OMS_SIZE_GB + st.backupGb;
    return {
      controller: { cpu: c.controller.cpu, ram: c.controller.memory, disk: controllerDisk, baseDisk: c.controller.baseDisk,
        heap: c.controller.jvm + " GB", inst: (c.controller[k] || {}).instance || "—" },
      db: { cpu: c.database.cpu, ram: c.database.memory, disk: st.total, iops: c.database.iops,
        inst: (c.database[k] || {}).instance || "—" },
      agent: { cpu: c.agent.cpu, ram: c.agent.memory, disk: c.agent.disk, inst: "—" }
    };
  }

  function warnings() {
    const s = state, t = STEPS[s.taskIndex], st = storage(), i = tierIndex(), out = [];
    const amber = "display:flex;gap:10px;align-items:baseline;background:#fdf6e3;border:1px solid #f0dfae;border-left:4px solid #d99e1f;border-radius:8px;padding:10px 13px;color:#7a5b00";
    const blue = "display:flex;gap:10px;align-items:baseline;background:#eef5fe;border:1px solid #cfe0f8;border-left:4px solid #186CDA;border-radius:8px;padding:10px 13px;color:#12539f";
    if (st.total >= 1000) out.push({ tag: "Storage", text: "Over 1 TB of database. Confirm your storage growth policy and plan purges before go-live.", style: amber });
    const histShare = st.history / st.raw;
    if (histShare > 0.5 && s.history >= 120) out.push({ tag: "Retention", text: "History retention of " + s.history + " days is " + Math.round(histShare * 100) + "% of the database. Dropping to 90 days would save roughly " + gb((st.history - st.history * 90 / s.history) * 1.3) + ".", style: amber });
    if (s.audit >= 365) out.push({ tag: "Retention", text: "365-day audit retention is usually a compliance requirement — keep it only if yours says so.", style: amber });
    if (t >= 5000000) out.push({ tag: "Availability", text: "At " + fmtTasks(t) + " tasks/month plan active/passive controllers and a dedicated database host, not a shared one.", style: blue });
    if (i === 0 && (s.history >= 180 || s.audit >= 180)) out.push({ tag: "Mismatch", text: "Long retention on a Micro workload — the database will outgrow the small disk before CPU or memory become a limit.", style: amber });
    if (s.deployment === "on-prem" && i >= 2) out.push({ tag: "Disk", text: "On-prem at this size: the database needs sustained " + specs().db.iops + " IOPS. Spinning disks or shared SANs will bottleneck first.", style: amber });
    return out;
  }

  function summary() {
    const s = state, sp = specs(), st = storage(), t = STEPS[s.taskIndex];
    const target = s.deployment === "on-prem" ? "On-premises" : "Customer cloud · " + s.provider.toUpperCase();
    return [
      "STONEBRANCH UAC — HARDWARE SIZING",
      "Category            " + categoryName(),
      "Task volume         " + fmtTasks(t) + " executions / month",
      "Retention           activity " + s.activity + "d · history " + s.history + "d · audit " + s.audit + "d",
      "Target              " + target,
      "",
      "SERVER                 vCPU   MEMORY     DISK   NOTE",
      "Universal Controller   " + String(sp.controller.cpu).padStart(4) + "   " + (sp.controller.ram + " GB").padStart(6) + "   " + gb(sp.controller.disk).padStart(7) + "   heap " + sp.controller.heap + " · " + sp.controller.inst,
      "Database               " + String(sp.db.cpu).padStart(4) + "   " + (sp.db.ram + " GB").padStart(6) + "   " + (sp.db.disk + " GB").padStart(6) + "   " + sp.db.iops + " IOPS · " + sp.db.inst,
      "Universal Agent / OMS  " + String(sp.agent.cpu).padStart(4) + "   " + (sp.agent.ram + " GB").padStart(6) + "   " + (sp.agent.disk + " GB").padStart(6) + "   " + sp.agent.inst,
      "",
      "Database total        " + gb(st.total) + "  (activity " + gb(st.activity) + " · history " + gb(st.history) + " · audit " + gb(st.audit) + " + 30% headroom)",
      "OMS file share        " + gb(OMS_SIZE_GB),
      "Log & backup share    " + gb(st.backupGb),
      "",
      "Reference only — verify against official Stonebranch documentation."
    ].join("\n");
  }

  function targetLabel() {
    const s = state;
    return s.deployment === "on-prem" ? "On-premises" : s.provider.toUpperCase() + " cloud";
  }

  // ---- rendering -----------------------------------------------------------
  const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function renderCategories() {
    return CATEGORIES.map(c => {
      const on = categoryName() === c.name;
      return `<button type="button" data-act="cat" data-i="${c.index}" style="${on ? CAT_ON : CAT_OFF}">
        <span style="font-size:14px;font-weight:600">${c.name}</span>
        <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#6b7580">${c.limit}</span>
        <span style="font-size:11px;color:#8b95a3;line-height:1.4">${c.desc}</span>
      </button>`;
    }).join("");
  }

  function retentionRow(label, key, opts) {
    const st = storage();
    const share = key === "activity" ? gb(st.activity) : key === "history" ? gb(st.history) : gb(st.audit);
    const btns = opts.map(v => `<button type="button" data-act="ret" data-k="${key}" data-v="${v}" style="${state[key] === v ? PILL_ON : PILL_OFF}">${v}</button>`).join("");
    return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-size:12px;color:#7a8493;min-width:74px">${label}</span>
      <div class="button-group" style="display:flex;gap:5px;flex-wrap:wrap">${btns}</div>
      <span style="margin-left:auto;font-size:11px;color:#a3abb5;font-family:'IBM Plex Mono',monospace">${share}</span>
    </div>`;
  }

  function renderRetention() {
    return retentionRow("Activity", "activity", [7, 14, 21, 30]) +
      retentionRow("History", "history", [30, 60, 90, 120, 180, 365]) +
      retentionRow("Audit", "audit", [30, 60, 90, 120, 180, 365]);
  }

  function renderDeployment() {
    const s = state;
    const dep = [{ label: "Customer cloud", value: "customer-cloud" }, { label: "On-prem", value: "on-prem" }]
      .map(o => `<button type="button" data-act="dep" data-v="${o.value}" style="${s.deployment === o.value ? PILL_ON : PILL_OFF}">${o.label}</button>`).join("");
    const prov = [{ label: "AWS", value: "aws" }, { label: "Azure", value: "azure" }]
      .map(o => `<button type="button" data-act="prov" data-v="${o.value}" style="${s.provider === o.value ? PILL_ON : PILL_OFF}">${o.label}</button>`).join("");
    const note = s.deployment === "on-prem"
      ? "You provide the hardware. Disk throughput on the database host matters more than raw CPU at every size."
      : "Instance types below are the closest fit in your provider's general-purpose and memory-optimised families.";
    const cloud = s.deployment !== "on-prem"
      ? `<div id="cloud-provider-group" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="font-size:12px;color:#7a8493;min-width:74px">Provider</span>
          <div class="button-group" style="display:flex;gap:5px;flex-wrap:wrap">${prov}</div>
        </div>` : "";
    return `<span style="font-size:13px;font-weight:600">Deployment</span>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:12px;color:#7a8493;min-width:74px">Where</span>
        <div class="button-group" style="display:flex;gap:5px;flex-wrap:wrap">${dep}</div>
      </div>
      ${cloud}
      <p style="margin:0;font-size:11.5px;color:#8b95a3;line-height:1.5">${note}</p>`;
  }

  function renderResult() {
    const s = state, sp = specs(), st = storage(), t = STEPS[s.taskIndex], i = tierIndex();
    const wl = warnings();
    const pct = v => Math.max(2, Math.round(v / st.raw * 100));

    const summaryBar = `<div style="background:#12233d;color:#fff;border-radius:10px;padding:16px 18px;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:11px;letter-spacing:.1em;color:#93a3ba;font-family:'IBM Plex Mono',monospace">SIZING CATEGORY</span><span style="font-size:27px;font-weight:600;letter-spacing:-.02em;line-height:1.1">${categoryName()}</span></div>
      <div style="width:1px;height:38px;background:rgba(255,255,255,.16)"></div>
      <div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:11px;letter-spacing:.1em;color:#93a3ba;font-family:'IBM Plex Mono',monospace">TOTAL DATABASE</span><span style="font-family:'IBM Plex Mono',monospace;font-size:27px;font-weight:600;line-height:1.1">${gb(st.total)}</span></div>
      <div style="width:1px;height:38px;background:rgba(255,255,255,.16)"></div>
      <div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:11px;letter-spacing:.1em;color:#93a3ba;font-family:'IBM Plex Mono',monospace">TARGET</span><span style="font-size:15px;font-weight:500;line-height:1.3">${targetLabel()}</span></div>
      <div style="margin-left:auto;display:flex;gap:7px">
        <button type="button" data-act="copy" style="padding:8px 14px;border:1px solid rgba(255,255,255,.28);background:transparent;color:#fff;border-radius:7px;font-size:12.5px;font-family:inherit;cursor:pointer">${s.copied ? "Copied" : "Copy summary"}</button>
        <button type="button" data-act="download" style="padding:8px 14px;border:none;background:#3d8bef;color:#fff;border-radius:7px;font-size:12.5px;font-family:inherit;cursor:pointer">Download summary</button>
        <button type="button" data-act="print" style="padding:8px 14px;border:1px solid rgba(255,255,255,.28);background:transparent;color:#fff;border-radius:7px;font-size:12.5px;font-family:inherit;cursor:pointer">PDF</button>
      </div>
    </div>`;

    const warnBlock = wl.length ? `<div style="display:flex;flex-direction:column;gap:7px">${wl.map(w =>
      `<div style="${w.style}"><span style="font-weight:600;font-size:12px;white-space:nowrap">${w.tag}</span><span style="font-size:12.5px;line-height:1.5">${w.text}</span></div>`).join("")}</div>` : "";

    const extraHeader = s.deployment === "on-prem" ? "NOTES" : "INSTANCE";
    const specRows = [
      { name: "Universal Controller", sub: "Tomcat + WAR · JVM heap " + sp.controller.heap, cpu: sp.controller.cpu, ram: sp.controller.ram + " GB", disk: gb(sp.controller.disk), extra: sp.controller.inst, extraSub: sp.controller.baseDisk + " GB base + 10 GB OMS + " + st.backupGb + " GB backup" },
      { name: "Database", sub: "MySQL · MariaDB · Postgres · Oracle · MSSQL", cpu: sp.db.cpu, ram: sp.db.ram + " GB", disk: gb(sp.db.disk), extra: sp.db.inst, extraSub: sp.db.iops.toLocaleString() + " IOPS minimum" },
      { name: "Universal Agent + OMS", sub: "message bus and agent host", cpu: sp.agent.cpu, ram: sp.agent.ram + " GB", disk: sp.agent.disk.replace("SSD/GP3 ", ""), extra: sp.agent.inst, extraSub: "per agent host" }
    ];
    const specTable = `<div style="background:#fff;border:1px solid #dfe3e8;border-radius:10px;overflow:hidden">
      <div style="display:grid;grid-template-columns:minmax(150px,1.5fr) 82px 92px 108px minmax(120px,1.1fr);gap:12px;padding:10px 16px;background:#fafbfc;border-bottom:1px solid #e6e9ed;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.09em;color:#98a1ad"><span>SERVER</span><span style="text-align:right">vCPU</span><span style="text-align:right">MEMORY</span><span style="text-align:right">DISK</span><span>${extraHeader}</span></div>
      ${specRows.map(r => `<div style="${ROW}">
        <span style="display:flex;flex-direction:column;gap:1px;min-width:0"><span style="font-size:14px;font-weight:600">${r.name}</span><span style="font-size:11.5px;color:#8b95a3">${r.sub}</span></span>
        <span style="${NUM}">${r.cpu}</span><span style="${NUM}">${r.ram}</span><span style="${NUM}">${r.disk}</span>
        <span style="display:flex;flex-direction:column;gap:1px;font-size:11.5px;color:#5a6472;align-self:center"><span style="font-family:'IBM Plex Mono',monospace;color:#1d2126">${r.extra}</span><span style="color:#a3abb5">${r.extraSub}</span></span>
      </div>`).join("")}
    </div>`;

    const sideCards = [
      { title: "OMS file share", value: category().oms.size, note: "Fixed-size transactional message store (" + (category().oms[envKey()]||{}).type + ") — " + category().oms.policy + ". Does not scale with task volume." },
      { title: "Log & backup share", value: gb(st.backupGb), note: "Database backups and rolling logs (" + (category().backup[envKey()]||{}).type + "). Keep it off the database volume." },
      { title: "Load balancer", value: (category().loadbalancer[envKey()]||{}).type, note: "High availability and traffic distribution across the controller pair." }
    ];
    const sideBlock = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">${sideCards.map(c =>
      `<div style="background:#fff;border:1px solid #dfe3e8;border-radius:10px;padding:13px 15px;display:flex;flex-direction:column;gap:7px"><span style="font-size:12.5px;font-weight:600">${c.title}</span><span style="font-family:'IBM Plex Mono',monospace;font-size:21px;font-weight:600;letter-spacing:-.01em">${c.value}</span><span style="font-size:11.5px;color:#8b95a3;line-height:1.5">${c.note}</span></div>`).join("")}</div>`;

    const bars = [
      { label: "Activity", formula: fmtTasks(t) + " ÷ 30 × 10 KB × " + s.activity + "d", value: gb(st.activity), color: "#186CDA", p: pct(st.activity) },
      { label: "History", formula: fmtTasks(t) + " ÷ 30 × 10 KB × " + s.history + "d", value: gb(st.history), color: "#7048C6", p: pct(st.history) },
      { label: "Audit", formula: fmtTasks(t) + "25% of task+activity+history × " + s.audit + "/" + s.history, value: gb(st.audit), color: "#0E8A76", p: pct(st.audit) }
    ];
    const storageDetails = `<details style="background:#fff;border:1px solid #dfe3e8;border-radius:10px;padding:11px 15px">
      <summary style="cursor:pointer;list-style:none;font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:8px"><span style="color:#186CDA;font-size:11px">＋</span>Where the database size comes from<span style="margin-left:auto;font-size:11px;color:#98a1ad;font-family:'IBM Plex Mono',monospace">${gb(st.total)}</span></summary>
      <div style="display:flex;flex-direction:column;gap:8px;padding-top:11px">
        ${bars.map(b => `<div style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;align-items:baseline;gap:8px;font-size:12px"><span style="font-weight:500">${b.label}</span><span style="color:#8b95a3;font-size:11.5px">${b.formula}</span><span style="margin-left:auto;font-family:'IBM Plex Mono',monospace;font-weight:600">${b.value}</span></div><div style="height:7px;background:#eef0f3;border-radius:4px;overflow:hidden"><span style="display:block;height:100%;background:${b.color};border-radius:4px;width:${b.p}%"></span></div></div>`).join("")}
        <p style="margin:4px 0 0;font-size:11.5px;color:#8b95a3;line-height:1.55">Based on ~10 KB per task execution per day across the retention window, audit at 25% of task+activity+history scaled by audit/history, plus a 310 MB WAR allowance and a 4x risk factor.</p>
      </div>
    </details>`;

    const procurement = `<details style="background:#fff;border:1px solid #dfe3e8;border-radius:10px;padding:11px 15px">
      <summary style="cursor:pointer;list-style:none;font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:8px"><span style="color:#186CDA;font-size:11px">＋</span>Procurement summary<span style="margin-left:auto;font-size:11px;color:#98a1ad;font-family:'IBM Plex Mono',monospace">plain text</span></summary>
      <pre style="margin:11px 0 0;background:#12181f;border-radius:8px;padding:12px 14px;overflow:auto;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.8;color:#cdd4db;white-space:pre-wrap">${esc(summary())}</pre>
    </details>`;

    const arch = `<details style="background:#fff;border:1px solid #dfe3e8;border-radius:10px;padding:11px 15px">
      <summary style="cursor:pointer;list-style:none;font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:8px"><span style="color:#186CDA;font-size:11px">＋</span>Reference architecture<span style="margin-left:auto;font-size:11px;color:#98a1ad">active / passive controllers, shared DB and file system</span></summary>
      <img src="architecture.png" alt="UAC architecture" style="display:block;max-width:100%;margin:12px auto 0">
    </details>`;

    return summaryBar + warnBlock + specTable + sideBlock + storageDetails + procurement + arch;
  }

  function renderPrint() {
    const s = state, sp = specs(), st = storage(), t = STEPS[s.taskIndex], i = tierIndex();
    const wl = warnings();
    const printDate = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const printInputs = [
      { label: "Task volume", value: fmtTasks(t) + " executions / month" },
      { label: "Retention (activity / history / audit)", value: s.activity + " / " + s.history + " / " + s.audit + " days" },
      { label: "Deployment", value: s.deployment === "on-prem" ? "On-premises" : "Customer cloud · " + s.provider.toUpperCase() },
      { label: "Sizing category", value: categoryName() + " (" + ["≤ 100K", "≤ 500K", "≤ 3M", "≤ 15M"][i] + " tasks / month)" }
    ];
    const specRows = [
      { name: "Universal Controller", sub: "Tomcat + WAR · JVM heap " + sp.controller.heap, cpu: sp.controller.cpu, ram: sp.controller.ram + " GB", disk: gb(sp.controller.disk), extra: sp.controller.inst, extraSub: sp.controller.baseDisk + " GB base + 10 GB OMS + " + st.backupGb + " GB backup" },
      { name: "Database", sub: "MySQL · MariaDB · Postgres · Oracle · MSSQL", cpu: sp.db.cpu, ram: sp.db.ram + " GB", disk: gb(sp.db.disk), extra: sp.db.inst, extraSub: sp.db.iops.toLocaleString() + " IOPS minimum" },
      { name: "Universal Agent + OMS", sub: "message bus and agent host", cpu: sp.agent.cpu, ram: sp.agent.ram + " GB", disk: sp.agent.disk.replace("SSD/GP3 ", ""), extra: sp.agent.inst, extraSub: "per agent host" }
    ];
    const bars = [
      { label: "Activity", formula: fmtTasks(t) + " ÷ 30 × 10 KB × " + s.activity + "d", value: gb(st.activity) },
      { label: "History", formula: fmtTasks(t) + " ÷ 30 × 10 KB × " + s.history + "d", value: gb(st.history) },
      { label: "Audit", formula: fmtTasks(t) + "25% of task+activity+history × " + s.audit + "/" + s.history, value: gb(st.audit) }
    ];
    const sideCards = [
      { title: "OMS file share", value: category().oms.size },
      { title: "Log & backup share", value: gb(st.backupGb) },
      { title: "Load balancer", value: (category().loadbalancer[envKey()]||{}).type }
    ];
    return `<div style="display:flex;align-items:flex-end;gap:14px;border-bottom:2px solid #12233d;padding-bottom:8px">
        <div style="display:flex;flex-direction:column;gap:2px"><span style="font-family:'IBM Plex Mono',monospace;font-size:8.5pt;letter-spacing:.12em;color:#666">STONEBRANCH UAC · HARDWARE SIZING</span><span style="font-size:20pt;font-weight:600;letter-spacing:-.01em;line-height:1.1">${categoryName()} deployment</span></div>
        <span style="margin-left:auto;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:9pt;color:#444">${targetLabel()}<br>${printDate}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:12px" class="pbreak"><tbody>${printInputs.map(r => `<tr><td style="width:34%;padding:4px 0;font-size:9.5pt;color:#555;vertical-align:top">${r.label}</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace;font-size:10pt;font-weight:500">${r.value}</td></tr>`).join("")}</tbody></table>
      <h2 style="margin:18px 0 6px;font-size:12pt;font-weight:600;letter-spacing:.02em">Server specifications</h2>
      <table style="width:100%;border-collapse:collapse" class="pbreak"><thead><tr style="border-bottom:1px solid #12233d">
        <th style="text-align:left;padding:5px 6px 5px 0;font-size:8.5pt;letter-spacing:.09em;color:#555;font-family:'IBM Plex Mono',monospace;font-weight:500">SERVER</th><th style="text-align:right;padding:5px 6px;font-size:8.5pt;color:#555;font-family:'IBM Plex Mono',monospace;font-weight:500">vCPU</th><th style="text-align:right;padding:5px 6px;font-size:8.5pt;color:#555;font-family:'IBM Plex Mono',monospace;font-weight:500">MEMORY</th><th style="text-align:right;padding:5px 6px;font-size:8.5pt;color:#555;font-family:'IBM Plex Mono',monospace;font-weight:500">DISK</th><th style="text-align:left;padding:5px 0 5px 12px;font-size:8.5pt;color:#555;font-family:'IBM Plex Mono',monospace;font-weight:500">${s.deployment === "on-prem" ? "NOTES" : "INSTANCE"}</th>
      </tr></thead><tbody>${specRows.map(r => `<tr style="border-bottom:1px solid #ddd"><td style="padding:8px 6px 8px 0;vertical-align:top"><span style="font-size:10.5pt;font-weight:600;display:block">${r.name}</span><span style="font-size:8.5pt;color:#666">${r.sub}</span></td><td style="padding:8px 6px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12pt;font-weight:600">${r.cpu}</td><td style="padding:8px 6px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12pt;font-weight:600">${r.ram}</td><td style="padding:8px 6px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12pt;font-weight:600">${r.disk}</td><td style="padding:8px 0 8px 12px;vertical-align:top"><span style="font-family:'IBM Plex Mono',monospace;font-size:9.5pt;display:block">${r.extra}</span><span style="font-size:8.5pt;color:#666">${r.extraSub}</span></td></tr>`).join("")}</tbody></table>
      <div style="display:flex;gap:22px;margin-top:18px" class="pbreak">
        <div style="flex:1"><h2 style="margin:0 0 6px;font-size:12pt;font-weight:600">Database storage</h2><table style="width:100%;border-collapse:collapse"><tbody>${bars.map(b => `<tr style="border-bottom:1px solid #eee"><td style="padding:4px 0;font-size:9.5pt">${b.label}<span style="color:#777;font-size:8.5pt"> · ${b.formula}</span></td><td style="padding:4px 0;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:10pt;font-weight:600">${b.value}</td></tr>`).join("")}<tr><td style="padding:6px 0;font-size:10pt;font-weight:600">Total with 30% headroom</td><td style="padding:6px 0;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12pt;font-weight:600">${gb(st.total)}</td></tr></tbody></table></div>
        <div style="flex:1"><h2 style="margin:0 0 6px;font-size:12pt;font-weight:600">Shared services</h2><table style="width:100%;border-collapse:collapse"><tbody>${sideCards.map(c => `<tr style="border-bottom:1px solid #eee"><td style="padding:4px 0;font-size:9.5pt;vertical-align:top">${c.title}</td><td style="padding:4px 0;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:10pt;font-weight:600">${c.value}</td></tr>`).join("")}</tbody></table></div>
      </div>
      ${wl.length ? `<div style="margin-top:18px" class="pbreak"><h2 style="margin:0 0 6px;font-size:12pt;font-weight:600">Things to check</h2>${wl.map(w => `<p style="margin:0 0 5px;font-size:9.5pt;line-height:1.5;padding-left:10px;border-left:2px solid #999"><b>${w.tag}.</b> ${w.text}</p>`).join("")}</div>` : ""}
      <div style="margin-top:18px;break-before:page;page-break-before:always"><h2 style="margin:0 0 8px;font-size:12pt;font-weight:600">Reference architecture</h2><img src="architecture.png" alt="UAC architecture" style="display:block;max-width:100%;margin:0 auto"><p style="margin:8px 0 0;font-size:9pt;color:#555;text-align:center">Active / passive Universal Controller with OMS, shared database and file system; agents connect outbound on port 7878.</p></div>
      <p style="margin:20px 0 0;padding-top:8px;border-top:1px solid #ccc;font-size:8.5pt;color:#666">Reference only — figures are estimates from the stated inputs and may be outdated or inaccurate. Always verify against official Stonebranch documentation before purchase.</p>`;
  }

  function render() {
    document.getElementById('cat-grid').innerHTML = renderCategories();
    document.getElementById('task-label').textContent = fmtTasks(STEPS[state.taskIndex]) + " tasks / month";
    document.getElementById('retention-rows').innerHTML = renderRetention();
    document.getElementById('deploy-block').innerHTML = renderDeployment();
    document.getElementById('sizing-result').innerHTML = renderResult();
    document.getElementById('print-section').innerHTML = renderPrint();
  }

  function set(patch) { Object.assign(state, patch); state.copied = false; render(); }

  // slider is persistent so dragging stays smooth
  slider.addEventListener('input', () => { state.taskIndex = Number(slider.value); state.copied = false; render(); });

  // event delegation for all buttons
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'cat') { state.taskIndex = Number(el.dataset.i); slider.value = state.taskIndex; set({}); }
    else if (act === 'ret') { set({ [el.dataset.k]: Number(el.dataset.v) }); }
    else if (act === 'dep') { set({ deployment: el.dataset.v }); }
    else if (act === 'prov') { set({ provider: el.dataset.v }); }
    else if (act === 'copy') { navigator.clipboard.writeText(summary()); state.copied = true; render(); }
    else if (act === 'download') {
      const url = URL.createObjectURL(new Blob([summary() + "\n"], { type: "text/plain" }));
      const a = document.createElement("a");
      a.href = url; a.download = "uac-sizing-" + categoryName().toLowerCase() + ".txt";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    else if (act === 'print') { window.print(); }
  });

  slider.value = state.taskIndex;
  render();
})();

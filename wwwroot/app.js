
// Current logged in user
let currentUser = null;
let isSidebarCollapsed = false;

// ============ API CALLS ============
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'API call failed');
    return data;
}

async function login(username, password) {
    const result = await apiCall('/Auth/login', 'POST', { username, password });
    return {
        success: true,
        userId: result.userId,
        name: `${result.fName} ${result.lName}`,
        role: result.role.toLowerCase(),
        firstName: result.fName,
        lastName: result.lName
    };
}

async function submitTicket(submitterId, description, location) {
    const result = await apiCall('/Tickets/submit', 'POST', { submitterID: submitterId, description, location });
    return { success: true, message: result.message };
}

async function getActiveTickets() {
    return await apiCall('/Tickets/active', 'GET');
}

async function getAllTickets() {
    return await apiCall('/Tickets/all', 'GET');
}

async function resolveTicket(ticketId, adminId, note) {
    return await apiCall(`/Tickets/resolve?ticketId=${ticketId}&adminId=${adminId}&note=${encodeURIComponent(note)}`, 'POST');
}

// ============ UI FUNCTIONS ============
function renderApp() {
    const root = document.getElementById("appRoot");
    if (!currentUser) {
        renderLoginScreen(root);
    } else {
        renderMainApp(root);
    }
}

function renderLoginScreen(root) {
    root.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div style="text-align:center; margin-bottom: 1.5rem;">
                    <div style="width: 56px; height: 56px; background: #357EDD; border-radius: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
                        <span style="font-size: 28px; color: white;">🎓</span>
                    </div>
                    <h2 style="font-size: 24px; font-weight: 600;">UniTicket</h2>
                    <p style="color: var(--text-muted); font-size: 13px;">Smart IT Support Desk</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" id="loginUsername" placeholder="Username">
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" id="loginPassword" placeholder="Password">
                </div>
                <button class="btn-primary" id="loginBtn" style="width:100%; justify-content: center;">Log In →</button>
                <div id="loginError" style="margin-top: 16px;"></div>
            </div>
        </div>
    `;
    
    document.getElementById("loginBtn").addEventListener("click", async () => {
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        
        if (!username || !password) {
            showLoginError("Please enter username and password");
            return;
        }
        
        try {
            const result = await login(username, password);
            if (result.success) {
                currentUser = {
                    id: result.userId,
                    name: result.name,
                    role: result.role,
                    initials: result.firstName.charAt(0) + (result.lastName?.charAt(0) || ''),
                    username: username
                };
                renderApp();
            } else {
                showLoginError(result.message || "Login failed");
            }
        } catch (error) {
            showLoginError(error.message);
        }
    });
}

function showLoginError(msg) {
    const errDiv = document.getElementById("loginError");
    errDiv.innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
    setTimeout(() => { errDiv.innerHTML = ""; }, 2500);
}

function renderMainApp(root) {
    const isAdmin = currentUser.role === "admin";
    
    root.innerHTML = `
        <div class="top-nav">
            <div class="logo-area">
                <button class="sidebar-toggle" id="sidebarToggleBtn">✖</button>
                <div>
                    <h1>🎓 UniTicket</h1>
                    <span>Smart IT Support Desk</span>
                </div>
            </div>
            <div class="user-badge">
                <span id="roleDisplay">${isAdmin ? "Administrator" : "Student"}</span>
                <div class="avatar">${currentUser.initials}</div>
            </div>
        </div>
        <div class="dashboard-layout">
            <div class="sidebar ${isSidebarCollapsed ? 'collapsed' : ''}" id="sidebarNav"></div>
            <div class="content-area" id="mainContent"></div>
        </div>
    `;
    
    document.getElementById("sidebarToggleBtn").addEventListener("click", toggleSidebar);
    renderSidebar(isAdmin);
    
    if (isAdmin) {
        renderAdminDashboard();
    } else {
        renderStudentDashboard();
    }
    attachNavEvents(isAdmin);
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebarNav");
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    
    isSidebarCollapsed = !isSidebarCollapsed;
    
    if (isSidebarCollapsed) {
        sidebar.classList.add("collapsed");
        toggleBtn.textContent = "☰";
    } else {
        sidebar.classList.remove("collapsed");
        toggleBtn.textContent = "✖";
    }
    
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed);
}

function renderSidebar(isAdmin) {
    const sidebar = document.getElementById("sidebarNav");
    if (!isAdmin) {
        sidebar.innerHTML = `
            <div class="nav-item active" data-view="dashboard"><span>📊</span> <span>Dashboard</span></div>
            <div class="nav-item" data-view="submit"><span>➕</span> <span>Submit Ticket</span></div>
            <div class="nav-item" data-view="myTickets"><span>📋</span> <span>My Tickets</span></div>
            <div class="nav-item" data-view="logout"><span>🚪</span> <span>Logout</span></div>
        `;
    } else {
        sidebar.innerHTML = `
            <div class="nav-item active" data-view="adminDashboard"><span>📈</span> <span>Admin Dashboard</span></div>
            <div class="nav-item" data-view="allTickets"><span>🎫</span> <span>All Tickets</span></div>
            <div class="nav-item" data-view="priorityQueue"><span>⚙️</span> <span>Priority Queue</span></div>
            <div class="nav-item" data-view="logout"><span>🔐</span> <span>Logout</span></div>
        `;
    }
}

function attachNavEvents(isAdmin) {
    document.querySelectorAll("[data-view]").forEach(el => {
        el.addEventListener("click", async (e) => {
            const view = el.getAttribute("data-view");
            if (view === "logout") {
                currentUser = null;
                renderApp();
                return;
            }
            if (!isAdmin) {
                if (view === "dashboard") await renderStudentDashboard();
                else if (view === "submit") renderSubmitForm();
                else if (view === "myTickets") await renderMyTickets();
            } else {
                if (view === "adminDashboard") await renderAdminDashboard();
                else if (view === "allTickets") await renderAllTicketsAdmin();
                else if (view === "priorityQueue") await renderPriorityQueue();
            }
            document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
            el.classList.add("active");
        });
    });
}

// ============ STUDENT VIEWS ============
async function renderStudentDashboard() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">📋 Loading your tickets...</div>`;
    
    try {
        const tickets = await getActiveTickets();
        const myTickets = tickets.filter(t => t.submitterID === currentUser.id);
        
        const open = myTickets.filter(t => t.status === "Open").length;
        const progress = myTickets.filter(t => t.status === "In Progress").length;
        const resolved = myTickets.filter(t => t.status === "Resolved").length;
        
        container.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h2 style="font-size: 24px; font-weight: 600;">Welcome, ${currentUser.name}</h2>
                <p style="color: var(--text-muted);">Track and manage your IT requests (AI auto-routing enabled)</p>
            </div>
            <div class="stat-grid">
                <div class="stat-card"><div class="stat-title">Total Tickets</div><div class="stat-number">${myTickets.length}</div></div>
                <div class="stat-card"><div class="stat-title">Open</div><div class="stat-number" style="color:#E9A23B;">${open}</div></div>
                <div class="stat-card"><div class="stat-title">In Progress</div><div class="stat-number" style="color:#357EDD;">${progress}</div></div>
                <div class="stat-card"><div class="stat-title">Resolved</div><div class="stat-number" style="color:#2C8E5A;">${resolved}</div></div>
            </div>
            <div class="filter-bar"><button class="btn-primary" id="newTicketBtn">+ New Ticket</button></div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Description</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
                    <tbody>
                        ${myTickets.map(t => `
                            <tr>
                                <td><strong>#${t.ticketID}</strong></td>
                                <td>${t.description?.substring(0, 60)}${t.description?.length > 60 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td><span class="badge ${t.status === 'Open' ? 'badge-open' : 'badge-progress'}">${t.status}</span></td>
                                <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById("newTicketBtn")?.addEventListener("click", () => renderSubmitForm());
    } catch (error) {
        container.innerHTML = `<div style="color:red; padding:2rem;">❌ Error loading tickets: ${error.message}</div>`;
    }
}

function renderSubmitForm() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `
        <div class="form-card">
            <h3 style="margin-bottom: 1rem;">📝 Report an IT Issue</h3>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:1rem;">🤖 AI will automatically detect the category and priority level for your ticket.</p>
            
            <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea class="form-control" id="ticketDesc" rows="4" placeholder="Describe your technical issue in detail..."></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">📍 Location *</label>
                <input type="text" class="form-control" id="ticketLocation" placeholder="Building name, room number">
                <small style="color: var(--text-light);">Where is the issue occurring?</small>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn-outline" id="cancelBtn">Cancel</button>
                <button class="btn-primary" id="submitFinalBtn">Submit Ticket</button>
            </div>
            
            <div id="aiFeedback" style="margin-top: 16px; display:none; background:#E8F5E9; padding:12px; border-radius:16px;"></div>
        </div>
    `;
    
    document.getElementById("submitFinalBtn").addEventListener("click", async () => {
        const description = document.getElementById("ticketDesc").value.trim();
        const location = document.getElementById("ticketLocation").value.trim();
        
        if (!description || !location) {
            showToast("Please fill in description and location", "error");
            return;
        }
        
        const btn = document.getElementById("submitFinalBtn");
        btn.innerHTML = "⏳ Processing...";
        btn.disabled = true;
        
        try {
            const result = await submitTicket(currentUser.id, description, location);
            const feedbackDiv = document.getElementById("aiFeedback");
            feedbackDiv.innerHTML = `✅ ${result.message}`;
            feedbackDiv.style.display = "block";
            showToast("Ticket submitted successfully!", "success");
            setTimeout(() => renderStudentDashboard(), 2000);
        } catch (error) {
            const feedbackDiv = document.getElementById("aiFeedback");
            feedbackDiv.innerHTML = `❌ ${error.message}`;
            feedbackDiv.style.background = "#FFEBEE";
            feedbackDiv.style.display = "block";
            btn.innerHTML = "Submit Ticket";
            btn.disabled = false;
        }
    });
    
    document.getElementById("cancelBtn").addEventListener("click", () => renderStudentDashboard());
}

async function renderMyTickets() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">📋 Loading your tickets...</div>`;
    
    try {
        const tickets = await getActiveTickets();
        const myTickets = tickets.filter(t => t.submitterID === currentUser.id);
        
        if (myTickets.length === 0) {
            container.innerHTML = `<h3>📌 My Tickets</h3><p>You haven't submitted any tickets yet.</p><button class="btn-primary" id="goToSubmitBtn">+ Submit a Ticket</button>`;
            document.getElementById("goToSubmitBtn")?.addEventListener("click", () => renderSubmitForm());
            return;
        }
        
        container.innerHTML = `
            <h3>📌 My Tickets (${myTickets.length})</h3>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Description</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
                    <tbody>
                        ${myTickets.map(t => `
                            <tr>
                                <td>#${t.ticketID}</td>
                                <td>${t.description?.substring(0, 60)}${t.description?.length > 60 ? '...' : ''}</td>
                                <td>📍 ${t.location || 'Not specified'}</td>
                                <td>${t.category || 'N/A'}</td>
                                <td>${t.priorityLevel || 'Standard'}</td>
                                <td>${t.status}</td>
                                <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<div style="color:red;">❌ Error: ${error.message}</div>`;
    }
}

// ============ ADMIN VIEWS ============
async function renderAdminDashboard() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">📋 Loading tickets...</div>`;
    
    try {
        const tickets = await getAllTickets(); // Use getAllTickets, not getActiveTickets
        
        const activeTickets = tickets.filter(t => t.status !== "Resolved");
        const highPriority = activeTickets.filter(t => t.priorityLevel === "Urgent").length;
        
        container.innerHTML = `
            <div><h2>🛡️ Admin Overview</h2><p style="margin-bottom: 1.5rem;">AI-powered ticketing & smart priority queue</p></div>
            <div class="stat-grid">
                <div class="stat-card"><div class="stat-title">Active Tickets</div><div class="stat-number">${activeTickets.length}</div></div>
                <div class="stat-card"><div class="stat-title">High Priority</div><div class="stat-number" style="color:#E33E3E;">${highPriority}</div></div>
            </div>
            <div class="table-responsive">
                <h4>🚨 Active Tickets</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Submitter</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeTickets.map(t => `
                            <tr>
                                <td>#${t.ticketID}</td>
                                <td>User ${t.submitterID}</td>
                                <td>${t.description?.substring(0, 40)}${t.description?.length > 40 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td>${t.category || 'N/A'}</td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td>${t.status}</td>
                                <td><button class="btn-outline resolveBtn" data-id="${t.ticketID}" style="padding:4px 12px;">Resolve</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        attachResolveButtons();
    } catch (error) {
        container.innerHTML = `<div style="color:red;">❌ Error: ${error.message}</div>`;
    }
}

async function renderAllTicketsAdmin() {
    const container = document.getElementById("mainContent");
    
    try {
        const tickets = await getAllTickets();
        
        container.innerHTML = `
            <h3>📋 All Tickets (Admin View)</h3>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tickets.map(t => `
                            <tr>
                                <td>#${t.ticketID}</td>
                                <td>${t.description?.substring(0, 50)}${t.description?.length > 50 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td>${t.category || 'N/A'}</td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td>${t.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<div style="color:red;">❌ Error: ${error.message}</div>`;
    }
}

async function renderPriorityQueue() {
    const container = document.getElementById("mainContent");
    
    try {
        const tickets = await getAllTickets();
        const active = tickets.filter(t => t.status !== "Resolved");
        const sorted = [...active].sort((a, b) => {
            const priority = { 'Urgent': 3, 'High Priority': 2, 'Issue': 1 };
            return (priority[b.priorityLevel] || 0) - (priority[a.priorityLevel] || 0);
        });
        
        container.innerHTML = `
            <h3>📊 Priority Queue</h3>
            <p>Tickets sorted by urgency: Urgent → High Priority → Issue</p>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sorted.map(t => `
                            <tr>
                                <td>#${t.ticketID}</td>
                                <td>${t.description?.substring(0, 50)}${t.description?.length > 50 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td>${t.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<div style="color:red;">❌ Error: ${error.message}</div>`;
    }
}

function attachResolveButtons() {
    document.querySelectorAll(".resolveBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const ticketId = btn.getAttribute("data-id");
            const note = prompt("Enter resolution notes:");
            if (note) {
                try {
                    await resolveTicket(ticketId, currentUser.id, note);
                    showToast("Ticket resolved successfully!", "success");
                    renderAdminDashboard();
                } catch (error) {
                    showToast(error.message, "error");
                }
            }
        });
    });
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.style.background = type === "error" ? "#E33E3E" : type === "success" ? "#2C8E5A" : "#357EDD";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Load saved sidebar state and start
const savedState = localStorage.getItem("sidebarCollapsed");
isSidebarCollapsed = savedState === "true";
renderApp();
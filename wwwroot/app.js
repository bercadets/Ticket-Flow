

// Current logged in user
let currentUser = null;
let isSidebarCollapsed = false;

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || data.message || 'API call failed');
    }
    
    return data;
}

// LOGIN FUNCTION (Connect to backend)
async function login(username, password) {
    try {
        const result = await apiCall('/Auth/login', 'POST', {
            username: username,
            password: password
        });
        
        return {
            success: true,
            userId: result.userId,
            name: `${result.fName} ${result.lName}`,
            role: result.role.toLowerCase(),
            firstName: result.fName,
            lastName: result.lName
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// REGISTER FUNCTION
async function register(fName, lName, username, password) {
    try {
        const result = await apiCall('/Auth/register', 'POST', {
            fName: fName,
            lName: lName,
            username: username,
            password: password
        });
        
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// SUBMIT TICKET FUNCTION
async function submitTicket(submitterId, description, location) {
    try {
        const result = await apiCall('/Tickets/submit', 'POST', {
            submitterId: submitterId,
            description: description,
            location: location
        });
        
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// GET ACTIVE TICKETS (for student view)
async function getActiveTickets() {
    try {
        const tickets = await apiCall('/Tickets/active', 'GET');
        return { success: true, tickets: tickets };
    } catch (error) {
        return { success: false, tickets: [] };
    }
}

// GET ALL TICKETS (for admin view)
async function getAllTickets() {
    try {
        const tickets = await apiCall('/Tickets/all', 'GET');
        return { success: true, tickets: tickets };
    } catch (error) {
        return { success: false, tickets: [] };
    }
}

// RESOLVE TICKET (admin only)
async function resolveTicket(ticketId, adminId, note) {
    try {
        const result = await apiCall(`/Tickets/resolve?ticketId=${ticketId}&adminId=${adminId}&note=${encodeURIComponent(note)}`, 'POST');
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ============ UI RENDER FUNCTIONS ============

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
    });
}

function showLoginError(msg) {
    const errDiv = document.getElementById("loginError");
    errDiv.innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
    setTimeout(() => { errDiv.innerHTML = ""; }, 2500);
}

// MAIN APP AFTER LOGIN
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
            <div class="sidebar" id="sidebarNav"></div>
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

// STUDENT VIEWS (using real API)
async function renderStudentDashboard() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">Loading tickets...</div>`;
    
    const result = await getActiveTickets();
    const myTickets = result.tickets.filter(t => t.submitterId === currentUser.id);
    
    const open = myTickets.filter(t => t.status === "Open").length;
    const progress = myTickets.filter(t => t.status === "In Progress").length;
    
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 24px; font-weight: 600;">Welcome, ${currentUser.name}</h2>
            <p style="color: var(--text-muted);">Track and manage your IT requests (AI auto-routing enabled)</p>
        </div>
        <div class="stat-grid">
            <div class="stat-card"><div class="stat-title">Total Tickets</div><div class="stat-number">${myTickets.length}</div></div>
            <div class="stat-card"><div class="stat-title">Open</div><div class="stat-number" style="color:#E9A23B;">${open}</div></div>
            <div class="stat-card"><div class="stat-title">In Progress</div><div class="stat-number" style="color:#357EDD;">${progress}</div></div>
        </div>
        <div class="filter-bar"><button class="btn-primary" id="newTicketBtn">+ New Ticket</button></div>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Description</th><th>Category</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                    ${myTickets.map(t => `
                        <tr>
                            <td>#${t.ticketId}</td>
                            <td>${t.description?.substring(0, 50)}...</td>
                            <td><span class="badge badge-hw">${t.category}</span></td>
                            <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel}</span></td>
                            <td><span class="badge badge-open">${t.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById("newTicketBtn")?.addEventListener("click", () => renderSubmitForm());
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
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn-outline" id="cancelBtn">Cancel</button>
                <button class="btn-primary" id="submitFinalBtn">Submit Ticket</button>
            </div>
            
            <div id="aiFeedback" style="margin-top: 16px; display:none; background:#E8F5E9; padding:12px; border-radius:16px;"></div>
        </div>
    `;
    
    document.getElementById("submitFinalBtn").addEventListener("click", async () => {
        const desc = document.getElementById("ticketDesc").value.trim();
        const location = document.getElementById("ticketLocation").value.trim();
        
        if (!desc || !location) {
            showToast("Please fill in description and location", "error");
            return;
        }
        
        const btn = document.getElementById("submitFinalBtn");
        btn.innerHTML = "⏳ Processing...";
        btn.disabled = true;
        
        const result = await submitTicket(currentUser.id, desc, location);
        
        const feedbackDiv = document.getElementById("aiFeedback");
        if (result.success) {
            feedbackDiv.innerHTML = `✅ ${result.message}`;
            feedbackDiv.style.background = "#E8F5E9";
            showToast("Ticket submitted successfully!", "success");
            setTimeout(() => renderStudentDashboard(), 2000);
        } else {
            feedbackDiv.innerHTML = `❌ ${result.message}`;
            feedbackDiv.style.background = "#FFEBEE";
            btn.innerHTML = "Submit Ticket";
            btn.disabled = false;
        }
        feedbackDiv.style.display = "block";
    });
    
    document.getElementById("cancelBtn").addEventListener("click", () => renderStudentDashboard());
}

async function renderMyTickets() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">Loading tickets...</div>`;
    
    const result = await getActiveTickets();
    const myTickets = result.tickets.filter(t => t.submitterId === currentUser.id);
    
    container.innerHTML = `
        <h3 style="margin-bottom: 1rem;">📌 My Tickets</h3>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Description</th><th>Category</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                    ${myTickets.map(t => `
                        <tr>
                            <td>#${t.ticketId}</td>
                            <td>${t.description?.substring(0, 50)}...</td>
                            <td>${t.category}</td>
                            <td>${t.priorityLevel}</td>
                            <td>${t.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ADMIN VIEWS
async function renderAdminDashboard() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">Loading tickets...</div>`;
    
    const result = await getAllTickets();
    const tickets = result.tickets;
    
    container.innerHTML = `
        <div><h2>🛡️ Admin Overview</h2><p style="margin-bottom: 1.5rem;">AI-powered ticketing & smart priority queue</p></div>
        <div class="stat-grid">
            <div class="stat-card"><div class="stat-title">Total Tickets</div><div class="stat-number">${tickets.length}</div></div>
        </div>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Description</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                    ${tickets.map(t => `
                        <tr>
                            <td>#${t.ticketId}</td>
                            <td>${t.description?.substring(0, 50)}...</td>
                            <td>${t.category}</td>
                            <td>${t.status}</td>
                            <td><button class="btn-outline resolveBtn" data-id="${t.ticketId}">Resolve</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    attachResolveButtons();
}

function attachResolveButtons() {
    document.querySelectorAll(".resolveBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const ticketId = btn.getAttribute("data-id");
            const note = prompt("Enter resolution notes:");
            if (note) {
                const result = await resolveTicket(ticketId, currentUser.id, note);
                showToast(result.message, result.success ? "success" : "error");
                if (result.success) renderAdminDashboard();
            }
        });
    });
}

async function renderAllTicketsAdmin() {
    const container = document.getElementById("mainContent");
    const result = await getAllTickets();
    const tickets = result.tickets;
    
    container.innerHTML = `
        <h3>📋 All Tickets (Admin View)</h3>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Description</th><th>Category</th><th>Status</th></tr></thead>
                <tbody>
                    ${tickets.map(t => `
                        <tr>
                            <td>#${t.ticketId}</td>
                            <td>${t.description?.substring(0, 50)}...</td>
                            <td>${t.category}</td>
                            <td>${t.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderPriorityQueue() {
    const container = document.getElementById("mainContent");
    const result = await getAllTickets();
    const tickets = result.tickets;
    
    container.innerHTML = `
        <h3>📊 Priority Queue</h3>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Description</th><th>Category</th><th>Status</th></tr></thead>
                <tbody>
                    ${tickets.map(t => `
                        <tr>
                            <td>#${t.ticketId}</td>
                            <td>${t.description?.substring(0, 50)}...</td>
                            <td>${t.category}</td>
                            <td>${t.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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
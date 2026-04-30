
let currentUser = null;
let isSidebarCollapsed = false;
let showRegister = false; 

function isMobile() {
    return window.innerWidth <= 768;
}

function toggleTicketDetails(element) {
    const card = element.closest('.mobile-ticket-card');
    const details = card.querySelector('.ticket-details');
    const icon = element.querySelector('.expand-icon');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        element.classList.add('expanded');
    } else {
        details.style.display = 'none';
        element.classList.remove('expanded');
    }
}


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

async function register(fName, lName, username, password) {
    const result = await apiCall('/Auth/register', 'POST', { fName, lName, username, password });
    return { success: true, message: result.message };
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

async function updateTicketStatus(ticketId, status) {
    return await apiCall(`/Tickets/update-status?ticketId=${ticketId}&status=${status}`, 'PUT');
}


// ============ UI FUNCTIONS ============
function renderApp() {
    const root = document.getElementById("appRoot");
    if (!currentUser) {
        if (showRegister) {
            renderRegisterScreen(root);
        } else {
            renderLoginScreen(root);
        }
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
                    <input type="password" class="form-control" id="loginPassword" placeholder="Password" onkeypress="handleLoginEnter(event)">
                </div>
                <button class="btn-primary" id="loginBtn" style="width:100%; justify-content: center;">Log In →</button>
                <div style="text-align: center; margin-top: 1rem;">
                    <p style="color: var(--text-muted); font-size: 13px;">Don't have an account? 
                        <a href="#" id="showRegisterBtn" style="color: #357EDD; text-decoration: none; font-weight: 600;">Register here</a>
                    </p>
                </div>
                <div id="loginError" style="margin-top: 16px;"></div>
            </div>
        </div>
    `;
    

    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const loginBtn = document.getElementById("loginBtn");
    

    async function performLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
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
                showRegister = false;
                renderApp();
            } else {
                showLoginError(result.message || "Login failed");
            }
        } catch (error) {
            showLoginError(error.message);
        }
    }
    
    usernameInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            performLogin();
        }
    });
    
    passwordInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            performLogin();
        }
    });
    
    loginBtn.addEventListener("click", performLogin);
    
    document.getElementById("showRegisterBtn").addEventListener("click", (e) => {
        e.preventDefault();
        showRegister = true;
        renderApp();
    });
}

function renderRegisterScreen(root) {
    root.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div style="text-align:center; margin-bottom: 1.5rem;">
                    <div style="width: 56px; height: 56px; background: #357EDD; border-radius: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
                        <span style="font-size: 28px; color: white;">📝</span>
                    </div>
                    <h2 style="font-size: 24px; font-weight: 600;">Create Account</h2>
                    <p style="color: var(--text-muted); font-size: 13px;">Join UniTicket today</p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input type="text" class="form-control" id="regFName" placeholder="Enter your first name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input type="text" class="form-control" id="regLName" placeholder="Enter your last name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Username *</label>
                    <input type="text" class="form-control" id="regUsername" placeholder="Choose a username">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password *</label>
                    <input type="password" class="form-control" id="regPassword" placeholder="Create a password (min 6 characters)">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Confirm Password *</label>
                    <input type="password" class="form-control" id="regConfirmPassword" placeholder="Confirm your password" onkeypress="handleRegisterEnter(event)">
                </div>
                
                <button class="btn-primary" id="registerBtn" style="width:100%; justify-content: center;">Create Account →</button>
                
                <div style="text-align: center; margin-top: 1rem;">
                    <p style="color: var(--text-muted); font-size: 13px;">Already have an account? 
                        <a href="#" id="backToLoginBtn" style="color: #357EDD; text-decoration: none; font-weight: 600;">Back to Login</a>
                    </p>
                </div>
                
                <div id="registerError" style="margin-top: 16px;"></div>
                <div id="registerSuccess" style="margin-top: 16px;"></div>
            </div>
        </div>
    `;
    

    const fNameInput = document.getElementById("regFName");
    const lNameInput = document.getElementById("regLName");
    const usernameInput = document.getElementById("regUsername");
    const passwordInput = document.getElementById("regPassword");
    const confirmInput = document.getElementById("regConfirmPassword");
    const registerBtn = document.getElementById("registerBtn");
    

    async function performRegister() {
        const fName = fNameInput.value.trim();
        const lName = lNameInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        

        document.getElementById("registerError").innerHTML = "";
        document.getElementById("registerSuccess").innerHTML = "";
        

        if (!fName || !lName || !username || !password) {
            showRegisterError("Please fill in all fields");
            return;
        }
        
        if (password.length < 6) {
            showRegisterError("Password must be at least 6 characters long");
            return;
        }
        
        if (password !== confirmPassword) {
            showRegisterError("Passwords do not match");
            return;
        }
        
        try {
            const result = await register(fName, lName, username, password);
            if (result.success) {
                showRegisterSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => {
                    showRegister = false;
                    renderApp();
                }, 2000);
            }
        } catch (error) {
            showRegisterError(error.message);
        }
    }
    
    // Add Enter key listener to all inputs
    const inputs = [fNameInput, lNameInput, usernameInput, passwordInput, confirmInput];
    inputs.forEach(input => {
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                performRegister();
            }
        });
    });
    
    registerBtn.addEventListener("click", performRegister);
    
    document.getElementById("backToLoginBtn").addEventListener("click", (e) => {
        e.preventDefault();
        showRegister = false;
        renderApp();
    });
}


document.addEventListener('keypress', function(event) {
    // Check if login screen is showing
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && event.key === 'Enter') {
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;
        if (username && password) {
            event.preventDefault();
            loginBtn.click();
        }
    }
    

    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn && event.key === 'Enter') {
        event.preventDefault();
        registerBtn.click();
    }
});

function showLoginError(msg) {
    const errDiv = document.getElementById("loginError");
    errDiv.innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
    setTimeout(() => { errDiv.innerHTML = ""; }, 2500);
}

function showRegisterError(msg) {
    const errDiv = document.getElementById("registerError");
    errDiv.innerHTML = `<div class="error-msg">⚠️ ${msg}</div>`;
    setTimeout(() => { errDiv.innerHTML = ""; }, 3000);
}

function showRegisterSuccess(msg) {
    const successDiv = document.getElementById("registerSuccess");
    successDiv.innerHTML = `<div class="error-msg" style="background:#E8F5E9; color:#2C8E5A;">✅ ${msg}</div>`;
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
                showRegister = false;
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
        const allMyTickets = tickets.filter(t => t.submitterID === currentUser.id);
        
        const open = allMyTickets.filter(t => t.status === "Open").length;
        const progress = allMyTickets.filter(t => t.status === "In Progress").length;
        const resolved = allMyTickets.filter(t => t.status === "Resolved").length;
        const activeOnly = allMyTickets.filter(t => t.status !== "Resolved");
        
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            container.innerHTML = `
                <div style="margin-bottom: 2rem;">
                    <h2 style="font-size: 28px; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); -webkit-background-clip: text; background-clip: text; color: transparent;">Welcome back, ${currentUser.name.split(' ')[0]}! 👋</h2>
                    <p style="color: var(--text-muted);">Track and manage your IT requests</p>
                </div>
                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-title">Open</div>
                        <div class="stat-number" style="color:#E9A23B;">${open}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">In Progress</div>
                        <div class="stat-number" style="color:#357EDD;">${progress}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Resolved</div>
                        <div class="stat-number" style="color:#2C8E5A;">${resolved}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">Total Tickets</div>
                        <div class="stat-number">${allMyTickets.length}</div>
                    </div>
                </div>
                <div class="filter-bar">
                    <button class="btn-primary" id="newTicketBtn">
                        <span>+</span> New Ticket
                    </button>
                </div>
                <h3 style="margin: 1rem 0 0.75rem 0;">Active Tickets</h3>
                ${activeOnly.length === 0 ? `
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 20px;">
                        <p style="color: var(--text-muted);">No active tickets 🎉</p>
                        <p style="font-size: 13px; color: var(--text-light);">Your resolved tickets can be found in "My Tickets"</p>
                    </div>
                ` : `
                    <div class="mobile-tickets">
                        ${activeOnly.map(t => `
                            <div class="mobile-ticket-card" data-ticket-id="${t.ticketID}">
                                <div class="ticket-header" onclick="toggleTicketDetails(this)">
                                    <div class="ticket-header-left">
                                        <span class="ticket-id">#${t.ticketID}</span>
                                        <span class="ticket-status-badge ${t.status === 'Open' ? 'badge-open' : 'badge-progress'}">${t.status}</span>
                                    </div>
                                    <span class="expand-icon">▼</span>
                                </div>
                                <div class="ticket-summary">
                                    <div class="ticket-desc">${t.description?.substring(0, 60)}${t.description?.length > 60 ? '...' : ''}</div>
                                </div>
                                <div class="ticket-details" style="display: none;">
                                    <div class="detail-row">
                                        <span class="detail-label">📍 Location</span>
                                        <span class="detail-value">${t.location || 'Not specified'}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">🏷️ Category</span>
                                        <span class="detail-value"><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">⚡ Priority</span>
                                        <span class="detail-value"><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">📅 Submitted</span>
                                        <span class="detail-value">${new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">📝 Full Description</span>
                                        <span class="detail-value">${t.description}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            `;
        } else {
            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 24px; font-weight: 600;">Welcome, ${currentUser.name}</h2>
                    <p style="color: var(--text-muted);">Track and manage your IT requests (AI auto-routing enabled)</p>
                </div>
                <div class="stat-grid">
                    <div class="stat-card"><div class="stat-title">Open</div><div class="stat-number" style="color:#E9A23B;">${open}</div></div>
                    <div class="stat-card"><div class="stat-title">In Progress</div><div class="stat-number" style="color:#357EDD;">${progress}</div></div>
                    <div class="stat-card"><div class="stat-title">Resolved</div><div class="stat-number" style="color:#2C8E5A;">${resolved}</div></div>
                    <div class="stat-card"><div class="stat-title">Total Tickets</div><div class="stat-number">${allMyTickets.length}</div></div>
                </div>
                <div class="filter-bar"><button class="btn-primary" id="newTicketBtn">+ New Ticket</button></div>
                <h3 style="margin: 1rem 0 0.75rem 0;">Active Tickets</h3>
                ${activeOnly.length === 0 ? `
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 20px;">
                        <p style="color: var(--text-muted);">No active tickets 🎉</p>
                        <p style="font-size: 13px; color: var(--text-light);">Your resolved tickets can be found in "My Tickets"</p>
                    </div>
                ` : `
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
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${activeOnly.map(t => `
                                    <tr>
                                        <td data-label="ID"><strong>#${t.ticketID}</strong></td>
                                        <td data-label="Description">${t.description?.substring(0, 60)}${t.description?.length > 60 ? '...' : ''}</td>
                                        <td data-label="Location">📍 ${t.location || 'Not specified'}</td>
                                        <td data-label="Category"><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                        <td data-label="Priority"><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                        <td data-label="Status"><span class="badge ${t.status === 'Open' ? 'badge-open' : 'badge-progress'}">${t.status}</span></td>
                                        <td data-label="Created">${new Date(t.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            `;
        }
        
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
    container.innerHTML = `<div style="text-align:center; padding:2rem;">📋 Loading all your tickets...</div>`;
    
    try {
        const tickets = await getActiveTickets();
        const allMyTickets = tickets.filter(t => t.submitterID === currentUser.id);
        
        const activeCount = allMyTickets.filter(t => t.status !== "Resolved").length;
        const resolvedCount = allMyTickets.filter(t => t.status === "Resolved").length;
        
        const isMobile = window.innerWidth <= 768;
        
        if (allMyTickets.length === 0) {
            container.innerHTML = `
                <h3>📌 My Tickets</h3>
                <p>You haven't submitted any tickets yet.</p>
                <button class="btn-primary" id="goToSubmitBtn">+ Submit a Ticket</button>
            `;
            document.getElementById("goToSubmitBtn")?.addEventListener("click", () => renderSubmitForm());
            return;
        }
        
        if (isMobile) {
            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h3>📌 My Complete Ticket History</h3>
                    <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem; flex-wrap: wrap;">
                        <span style="background: #E3F2FD; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                            🟡 Active: ${activeCount}
                        </span>
                        <span style="background: #E8F5E9; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                            ✅ Resolved: ${resolvedCount}
                        </span>
                        <span style="background: #F3E5F5; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                            📋 Total: ${allMyTickets.length}
                        </span>
                    </div>
                </div>
                <div class="mobile-tickets">
                    ${allMyTickets.map(t => `
                        <div class="mobile-ticket-card" data-ticket-id="${t.ticketID}">
                            <div class="ticket-header" onclick="toggleTicketDetails(this)">
                                <div class="ticket-header-left">
                                    <span class="ticket-id">#${t.ticketID}</span>
                                    <span class="ticket-status-badge ${t.status === 'Open' ? 'badge-open' : t.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${t.status}</span>
                                </div>
                                <span class="expand-icon">▼</span>
                            </div>
                            <div class="ticket-summary">
                                <div class="ticket-desc">${t.description?.substring(0, 60)}${t.description?.length > 60 ? '...' : ''}</div>
                            </div>
                            <div class="ticket-details" style="display: none;">
                                <div class="detail-row">
                                    <span class="detail-label">📍 Location</span>
                                    <span class="detail-value">${t.location || 'Not specified'}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">🏷️ Category</span>
                                    <span class="detail-value"><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">⚡ Priority</span>
                                    <span class="detail-value"><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">📅 Submitted</span>
                                    <span class="detail-value">${new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">📝 Full Description</span>
                                    <span class="detail-value">${t.description}</span>
                                </div>
                                ${t.status === 'Resolved' ? `
                                <div class="detail-row">
                                    <span class="detail-label">✅ Resolved</span>
                                    <span class="detail-value" style="color: #2C8E5A;">Ticket closed</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h3>📌 My Complete Ticket History</h3>
                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                        <span style="background: #E3F2FD; padding: 4px 12px; border-radius: 20px; font-size: 13px;">
                            🟡 Active: ${activeCount}
                        </span>
                        <span style="background: #E8F5E9; padding: 4px 12px; border-radius: 20px; font-size: 13px;">
                            ✅ Resolved: ${resolvedCount}
                        </span>
                        <span style="background: #F3E5F5; padding: 4px 12px; border-radius: 20px; font-size: 13px;">
                            📋 Total: ${allMyTickets.length}
                        </span>
                    </div>
                </div>
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
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allMyTickets.map(t => `
                                <tr>
                                    <td data-label="ID"><strong>#${t.ticketID}</strong></td>
                                    <td data-label="Description">${t.description?.substring(0, 60)}${t.description?.length > 60 ? '...' : ''}</td>
                                    <td data-label="Location">📍 ${t.location || 'Not specified'}</td>
                                    <td data-label="Category"><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                    <td data-label="Priority"><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                    <td data-label="Status"><span class="badge ${t.status === 'Open' ? 'badge-open' : t.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${t.status}</span></td>
                                    <td data-label="Created">${new Date(t.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `<div style="color:red;">❌ Error: ${error.message}</div>`;
    }
}

// ============ ADMIN VIEWS ============
async function renderAdminDashboard() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">📋 Loading tickets...</div>`;
    
    try {
        const tickets = await getAllTickets();
        
        const activeTickets = tickets.filter(t => t.status !== "Resolved");
        const urgentCount = activeTickets.filter(t => t.priorityLevel === "Urgent").length;
        const inProgressCount = activeTickets.filter(t => t.status === "In Progress").length;
        const openCount = activeTickets.filter(t => t.status === "Open").length;
        
        container.innerHTML = `
            <div><h2>🛡️ Admin Overview</h2><p style="margin-bottom: 1.5rem;">AI-powered ticketing & smart priority queue</p></div>
            <div class="stat-grid">
                <div class="stat-card"><div class="stat-title">Active Tickets</div><div class="stat-number">${activeTickets.length}</div></div>
                <div class="stat-card"><div class="stat-title">Urgent Tickets</div><div class="stat-number" style="color:#E33E3E;">${urgentCount}</div></div>
                <div class="stat-card"><div class="stat-title">Open</div><div class="stat-number" style="color:#E9A23B;">${openCount}</div></div>
                <div class="stat-card"><div class="stat-title">In Progress</div><div class="stat-number" style="color:#357EDD;">${inProgressCount}</div></div>
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeTickets.map(t => `
                            <tr>
                                <td>#${t.ticketID}</td>
                                <td>${t.submitterID || 'N/A'}${" "} 
                                <td>${t.description?.substring(0, 50)}${t.description?.length > 50 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td><span class="badge ${t.status === 'Open' ? 'badge-open' : 'badge-progress'}">${t.status}</span></td>
                                <td>
                                    ${t.status === 'Open' ? `<button class="btn-outline startBtn" data-id="${t.ticketID}" style="padding:4px 12px; background:#357EDD; color:white; margin-right:5px;">▶ Start</button>` : ''}
                                    ${t.status === 'In Progress' ? `<button class="btn-outline resolveBtn" data-id="${t.ticketID}" style="padding:4px 12px; background:#2C8E5A; color:white; margin-right:5px;">✓ Resolve</button>` : ''}
                                    ${t.status === 'Open' ? `<button class="btn-outline resolveBtn" data-id="${t.ticketID}" style="padding:4px 12px;">Resolve</button>` : ''}
                                  </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.querySelectorAll(".startBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const ticketId = btn.getAttribute("data-id");
                await updateTicketStatus(ticketId, "In Progress");
                showToast(`Ticket #${ticketId} marked as In Progress`, "success");
                renderAdminDashboard();
            });
        });
        
        document.querySelectorAll(".resolveBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const ticketId = btn.getAttribute("data-id");
                const note = prompt("Enter resolution notes:");
                if (note) {
                    try {
                        await resolveTicket(ticketId, currentUser.id, note);
                        showToast(`Ticket #${ticketId} resolved!`, "success");
                        renderAdminDashboard();
                    } catch (error) {
                        showToast(error.message, "error");
                    }
                }
            });
        });
        
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
                            <th>Submitter ID</th>
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
                                <td>${t.submitterID || 'N/A'}${" "} 
                                <td>${t.description?.substring(0, 50)}${t.description?.length > 50 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td><span class="badge ${t.status === 'Open' ? 'badge-open' : t.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${t.status}</span></td>
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
            const priority = { 'Urgent': 3, 'High Priority': 2, 'Issue': 1, 'Standard': 1, 'Low': 0 };
            return (priority[b.priorityLevel] || 0) - (priority[a.priorityLevel] || 0);
        });
        
        container.innerHTML = `
            <h3>📊 Priority Queue</h3>
            <p>Tickets sorted by urgency: Urgent → High Priority → Issue/Standard → Low</p>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Submitter ID</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sorted.map(t => `
                            <tr>
                                <td>#${t.ticketID}</td>
                                <td>${t.submitterID || 'N/A'}${" "} 
                                <td>${t.description?.substring(0, 50)}${t.description?.length > 50 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td><span class="badge ${t.status === 'Open' ? 'badge-open' : t.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${t.status}</span></td>
                                <td><button class="btn-outline priorityResolve" data-id="${t.ticketID}" style="padding:4px 12px;">Resolve</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.querySelectorAll(".priorityResolve").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const ticketId = btn.getAttribute("data-id");
                const note = prompt("Enter resolution notes:");
                if (note) {
                    try {
                        await resolveTicket(ticketId, currentUser.id, note);
                        showToast("Ticket resolved successfully!", "success");
                        renderPriorityQueue();
                    } catch (error) {
                        showToast(error.message, "error");
                    }
                }
            });
        });
    } catch (error) {
        container.innerHTML = `<div style="color:red;">❌ Error: ${error.message}</div>`;
    }
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.style.background = type === "error" ? "#E33E3E" : type === "success" ? "#2C8E5A" : "#357EDD";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

const savedState = localStorage.getItem("sidebarCollapsed");
isSidebarCollapsed = savedState === "true";
renderApp();
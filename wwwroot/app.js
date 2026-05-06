
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

async function resetPassword(fName, lName, username, newPassword, confirmPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fName: fName,
                lName: lName,
                username: username,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            })
        });
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

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
                    <input type="password" class="form-control" id="loginPassword" placeholder="Password">
                </div>
                
                <button class="btn-primary" id="loginBtn" style="width:100%; justify-content: center;">Log In →</button>
                
                <div style="text-align: center; margin-top: 0.75rem;">
                    <a href="#" id="forgotPasswordBtn" style="color: var(--text-muted); font-size: 12px; text-decoration: none;">Forgot Password?</a>
                </div>
                
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-light); text-align: center;">
                    <p style="color: var(--text-muted); font-size: 13px; margin: 0;">
                        Don't have an account? 
                        <a href="#" id="showRegisterBtn" style="color: #357EDD; text-decoration: none; font-weight: 600;">Register here</a>
                    </p>
                </div>
                
                <div id="loginError" style="margin-top: 16px;"></div>
            </div>
        </div>
    `;
    
    
    const forgotBtn = document.getElementById("forgotPasswordBtn");
    forgotBtn.addEventListener("mouseenter", () => {
        forgotBtn.style.textDecoration = "underline";
    });
    forgotBtn.addEventListener("mouseleave", () => {
        forgotBtn.style.textDecoration = "none";
    });
    
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
                showRegister = false;
                renderApp();
            } else {
                showLoginError(result.message || "Login failed");
            }
        } catch (error) {
            showLoginError(error.message);
        }
    });
    
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    
    usernameInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("loginBtn").click();
        }
    });
    
    passwordInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("loginBtn").click();
        }
    });
    
    document.getElementById("forgotPasswordBtn").addEventListener("click", (e) => {
        e.preventDefault();
        showResetPasswordScreen();
    });
    
    document.getElementById("showRegisterBtn").addEventListener("click", (e) => {
        e.preventDefault();
        showRegister = true;
        renderApp();
    });
}

function showResetPasswordScreen() {
    const root = document.getElementById("appRoot");
    root.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <div style="text-align:center; margin-bottom: 1.5rem;">
                    <div style="width: 56px; height: 56px; background: #2C8E5A; border-radius: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
                        <span style="font-size: 28px; color: white;">🔑</span>
                    </div>
                    <h2 style="font-size: 24px; font-weight: 600;">Reset Password</h2>
                    <p style="color: var(--text-muted); font-size: 13px;">Enter your account details to reset password</p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input type="text" class="form-control" id="resetFName" placeholder="Enter your first name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input type="text" class="form-control" id="resetLName" placeholder="Enter your last name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" id="resetUsername" placeholder="Enter your username">
                </div>
                
                <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input type="password" class="form-control" id="newPassword" placeholder="Min. 6 characters">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Confirm Password</label>
                    <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm your password">
                </div>
                
                <button class="btn-primary" id="resetPasswordBtn" style="width:100%; justify-content: center;">Reset Password</button>
                
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="#" id="backToLoginBtn" style="color: #357EDD; text-decoration: none;">← Back to Login</a>
                </div>
                
                <div id="resetMessage" style="margin-top: 16px;"></div>
            </div>
        </div>
    `;
    
    document.getElementById("resetPasswordBtn").addEventListener("click", async () => {
        const fName = document.getElementById("resetFName").value.trim();
        const lName = document.getElementById("resetLName").value.trim();
        const username = document.getElementById("resetUsername").value.trim();
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        
        document.getElementById("resetMessage").innerHTML = "";
        
        if (!fName || !lName || !username) {
            showResetMessage("Please fill in all identity fields", "error");
            return;
        }
        
        if (!newPassword || !confirmPassword) {
            showResetMessage("Please enter a new password", "error");
            return;
        }
        
        if (newPassword.length < 6) {
            showResetMessage("Password must be at least 6 characters", "error");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showResetMessage("Passwords do not match", "error");
            return;
        }
        
        const result = await resetPassword(fName, lName, username, newPassword, confirmPassword);
        
        if (result.message) {
            showResetMessage(result.message, "success");
            setTimeout(() => {
                renderApp();
            }, 2000);
        } else {
            showResetMessage(result.error || "Password reset failed", "error");
        }
    });
    
    document.getElementById("backToLoginBtn").addEventListener("click", (e) => {
        e.preventDefault();
        renderApp();
    });
}

function showResetMessage(msg, type) {
    const msgDiv = document.getElementById("resetMessage");
    if (msgDiv) {
        msgDiv.innerHTML = `<div class="error-msg" style="background: ${type === 'success' ? '#E8F5E9' : '#FEF2F0'}; color: ${type === 'success' ? '#2C8E5A' : '#D14545'};">${msg}</div>`;
    }
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
                    <label class="form-label">First Name</label>
                    <input type="text" class="form-control" id="regFName" placeholder="Enter your first name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input type="text" class="form-control" id="regLName" placeholder="Enter your last name">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" id="regUsername" placeholder="Choose a username">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" id="regPassword" placeholder="Create a password (min 6 characters)">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Confirm Password</label>
                    <input type="password" class="form-control" id="regConfirmPassword" placeholder="Confirm your password">
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

async function renderStudentDashboard() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">📋 Loading your tickets...</div>`;
    
    try {
        const tickets = await getActiveTickets();
        const allMyTickets = tickets.filter(t => t.submitterID === currentUser.id);
        
        const open = allMyTickets.filter(t => t.status === "Open").length;
        const progress = allMyTickets.filter(t => t.status === "In Progress").length;
        const resolved = allMyTickets.filter(t => t.status === "Resolved").length;
        
        let filteredTickets = [...allMyTickets];
        
        function applyFilters() {
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const statusFilter = document.getElementById("statusFilter")?.value || "all";
    const categoryFilter = document.getElementById("categoryFilter")?.value || "all";
    const priorityFilter = document.getElementById("priorityFilter")?.value || "all";
    
    filteredTickets = allMyTickets.filter(ticket => {
        const matchesSearch = !searchTerm || 
            ticket.description?.toLowerCase().includes(searchTerm) ||
            ticket.ticketID?.toString().includes(searchTerm);
        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
        const matchesPriority = priorityFilter === "all" || ticket.priorityLevel === priorityFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
    
    const activeFilteredCount = filteredTickets.filter(t => t.status !== "Resolved").length;
    const totalActive = allMyTickets.filter(t => t.status !== "Resolved").length;
    document.getElementById("filterStats").innerHTML = `Showing ${activeFilteredCount} of ${totalActive} active tickets`;
    renderTicketsTable();
}
        
        function clearFilters() {
            document.getElementById("searchInput").value = "";
            document.getElementById("statusFilter").value = "all";
            document.getElementById("categoryFilter").value = "all";
            document.getElementById("priorityFilter").value = "all";
            applyFilters();
        }
        
        function renderTicketsTable() {
            const activeOnly = filteredTickets.filter(t => t.status !== "Resolved");
            const tableContainer = document.getElementById("ticketsTableContainer");
            const isMobile = window.innerWidth <= 768;
            
            if (activeOnly.length === 0) {
                tableContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 20px;">
                        <p style="color: var(--text-muted);">No tickets match your filters 🎉</p>
                        <p style="font-size: 13px; color: var(--text-light);">Try changing your search criteria</p>
                    </div>
                `;
                return;
            }
            
            if (isMobile) {
                tableContainer.innerHTML = `
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
                                    <div class="detail-row"><span class="detail-label">📍 Location</span><span class="detail-value">${t.location || 'Not specified'}</span></div>
                                    <div class="detail-row"><span class="detail-label">🏷️ Category</span><span class="detail-value"><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></span></div>
                                    <div class="detail-row"><span class="detail-label">⚡ Priority</span><span class="detail-value"><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></span></div>
                                    <div class="detail-row"><span class="detail-label">📅 Submitted</span><span class="detail-value">${new Date(t.createdAt).toLocaleDateString()}</span></div>
                                    <div class="detail-row"><span class="detail-label">📝 Full Description</span><span class="detail-value">${t.description}</span></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                tableContainer.innerHTML = `
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Description</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th>
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
                `;
            }
        }
        
        const isMobile = window.innerWidth <= 768;
        
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
            
            <div class="filter-bar">
                <input type="text" id="searchInput" class="form-control" placeholder="🔍 Search by ID or description..." autocomplete="off">
                <select id="statusFilter" class="form-control">
                    <option value="all">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <select id="categoryFilter" class="form-control">
                    <option value="all">All Categories</option>
                    <option value="Hardware">🖥️ Hardware</option>
                    <option value="Software">💿 Software</option>
                    <option value="Network">🌐 Network</option>
                </select>
                <select id="priorityFilter" class="form-control">
                    <option value="all">All Priorities</option>
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="High Priority">🟠 High Priority</option>
                    <option value="Standard">🟡 Standard</option>
                </select>
                <button id="clearFiltersBtn" class="clear-filters-btn">Clear Filters</button>
                <span id="filterStats" class="filter-stats">Showing ${allMyTickets.filter(t => t.status !== "Resolved").length} active tickets</span>
            </div>
            
            <div class="filter-bar" style="margin-top: -0.5rem;">
                <button class="btn-primary" id="newTicketBtn">+ New Ticket</button>
            </div>
            
            <div id="ticketsTableContainer"></div>
        `;
        
        renderTicketsTable();
        
        document.getElementById("newTicketBtn")?.addEventListener("click", () => renderSubmitForm());
        document.getElementById("searchInput")?.addEventListener("input", applyFilters);
        document.getElementById("statusFilter")?.addEventListener("change", applyFilters);
        document.getElementById("categoryFilter")?.addEventListener("change", applyFilters);
        document.getElementById("priorityFilter")?.addEventListener("change", applyFilters);
        document.getElementById("clearFiltersBtn")?.addEventListener("click", clearFilters);
        
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
        const tickets = await getAllTickets();
        const allMyTickets = tickets.filter(t => t.submitterID === currentUser.id);
        
        const activeCount = allMyTickets.filter(t => t.status !== "Resolved").length;
        const resolvedCount = allMyTickets.filter(t => t.status === "Resolved").length;
        
        const isMobile = window.innerWidth <= 768;
        
        if (allMyTickets.length === 0) {
            container.innerHTML = `<h3>📌 My Tickets</h3><p>You haven't submitted any tickets yet.</p><button class="btn-primary" id="goToSubmitBtn">+ Submit a Ticket</button>`;
            document.getElementById("goToSubmitBtn")?.addEventListener("click", () => renderSubmitForm());
            return;
        }
        
        if (isMobile) {
            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h3>📌 My Complete Ticket History</h3>
                    <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem; flex-wrap: wrap;">
                        <span style="background: #E3F2FD; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">🟡 Active: ${activeCount}</span>
                        <span style="background: #E8F5E9; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">✅ Resolved: ${resolvedCount}</span>
                        <span style="background: #F3E5F5; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">📋 Total: ${allMyTickets.length}</span>
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
                                <div class="detail-row"><span class="detail-label">📍 Location</span><span class="detail-value">${t.location || 'Not specified'}</span></div>
                                <div class="detail-row"><span class="detail-label">🏷️ Category</span><span class="detail-value"><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></span></div>
                                <div class="detail-row"><span class="detail-label">⚡ Priority</span><span class="detail-value"><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></span></div>
                                <div class="detail-row"><span class="detail-label">📅 Submitted</span><span class="detail-value">${new Date(t.createdAt).toLocaleDateString()}</span></div>
                                <div class="detail-row"><span class="detail-label">📝 Full Description</span><span class="detail-value">${t.description}</span></div>
                                ${t.status === 'Resolved' ? `<div class="detail-row"><span class="detail-label">✅ Resolved</span><span class="detail-value" style="color: #2C8E5A;">Ticket closed</span></div>` : ''}
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
                        <span style="background: #E3F2FD; padding: 4px 12px; border-radius: 20px; font-size: 13px;">🟡 Active: ${activeCount}</span>
                        <span style="background: #E8F5E9; padding: 4px 12px; border-radius: 20px; font-size: 13px;">✅ Resolved: ${resolvedCount}</span>
                        <span style="background: #F3E5F5; padding: 4px 12px; border-radius: 20px; font-size: 13px;">📋 Total: ${allMyTickets.length}</span>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>ID</th><th>Description</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
                        <tbody>
                            ${allMyTickets.map(t => `
                                <tr ${t.status === 'Resolved' ? `style="cursor: pointer;" onclick="toggleNote(${t.ticketID})"` : ''}>
                                    <td data-label="ID"><strong>#${t.ticketID}</strong></td>
                                    <td data-label="Description">${t.description?.substring(0, 60)}${t.description?.length > 60 ? '...' : ''}</td>
                                    <td data-label="Location">📍 ${t.location || 'Not specified'}</td>
                                    <td data-label="Category"><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                    <td data-label="Priority"><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                    <td data-label="Status"><span class="badge ${t.status === 'Open' ? 'badge-open' : t.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${t.status}</span></td>
                                    <td data-label="Created">${new Date(t.createdAt).toLocaleDateString()}</td>
                                </tr>
                                <tr id="note-${t.ticketID}" class="hidden">
                                    <td colspan="7" style="padding: 0; border: none;">
                                        <div style="margin: 5px 15px 15px 15px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px;">
                                            <strong>IT Resolution Note:</strong><br> 
                                            ${t.resolutionNote || 'No resolution note provided for this ticket.'}
                                        </div>
                                    </td>
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

async function toggleNote(ticketId) {
    const noteRow = document.getElementById(`note-${ticketId}`);
    if (noteRow) {
        if (noteRow.classList.contains("hidden")) {
            noteRow.classList.remove("hidden");
        } else {
            noteRow.classList.add("hidden");
        }
    }
}

async function renderAdminDashboard() {
    const container = document.getElementById("mainContent");
    container.innerHTML = `<div style="text-align:center; padding:2rem;">📋 Loading tickets...</div>`;
    
    try {
        let allTickets = await getAllTickets();
        let filteredTickets = [...allTickets];
        
        function applyAdminFilters() {
            const searchTerm = document.getElementById("adminSearchInput")?.value.toLowerCase() || "";
            const statusFilter = document.getElementById("adminStatusFilter")?.value || "all";
            const categoryFilter = document.getElementById("adminCategoryFilter")?.value || "all";
            const priorityFilter = document.getElementById("adminPriorityFilter")?.value || "all";
            
            filteredTickets = allTickets.filter(ticket => {
                const matchesSearch = !searchTerm || 
                    ticket.description?.toLowerCase().includes(searchTerm) ||
                    ticket.ticketID?.toString().includes(searchTerm);
                const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
                const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
                const matchesPriority = priorityFilter === "all" || ticket.priorityLevel === priorityFilter;
                return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
            });
            
            document.getElementById("adminFilterStats").innerHTML = `Showing ${filteredTickets.length} of ${allTickets.length} tickets`;
            renderAdminTable();
        }
        
        function clearAdminFilters() {
            document.getElementById("adminSearchInput").value = "";
            document.getElementById("adminStatusFilter").value = "all";
            document.getElementById("adminCategoryFilter").value = "all";
            document.getElementById("adminPriorityFilter").value = "all";
            applyAdminFilters();
        }
        
        function renderAdminTable() {
            const activeTickets = filteredTickets.filter(t => t.status !== "Resolved");
            const urgentCount = activeTickets.filter(t => t.priorityLevel === "Urgent").length;
            const inProgressCount = activeTickets.filter(t => t.status === "In Progress").length;
            const openCount = activeTickets.filter(t => t.status === "Open").length;
            
            activeTickets.sort((a, b) => {
                const priority = { 'Urgent': 3, 'High Priority': 2, 'Issue': 1, 'Standard': 1, 'Low': 0 };
                return (priority[b.priorityLevel] || 0) - (priority[a.priorityLevel] || 0);
            });
            
            document.getElementById("adminStatsContainer").innerHTML = `
                <div class="stat-grid">
                    <div class="stat-card"><div class="stat-title">Active Tickets</div><div class="stat-number">${activeTickets.length}</div></div>
                    <div class="stat-card"><div class="stat-title">Urgent Tickets</div><div class="stat-number" style="color:#E33E3E;">${urgentCount}</div></div>
                    <div class="stat-card"><div class="stat-title">Open</div><div class="stat-number" style="color:#E9A23B;">${openCount}</div></div>
                    <div class="stat-card"><div class="stat-title">In Progress</div><div class="stat-number" style="color:#357EDD;">${inProgressCount}</div></div>
                </div>
            `;
            
            const tableContainer = document.getElementById("adminTableContainer");
            if (activeTickets.length === 0) {
                tableContainer.innerHTML = `<div style="text-align: center; padding: 2rem; background: white; border-radius: 20px;"><p style="color: var(--text-muted);">No active tickets match your filters</p></div>`;
                return;
            }
            
            tableContainer.innerHTML = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr><th>ID</th><th>Submitter</th><th>Description</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${activeTickets.map(t => `
                                <tr>
                                    <td>#${t.ticketID}</td>
                                    <td>${t.submitterID || 'N/A'}</td>
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
        }
        
        container.innerHTML = `
            <div><h2>🛡️ Admin Overview</h2><p style="margin-bottom: 1.5rem;">AI-powered ticketing & smart priority queue</p></div>
            <div id="adminStatsContainer"></div>
            
            <div class="filter-bar">
                <input type="text" id="adminSearchInput" class="form-control" placeholder="🔍 Search by ID or description..." autocomplete="off">
                <select id="adminStatusFilter" class="form-control">
                    <option value="all">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <select id="adminCategoryFilter" class="form-control">
                    <option value="all">All Categories</option>
                    <option value="Hardware">🖥️ Hardware</option>
                    <option value="Software">💿 Software</option>
                    <option value="Network">🌐 Network</option>
                </select>
                <select id="adminPriorityFilter" class="form-control">
                    <option value="all">All Priorities</option>
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="High Priority">🟠 High Priority</option>
                    <option value="Standard">🟡 Standard</option>
                </select>
                <button id="adminClearFiltersBtn" class="clear-filters-btn">Clear Filters</button>
                <span id="adminFilterStats" class="filter-stats">Showing ${allTickets.length} of ${allTickets.length} tickets</span>
            </div>
            
            <h4 style="margin: 1rem 0 0.75rem 0;">🚨 Active Tickets</h4>
            <div id="adminTableContainer"></div>
        `;
        
        renderAdminTable();
        
        document.getElementById("adminSearchInput")?.addEventListener("input", applyAdminFilters);
        document.getElementById("adminStatusFilter")?.addEventListener("change", applyAdminFilters);
        document.getElementById("adminCategoryFilter")?.addEventListener("change", applyAdminFilters);
        document.getElementById("adminPriorityFilter")?.addEventListener("change", applyAdminFilters);
        document.getElementById("adminClearFiltersBtn")?.addEventListener("click", clearAdminFilters);
        
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
                        <tr><th>ID</th><th>Submitter ID</th><th>Description</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${tickets.map(t => `
                            <tr ${t.status === 'Resolved' ? `style="cursor: pointer;" onclick="toggleNote(${t.ticketID})"` : ''}>
                                <td>#${t.ticketID}</td>
                                <td>${t.submitterID || 'N/A'}</td>
                                <td>${t.description?.substring(0, 50)}${t.description?.length > 50 ? '...' : ''}</td>
                                <td><span class="badge" style="background:#F0F4FA;">📍 ${t.location || 'Not specified'}</span></td>
                                <td><span class="badge ${t.category === 'Hardware' ? 'badge-hw' : t.category === 'Software' ? 'badge-sw' : 'badge-net'}">${t.category || 'N/A'}</span></td>
                                <td><span class="badge ${t.priorityLevel === 'Urgent' ? 'badge-high' : 'badge-medium'}">${t.priorityLevel || 'Standard'}</span></td>
                                <td><span class="badge ${t.status === 'Open' ? 'badge-open' : t.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${t.status}</span></td>
                            </tr>
                            <tr id="note-${t.ticketID}" class="hidden">
                                <td colspan="7" style="padding: 0; border: none;">
                                    <div style="margin: 5px 15px 15px 15px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px;">
                                        <strong>IT Resolution Note:</strong><br> 
                                        ${t.resolutionNote || 'No resolution note provided for this ticket.'}
                                    </div>
                                </td>
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
                        <tr><th>ID</th><th>Submitter ID</th><th>Description</th><th>Location</th><th>Category</th><th>Priority</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        ${sorted.map(t => `
                            <tr>
                                <td>#${t.ticketID}</td>
                                <td>${t.submitterID || 'N/A'}</td>
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
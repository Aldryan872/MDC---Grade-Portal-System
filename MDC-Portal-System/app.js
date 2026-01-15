// MDC Grading System Portal - Mati Doctors College
// API Base URL
const API_URL = 'api/';

// Sample Data (fallback when database is not available)
const sampleData = {
    students: [
        { id: 'STU-2024-001', name: 'Juan Dela Cruz', course: 'BS Nursing', year: '3rd Year', section: 'A', contact: '09171234567' },
        { id: 'STU-2024-002', name: 'Maria Santos', course: 'BS Nursing', year: '2nd Year', section: 'B', contact: '09182345678' },
        { id: 'STU-2024-003', name: 'Pedro Reyes', course: 'BS Medical Technology', year: '4th Year', section: 'A', contact: '09193456789' },
        { id: 'STU-2024-004', name: 'Ana Garcia', course: 'BS Pharmacy', year: '1st Year', section: 'A', contact: '09204567890' },
        { id: 'STU-2024-005', name: 'Jose Mendoza', course: 'BS Nursing', year: '3rd Year', section: 'A', contact: '09215678901' }
    ],
    faculty: [
        { id: 'FAC-001', name: 'Dr. Roberto Villanueva', department: 'Nursing', subjects: ['Fundamentals of Nursing', 'Medical-Surgical Nursing'] },
        { id: 'FAC-002', name: 'Prof. Elena Ramos', department: 'Medical Technology', subjects: ['Clinical Chemistry', 'Hematology'] },
        { id: 'FAC-003', name: 'Dr. Miguel Torres', department: 'Pharmacy', subjects: ['Pharmacology'] }
    ],
    subjects: [
        { code: 'NUR101', name: 'Fundamentals of Nursing', units: 3, instructor: 'Dr. Roberto Villanueva' },
        { code: 'NUR201', name: 'Medical-Surgical Nursing', units: 3, instructor: 'Dr. Roberto Villanueva' },
        { code: 'MT301', name: 'Clinical Chemistry', units: 3, instructor: 'Prof. Elena Ramos' },
        { code: 'MT302', name: 'Hematology', units: 3, instructor: 'Prof. Elena Ramos' },
        { code: 'PHAR101', name: 'Pharmacology', units: 3, instructor: 'Dr. Miguel Torres' }
    ],
    grades: [
        { studentId: 'STU-2024-001', subjectCode: 'NUR101', prelim: 88, midterm: 92, prefinal: 90, final: 91 },
        { studentId: 'STU-2024-001', subjectCode: 'NUR201', prelim: 85, midterm: 88, prefinal: 87, final: 89 },
        { studentId: 'STU-2024-002', subjectCode: 'NUR101', prelim: 78, midterm: 82, prefinal: 80, final: 83 },
        { studentId: 'STU-2024-003', subjectCode: 'MT301', prelim: 92, midterm: 95, prefinal: 93, final: 94 },
        { studentId: 'STU-2024-003', subjectCode: 'MT302', prelim: 90, midterm: 88, prefinal: 91, final: 90 },
        { studentId: 'STU-2024-004', subjectCode: 'PHAR101', prelim: 75, midterm: 78, prefinal: 80, final: 82 },
        { studentId: 'STU-2024-005', subjectCode: 'NUR101', prelim: 82, midterm: 85, prefinal: 84, final: 86 },
        { studentId: 'STU-2024-005', subjectCode: 'NUR201', prelim: 80, midterm: 83, prefinal: 82, final: 85 }
    ],
    attendance: [
        { studentId: 'STU-2024-001', name: 'Juan Dela Cruz', contact: '09171234567', percentage: 95, status: 'Present' },
        { studentId: 'STU-2024-002', name: 'Maria Santos', contact: '09182345678', percentage: 60, status: 'Absent' },
        { studentId: 'STU-2024-003', name: 'Pedro Reyes', contact: '09193456789', percentage: 88, status: 'Present' }
    ]
};

// Cache for database data
let dbData = {
    students: 0,
    faculty: 0,
    subjects: 0,
    grades: [],
    attendance: [],
    facultyList: []
};

let currentUser = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const privacyConsentSection = document.getElementById('privacyConsentSection');
const dashboardSection = document.getElementById('dashboardSection');
const dashboardMain = document.getElementById('dashboardMain');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const navMenu = document.getElementById('navMenu');
const contentArea = document.getElementById('contentArea');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close-btn');
const privacyCheckbox = document.getElementById('privacyAgree');
const continueBtn = document.getElementById('continueBtn');


// Event Listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', handleLogout);
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// User type change listener for dynamic label
document.getElementById('userType').addEventListener('change', function() {
    const label = document.querySelector('label[for="userId"]');
    if (this.value === 'admin') {
        label.textContent = 'Administrator ID Number:';
    } else {
        label.textContent = 'ID Number:';
    }
});

// Privacy checkbox listener
privacyCheckbox.addEventListener('change', function () {
    continueBtn.disabled = !this.checked;
});

// ============================================
// FACEBOOK SDK CONFIGURATION
// ============================================

// Load Facebook SDK
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function () {
    FB.init({
        appId: '2079277599507736',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
    });
    console.log('Facebook SDK loaded successfully');
};

// Facebook Login Function
function loginWithFacebook() {
    // Check if FB SDK is loaded
    if (typeof FB === 'undefined') {
        // Try to wait for SDK to load
        setTimeout(function() {
            if (typeof FB === 'undefined') {
                alert('Facebook SDK not loaded. Please disable ad blockers and refresh the page.');
            } else {
                doFacebookLogin();
            }
        }, 2000);
        return;
    }
    doFacebookLogin();
}

function doFacebookLogin() {
    FB.login(function (response) {
        if (response.authResponse) {
            // Get user info from Facebook
            FB.api('/me', { fields: 'id,name,picture' }, function (userData) {
                console.log('Facebook user data:', userData);

                currentUser = {
                    type: 'student',
                    id: 'FB-' + userData.id,
                    name: userData.name || 'Student',
                    email: '',
                    picture: userData.picture?.data?.url || '',
                    loginMethod: 'facebook'
                };

                // Save to database via API
                fetch(API_URL + 'facebook_login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        facebookId: userData.id,
                        name: userData.name || 'Student',
                        picture: userData.picture?.data?.url || ''
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        currentUser = data.user;
                    }
                    // Save session to localStorage
                    saveSession(currentUser);
                    showPrivacyConsent();
                })
                .catch(err => {
                    console.error('Facebook API error:', err);
                    // Save session even if API fails
                    saveSession(currentUser);
                    showPrivacyConsent();
                });
            });
        } else {
            console.log('Facebook login cancelled or failed');
            alert('Facebook login was cancelled.');
        }
    }, { scope: 'public_profile' });
}

 // Google OAuth 2.0 Server-Side Flow
const GOOGLE_CLIENT_ID = '198572256648-qmb3js8crku30opeqr7ksotdav1tknhe.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = 'http://localhost/MDC-Portal-System/api/google_callback.php';

// Google Login Function (server-side OAuth flow)
function loginWithGoogle() {
    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Store state in PHP session via API
    fetch(API_URL + 'set_google_state.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: state })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert('Failed to prepare Google login. Please try again.');
            return;
        }
        
        // Construct authorization URL
        const authParams = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: GOOGLE_REDIRECT_URI,
            scope: 'openid email profile',
            response_type: 'code',
            state: state
        });
        
        const authUrl = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`;
        
        // Redirect to Google
        window.location.href = authUrl;
    })
    .catch(err => {
        console.error('Error setting Google state:', err);
        alert('Google login preparation failed. Please try again.');
    });
}

// Initialize and check for saved session on page load
window.onload = function () {
    checkSavedSession();
};

// Check for saved session on page load
function checkSavedSession() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            
            // Check if session is still valid (check with server if using sessions)
            fetch(API_URL + 'session.php', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    // Session is valid, restore user
                    currentUser = data.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    showDashboard();
                } else if (currentUser) {
                    // No server session but has localStorage, still show dashboard
                    showDashboard();
                }
            })
            .catch(err => {
                // If API fails, still use localStorage
                if (currentUser) {
                    showDashboard();
                }
            });
        } catch (e) {
            console.error('Error parsing saved session:', e);
            localStorage.removeItem('currentUser');
        }
    }
}

// Save session to localStorage on login
function saveSession(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear session on logout
function clearSession() {
    localStorage.removeItem('currentUser');
}

// Privacy consent functions
function showPrivacyConsent() {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    privacyConsentSection.classList.remove('hidden');
    dashboardSection.classList.remove('hidden');
    dashboardMain.classList.add('hidden');
    privacyCheckbox.checked = false;
    continueBtn.disabled = true;
}

function acceptPrivacy() {
    if (privacyCheckbox.checked) {
        privacyConsentSection.classList.add('hidden');
        dashboardMain.classList.remove('hidden');
        document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}`;
        setupNavigation();
        showDashboardHome();
    }
}

function exitPortal() {
    currentUser = null;
    privacyConsentSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
}


// Event Listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', handleLogout);
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// Show/Hide Login and Register Forms
function showRegisterForm() {
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
}

function showLoginForm() {
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

// Handle Registration
function handleRegister(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('regStudentId').value;
    const fullName = document.getElementById('regFullName').value;
    const course = document.getElementById('regCourse').value;
    const year = document.getElementById('regYear').value;
    const section = document.getElementById('regSection').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Send to API
    fetch(API_URL + 'register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, fullName, course, year, section, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Registration successful! You can now login.');
            registerForm.reset();
            showLoginForm();
        } else {
            alert(data.message || 'Registration failed');
        }
    })
    .catch(err => {
        console.error('Registration error:', err);
        alert('Registration failed. Please try again.');
    });
}

function handleLogin(e) {
    e.preventDefault();
    const userType = document.getElementById('userType').value;
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    fetch(API_URL + 'login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ userId, password, userType })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            
            // Save session to localStorage
            saveSession(currentUser);
            
            // Create session
            fetch(API_URL + 'session.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: currentUser.id,
                    userType: currentUser.type,
                    userName: currentUser.name,
                    rememberMe: rememberMe
                })
            });
            
            showPrivacyConsent();
        } else {
            alert(data.message || 'Login failed');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        alert('Login failed. Please check your credentials or register first.');
    });
}

function getUserName(type, id) {
    return type === 'admin' ? 'Administrator' : 'Student User';
}

function handleLogout() {
    // Destroy session
    fetch(API_URL + 'session.php', {
        method: 'DELETE',
        credentials: 'include'
    });
    
    // Clear session
    clearSession();
    
    currentUser = null;
    loginSection.classList.remove('hidden');
    registerSection.classList.add('hidden');
    privacyConsentSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
    dashboardMain.classList.add('hidden');
    loginForm.reset();
}

function showDashboard() {
    privacyConsentSection.classList.add('hidden');
    dashboardMain.classList.remove('hidden');
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}`;
    setupNavigation();
    showDashboardHome();
}

function setupNavigation() {
    let menuItems = '';
    
    if (currentUser.type === 'student') {
        menuItems = `
            <li><a href="#" onclick="showDashboardHome()" class="active" title="Dashboard"><span class="nav-icon">🏠</span></a></li>
            <li><a href="#" onclick="showMyGrades()" title="My Grades"><span class="nav-icon">📊</span></a></li>
            <li><a href="#" onclick="showMyClearance()" title="My Clearance"><span class="nav-icon">📋</span></a></li>
            <li><a href="#" onclick="showMyProfile()" title="Profile"><span class="nav-icon">👤</span></a></li>
        `;
    } else if (currentUser.type === 'admin') {
        menuItems = `
            <li><a href="#" onclick="showDashboardHome()" class="active" title="Dashboard"><span class="nav-icon">🏠</span></a></li>
            <li><a href="#" onclick="showAllStudents()" title="Students"><span class="nav-icon">👥</span></a></li>
            <li><a href="#" onclick="showAllFaculty()" title="Teachers"><span class="nav-icon">👨‍🏫</span></a></li>
            <li><a href="#" onclick="showAllSubjects()" title="Subjects"><span class="nav-icon">📚</span></a></li>
            <li><a href="#" onclick="showAllGrades()" title="Grades"><span class="nav-icon">📝</span></a></li>
            <li><a href="#" onclick="showReports()" title="Reports"><span class="nav-icon">📈</span></a></li>
        `;
    }
    
    navMenu.innerHTML = menuItems;
}

function setActiveNav(element) {
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    if (element) element.classList.add('active');
}


// Dashboard Home - New Design
function showDashboardHome() {
    setActiveNav(event?.target);

    // Load data from API
    fetch(API_URL + 'dashboard.php')
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            dbData = response.data;
        }
        return fetch(API_URL + 'grades.php');
    })
    .then(res => res.json())
    .then(gradesRes => {
        if (gradesRes.success) {
            dbData.grades = gradesRes.data.length;
        }
        renderDashboard();
    })
    .catch(err => {
        console.error('Dashboard load error:', err);
        renderDashboard();
    });
}

function renderDashboard() {
    // Get current date for calendar
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    
    // Sample events
    const events = [
        { date: 'Dec 23, 2025', title: 'Christmas Break Starts', type: 'holiday' },
        { date: 'Jan 6, 2026', title: 'Classes Resume', type: 'academic' },
        { date: 'Jan 15, 2026', title: 'Prelim Exams', type: 'exam' },
        { date: 'Feb 14, 2026', title: 'Foundation Day', type: 'event' },
        { date: 'Mar 1, 2026', title: 'Midterm Exams', type: 'exam' }
    ];
    
    const studentCount = dbData.students || 0;
    const facultyCount = dbData.faculty || 0;
    const subjectCount = dbData.subjects || 0;
    const gradeCount = dbData.grades || 0;
    const facultyList = dbData.facultyList || [];

    if (currentUser.type === 'admin') {
        contentArea.innerHTML = `
            <!-- Filters Row -->
            <div class="filters-row">
                <div class="filter-group">
                    <label>Academic Year:</label>
                    <select id="filterYear" class="filter-select">
                        <option value="2025-2026" selected>2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2023-2024">2023-2024</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Semester:</label>
                    <select id="filterSemester" class="filter-select">
                        <option value="1st">1st Semester</option>
                        <option value="2nd">2nd Semester</option>
                        <option value="summer">Summer</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Year Level:</label>
                    <select id="filterYearLevel" class="filter-select">
                        <option value="all">All Year Levels</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Course:</label>
                    <select id="filterCourse" class="filter-select">
                        <option value="all">All Courses</option>
                        <option value="BS Nursing">BS Nursing</option>
                        <option value="BS Medical Technology">BS Medical Technology</option>
                        <option value="BS Pharmacy">BS Pharmacy</option>
                    </select>
                </div>
            </div>

            <!-- Stats Row -->
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-icon blue">👤</div>
                    <div class="stat-info">
                        <h3>${studentCount}</h3>
                        <p>Students</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon cyan">👨‍🏫</div>
                    <div class="stat-info">
                        <h3>${facultyCount}</h3>
                        <p>Teachers</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon teal">🏫</div>
                    <div class="stat-info">
                        <h3>${subjectCount}</h3>
                        <p>Subjects</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">📝</div>
                    <div class="stat-info">
                        <h3>${dbData.grades || 0}</h3>
                        <p>Grade Records</p>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid with Calendar -->
            <div class="dashboard-grid-2">
                <!-- Calendar -->
                <div class="calendar-card">
                    <div class="calendar-header">
                        <button class="cal-nav" onclick="changeMonth(-1)">◀</button>
                        <h2>${currentMonth} ${currentYear}</h2>
                        <button class="cal-nav" onclick="changeMonth(1)">▶</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="cal-day-header">Sun</div>
                        <div class="cal-day-header">Mon</div>
                        <div class="cal-day-header">Tue</div>
                        <div class="cal-day-header">Wed</div>
                        <div class="cal-day-header">Thu</div>
                        <div class="cal-day-header">Fri</div>
                        <div class="cal-day-header">Sat</div>
                        ${generateCalendarDays()}
                    </div>
                </div>

                <!-- Events -->
                <div class="events-card">
                    <h2>📅 Upcoming Events</h2>
                    <div class="events-list">
                        ${events.map(e => `
                            <div class="event-item ${e.type}">
                                <div class="event-date">${e.date}</div>
                                <div class="event-title">${e.title}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Teachers Row -->
            <div class="content-card" style="margin-top: 20px;">
                <div class="card-header"><h2>Teachers</h2></div>
                <div class="teachers-row">
                    ${facultyList.map(f => `
                        <div class="teacher-item-horizontal">
                            <div class="teacher-avatar">👨‍🏫</div>
                            <div class="teacher-info">
                                <h4>${f.full_name || f.name}</h4>
                                <p>${f.department}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Grade Distribution -->
            <div class="content-card" style="margin-top: 20px;">
                <div class="card-header"><h2>Grade Distribution</h2></div>
                <div class="grade-distribution">
                    <table class="distribution-table">
                        <thead>
                            <tr>
                                <th>Grade Range</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(() => {
                                const dist = dbData.grade_distribution || {
                                    excellent: {count: 0, percentage: 0},
                                    average: {count: 0, percentage: 0},
                                    failed: {count: 0, percentage: 0}
                                };
                                return `
                                    <tr>
                                        <td>Excellent (90-100)</td>
                                        <td>${dist.excellent.count}</td>
                                        <td>${dist.excellent.percentage}%</td>
                                    </tr>
                                    <tr>
                                        <td>Average (75-89)</td>
                                        <td>${dist.average.count}</td>
                                        <td>${dist.average.percentage}%</td>
                                    </tr>
                                    <tr>
                                        <td>Failed (<75)</td>
                                        <td>${dist.failed.count}</td>
                                        <td>${dist.failed.percentage}%</td>
                                    </tr>
                                `;
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else {
        // Student Dashboard - Load grades from API
        loadStudentGrades();
    }
}

function loadStudentGrades() {
    fetch(API_URL + 'grades.php?student_id=' + currentUser.id)
    .then(res => res.json())
    .then(response => {
        const studentGrades = response.success ? response.data : [];
        renderStudentDashboard(studentGrades);
    })
    .catch(err => {
        console.error('Grades load error:', err);
        renderStudentDashboard([]);
    });
}

function renderStudentDashboard(studentGrades) {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    
    const events = [
        { date: 'Dec 23, 2025', title: 'Christmas Break Starts', type: 'holiday' },
        { date: 'Jan 6, 2026', title: 'Classes Resume', type: 'academic' },
        { date: 'Jan 15, 2026', title: 'Prelim Exams', type: 'exam' },
        { date: 'Feb 14, 2026', title: 'Foundation Day', type: 'event' },
        { date: 'Mar 1, 2026', title: 'Midterm Exams', type: 'exam' }
    ];
    
    const avgGrade = studentGrades.length > 0 
        ? (studentGrades.reduce((sum, g) => sum + parseFloat(calculateFinalGrade(g)), 0) / studentGrades.length).toFixed(2)
        : 'N/A';
        
    contentArea.innerHTML = `
        <!-- Filters Row for Student -->
        <div class="filters-row">
            <div class="filter-group">
                <label>Academic Year:</label>
                <select id="filterYear" class="filter-select">
                    <option value="2025-2026" selected>2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Semester:</label>
                <select id="filterSemester" class="filter-select">
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                </select>
            </div>
        </div>

        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon blue">📚</div>
                <div class="stat-info">
                    <h3>${studentGrades.length}</h3>
                    <p>Enrolled Subjects</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon cyan">📊</div>
                <div class="stat-info">
                    <h3>${avgGrade}</h3>
                    <p>Average Grade</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon teal">📅</div>
                <div class="stat-info">
                    <h3>1st</h3>
                    <p>Current Semester</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">🎓</div>
                <div class="stat-info">
                    <h3>2025-26</h3>
                    <p>Academic Year</p>
                </div>
            </div>
        </div>

        <!-- Student Dashboard - Full Width Calendar & Events -->
        <div class="dashboard-full">
            <!-- Large Calendar -->
            <div class="calendar-card large">
                <div class="calendar-header">
                    <button class="cal-nav" onclick="changeMonth(-1)">◀</button>
                    <h2>${currentMonth} ${currentYear}</h2>
                    <button class="cal-nav" onclick="changeMonth(1)">▶</button>
                </div>
                <div class="calendar-grid large">
                    <div class="cal-day-header">Sunday</div>
                    <div class="cal-day-header">Monday</div>
                    <div class="cal-day-header">Tuesday</div>
                    <div class="cal-day-header">Wednesday</div>
                    <div class="cal-day-header">Thursday</div>
                    <div class="cal-day-header">Friday</div>
                    <div class="cal-day-header">Saturday</div>
                    ${generateCalendarDays()}
                </div>
            </div>

            <!-- Events Section -->
            <div class="events-card large">
                <h2>📅 Upcoming Events</h2>
                <div class="events-list">
                    ${events.map(e => `
                        <div class="event-item ${e.type}">
                            <div class="event-date">${e.date}</div>
                            <div class="event-title">${e.title}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- Quick Links Section -->
        <div class="quick-links-section">
            <div class="quick-link-card" onclick="showMyGrades()">
                <div class="quick-link-icon">📊</div>
                <div class="quick-link-text">
                    <h4>View My Grades</h4>
                    <p>Check your academic performance</p>
                </div>
            </div>
            <div class="quick-link-card" onclick="showMyProfile()">
                <div class="quick-link-icon">👤</div>
                <div class="quick-link-text">
                    <h4>My Profile</h4>
                    <p>View and update your information</p>
                </div>
            </div>
            <div class="quick-link-card">
                <div class="quick-link-icon">📝</div>
                <div class="quick-link-text">
                    <h4>Enrollment Status</h4>
                    <p>Currently Enrolled - 1st Sem</p>
                </div>
            </div>
            <div class="quick-link-card">
                <div class="quick-link-icon">📞</div>
                <div class="quick-link-text">
                    <h4>Contact Registrar</h4>
                    <p>registrar@mdc.edu.ph</p>
                </div>
            </div>
        </div>
    `;
}

// Generate calendar days
function generateCalendarDays() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDate = today.getDate();
    
    let days = '';
    
    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
        days += '<div class="cal-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === currentDate ? 'today' : '';
        days += `<div class="cal-day ${isToday}">${day}</div>`;
    }
    
    return days;
}

function calculateFinalGrade(grade) {
    return ((grade.prelim * 0.2) + (grade.midterm * 0.2) + (grade.prefinal * 0.2) + (grade.final * 0.4)).toFixed(2);
}

function getGradeClass(grade) {
    if (grade >= 90) return 'grade-excellent';
    if (grade >= 80) return 'grade-good';
    if (grade >= 75) return 'grade-average';
    return 'grade-poor';
}

function getLetterGrade(grade) {
    if (grade >= 97) return '1.00';
    if (grade >= 94) return '1.25';
    if (grade >= 91) return '1.50';
    if (grade >= 88) return '1.75';
    if (grade >= 85) return '2.00';
    if (grade >= 82) return '2.25';
    if (grade >= 79) return '2.50';
    if (grade >= 76) return '2.75';
    if (grade >= 75) return '3.00';
    return '5.00';
}

// Utility: Generate deterministic-looking random PH mobile number for non-users
function generateRandomContact(seedSource) {
    // Use a fixed set of common PH prefixes
    const prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0927', '0935', '0945'];
    // Build a numeric seed from seedSource (id) or Date.now
    let seed = 0;
    const s = String(seedSource || Date.now());
    for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
    // Pseudo-random helper
    function rnd() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0xffffffff;
    }
    const prefix = prefixes[Math.floor(rnd() * prefixes.length)];
    // Generate 7 digits
    let rest = '';
    for (let i = 0; i < 7; i++) rest += Math.floor(rnd() * 10);
    return prefix + rest;
}


function renderStudentGradesTable(grades) {
    if (grades.length === 0) return '<p>No grades available yet.</p>';
    
    let rows = grades.map(g => {
        const finalGrade = calculateFinalGrade(g);
        return `
            <tr>
                <td>${g.subject_code}</td>
                <td>${g.subject_name || 'Unknown'}</td>
                <td>${g.prelim}</td>
                <td>${g.midterm}</td>
                <td>${g.prefinal}</td>
                <td>${g.final}</td>
                <td class="${getGradeClass(finalGrade)}">${finalGrade}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <table class="grades-table">
            <thead>
                <tr><th>Code</th><th>Subject</th><th>Prelim</th><th>Midterm</th><th>Pre-Final</th><th>Final</th><th>Grade</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function showMyGrades() {
    setActiveNav(event?.target);

    // Fetch grades from API
    fetch(API_URL + 'grades.php?student_id=' + currentUser.id)
    .then(res => res.json())
    .then(response => {
        const studentGrades = response.success ? response.data : [];
        
        // Calculate GWA
        const gwa = studentGrades.length > 0 
            ? (studentGrades.reduce((sum, g) => sum + parseFloat(calculateFinalGrade(g)), 0) / studentGrades.length).toFixed(2)
            : 'N/A';
        
        contentArea.innerHTML = `
            <div class="grades-container">
                <!-- Grades Header -->
                <div class="grades-header">
                    <h2>📊 My Grades</h2>
                    <p>Academic Year 2025-2026 | 1st Semester</p>
                </div>
                
                <!-- GWA Summary -->
                <div class="gwa-summary">
                    <div class="gwa-card">
                        <div class="gwa-number">${gwa}</div>
                        <div class="gwa-label">General Weighted Average</div>
                    </div>
                    <div class="gwa-card">
                        <div class="gwa-number">${studentGrades.length}</div>
                        <div class="gwa-label">Subjects Enrolled</div>
                    </div>
                    <div class="gwa-card">
                        <div class="gwa-number">${studentGrades.length > 0 ? getLetterGrade(gwa) : 'N/A'}</div>
                        <div class="gwa-label">Grade Point</div>
                    </div>
                    <div class="gwa-card">
                        <div class="gwa-number status-passed">${gwa >= 75 || gwa === 'N/A' ? 'REGULAR' : 'IRREGULAR'}</div>
                        <div class="gwa-label">Standing</div>
                    </div>
                </div>
                
                <!-- Grades Table -->
                <div class="content-card full-width">
                    <div class="card-header">
                        <h2>Subject Grades</h2>
                        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Grades</button>
                    </div>
                    ${studentGrades.length > 0 ? `
                        <table class="grades-table">
                            <thead>
                                <tr>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Units</th>
                                    <th>Prelim</th>
                                    <th>Midterm</th>
                                    <th>Pre-Final</th>
                                    <th>Final</th>
                                    <th>Grade</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${studentGrades.map(g => {
                                    const finalGrade = calculateFinalGrade(g);
                                    return `
                                        <tr>
                                            <td><strong>${g.subject_code}</strong></td>
                                            <td>${g.subject_name || 'Unknown'}</td>
                                            <td>${g.units || 3}</td>
                                            <td>${g.prelim}</td>
                                            <td>${g.midterm}</td>
                                            <td>${g.prefinal}</td>
                                            <td>${g.final}</td>
                                            <td class="${getGradeClass(finalGrade)}"><strong>${finalGrade}</strong></td>
                                            <td><span class="remarks-badge ${finalGrade >= 75 ? 'passed' : 'failed'}">${finalGrade >= 75 ? 'PASSED' : 'FAILED'}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div class="no-grades">
                            <div class="no-grades-icon">📚</div>
                            <h3>No grades available yet</h3>
                            <p>Your grades will appear here once your instructors submit them.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    })
    .catch(err => {
        console.error('Grades fetch error:', err);
        // Fallback to sample data if API fails
        const studentGrades = sampleData.grades.filter(g => g.studentId === currentUser.id);
        const gwa = studentGrades.length > 0 
            ? (studentGrades.reduce((sum, g) => sum + parseFloat(calculateFinalGrade(g)), 0) / studentGrades.length).toFixed(2)
            : 'N/A';
        
        contentArea.innerHTML = `
            <div class="grades-container">
                <!-- Grades Header -->
                <div class="grades-header">
                    <h2>📊 My Grades</h2>
                    <p>Academic Year 2025-2026 | 1st Semester</p>
                </div>
                
                <!-- GWA Summary -->
                <div class="gwa-summary">
                    <div class="gwa-card">
                        <div class="gwa-number">${gwa}</div>
                        <div class="gwa-label">General Weighted Average</div>
                    </div>
                    <div class="gwa-card">
                        <div class="gwa-number">${studentGrades.length}</div>
                        <div class="gwa-label">Subjects Enrolled</div>
                    </div>
                    <div class="gwa-card">
                        <div class="gwa-number">${studentGrades.length > 0 ? getLetterGrade(gwa) : 'N/A'}</div>
                        <div class="gwa-label">Grade Point</div>
                    </div>
                    <div class="gwa-card">
                        <div class="gwa-number status-passed">${gwa >= 75 || gwa === 'N/A' ? 'REGULAR' : 'IRREGULAR'}</div>
                        <div class="gwa-label">Standing</div>
                    </div>
                </div>
                
                <!-- Grades Table -->
                <div class="content-card full-width">
                    <div class="card-header">
                        <h2>Subject Grades</h2>
                        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Grades</button>
                    </div>
                    ${studentGrades.length > 0 ? `
                        <table class="grades-table">
                            <thead>
                                <tr>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Units</th>
                                    <th>Prelim</th>
                                    <th>Midterm</th>
                                    <th>Pre-Final</th>
                                    <th>Final</th>
                                    <th>Grade</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${studentGrades.map(g => {
                                    const subject = sampleData.subjects.find(s => s.code === g.subjectCode);
                                    const finalGrade = calculateFinalGrade(g);
                                    return `
                                        <tr>
                                            <td><strong>${g.subjectCode}</strong></td>
                                            <td>${subject ? subject.name : 'Unknown'}</td>
                                            <td>${subject ? subject.units : 3}</td>
                                            <td>${g.prelim}</td>
                                            <td>${g.midterm}</td>
                                            <td>${g.prefinal}</td>
                                            <td>${g.final}</td>
                                            <td class="${getGradeClass(finalGrade)}"><strong>${finalGrade}</strong></td>
                                            <td><span class="remarks-badge ${finalGrade >= 75 ? 'passed' : 'failed'}">${finalGrade >= 75 ? 'PASSED' : 'FAILED'}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div class="no-grades">
                            <div class="no-grades-icon">📚</div>
                            <h3>No grades available yet</h3>
                            <p>Your grades will appear here once your instructors submit them.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    });
}

function showMyProfile() {
    setActiveNav(event?.target);
    const student = sampleData.students.find(s => s.id === currentUser.id) || {
        id: currentUser.id, name: currentUser.name, course: 'BS Nursing', year: '3rd Year', section: 'A'
    };

    // Ensure non-users see a realistic contact number when not provided
    if (!student.contact) {
        student.contact = generateRandomContact(currentUser?.id);
    }
    
    // Get saved profile photo from localStorage or use default
    const savedPhoto = localStorage.getItem('profilePhoto_' + currentUser.id);
    const profilePhoto = currentUser.picture || savedPhoto;
    
    contentArea.innerHTML = `
        <div class="profile-container">
            <!-- Profile Header -->
            <div class="profile-header-card">
                <div class="profile-avatar-wrapper">
                    ${profilePhoto ? 
                        `<img src="${profilePhoto}" alt="Profile" class="avatar-image" id="profileImage">` :
                        `<div class="avatar-circle" id="profileImage">${student.name ? student.name.charAt(0).toUpperCase() : 'S'}</div>`
                    }
                    <label for="photoUpload" class="photo-upload-btn" title="Change Photo">
                        📷
                    </label>
                    <input type="file" id="photoUpload" accept="image/*" onchange="handlePhotoUpload(event)" hidden>
                </div>
                <div class="profile-header-info">
                    <h2>${student.name || currentUser.name}</h2>
                    <p class="student-id">${student.id || currentUser.id}</p>
                    <span class="profile-badge">${student.course || 'BS Nursing'}</span>
                </div>
            </div>
            
            <!-- Profile Details -->
            <div class="profile-grid">
                <div class="profile-card">
                    <h3>📋 Personal Information</h3>
                    <div class="profile-info-row">
                        <span class="label">Student ID:</span>
                        <span class="value">${student.id || currentUser.id}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Full Name:</span>
                        <span class="value">${student.name || currentUser.name}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Email:</span>
                        <span class="value">${currentUser.email || student.id + '@mdc.edu.ph'}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Contact:</span>
                        <span class="value">${student.contact || generateRandomContact(currentUser?.id)}</span>
                    </div>
                </div>
                
                <div class="profile-card">
                    <h3>🎓 Academic Information</h3>
                    <div class="profile-info-row">
                        <span class="label">Course:</span>
                        <span class="value">${student.course || 'BS Nursing'}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Year Level:</span>
                        <span class="value">${student.year || '3rd Year'}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Section:</span>
                        <span class="value">${student.section || 'A'}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Academic Year:</span>
                        <span class="value">2025-2026</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Semester:</span>
                        <span class="value">1st Semester</span>
                    </div>
                </div>
                
                <div class="profile-card">
                    <h3>📊 Academic Status</h3>
                    <div class="profile-info-row">
                        <span class="label">Enrollment Status:</span>
                        <span class="value status-active">Currently Enrolled</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Standing:</span>
                        <span class="value">Regular</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Units Enrolled:</span>
                        <span class="value">21 units</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Scholarship:</span>
                        <span class="value">None</span>
                    </div>
                </div>
                
                <div class="profile-card">
                    <h3>🔐 Account Settings</h3>
                    <div class="profile-info-row">
                        <span class="label">Login Method:</span>
                        <span class="value">${currentUser.loginMethod === 'facebook' ? 'Facebook' : 'Student Portal'}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="label">Account Created:</span>
                        <span class="value">December 2025</span>
                    </div>
                    <button class="btn btn-outline" onclick="alert('Feature coming soon!')">Change Password</button>
                </div>
            </div>
        </div>
    `;
}

// My Clearance Function
function showMyClearance() {
    setActiveNav(event?.target);
    
    const clearanceItems = [
        { department: 'Library', status: 'cleared', signedBy: 'Mrs. Santos', date: '2025-12-15' },
        { department: 'Registrar', status: 'cleared', signedBy: 'Mr. Reyes', date: '2025-12-16' },
        { department: 'Cashier', status: 'pending', signedBy: '', date: '' },
        { department: 'Student Affairs', status: 'cleared', signedBy: 'Dr. Garcia', date: '2025-12-14' },
        { department: 'Department Head', status: 'pending', signedBy: '', date: '' },
        { department: 'Dean', status: 'not_started', signedBy: '', date: '' },
        { department: 'Guidance Office', status: 'cleared', signedBy: 'Ms. Cruz', date: '2025-12-17' },
        { department: 'Laboratory', status: 'cleared', signedBy: 'Mr. Torres', date: '2025-12-13' }
    ];
    
    const clearedCount = clearanceItems.filter(c => c.status === 'cleared').length;
    const pendingCount = clearanceItems.filter(c => c.status === 'pending').length;
    const progress = Math.round((clearedCount / clearanceItems.length) * 100);
    
    contentArea.innerHTML = `
        <div class="clearance-container">
            <div class="clearance-header">
                <h2>📋 My Clearance</h2>
                <p>Academic Year 2025-2026 | 1st Semester</p>
            </div>
            
            <div class="clearance-stats">
                <div class="clearance-stat-card">
                    <div class="stat-number green">${clearedCount}</div>
                    <div class="stat-label">Cleared</div>
                </div>
                <div class="clearance-stat-card">
                    <div class="stat-number orange">${pendingCount}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="clearance-stat-card">
                    <div class="stat-number blue">${clearanceItems.length}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="clearance-stat-card progress-card">
                    <div class="progress-circle">
                        <svg viewBox="0 0 36 36">
                            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <path class="circle-progress" stroke-dasharray="${progress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <text x="18" y="20.35" class="percentage">${progress}%</text>
                        </svg>
                    </div>
                    <div class="stat-label">Progress</div>
                </div>
            </div>
            
            <div class="content-card full-width">
                <div class="card-header">
                    <h2>Clearance Status</h2>
                    <button class="btn btn-view btn-small" onclick="printClearance()">🖨️ Print Clearance</button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Department/Office</th>
                            <th>Status</th>
                            <th>Signed By</th>
                            <th>Date Cleared</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clearanceItems.map(c => `
                            <tr>
                                <td><strong>${c.department}</strong></td>
                                <td>
                                    <span class="clearance-badge ${c.status}">
                                        ${c.status === 'cleared' ? '✓ Cleared' : c.status === 'pending' ? '⏳ Pending' : '○ Not Started'}
                                    </span>
                                </td>
                                <td>${c.signedBy || '-'}</td>
                                <td>${c.date || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="clearance-note">
                <p><strong>Note:</strong> Please visit each department to complete your clearance. All departments must be cleared before you can enroll for the next semester or request official documents.</p>
            </div>
        </div>
    `;
}

function printClearance() {
    window.print();
}

// Profile Photo Upload Handler
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Save to localStorage
        localStorage.setItem('profilePhoto_' + currentUser.id, imageData);
        
        // Update the profile image on page
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            if (profileImage.tagName === 'IMG') {
                profileImage.src = imageData;
            } else {
                // Replace the avatar circle with an image
                const wrapper = profileImage.parentElement;
                const img = document.createElement('img');
                img.src = imageData;
                img.alt = 'Profile';
                img.className = 'avatar-image';
                img.id = 'profileImage';
                wrapper.replaceChild(img, profileImage);
            }
        }
        
        alert('Profile photo updated successfully!');
    };
    
    reader.readAsDataURL(file);
}

// Admin Functions
function showAllStudents() {
    setActiveNav(event?.target);

    // Fetch students
    fetch(API_URL + 'students.php')
    .then(res => res.json())
    .then(studentsRes => {
        if (studentsRes.success) {
            // Fetch grades for averages
            fetch(API_URL + 'grades.php')
            .then(res => res.json())
            .then(gradesRes => {
                const grades = gradesRes.success ? gradesRes.data : [];
                let rows = studentsRes.data.map(s => {
                    const studentGrades = grades.filter(g => g.student_id === s.student_id);
                    const avgGrade = studentGrades.length > 0 
                        ? (studentGrades.reduce((sum, g) => sum + parseFloat(calculateFinalGrade(g)), 0) / studentGrades.length).toFixed(2) : 'N/A';
                    return `
                        <tr>
                            <td>${s.student_id}</td><td>${s.full_name}</td><td>${s.course}</td><td>${s.year_level}</td><td>${s.section}</td>
                            <td class="${avgGrade !== 'N/A' ? getGradeClass(avgGrade) : ''}">${avgGrade}</td>
                            <td>
                                <button class="btn btn-view btn-small" onclick="editStudent('${s.student_id}')">Edit</button>
                                <button class="btn btn-small" onclick="viewStudentGrades('${s.student_id}')">Grades</button>
                                <button class="btn btn-danger btn-small" onclick="deleteStudent('${s.student_id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                contentArea.innerHTML = `
                    <div class="content-card">
                        <div class="card-header">
                            <h2>All Students</h2>
                            <button class="btn btn-view" onclick="addNewStudent()">+ Add Student</button>
                        </div>
                        <table><thead><tr><th>ID</th><th>Name</th><th>Course</th><th>Year</th><th>Section</th><th>Average</th><th>Actions</th></tr></thead>
                        <tbody>${rows}</tbody></table>
                    </div>
                `;
            })
            .catch(err => {
                console.error('Grades fetch error:', err);
                // Fallback to N/A for averages
                let rows = studentsRes.data.map(s => {
                    return `
                        <tr>
                            <td>${s.student_id}</td><td>${s.full_name}</td><td>${s.course}</td><td>${s.year_level}</td><td>${s.section}</td>
                            <td>N/A</td>
                            <td>
                                <button class="btn btn-view btn-small" onclick="editStudent('${s.student_id}')">Edit</button>
                                <button class="btn btn-small" onclick="viewStudentGrades('${s.student_id}')">Grades</button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                contentArea.innerHTML = `
                    <div class="content-card">
                        <div class="card-header">
                            <h2>All Students</h2>
                            <button class="btn btn-view" onclick="addNewStudent()">+ Add Student</button>
                        </div>
                        <table><thead><tr><th>ID</th><th>Name</th><th>Course</th><th>Year</th><th>Section</th><th>Average</th><th>Actions</th></tr></thead>
                        <tbody>${rows}</tbody></table>
                    </div>
                `;
            });
        } else {
            alert('Failed to load students');
        }
    })
    .catch(err => {
        console.error('Students fetch error:', err);
        alert('Failed to load students');
    });
}


function addNewStudent() {
    modalBody.innerHTML = `
        <h2>Add New Student</h2>
        <form onsubmit="saveNewStudent(event)">
            <div class="form-group"><label>Student ID</label><input type="text" id="newStudentId" placeholder="STU-2024-XXX" required></div>
            <div class="form-group"><label>Full Name</label><input type="text" id="newStudentName" required></div>
            <div class="form-group"><label>Course</label>
                <select id="newStudentCourse" required>
                    <option value="BS Nursing">BS Nursing</option>
                    <option value="BS Medical Technology">BS Medical Technology</option>
                    <option value="BS Pharmacy">BS Pharmacy</option>
                </select>
            </div>
            <div class="form-group"><label>Year Level</label>
                <select id="newStudentYear" required>
                    <option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option>
                </select>
            </div>
            <div class="form-group"><label>Section</label><input type="text" id="newStudentSection" placeholder="A" required></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">Save Student</button></div>
        </form>
    `;
    modal.classList.remove('hidden');
}

function saveNewStudent(e) {
    e.preventDefault();
    sampleData.students.push({
        id: document.getElementById('newStudentId').value,
        name: document.getElementById('newStudentName').value,
        course: document.getElementById('newStudentCourse').value,
        year: document.getElementById('newStudentYear').value,
        section: document.getElementById('newStudentSection').value
    });
    modal.classList.add('hidden');
    showAllStudents();
    alert('Student added successfully!');
}

function editStudent(studentId) {
    // Load student from API to support database-only IDs
    fetch(API_URL + 'students.php?id=' + encodeURIComponent(studentId))
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.data) {
                alert('Failed to load student data.');
                return;
            }
            const s = data.data;
            modalBody.innerHTML = `
                <h2>Edit Student</h2>
                <form onsubmit="updateStudent(event, '${studentId}')">
                    <div class="form-group"><label>Student ID</label><input type="text" value="${s.student_id}" readonly></div>
                    <div class="form-group"><label>Full Name</label><input type="text" id="editStudentName" value="${s.full_name || ''}" required></div>
                    <div class="form-group"><label>Course</label>
                        <select id="editStudentCourse" required>
                            <option value="BS Nursing" ${s.course === 'BS Nursing' ? 'selected' : ''}>BS Nursing</option>
                            <option value="BS Medical Technology" ${s.course === 'BS Medical Technology' ? 'selected' : ''}>BS Medical Technology</option>
                            <option value="BS Pharmacy" ${s.course === 'BS Pharmacy' ? 'selected' : ''}>BS Pharmacy</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Year Level</label>
                        <select id="editStudentYear" required>
                            <option value="1st Year" ${s.year_level === '1st Year' ? 'selected' : ''}>1st Year</option>
                            <option value="2nd Year" ${s.year_level === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                            <option value="3rd Year" ${s.year_level === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                            <option value="4th Year" ${s.year_level === '4th Year' ? 'selected' : ''}>4th Year</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Section</label><input type="text" id="editStudentSection" value="${s.section || ''}" required></div>
                    <div class="form-group"><label>Contact</label><input type="text" id="editStudentContact" value="${s.contact || ''}" placeholder="Optional"></div>
                    <div class="form-actions"><button type="submit" class="btn btn-primary">Update Student</button></div>
                </form>
            `;
            modal.classList.remove('hidden');
        })
        .catch(err => {
            console.error('Student load error:', err);
            alert('Failed to load student data.');
        });
}

function updateStudent(e, studentId) {
    e.preventDefault();
    const updateData = {
        studentId: studentId,
        fullName: document.getElementById('editStudentName').value,
        course: document.getElementById('editStudentCourse').value,
        year: document.getElementById('editStudentYear').value,
        section: document.getElementById('editStudentSection').value,
        contact: document.getElementById('editStudentContact') ? document.getElementById('editStudentContact').value : ''
    };

    fetch(API_URL + 'students.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Student updated successfully!');
            modal.classList.add('hidden');
            showAllStudents(); // Refresh list
        } else {
            alert('Update failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Update error:', err);
        alert('Update failed. Please try again.');
    });
}

function viewStudentGrades(studentId) {
    // Fetch student info
    fetch(API_URL + 'students.php?id=' + studentId)
    .then(res => res.json())
    .then(studentRes => {
        const studentName = (studentRes.success && studentRes.data && studentRes.data.full_name) ? studentRes.data.full_name : 'Student';
        
        // Fetch grades for the student
        fetch(API_URL + 'grades.php?student_id=' + studentId)
        .then(res => res.json())
        .then(gradesRes => {
            const grades = gradesRes.success ? gradesRes.data : [];
            
            // Render modal
            modalBody.innerHTML = `
                <h2>${studentName}'s Grades</h2>
                <p><strong>ID:</strong> ${studentId}</p>
                ${renderStudentGradesTable(grades)}
            `;
            modal.classList.remove('hidden');
        })
        .catch(err => {
            console.error('Grades fetch error:', err);
            modalBody.innerHTML = `
                <h2>${studentName}'s Grades</h2>
                <p><strong>ID:</strong> ${studentId}</p>
                <p>Error loading grades. Please try again.</p>
            `;
            modal.classList.remove('hidden');
        });
    })
    .catch(err => {
        console.error('Student fetch error:', err);
        // Fallback without student name
        fetch(API_URL + 'grades.php?student_id=' + studentId)
        .then(res => res.json())
        .then(gradesRes => {
            const grades = gradesRes.success ? gradesRes.data : [];
            modalBody.innerHTML = `
                <h2>Student's Grades</h2>
                <p><strong>ID:</strong> ${studentId}</p>
                ${renderStudentGradesTable(grades)}
            `;
            modal.classList.remove('hidden');
        })
        .catch(err => {
            console.error('Grades fetch error:', err);
            modalBody.innerHTML = `
                <h2>Student's Grades</h2>
                <p><strong>ID:</strong> ${studentId}</p>
                <p>Error loading data. Please try again.</p>
            `;
            modal.classList.remove('hidden');
        });
    });
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone and may affect associated grades.')) {
        fetch(API_URL + 'students.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Student deleted successfully!');
                showAllStudents(); // Refresh the list
            } else {
                alert('Delete failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Delete error:', err);
            alert('Delete failed. Please try again.');
        });
    }
}

function deleteFaculty(facultyId) {
    if (confirm('Are you sure you want to delete this faculty member? This action cannot be undone and may affect assigned subjects.')) {
        fetch(API_URL + 'faculty.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ facultyId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Faculty member deleted successfully!');
                showAllFaculty(); // Refresh the list
            } else {
                alert('Delete failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Delete error:', err);
            alert('Delete failed. Please try again.');
        });
    }
}

function deleteSubject(subjectCode) {
    if (confirm('Are you sure you want to delete this subject? This action cannot be undone and may affect enrolled students and grades.')) {
        fetch(API_URL + 'subjects.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectCode })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Subject deleted successfully!');
                showAllSubjects(); // Refresh the list
            } else {
                alert('Delete failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Delete error:', err);
            alert('Delete failed. Please try again.');
        });
    }
}

function deleteGrade(studentId, subjectCode) {
    if (confirm('Are you sure you want to delete this grade record? This action cannot be undone.')) {
        fetch(API_URL + 'grades.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, subjectCode })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Grade deleted successfully!');
                showAllGrades(); // Refresh the list
            } else {
                alert('Delete failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Delete error:', err);
            alert('Delete failed. Please try again.');
        });
    }
}

function editGrade(studentId, subjectCode) {
    // Fetch the specific grade
    fetch(API_URL + 'grades.php?student_id=' + studentId + '&subject_code=' + subjectCode)
    .then(res => res.json())
    .then(gradeRes => {
        if (gradeRes.success && gradeRes.data.length > 0) {
            const grade = gradeRes.data[0];
            // Fetch student and subject names
            Promise.all([
                fetch(API_URL + 'students.php?id=' + studentId).then(sRes => sRes.json()),
                fetch(API_URL + 'subjects.php?code=' + subjectCode).then(subRes => subRes.json())
            ])
            .then(([studentRes, subjectRes]) => {
                const student = (studentRes.success && studentRes.data) ? studentRes.data : { full_name: 'Unknown Student' };
                const subject = (subjectRes.success && subjectRes.data) ? subjectRes.data : { subject_name: 'Unknown Subject' };

                modalBody.innerHTML = `
                    <h2>Edit Grade</h2>
                    <form onsubmit="updateGrade(event, '${studentId}', '${subjectCode}')">
                        <div class="form-group"><label>Student ID</label><input type="text" value="${studentId}" readonly></div>
                        <div class="form-group"><label>Student Name</label><input type="text" value="${student.full_name}" readonly></div>
                        <div class="form-group"><label>Subject Code</label><input type="text" value="${subjectCode}" readonly></div>
                        <div class="form-group"><label>Subject Name</label><input type="text" value="${subject.subject_name}" readonly></div>
                        <div class="form-group"><label>Prelim</label><input type="number" id="editPrelim" value="${grade.prelim}" min="0" max="100" step="0.01" required></div>
                        <div class="form-group"><label>Midterm</label><input type="number" id="editMidterm" value="${grade.midterm}" min="0" max="100" step="0.01" required></div>
                        <div class="form-group"><label>Pre-Final</label><input type="number" id="editPrefinal" value="${grade.prefinal}" min="0" max="100" step="0.01" required></div>
                        <div class="form-group"><label>Final</label><input type="number" id="editFinal" value="${grade.final}" min="0" max="100" step="0.01" required></div>
                        <div class="form-actions"><button type="submit" class="btn btn-primary">Update Grade</button></div>
                    </form>
                `;
                modal.classList.remove('hidden');
            })
            .catch(err => {
                console.error('Supporting data error:', err);
                // Use defaults and still show modal
                const student = { full_name: 'Unknown Student' };
                const subject = { subject_name: 'Unknown Subject' };

                modalBody.innerHTML = `
                    <h2>Edit Grade</h2>
                    <form onsubmit="updateGrade(event, '${studentId}', '${subjectCode}')">
                        <div class="form-group"><label>Student ID</label><input type="text" value="${studentId}" readonly></div>
                        <div class="form-group"><label>Student Name</label><input type="text" value="${student.full_name}" readonly></div>
                        <div class="form-group"><label>Subject Code</label><input type="text" value="${subjectCode}" readonly></div>
                        <div class="form-group"><label>Subject Name</label><input type="text" value="${subject.subject_name}" readonly></div>
                        <div class="form-group"><label>Prelim</label><input type="number" id="editPrelim" value="${grade.prelim}" min="0" max="100" step="0.01" required></div>
                        <div class="form-group"><label>Midterm</label><input type="number" id="editMidterm" value="${grade.midterm}" min="0" max="100" step="0.01" required></div>
                        <div class="form-group"><label>Pre-Final</label><input type="number" id="editPrefinal" value="${grade.prefinal}" min="0" max="100" step="0.01" required></div>
                        <div class="form-group"><label>Final</label><input type="number" id="editFinal" value="${grade.final}" min="0" max="100" step="0.01" required></div>
                        <div class="form-actions"><button type="submit" class="btn btn-primary">Update Grade</button></div>
                    </form>
                `;
                modal.classList.remove('hidden');
            });
        } else {
            alert('Grade not found');
        }
    })
    .catch(err => {
        console.error('Grade fetch error:', err);
        alert('Failed to load grade');
    });
}

function updateGrade(e, studentId, subjectCode) {
    e.preventDefault();
    const updateData = {
        studentId,
        subjectCode,
        prelim: parseFloat(document.getElementById('editPrelim').value),
        midterm: parseFloat(document.getElementById('editMidterm').value),
        prefinal: parseFloat(document.getElementById('editPrefinal').value),
        final: parseFloat(document.getElementById('editFinal').value)
    };

    fetch(API_URL + 'grades.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Grade updated successfully!');
            modal.classList.add('hidden');
            showAllGrades(); // Refresh list
        } else {
            alert('Update failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Update error:', err);
        alert('Update failed. Please try again.');
    });
}

function addNewGrade() {
    // For adding new grade, need to select student and subject
    // Fetch students and subjects for dropdowns
    Promise.all([
        fetch(API_URL + 'students.php').then(sRes => sRes.json()),
        fetch(API_URL + 'subjects.php').then(subRes => subRes.json())
    ])
    .then(([studentsRes, subjectsRes]) => {
        if (!studentsRes.success || !subjectsRes.success) {
            alert('Failed to load data for form');
            return;
        }
        const students = studentsRes.data;
        const subjects = subjectsRes.data;

        let studentOptions = students.map(s => `<option value="${s.student_id}">${s.student_id} - ${s.full_name}</option>`).join('');
        let subjectOptions = subjects.map(s => `<option value="${s.subject_code}">${s.subject_code} - ${s.subject_name}</option>`).join('');

        modalBody.innerHTML = `
            <h2>Add New Grade</h2>
            <form onsubmit="saveNewGrade(event)">
                <div class="form-group"><label>Student</label><select id="newGradeStudent" required>${studentOptions}</select></div>
                <div class="form-group"><label>Subject</label><select id="newGradeSubject" required>${subjectOptions}</select></div>
                <div class="form-group"><label>Prelim</label><input type="number" id="newPrelim" min="0" max="100" step="0.01" required></div>
                <div class="form-group"><label>Midterm</label><input type="number" id="newMidterm" min="0" max="100" step="0.01" required></div>
                <div class="form-group"><label>Pre-Final</label><input type="number" id="newPrefinal" min="0" max="100" step="0.01" required></div>
                <div class="form-group"><label>Final</label><input type="number" id="newFinal" min="0" max="100" step="0.01" required></div>
                <div class="form-actions"><button type="submit" class="btn btn-primary">Save Grade</button></div>
            </form>
        `;
        modal.classList.remove('hidden');
    })
    .catch(err => {
        console.error('Data fetch error:', err);
        alert('Failed to load form');
    });
}

function saveNewGrade(e) {
    e.preventDefault();
    const newData = {
        studentId: document.getElementById('newGradeStudent').value,
        subjectCode: document.getElementById('newGradeSubject').value,
        prelim: parseFloat(document.getElementById('newPrelim').value),
        midterm: parseFloat(document.getElementById('newMidterm').value),
        prefinal: parseFloat(document.getElementById('newPrefinal').value),
        final: parseFloat(document.getElementById('newFinal').value)
    };

    fetch(API_URL + 'grades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Grade added successfully!');
            modal.classList.add('hidden');
            showAllGrades(); // Refresh list
        } else {
            alert('Add failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Add error:', err);
        alert('Add failed. Please try again.');
    });
}


function showAllFaculty() {
    setActiveNav(event?.target);

    // Fetch faculty from API
    fetch(API_URL + 'faculty.php')
    .then(res => res.json())
    .then(facultyRes => {
        if (facultyRes.success) {
            let rows = facultyRes.data.map(f => `
                <tr>
                    <td>${f.faculty_id}</td><td>${f.full_name}</td><td>${f.department}</td><td>${f.subject_count || 0} subjects</td>
                    <td>
                        <button class="btn btn-view btn-small" onclick="editFaculty('${f.faculty_id}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteFaculty('${f.faculty_id}')">Delete</button>
                    </td>
                </tr>
            `).join('');

            contentArea.innerHTML = `
                <div class="content-card">
                    <div class="card-header"><h2>All Teachers</h2><button class="btn btn-view" onclick="addNewFaculty()">+ Add Teacher</button></div>
                    <table><thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Subjects</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody></table>
                </div>
            `;
        } else {
            alert('Failed to load faculty');
        }
    })
    .catch(err => {
        console.error('Faculty fetch error:', err);
        alert('Failed to load faculty');
    });
}

function addNewFaculty() {
    modalBody.innerHTML = `
        <h2>Add New Teacher</h2>
        <form onsubmit="saveNewFaculty(event)">
            <div class="form-group"><label>Faculty ID</label><input type="text" id="newFacultyId" placeholder="FAC-XXX" required></div>
            <div class="form-group"><label>Full Name</label><input type="text" id="newFacultyName" required></div>
            <div class="form-group"><label>Department</label>
                <select id="newFacultyDept" required>
                    <option value="Nursing">Nursing</option>
                    <option value="Medical Technology">Medical Technology</option>
                    <option value="Pharmacy">Pharmacy</option>
                </select>
            </div>
            <div class="form-group"><label>Subjects (comma-separated)</label><textarea id="newFacultySubjects" placeholder="e.g., Fundamentals of Nursing, Medical-Surgical Nursing" rows="3"></textarea></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">Save Teacher</button></div>
        </form>
    `;
    modal.classList.remove('hidden');
}

function saveNewFaculty(e) {
    e.preventDefault();
    const newData = {
        facultyId: document.getElementById('newFacultyId').value,
        fullName: document.getElementById('newFacultyName').value,
        department: document.getElementById('newFacultyDept').value
    };

    fetch(API_URL + 'faculty.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Teacher added successfully!');
            modal.classList.add('hidden');
            showAllFaculty(); // Refresh list
        } else {
            alert('Add failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Add error:', err);
        alert('Add failed. Please try again.');
    });
}

function editFaculty(facultyId) {
    // Fetch single faculty for edit
    fetch(API_URL + 'faculty.php?id=' + facultyId)
    .then(res => res.json())
    .then(facultyRes => {
        if (facultyRes.success && facultyRes.data) {
            const faculty = facultyRes.data;
            
            // Fetch all subjects
            fetch(API_URL + 'subjects.php')
            .then(subRes => subRes.json())
            .then(subjectsRes => {
                if (subjectsRes.success) {
                    const allSubjects = subjectsRes.data;
                    const assignedSubjects = allSubjects.filter(s => s.faculty_id === facultyId);
                    
                    let subjectOptions = allSubjects.map(s => 
                        `<option value="${s.subject_code}" ${assignedSubjects.some(as => as.subject_code === s.subject_code) ? 'selected' : ''}>${s.subject_code} - ${s.subject_name}</option>`
                    ).join('');
                    
                    modalBody.innerHTML = `
                        <h2>Edit Teacher</h2>
                        <form onsubmit="updateFaculty(event, '${facultyId}')">
                            <div class="form-group"><label>Faculty ID</label><input type="text" value="${faculty.faculty_id}" readonly></div>
                            <div class="form-group"><label>Full Name</label><input type="text" id="editFacultyName" value="${faculty.full_name}" required></div>
                            <div class="form-group"><label>Department</label>
                                <select id="editFacultyDept" required>
                                    <option value="Nursing" ${faculty.department === 'Nursing' ? 'selected' : ''}>Nursing</option>
                                    <option value="Medical Technology" ${faculty.department === 'Medical Technology' ? 'selected' : ''}>Medical Technology</option>
                                    <option value="Pharmacy" ${faculty.department === 'Pharmacy' ? 'selected' : ''}>Pharmacy</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Subjects (Hold Ctrl/Cmd to select multiple)</label>
                                <select id="editFacultySubjects" multiple size="5" style="width: 100%; height: 120px;">
                                    ${subjectOptions}
                                </select>
                            </div>
                            <div class="form-actions"><button type="submit" class="btn btn-primary">Update Teacher</button></div>
                        </form>
                    `;
                    modal.classList.remove('hidden');
                } else {
                    alert('Failed to load subjects for edit form');
                    modal.classList.add('hidden');
                }
            })
            .catch(subErr => {
                console.error('Subjects fetch error:', subErr);
                alert('Failed to load subjects for edit form');
                modal.classList.add('hidden');
            });
        } else {
            alert('Faculty not found');
        }
    })
    .catch(err => {
        console.error('Faculty fetch error:', err);
        alert('Failed to load faculty for editing');
    });
}

function updateFaculty(e, facultyId) {
    e.preventDefault();
    const selectedSubjects = Array.from(document.getElementById('editFacultySubjects').selectedOptions).map(opt => opt.value);
    const updateData = {
        facultyId: facultyId,
        fullName: document.getElementById('editFacultyName').value,
        department: document.getElementById('editFacultyDept').value,
        subjects: selectedSubjects
    };

    fetch(API_URL + 'faculty.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Teacher updated successfully!');
            modal.classList.add('hidden');
            showAllFaculty(); // Refresh list
        } else {
            alert('Update failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Update error:', err);
        alert('Update failed. Please try again.');
    });
}


function showAllSubjects() {
    setActiveNav(event?.target);

    // Fetch subjects from API
    fetch(API_URL + 'subjects.php')
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            let rows = response.data.map(s => `
                <tr>
                    <td>${s.subject_code}</td>
                    <td>${s.subject_name}</td>
                    <td>${s.units}</td>
                    <td>${s.instructor_name || 'Unassigned'}</td>
                    <td>
                        <button class="btn btn-view btn-small" onclick="editSubject('${s.subject_code}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteSubject('${s.subject_code}')">Delete</button>
                    </td>
                </tr>
            `).join('');

            contentArea.innerHTML = `
                <div class="content-card">
                    <div class="card-header"><h2>All Subjects</h2><button class="btn btn-view" onclick="addNewSubject()">+ Add Subject</button></div>
                    <table><thead><tr><th>Code</th><th>Subject Name</th><th>Units</th><th>Instructor</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody></table>
                </div>
            `;
        } else {
            alert('Failed to load subjects: ' + (response.message || 'Unknown error'));
            contentArea.innerHTML = '<div class="content-card"><p>No subjects available.</p></div>';
        }
    })
    .catch(err => {
        console.error('Subjects fetch error:', err);
        alert('Failed to load subjects. Please try again.');
    });
}

function addNewSubject() {
    // Fetch faculty for dropdown
    fetch(API_URL + 'faculty.php')
    .then(res => res.json())
    .then(facultyRes => {
        if (facultyRes.success) {
            let instructorOptions = facultyRes.data.map(f => `<option value="${f.faculty_id}">${f.full_name}</option>`).join('');
            modalBody.innerHTML = `
                <h2>Add New Subject</h2>
                <form onsubmit="saveNewSubject(event)">
                    <div class="form-group"><label>Subject Code</label><input type="text" id="newSubjectCode" placeholder="XXX101" required></div>
                    <div class="form-group"><label>Subject Name</label><input type="text" id="newSubjectName" required></div>
                    <div class="form-group"><label>Units</label><input type="number" id="newSubjectUnits" min="1" max="10" required></div>
                    <div class="form-group"><label>Instructor</label><select id="newSubjectInstructor" required><option value="">Select</option>${instructorOptions}</select></div>
                    <div class="form-actions"><button type="submit" class="btn btn-primary">Save Subject</button></div>
                </form>
            `;
            modal.classList.remove('hidden');
        } else {
            alert('Failed to load faculty for dropdown');
            modal.classList.add('hidden');
        }
    })
    .catch(err => {
        console.error('Faculty fetch error:', err);
        alert('Failed to load form. Please try again.');
        modal.classList.add('hidden');
    });
}

function saveNewSubject(e) {
    e.preventDefault();
    const newData = {
        subjectCode: document.getElementById('newSubjectCode').value,
        subjectName: document.getElementById('newSubjectName').value,
        units: parseInt(document.getElementById('newSubjectUnits').value),
        facultyId: document.getElementById('newSubjectInstructor').value || null
    };

    fetch(API_URL + 'subjects.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Subject added successfully!');
            modal.classList.add('hidden');
            showAllSubjects(); // Refresh list
        } else {
            alert('Add failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Add error:', err);
        alert('Add failed. Please try again.');
    });
}

function editSubject(subjectCode) {
    // Fetch single subject
    fetch(API_URL + 'subjects.php?code=' + subjectCode)
    .then(res => res.json())
    .then(subjectRes => {
        if (subjectRes.success && subjectRes.data) {
            const subject = subjectRes.data;
            // Fetch faculty for dropdown
            fetch(API_URL + 'faculty.php')
            .then(res => res.json())
            .then(facultyRes => {
                if (facultyRes.success) {
                    let instructorOptions = facultyRes.data.map(f => 
                        `<option value="${f.faculty_id}" ${subject.faculty_id == f.faculty_id ? 'selected' : ''}>${f.full_name}</option>`
                    ).join('');
                    modalBody.innerHTML = `
                        <h2>Edit Subject</h2>
                        <form onsubmit="updateSubject(event, '${subjectCode}')">
                            <div class="form-group"><label>Subject Code</label><input type="text" value="${subject.subject_code}" readonly></div>
                            <div class="form-group"><label>Subject Name</label><input type="text" id="editSubjectName" value="${subject.subject_name}" required></div>
                            <div class="form-group"><label>Units</label><input type="number" id="editSubjectUnits" value="${subject.units}" min="1" max="10" required></div>
                            <div class="form-group"><label>Instructor</label><select id="editSubjectInstructor" required><option value="">Select</option>${instructorOptions}</select></div>
                            <div class="form-actions"><button type="submit" class="btn btn-primary">Update Subject</button></div>
                        </form>
                    `;
                    modal.classList.remove('hidden');
                } else {
                    alert('Failed to load faculty for edit form');
                    modal.classList.add('hidden');
                }
            })
            .catch(err => {
                console.error('Faculty fetch error:', err);
                alert('Failed to load edit form. Please try again.');
                modal.classList.add('hidden');
            });
        } else {
            alert('Subject not found: ' + (subjectRes.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Subject fetch error:', err);
        alert('Failed to load subject for editing');
    });
}

function updateSubject(e, subjectCode) {
    e.preventDefault();
    const updateData = {
        subjectCode: subjectCode,
        subjectName: document.getElementById('editSubjectName').value,
        units: parseInt(document.getElementById('editSubjectUnits').value),
        facultyId: document.getElementById('editSubjectInstructor').value || null
    };

    fetch(API_URL + 'subjects.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Subject updated successfully!');
            modal.classList.add('hidden');
            showAllSubjects(); // Refresh list
        } else {
            alert('Update failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(err => {
        console.error('Update error:', err);
        alert('Update failed. Please try again.');
    });
}

function showAllGrades() {
    setActiveNav(event?.target);

    // Fetch grades, students, and subjects
    fetch(API_URL + 'grades.php')
    .then(res => res.json())
    .then(gradesRes => {
        if (!gradesRes.success) {
            alert('Failed to load grades');
            return;
        }
        const grades = gradesRes.data;

        Promise.all([
            fetch(API_URL + 'students.php').then(sRes => sRes.json()),
            fetch(API_URL + 'subjects.php').then(subRes => subRes.json())
        ])
        .then(([studentsRes, subjectsRes]) => {
            if (!studentsRes.success || !subjectsRes.success) {
                alert('Failed to load supporting data');
                return;
            }
            const students = studentsRes.data;
            const subjects = subjectsRes.data;

            let rows = grades.map(g => {
                const student = students.find(s => s.student_id === g.student_id);
                const subject = subjects.find(s => s.subject_code === g.subject_code);
                const finalGrade = calculateFinalGrade(g);
                return `
                    <tr>
                        <td>${g.student_id}</td>
                        <td>${student ? student.full_name : 'Unknown'}</td>
                        <td>${g.subject_code}</td>
                        <td>${subject ? subject.subject_name : 'Unknown'}</td>
                        <td>${g.prelim}</td>
                        <td>${g.midterm}</td>
                        <td>${g.prefinal}</td>
                        <td>${g.final}</td>
                        <td class="${getGradeClass(finalGrade)}">${finalGrade}</td>
                        <td>${getLetterGrade(finalGrade)}</td>
                        <td>
                            <button class="btn btn-view btn-small" onclick="editGrade('${g.student_id}', '${g.subject_code}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteGrade('${g.student_id}', '${g.subject_code}')">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');

            contentArea.innerHTML = `
                <div class="content-card">
                    <div class="card-header">
                        <h2>All Grade Records</h2>
                        <button class="btn btn-view" onclick="addNewGrade()">+ Add Grade</button>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Subject</th>
                                <th>Prelim</th>
                                <th>Midterm</th>
                                <th>Pre-Final</th>
                                <th>Final</th>
                                <th>Grade</th>
                                <th>Equiv</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        })
        .catch(err => {
            console.error('Supporting data fetch error:', err);
            alert('Failed to load data');
        });
    })
    .catch(err => {
        console.error('Grades fetch error:', err);
        alert('Failed to load grades');
    });
}

function showReports() {
    setActiveNav(event?.target);
    const allFinalGrades = sampleData.grades.map(g => parseFloat(calculateFinalGrade(g)));
    const avgGrade = allFinalGrades.length > 0 ? (allFinalGrades.reduce((a, b) => a + b, 0) / allFinalGrades.length).toFixed(2) : 0;
    const passingGrades = allFinalGrades.filter(g => g >= 75).length;
    const passingRate = allFinalGrades.length > 0 ? ((passingGrades / allFinalGrades.length) * 100).toFixed(1) : 0;
    
    contentArea.innerHTML = `
        <div class="stats-row">
            <div class="stat-card"><div class="stat-icon blue">👥</div><div class="stat-info"><h3>${sampleData.students.length}</h3><p>Total Students</p></div></div>
            <div class="stat-card"><div class="stat-icon cyan">📝</div><div class="stat-info"><h3>${sampleData.grades.length}</h3><p>Grade Records</p></div></div>
            <div class="stat-card"><div class="stat-icon teal">📊</div><div class="stat-info"><h3>${avgGrade}</h3><p>Average Grade</p></div></div>
            <div class="stat-card"><div class="stat-icon orange">✓</div><div class="stat-info"><h3>${passingRate}%</h3><p>Passing Rate</p></div></div>
        </div>
        <div class="content-card">
            <div class="card-header"><h2>Grade Distribution</h2></div>
            <table><thead><tr><th>Grade Range</th><th>Count</th><th>Percentage</th></tr></thead>
            <tbody>
                <tr><td>Excellent (90-100)</td><td>${allFinalGrades.filter(g => g >= 90).length}</td><td>${allFinalGrades.length > 0 ? ((allFinalGrades.filter(g => g >= 90).length / allFinalGrades.length) * 100).toFixed(1) : 0}%</td></tr>
                <tr><td>Good (80-89)</td><td>${allFinalGrades.filter(g => g >= 80 && g < 90).length}</td><td>${allFinalGrades.length > 0 ? ((allFinalGrades.filter(g => g >= 80 && g < 90).length / allFinalGrades.length) * 100).toFixed(1) : 0}%</td></tr>
                <tr><td>Average (75-79)</td><td>${allFinalGrades.filter(g => g >= 75 && g < 80).length}</td><td>${allFinalGrades.length > 0 ? ((allFinalGrades.filter(g => g >= 75 && g < 80).length / allFinalGrades.length) * 100).toFixed(1) : 0}%</td></tr>
                <tr><td>Failed (Below 75)</td><td>${allFinalGrades.filter(g => g < 75).length}</td><td>${allFinalGrades.length > 0 ? ((allFinalGrades.filter(g => g < 75).length / allFinalGrades.length) * 100).toFixed(1) : 0}%</td></tr>
            </tbody></table>
        </div>
    `;
}

console.log('MDC Grading System Portal - Ready');


// ============================================
// SIDEBAR TOGGLE FUNCTION
// ============================================
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('sidebar-hidden');
        mainContent.classList.toggle('full-width');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menuToggle');
    
    if (sidebar && menuToggle) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && window.innerWidth <= 768) {
            if (!sidebar.classList.contains('sidebar-hidden')) {
                sidebar.classList.add('sidebar-hidden');
            }
        }
    }
});

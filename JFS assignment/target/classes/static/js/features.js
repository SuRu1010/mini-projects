/**
 * ========================================================
 * STUDENT MANAGEMENT SYSTEM - CORE FEATURES JAVASCRIPT
 * Spring Boot Static Web Architecture
 * Fully Interactive CRUD, Search & Analytics Engine
 * ========================================================
 */

// Initial Seed Dataset (Realistic SRMIST / University Students)
const DEFAULT_STUDENTS = [
    {
        rollNo: "SRM-2024-001",
        name: "Suryansh Singh",
        email: "suryansh@srmist.edu.in",
        phone: "+91 98765 43210",
        department: "Computer Science",
        semester: 6,
        year: "3rd Year",
        attendance: 92,
        status: "Active",
        electives: ["AI & Machine Learning", "Cloud Architecture", "Distributed Systems"],
        joinedDate: "2022-08-10"
    },
    {
        rollNo: "SRM-2024-002",
        name: "Ananya Verma",
        email: "ananya.v@srmist.edu.in",
        phone: "+91 98123 45678",
        department: "Computer Science",
        semester: 6,
        year: "3rd Year",
        attendance: 88,
        status: "Active",
        electives: ["AI & Machine Learning", "Data Mining", "Cyber Security"],
        joinedDate: "2022-08-11"
    },
    {
        rollNo: "SRM-2024-003",
        name: "Aarav Sharma",
        email: "aarav.s@srmist.edu.in",
        phone: "+91 99234 56789",
        department: "Information Technology",
        semester: 4,
        year: "2nd Year",
        attendance: 72,
        status: "Active",
        electives: ["Web Technologies", "Database Systems"],
        joinedDate: "2023-08-14"
    },
    {
        rollNo: "SRM-2024-004",
        name: "Priya Nair",
        email: "priya.n@srmist.edu.in",
        phone: "+91 97345 67890",
        department: "Electronics & Comm.",
        semester: 6,
        year: "3rd Year",
        attendance: 95,
        status: "Active",
        electives: ["Embedded Systems", "Signal Processing", "VLSI Design"],
        joinedDate: "2022-08-12"
    },
    {
        rollNo: "SRM-2024-005",
        name: "Rohan Patel",
        email: "rohan.p@srmist.edu.in",
        phone: "+91 96456 78901",
        department: "Mechanical Engineering",
        semester: 8,
        year: "4th Year",
        attendance: 81,
        status: "Graduated",
        electives: ["Robotics & Automation", "Thermodynamics", "CAD/CAM"],
        joinedDate: "2021-08-16"
    },
    {
        rollNo: "SRM-2024-006",
        name: "Sneha Iyer",
        email: "sneha.i@srmist.edu.in",
        phone: "+91 95567 89012",
        department: "Civil Engineering",
        semester: 2,
        year: "1st Year",
        attendance: 68,
        status: "Active",
        electives: ["Structural Analysis", "Geotechnical Eng."],
        joinedDate: "2024-08-18"
    },
    {
        rollNo: "SRM-2024-007",
        name: "Vikram Reddy",
        email: "vikram.r@srmist.edu.in",
        phone: "+91 94678 90123",
        department: "Computer Science",
        semester: 4,
        year: "2nd Year",
        attendance: 84,
        status: "Active",
        electives: ["Design & Analysis of Algorithms", "Operating Systems"],
        joinedDate: "2023-08-14"
    },
    {
        rollNo: "SRM-2024-008",
        name: "Meera Joshi",
        email: "meera.j@srmist.edu.in",
        phone: "+91 93789 01234",
        department: "Information Technology",
        semester: 6,
        year: "3rd Year",
        attendance: 79,
        status: "On Leave",
        electives: ["Cloud Computing", "DevOps Engineering"],
        joinedDate: "2022-08-10"
    }
];

const STORAGE_KEY = "SMS_STUDENTS_DATA";

// App State
let students = [];
let lastDeletedStudent = null;
let deleteUndoTimer = null;
let currentViewMode = "grid"; // 'grid' | 'table'
let activeTab = "directory"; // 'directory' | 'add' | 'search' | 'reports'

// DOM Elements cache
let elements = {};

// Helpers
function calculateYear(sem) {
    const s = parseInt(sem, 10);
    if (s <= 2) return "1st Year";
    if (s <= 4) return "2nd Year";
    if (s <= 6) return "3rd Year";
    return "4th Year";
}

function getAttendanceColorClass(att) {
    if (att >= 85) return "att-high";
    if (att >= 75) return "att-mid";
    return "att-low";
}

function getAttendanceBadgeClass(att) {
    if (att >= 85) return "tag-emerald";
    if (att >= 75) return "tag-cyan";
    return "tag-danger";
}

function getStatusBadgeClass(status) {
    if (status === "Active") return "tag-emerald";
    if (status === "On Leave") return "tag-warning";
    if (status === "Graduated") return "tag-purple";
    return "tag";
}

// Storage operations
function loadStudents() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            students = JSON.parse(raw);
        } else {
            students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
            saveStudents();
        }
    } catch (e) {
        console.error("Failed to load students from localStorage, fallback to defaults", e);
        students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
    }
}

function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
        console.error("Failed to save students to localStorage", e);
    }
    updateStatsBar();
    renderReports();
}

function resetDefaultData() {
    if (confirm("Reset student directory back to initial demo dataset?")) {
        students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
        saveStudents();
        renderDirectory();
        renderReports();
        showToast("Student database reset to default demo records", "info");
    }
}

// Toast notification system
function showToast(message, type = "info", undoCallback = null) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `sms-toast sms-toast-${type}`;

    const iconMap = {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️"
    };

    let contentHtml = `
    <span class="toast-icon">${iconMap[type] || "ℹ️"}</span>
    <div class="toast-text">${message}</div>
  `;

    if (undoCallback) {
        contentHtml += `<button class="toast-undo-btn" id="toast-undo-action">Undo</button>`;
    }

    contentHtml += `<button class="toast-close-btn" aria-label="Close notification">&times;</button>`;
    toast.innerHTML = contentHtml;

    container.appendChild(toast);

    const closeBtn = toast.querySelector(".toast-close-btn");
    closeBtn.addEventListener("click", () => {
        toast.remove();
    });

    if (undoCallback) {
        const undoBtn = toast.querySelector("#toast-undo-action");
        if (undoBtn) {
            undoBtn.addEventListener("click", () => {
                undoCallback();
                toast.remove();
            });
        }
    }

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add("sms-toast-fadeout");
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}

// Top Feature Cards Interactive Triggers
function setupFeatureCardTriggers() {
    const cards = document.querySelectorAll(".feature-box[data-feature]");
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            // Avoid retriggering if clicking specific sub-button
            const targetFeature = card.getAttribute("data-feature");
            activateFeature(targetFeature);
        });
    });
}

function activateFeature(featureKey) {
    const studio = document.getElementById("operations-studio");
    if (studio) {
        studio.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    switch (featureKey) {
        case "add":
            switchTab("add");
            document.getElementById("add-name")?.focus();
            break;
        case "view":
            switchTab("directory");
            break;
        case "update":
            switchTab("directory");
            if (students.length > 0) {
                openEditModal(students[0].rollNo);
            } else {
                showToast("No students to update. Please add a student first.", "warning");
            }
            break;
        case "delete":
            switchTab("directory");
            if (students.length > 0) {
                openDeleteModal(students[0].rollNo);
            } else {
                showToast("No students available to delete.", "warning");
            }
            break;
        case "search":
            switchTab("search");
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
            break;
        case "reports":
            switchTab("reports");
            break;
        default:
            switchTab("directory");
    }
}

// Tab Switcher
function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll(".studio-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    document.querySelectorAll(".studio-tab-content").forEach(content => {
        content.classList.toggle("active", content.id === `tab-${tabId}`);
    });

    if (tabId === "directory") {
        renderDirectory();
    } else if (tabId === "search") {
        runSearch();
    } else if (tabId === "reports") {
        renderReports();
    }
}

// Live Status KPI Bar
function updateStatsBar() {
    const total = students.length;
    const active = students.filter(s => s.status === "Active").length;
    const avgAtt = total > 0 ? (students.reduce((acc, s) => acc + s.attendance, 0) / total).toFixed(1) : 0;
    const deptCount = new Set(students.map(s => s.department)).size;

    const totalEl = document.getElementById("stat-total-students");
    const activeEl = document.getElementById("stat-active-students");
    const attEl = document.getElementById("stat-avg-attendance");
    const deptsEl = document.getElementById("stat-total-depts");

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (attEl) attEl.textContent = `${avgAtt}%`;
    if (deptsEl) deptsEl.textContent = deptCount;
}

// ========================================================
// FEATURE 1: ADD STUDENT (CREATE)
// ========================================================
function setupAddStudentForm() {
    const form = document.getElementById("add-student-form");
    if (!form) return;

    // Auto-generate roll number suggestion
    updateNextRollNumberSuggestion();

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const rollNo = document.getElementById("add-roll").value.trim().toUpperCase();
        const name = document.getElementById("add-name").value.trim();
        const email = document.getElementById("add-email").value.trim();
        const phone = document.getElementById("add-phone").value.trim();
        const department = document.getElementById("add-dept").value;
        const semester = parseInt(document.getElementById("add-sem").value, 10);
        const attendance = parseInt(document.getElementById("add-attendance").value, 10);
        const status = document.getElementById("add-status").value;

        // Collect electives
        const checkedElectives = Array.from(document.querySelectorAll("#add-electives input:checked"))
            .map(cb => cb.value);

        // Validation
        if (!rollNo || !name || !email || !department || isNaN(semester)) {
            showToast("Please complete all required fields correctly.", "warning");
            return;
        }

        // Check duplicate Roll No
        if (students.some(s => s.rollNo.toUpperCase() === rollNo)) {
            showToast(`Student with Roll Number "${rollNo}" already exists!`, "error");
            document.getElementById("add-roll").focus();
            return;
        }

        const newStudent = {
            rollNo,
            name,
            email,
            phone: phone || "+91 90000 00000",
            department,
            semester,
            year: calculateYear(semester),
            attendance: isNaN(attendance) ? 80 : Math.min(100, Math.max(0, attendance)),
            status,
            electives: checkedElectives.length > 0 ? checkedElectives : ["Core Fundamentals"],
            joinedDate: new Date().toISOString().split("T")[0]
        };

        students.unshift(newStudent);
        saveStudents();

        showToast(`Student "${name}" (${rollNo}) successfully added!`, "success");
        form.reset();
        updateNextRollNumberSuggestion();

        // Switch to Directory view and highlight
        switchTab("directory");
    });

    // Dynamic semester-to-year hint
    const semSelect = document.getElementById("add-sem");
    const yearHint = document.getElementById("add-year-hint");
    if (semSelect && yearHint) {
        semSelect.addEventListener("change", () => {
            yearHint.textContent = calculateYear(semSelect.value);
        });
    }

    // Attendance range sync with number
    const attRange = document.getElementById("add-attendance");
    const attDisplay = document.getElementById("add-attendance-val");
    if (attRange && attDisplay) {
        attRange.addEventListener("input", () => {
            attDisplay.textContent = `${attRange.value}%`;
        });
    }
}

function updateNextRollNumberSuggestion() {
    const rollInput = document.getElementById("add-roll");
    if (!rollInput || rollInput.value) return;

    const currentMax = students.reduce((max, s) => {
        const match = s.rollNo.match(/(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
        }
        return max;
    }, 8);

    const nextNum = String(currentMax + 1).padStart(3, "0");
    rollInput.value = `SRM-2024-${nextNum}`;
}

// ========================================================
// FEATURE 2: VIEW STUDENT (READ & PROFILE MODAL)
// ========================================================
function renderDirectory() {
    const container = document.getElementById("directory-container");
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <h3>No Students Found</h3>
        <p>The student directory is currently empty. Click below to add a student or restore demo records.</p>
        <div style="margin-top: 1rem; display: flex; gap: 0.75rem; justify-content: center;">
          <button class="btn btn-primary" onclick="activateFeature('add')">➕ Add Student</button>
          <button class="btn btn-outline" onclick="resetDefaultData()">🔄 Load Demo Records</button>
        </div>
      </div>
    `;
        return;
    }

    if (currentViewMode === "grid") {
        let html = `<div class="students-grid">`;
        students.forEach(s => {
            const initials = s.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            const attClass = getAttendanceColorClass(s.attendance);
            const attBadge = getAttendanceBadgeClass(s.attendance);
            const statusBadge = getStatusBadgeClass(s.status);

            html += `
        <div class="student-card" data-roll="${s.rollNo}">
          <div class="student-card-top">
            <div class="student-avatar">${initials}</div>
            <div style="flex: 1; min-width: 0;">
              <h4 class="student-name" title="${s.name}">${s.name}</h4>
              <div class="student-roll">${s.rollNo}</div>
            </div>
            <span class="tag ${statusBadge}" style="font-size: 0.75rem;">${s.status}</span>
          </div>

          <div class="student-details-list">
            <div class="student-detail-item">
              <span class="detail-label">Department</span>
              <span class="detail-val">${s.department}</span>
            </div>
            <div class="student-detail-item">
              <span class="detail-label">Academic Level</span>
              <span class="detail-val">Sem ${s.semester} • ${s.year}</span>
            </div>
            <div class="student-detail-item">
              <span class="detail-label">Contact</span>
              <span class="detail-val" style="font-size: 0.82rem;">${s.email}</span>
            </div>
          </div>

          <div class="attendance-meter-block">
            <div class="attendance-meter-header">
              <span>Attendance Rate</span>
              <span class="tag ${attBadge}" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">${s.attendance}%</span>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill ${attClass}" style="width: ${s.attendance}%;"></div>
            </div>
          </div>

          <div class="student-card-actions">
            <button class="btn btn-sm btn-outline" onclick="openProfileModal('${s.rollNo}')" title="View Full Academic Profile">
              👁️ View
            </button>
            <button class="btn btn-sm btn-outline" onclick="openEditModal('${s.rollNo}')" title="Edit Student Record">
              ✏️ Edit
            </button>
            <button class="btn btn-sm btn-danger-outline" onclick="openDeleteModal('${s.rollNo}')" title="Safely Delete Student">
              🗑️ Delete
            </button>
          </div>
        </div>
      `;
        });
        html += `</div>`;
        container.innerHTML = html;
    } else {
        // Table View
        let html = `
      <div class="table-responsive">
        <table class="sms-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Department</th>
              <th>Sem / Year</th>
              <th>Attendance</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

        students.forEach(s => {
            const attBadge = getAttendanceBadgeClass(s.attendance);
            const statusBadge = getStatusBadgeClass(s.status);

            html += `
        <tr>
          <td>
            <div style="font-weight: 600; color: #fff;">${s.name}</div>
            <div style="color: var(--text-subtle); font-size: 0.8rem;">${s.email}</div>
          </td>
          <td><code>${s.rollNo}</code></td>
          <td>${s.department}</td>
          <td>Sem ${s.semester} (${s.year})</td>
          <td>
            <span class="tag ${attBadge}">${s.attendance}%</span>
          </td>
          <td><span class="tag ${statusBadge}">${s.status}</span></td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.35rem;">
              <button class="action-icon-btn" onclick="openProfileModal('${s.rollNo}')" title="View Profile">👁️</button>
              <button class="action-icon-btn" onclick="openEditModal('${s.rollNo}')" title="Edit Record">✏️</button>
              <button class="action-icon-btn action-icon-danger" onclick="openDeleteModal('${s.rollNo}')" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
        });

        html += `
          </tbody>
        </table>
      </div>
    `;
        container.innerHTML = html;
    }
}

// Detailed Student Profile Modal
function openProfileModal(rollNo) {
    const student = students.find(s => s.rollNo === rollNo);
    if (!student) {
        showToast("Student profile not found", "error");
        return;
    }

    const modal = document.getElementById("profile-modal");
    const modalContent = document.getElementById("profile-modal-body");
    if (!modal || !modalContent) return;

    const initials = student.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    const attClass = getAttendanceColorClass(student.attendance);
    const attBadge = getAttendanceBadgeClass(student.attendance);
    const statusBadge = getStatusBadgeClass(student.status);

    modalContent.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar">${initials}</div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <h2 class="profile-name">${student.name}</h2>
          <span class="tag ${statusBadge}">${student.status}</span>
        </div>
        <div class="profile-sub">${student.rollNo} • ${student.department} • ${student.year}</div>
      </div>
    </div>

    <div class="profile-grid">
      <div class="profile-stat-box">
        <span class="stat-box-label">Semester</span>
        <span class="stat-box-val">Semester ${student.semester}</span>
      </div>
      <div class="profile-stat-box">
        <span class="stat-box-label">Attendance Score</span>
        <span class="stat-box-val ${attClass}">${student.attendance}% (${student.attendance >= 75 ? 'Eligible' : 'Critical'})</span>
      </div>
      <div class="profile-stat-box">
        <span class="stat-box-label">Contact Phone</span>
        <span class="stat-box-val">${student.phone}</span>
      </div>
      <div class="profile-stat-box">
        <span class="stat-box-label">Official Email</span>
        <span class="stat-box-val" style="font-size: 0.88rem;">${student.email}</span>
      </div>
    </div>

    <div class="profile-section">
      <div class="profile-section-title">Enrolled Electives & Course Modules</div>
      <div class="tag-list">
        ${student.electives.map(e => `<span class="tag tag-cyan">📚 ${e}</span>`).join("")}
      </div>
    </div>

    <div class="profile-section">
      <div class="profile-section-title">Attendance Status Assessment</div>
      <div class="progress-bar-track" style="height: 10px; margin-bottom: 0.5rem;">
        <div class="progress-bar-fill ${attClass}" style="width: ${student.attendance}%;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.825rem; color: var(--text-muted);">
        <span>Required Threshold: 75%</span>
        <span>Current: ${student.attendance}%</span>
      </div>
    </div>

    <div class="modal-footer" style="padding: 1.5rem 0 0; margin-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-outline" onclick="printStudentProfile('${student.rollNo}')">🖨️ Print Profile</button>
        <button class="btn btn-primary" onclick="closeModal('profile-modal'); openEditModal('${student.rollNo}')">✏️ Edit Details</button>
      </div>
      <button class="btn btn-outline" onclick="closeModal('profile-modal')">Close</button>
    </div>
  `;

    modal.classList.add("active");
}

function printStudentProfile(rollNo) {
    window.print();
}

// ========================================================
// FEATURE 3: UPDATE STUDENT (EDIT & PROMOTE)
// ========================================================
function openEditModal(rollNo) {
    const student = students.find(s => s.rollNo === rollNo);
    if (!student) {
        showToast("Student not found for editing", "error");
        return;
    }

    const modal = document.getElementById("edit-modal");
    if (!modal) return;

    document.getElementById("edit-roll").value = student.rollNo;
    document.getElementById("edit-roll-display").textContent = student.rollNo;
    document.getElementById("edit-name").value = student.name;
    document.getElementById("edit-email").value = student.email;
    document.getElementById("edit-phone").value = student.phone;
    document.getElementById("edit-dept").value = student.department;
    document.getElementById("edit-sem").value = student.semester;
    document.getElementById("edit-attendance").value = student.attendance;
    document.getElementById("edit-attendance-val").textContent = `${student.attendance}%`;
    document.getElementById("edit-status").value = student.status;

    // Electives checkboxes
    const electivesContainer = document.getElementById("edit-electives");
    if (electivesContainer) {
        electivesContainer.querySelectorAll("input[type=checkbox]").forEach(cb => {
            cb.checked = student.electives.includes(cb.value);
        });
    }

    // Promote button label
    const promoteBtn = document.getElementById("btn-quick-promote");
    if (promoteBtn) {
        if (student.semester >= 8) {
            promoteBtn.disabled = true;
            promoteBtn.textContent = "🎓 Max Semester Reached (Sem 8)";
        } else {
            promoteBtn.disabled = false;
            promoteBtn.textContent = `🚀 Promote to Semester ${student.semester + 1}`;
        }
    }

    modal.classList.add("active");
}

function setupEditStudentForm() {
    const form = document.getElementById("edit-student-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const rollNo = document.getElementById("edit-roll").value;
        const student = students.find(s => s.rollNo === rollNo);
        if (!student) return;

        student.name = document.getElementById("edit-name").value.trim();
        student.email = document.getElementById("edit-email").value.trim();
        student.phone = document.getElementById("edit-phone").value.trim();
        student.department = document.getElementById("edit-dept").value;
        student.semester = parseInt(document.getElementById("edit-sem").value, 10);
        student.year = calculateYear(student.semester);
        student.attendance = parseInt(document.getElementById("edit-attendance").value, 10);
        student.status = document.getElementById("edit-status").value;

        const checkedElectives = Array.from(document.querySelectorAll("#edit-electives input:checked"))
            .map(cb => cb.value);
        student.electives = checkedElectives.length > 0 ? checkedElectives : student.electives;

        saveStudents();
        closeModal("edit-modal");
        renderDirectory();
        showToast(`Student "${student.name}" updated successfully!`, "success");
    });

    // Promote semester click
    const promoteBtn = document.getElementById("btn-quick-promote");
    if (promoteBtn) {
        promoteBtn.addEventListener("click", () => {
            const rollNo = document.getElementById("edit-roll").value;
            const student = students.find(s => s.rollNo === rollNo);
            if (!student) return;

            if (student.semester < 8) {
                student.semester += 1;
                student.year = calculateYear(student.semester);
                document.getElementById("edit-sem").value = student.semester;
                saveStudents();
                showToast(`Promoted ${student.name} to Semester ${student.semester} (${student.year})!`, "success");
                openEditModal(student.rollNo); // refresh modal fields
                renderDirectory();
            }
        });
    }

    // Attendance slider sync
    const attSlider = document.getElementById("edit-attendance");
    const attVal = document.getElementById("edit-attendance-val");
    if (attSlider && attVal) {
        attSlider.addEventListener("input", () => {
            attVal.textContent = `${attSlider.value}%`;
        });
    }
}

// ========================================================
// FEATURE 4: DELETE STUDENT (SAFEGUARD & UNDO)
// ========================================================
function openDeleteModal(rollNo) {
    const student = students.find(s => s.rollNo === rollNo);
    if (!student) {
        showToast("Student not found", "error");
        return;
    }

    const modal = document.getElementById("delete-modal");
    const msgEl = document.getElementById("delete-student-details");
    const confirmBtn = document.getElementById("btn-confirm-delete");
    const archiveBtn = document.getElementById("btn-archive-delete");

    if (!modal || !msgEl || !confirmBtn) return;

    msgEl.innerHTML = `
    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); padding: 1rem; margin: 1rem 0;">
      <div style="font-weight: 700; color: #fca5a5; font-size: 1.05rem;">${student.name}</div>
      <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 0.25rem;">
        Roll No: <strong>${student.rollNo}</strong> • ${student.department} (Sem ${student.semester})
      </div>
    </div>
    <p style="color: var(--text-muted); font-size: 0.9rem;">
      You can permanently remove this student record, or safely archive them by marking their status as <strong>Graduated</strong>.
    </p>
  `;

    // Permanent Delete
    confirmBtn.onclick = () => {
        executeDeleteStudent(student.rollNo);
        closeModal("delete-modal");
    };

    // Archive / Mark Graduated Safe Action
    if (archiveBtn) {
        archiveBtn.onclick = () => {
            student.status = "Graduated";
            saveStudents();
            closeModal("delete-modal");
            renderDirectory();
            showToast(`Student ${student.name} archived as "Graduated" safely!`, "info");
        };
    }

    modal.classList.add("active");
}

function executeDeleteStudent(rollNo) {
    const index = students.findIndex(s => s.rollNo === rollNo);
    if (index === -1) return;

    const deletedStudent = students[index];
    lastDeletedStudent = { student: deletedStudent, index };

    students.splice(index, 1);
    saveStudents();
    renderDirectory();

    showToast(
        `Removed "${deletedStudent.name}" (${deletedStudent.rollNo})`,
        "warning",
        () => {
            // Undo callback
            if (lastDeletedStudent) {
                students.splice(lastDeletedStudent.index, 0, lastDeletedStudent.student);
                saveStudents();
                renderDirectory();
                showToast(`Restored "${lastDeletedStudent.student.name}"!`, "success");
                lastDeletedStudent = null;
            }
        }
    );
}

// ========================================================
// FEATURE 5: SEARCH STUDENT (MULTI-PARAMETER FAST QUERY)
// ========================================================
function setupSearchFeature() {
    const searchInput = document.getElementById("search-input");
    const deptFilter = document.getElementById("search-dept");
    const semFilter = document.getElementById("search-sem");
    const statusFilter = document.getElementById("search-status");
    const attFilter = document.getElementById("search-att");
    const sortSelect = document.getElementById("search-sort");
    const resetBtn = document.getElementById("search-reset-btn");

    if (searchInput) searchInput.addEventListener("input", runSearch);
    if (deptFilter) deptFilter.addEventListener("change", runSearch);
    if (semFilter) semFilter.addEventListener("change", runSearch);
    if (statusFilter) statusFilter.addEventListener("change", runSearch);
    if (attFilter) attFilter.addEventListener("change", runSearch);
    if (sortSelect) sortSelect.addEventListener("change", runSearch);

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (deptFilter) deptFilter.value = "all";
            if (semFilter) semFilter.value = "all";
            if (statusFilter) statusFilter.value = "all";
            if (attFilter) attFilter.value = "all";
            if (sortSelect) sortSelect.value = "name-asc";
            runSearch();
        });
    }
}

function runSearch() {
    const query = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
    const dept = document.getElementById("search-dept")?.value || "all";
    const sem = document.getElementById("search-sem")?.value || "all";
    const status = document.getElementById("search-status")?.value || "all";
    const att = document.getElementById("search-att")?.value || "all";
    const sort = document.getElementById("search-sort")?.value || "name-asc";

    let results = students.filter(s => {
        // Text search matching Roll No, Name, Dept, Email, Phone
        if (query) {
            const matchText = (
                s.name.toLowerCase().includes(query) ||
                s.rollNo.toLowerCase().includes(query) ||
                s.department.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                s.phone.toLowerCase().includes(query) ||
                s.electives.some(e => e.toLowerCase().includes(query))
            );
            if (!matchText) return false;
        }

        // Department Filter
        if (dept !== "all" && s.department !== dept) return false;

        // Semester Filter
        if (sem !== "all" && String(s.semester) !== sem) return false;

        // Status Filter
        if (status !== "all" && s.status !== status) return false;

        // Attendance Filter
        if (att === "low" && s.attendance >= 75) return false;
        if (att === "good" && s.attendance < 75) return false;
        if (att === "high" && s.attendance < 85) return false;

        return true;
    });

    // Sorting
    results.sort((a, b) => {
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        if (sort === "name-desc") return b.name.localeCompare(a.name);
        if (sort === "roll-asc") return a.rollNo.localeCompare(b.rollNo);
        if (sort === "att-high") return b.attendance - a.attendance;
        if (sort === "att-low") return a.attendance - b.attendance;
        return 0;
    });

    renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
    const container = document.getElementById("search-results-container");
    const countBadge = document.getElementById("search-count-badge");
    if (!container) return;

    if (countBadge) {
        countBadge.textContent = `${results.length} student${results.length === 1 ? '' : 's'} matched`;
    }

    if (results.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No Matching Records</h3>
        <p>No students match your query "${query || 'criteria'}". Try broadening your search or resetting filters.</p>
        <button class="btn btn-outline" style="margin-top: 1rem;" onclick="document.getElementById('search-reset-btn').click()">
          🔄 Reset Filters
        </button>
      </div>
    `;
        return;
    }

    let html = `
    <div class="table-responsive">
      <table class="sms-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Roll Number</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Attendance</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

    results.forEach(s => {
        const attBadge = getAttendanceBadgeClass(s.attendance);
        const statusBadge = getStatusBadgeClass(s.status);

        // Highlight helper
        const highlight = (text) => {
            if (!query) return text;
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, `<mark class="search-highlight">$1</mark>`);
        };

        html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: #fff;">${highlight(s.name)}</div>
          <div style="color: var(--text-subtle); font-size: 0.8rem;">${highlight(s.email)}</div>
        </td>
        <td><code>${highlight(s.rollNo)}</code></td>
        <td>${highlight(s.department)}</td>
        <td>Sem ${s.semester}</td>
        <td><span class="tag ${attBadge}">${s.attendance}%</span></td>
        <td><span class="tag ${statusBadge}">${s.status}</span></td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.35rem;">
            <button class="action-icon-btn" onclick="openProfileModal('${s.rollNo}')" title="View Profile">👁️</button>
            <button class="action-icon-btn" onclick="openEditModal('${s.rollNo}')" title="Edit">✏️</button>
            <button class="action-icon-btn action-icon-danger" onclick="openDeleteModal('${s.rollNo}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    container.innerHTML = html;
}

// ========================================================
// FEATURE 6: STUDENT REPORTS (ANALYTICS & EXPORT)
// ========================================================
function renderReports() {
    const container = document.getElementById("reports-container");
    if (!container) return;

    const total = students.length;
    if (total === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No Data for Reports</h3>
        <p>Add students to view analytical reports, attendance charts, and download class rosters.</p>
      </div>
    `;
        return;
    }

    // Calculate metrics
    const activeCount = students.filter(s => s.status === "Active").length;
    const avgAtt = (students.reduce((acc, s) => acc + s.attendance, 0) / total).toFixed(1);
    const defaulters = students.filter(s => s.attendance < 75);
    const excellentAtt = students.filter(s => s.attendance >= 85);

    // Department counts
    const deptCounts = {};
    students.forEach(s => {
        deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
    });

    // Top department
    let topDept = "None";
    let maxDeptCount = 0;
    for (const [dept, cnt] of Object.entries(deptCounts)) {
        if (cnt > maxDeptCount) {
            maxDeptCount = cnt;
            topDept = dept;
        }
    }

    let html = `
    <!-- Analytical KPI Metrics -->
    <div class="reports-kpi-grid">
      <div class="report-kpi-card">
        <div class="kpi-label">Total Enrollment</div>
        <div class="kpi-val">${total}</div>
        <div class="kpi-sub">${activeCount} Active Students</div>
      </div>
      <div class="report-kpi-card">
        <div class="kpi-label">Avg Attendance</div>
        <div class="kpi-val" style="color: ${avgAtt >= 75 ? 'var(--accent-emerald)' : '#f87171'};">${avgAtt}%</div>
        <div class="kpi-sub">Overall Class Average</div>
      </div>
      <div class="report-kpi-card">
        <div class="kpi-label">Attendance Defaulters</div>
        <div class="kpi-val" style="color: #f87171;">${defaulters.length}</div>
        <div class="kpi-sub">&lt; 75% Requirement (${((defaulters.length / total) * 100).toFixed(0)}%)</div>
      </div>
      <div class="report-kpi-card">
        <div class="kpi-label">Honors Attendance</div>
        <div class="kpi-val" style="color: var(--secondary);">${excellentAtt.length}</div>
        <div class="kpi-sub">&ge; 85% Score (${((excellentAtt.length / total) * 100).toFixed(0)}%)</div>
      </div>
    </div>

    <!-- Charts & Tallies Grid -->
    <div class="reports-split-grid">
      <!-- Department Distribution -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 1rem;">
          <h3 class="card-title" style="font-size: 1.1rem;">
            <span>🏛️</span> Department Distribution
          </h3>
          <span class="tag tag-cyan">${Object.keys(deptCounts).length} Branches</span>
        </div>
        <div class="chart-bars-list">
  `;

    for (const [dept, cnt] of Object.entries(deptCounts)) {
        const pct = ((cnt / total) * 100).toFixed(1);
        html += `
      <div class="chart-bar-item">
        <div class="chart-bar-labels">
          <span style="font-weight: 600; color: #fff;">${dept}</span>
          <span style="color: var(--text-muted); font-size: 0.85rem;">${cnt} students (${pct}%)</span>
        </div>
        <div class="progress-bar-track" style="height: 8px;">
          <div class="progress-bar-fill" style="width: ${pct}%; background: var(--gradient-brand);"></div>
        </div>
      </div>
    `;
    }

    html += `
        </div>
      </div>

      <!-- Attendance Risk Tally -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 1rem;">
          <h3 class="card-title" style="font-size: 1.1rem;">
            <span>⏱️</span> Attendance Health Tally
          </h3>
          <span class="tag tag-emerald">Institutional Check</span>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label"><span style="color: var(--accent-emerald);">●</span> Safe Zone (&ge; 85%)</span>
            <span class="info-val" style="color: var(--accent-emerald);">${excellentAtt.length} Students</span>
          </div>
          <div class="info-row">
            <span class="info-label"><span style="color: var(--secondary);">●</span> Moderate (75% - 84%)</span>
            <span class="info-val" style="color: var(--secondary);">${students.filter(s => s.attendance >= 75 && s.attendance < 85).length} Students</span>
          </div>
          <div class="info-row">
            <span class="info-label"><span style="color: #f87171;">●</span> Critical / Defaulter (&lt; 75%)</span>
            <span class="info-val" style="color: #f87171;">${defaulters.length} Students</span>
          </div>
        </div>

        <div style="margin-top: 1.5rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); padding: 0.85rem;">
          <div style="font-size: 0.825rem; font-weight: 600; color: #fca5a5; margin-bottom: 0.35rem;">⚠️ Defaulters Advisory:</div>
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
            ${defaulters.length > 0
            ? `${defaulters.map(d => d.name).join(", ")} must submit medical certificates or attend remedial lectures to be eligible for semester end exams.`
            : 'All students currently satisfy the minimum 75% attendance criterion.'}
          </p>
        </div>
      </div>
    </div>

    <!-- Export & Print Actions -->
    <div class="card" style="margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h4 style="font-family: var(--font-heading); color: #fff; font-size: 1.05rem; margin-bottom: 0.25rem;">
          📄 Export Class Roster & Analytical Records
        </h4>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          Generate complete CSV spreadsheet data or print clean institutional summaries.
        </p>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-outline" id="btn-export-csv" onclick="exportStudentsToCSV()">
          📥 Export CSV
        </button>
        <button class="btn btn-primary" onclick="window.print()">
          🖨️ Print Summary Report
        </button>
      </div>
    </div>
  `;

    container.innerHTML = html;
}

// CSV Export Utility
function exportStudentsToCSV() {
    if (students.length === 0) {
        showToast("No student records available to export.", "warning");
        return;
    }

    const headers = [
        "Roll Number",
        "Full Name",
        "Email",
        "Phone",
        "Department",
        "Semester",
        "Academic Year",
        "Attendance %",
        "Status",
        "Enrolled Electives",
        "Enrollment Date"
    ];

    const rows = students.map(s => [
        `"${s.rollNo}"`,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.phone}"`,
        `"${s.department}"`,
        s.semester,
        `"${s.year}"`,
        s.attendance,
        `"${s.status}"`,
        `"${s.electives.join('; ')}"`,
        `"${s.joinedDate || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_management_roster_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Downloaded official Student Roster CSV!", "success");
}

// Modal management
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    }
}

function setupModals() {
    // Close buttons inside modals
    document.querySelectorAll(".modal-close-trigger").forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = btn.closest(".sms-modal-overlay");
            if (modal) modal.classList.remove("active");
        });
    });

    // Click outside backdrop to close
    document.querySelectorAll(".sms-modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
            }
        });
    });

    // ESC key closes modals
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".sms-modal-overlay.active").forEach(m => m.classList.remove("active"));
        }
    });
}

// Global Initialization
document.addEventListener("DOMContentLoaded", () => {
    loadStudents();
    setupFeatureCardTriggers();
    setupAddStudentForm();
    setupEditStudentForm();
    setupSearchFeature();
    setupModals();

    // Tab buttons
    document.querySelectorAll(".studio-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");
            if (tab) switchTab(tab);
        });
    });

    // View mode toggle (Grid / Table)
    const viewToggle = document.getElementById("view-mode-toggle");
    if (viewToggle) {
        viewToggle.addEventListener("click", () => {
            currentViewMode = currentViewMode === "grid" ? "table" : "grid";
            viewToggle.textContent = currentViewMode === "grid" ? "📋 Table View" : "🔲 Grid View";
            renderDirectory();
        });
    }

    // Quick Action Buttons
    const resetBtn = document.getElementById("btn-reset-demo-data");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetDefaultData);
    }

    // Initial render
    updateStatsBar();
    renderDirectory();
    renderReports();
});

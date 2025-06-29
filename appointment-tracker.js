console.log("✅ Script is running");

// ================ FIXED LOGGING ================
// Replaced logToPanel with safe console.log calls
function safeLog(message) {
console.log(message);
}

// ================ FIREBASE INITIALIZATION ================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getFirestore,
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc,
onSnapshot,
Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
getAuth,
onAuthStateChanged,
signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

async function getFirebaseConfig() {
try {
const response = await fetch(
"https://cfr-backend-1.onrender.com/api/firebase-config"
);
return await response.json();
} catch (error) {
console.error("Error fetching Firebase config:", error);
alert("Failed to initialize Firebase");
return null;
}
}

(async () => {
const firebaseConfig = await getFirebaseConfig();
if (!firebaseConfig) {
alert("App configuration failed to load.");
return;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appointmentsCollection = collection(db, "appointments");
const customersCollection = collection(db, "customers");
const partsCollection = collection(db, "parts");

// ✅ Start your app logic
initApp(auth, db, appointmentsCollection, customersCollection, partsCollection);
})();
createDebugPanel();
logToPanel("✅ Debug panel initialized on load");
document.addEventListener("DOMContentLoaded", () => {
logToPanel("✅ DOM fully loaded");
});


// ================ UTILITY FUNCTIONS ================
function logAction(action, user = "guest") {
fetch("https://cfr-backend-1.onrender.com/api/log", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ action, user }),
}).catch((err) => {
console.error("Logging failed:", err);
});
}

function cleanInput(input) {
return input.replace(/<[^>]*>/g, '').trim();
}

function formatTimestamp(dateObj) {
if (!dateObj) return "N/A";

try {
return dateObj.toLocaleString('en-US', {
month: 'short',
day: 'numeric',
year: 'numeric',
hour: 'numeric',
minute: '2-digit'
});
} catch (e) {
console.error("Date format error:", e);
return "Invalid Date";
}
}

function convertTo24Hour(time12h) {
if (!time12h) return "12:00";
const [time, modifier] = time12h.split(' ');
let [hours, minutes] = time.split(':');

if (hours === '12') hours = '00';
if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

return `${hours}:${minutes}`;
}

function formatTimeForDisplay(time24) {
if (!time24) return "";
const [hours, minutes] = time24.split(':');
const hourNum = parseInt(hours, 10);
if (hourNum === 0) return `12:${minutes} AM`;
if (hourNum < 12) return `${hourNum}:${minutes} AM`;
if (hourNum === 12) return `12:${minutes} PM`;
return `${hourNum - 12}:${minutes} PM`;
}

function getBusinessDays(month, year) {
let count = 0;
const daysInMonth = new Date(year, month + 1, 0).getDate();
for (let day = 1; day <= daysInMonth; day++) {
const d = new Date(year, month, day);
if (d.getDay() !== 0 && d.getDay() !== 6) count++;
}
return count;
}

function formatMonthYear(month, year) {
return new Date(year, month).toLocaleString("default", {
month: "long",
year: "numeric",
});
}

function showLoading(show = true) {
const loadingElement = document.getElementById('loading-overlay');
if (loadingElement) {
loadingElement.style.display = show ? 'flex' : 'none';
}
}

// ================ MAIN APPLICATION ================
function initApp(auth, db, appointmentsCollection, customersCollection, partsCollection) {
// ================ GLOBAL STATE ================
let appointments = [];
let customers = [];
let parts = [];
let editingAppointmentId = null;
let editingCustomerId = null;
let chartInstance = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const defaultPriceInitial = 150;
let defaultPrice = defaultPriceInitial;
let allowPastEdits = true;
let currentPage = 1;
const appointmentsPerPage = 20;
let sessionTimer;
let logoutWarningTimer;
let countdownInterval;

// Status map for appointments
const statusMap = {
scheduled: { text: "Scheduled", class: "status-scheduled" },
draft: { text: "Draft", class: "status-draft" },
released: { text: "Released", class: "status-released" },
in_progress: { text: "In Progress", class: "status-inprogress" },
cancelled: { text: "Cancelled", class: "status-cancelled" },
needs_parts: { text: "Needs Parts", class: "status-warning" },
parts_ordered: { text: "Parts Ordered", class: "status-inprogress" },
repair_completed: { text: "Completed", class: "status-released" }
};


function activateView(viewName) {
// Map sidebar views to tab views where necessary
const viewMap = {
list: "list",
calendar: "calendar",
settings: "settings",
customers: "customers",
reports: "reports",
help: "help",
logout: "logout"
};

const targetView = viewMap[viewName] || viewName;

// Update sidebar active state
document.querySelectorAll('.nav-links a').forEach(link => {
link.classList.toggle('active', link.dataset.view === viewName);
});

// Update top tabs if applicable
document.querySelectorAll('.tab').forEach(tab => {
if (tab.dataset.tab === targetView) {
tab.classList.add('active');
showView(targetView);  // Add this line to activate content
} else {
tab.classList.remove('active');
}
});

// Show the actual content view
showView(targetView);
}

function showView(targetView) {
// Hide all views
document.querySelectorAll('.tab-content').forEach(view => {
view.classList.remove('active');
});

// Show requested view
const viewElement = document.getElementById(`${targetView}-view`);
if (viewElement) viewElement.classList.add('active');

// Initialize view-specific content
switch(targetView) {
  case "calendar":
      safeLog("🗓 Calendar view activated");
      renderCalendar();
      break;
  case "stats":
      safeLog("📈 Statistics view activated");
      initChart();
      break;
  case "customers":
      safeLog("👥 Customers view activated");
      fetchCustomers();
      break;
  case "settings":
      safeLog("⚙️ Settings view activated");
      loadSettings();
      break;
  case "reports":
      safeLog("📊 Reports view activated");
      generateReports();
      break;
  case "help":
      safeLog("🆘 Help view activated");
      loadHelpContent();
      break;
  case "logout":
      logout();
      break;
}
}
document.addEventListener('DOMContentLoaded', () => {
safeLog("✅ DOM fully loaded");
document.querySelectorAll('.nav-links a').forEach(link => {
link.addEventListener('click', (e) => {
e.preventDefault();
const view = link.dataset.view;
console.log("Sidebar clicked:", view);
activateView(view);
});
});
});

// ================ AUTHENTICATION HANDLING ================
onAuthStateChanged(auth, (user) => {
if (!user) {
window.location.href = "admin-login.html";
} else {
// Show logged-in user's email
document.getElementById("user-name").textContent = user.email;
// Log when dashboard is opened
logAction("Dashboard loaded", user.email);
fetchAppointments();
startSessionTimer(auth);
}
});

// Logout function
function logout() {
if (
confirm(
"Are you sure you want to logout? All unsaved changes will be lost."
)
) {
signOut(auth)
.then(() => {
logAction(
"User logged out",
auth.currentUser?.email || "guest"
);
window.location.href = "admin-login.html";
})
.catch((error) => {
console.error("Logout error:", error);
showToast("Logout failed", true);
});
}
}

// ================ SESSION MANAGEMENT ================
function startSessionTimer(auth) {
resetSessionTimer(auth);

// Reset timer on user activity
["mousemove", "keypress", "click", "scroll"].forEach((evt) => {
document.addEventListener(evt, () => resetSessionTimer(auth));
});
}

function resetSessionTimer(auth) {
clearTimeout(sessionTimer);
clearTimeout(logoutWarningTimer);
clearInterval(countdownInterval);
removeLogoutWarning();
sessionTimer = setTimeout(() => {
signOut(auth).then(() => {
logAction(
"Session auto-logout due to inactivity",
auth.currentUser?.email || "guest"
);
showToast("Session expired due to inactivity");
window.location.href = "admin-login.html";
});
}, 30 * 60 * 1000); // 30 minutes
}

function showLogoutWarning(auth) {
let countdown = 60;
const warningDiv = document.createElement("div");
warningDiv.className = "logout-warning";
warningDiv.innerHTML = `
<div class="toast warning">
⚠️ You will be logged out in <span id="logout-countdown">${countdown}</span> seconds due to inactivity.
</div>
`;
document.body.appendChild(warningDiv);

countdownInterval = setInterval(() => {
countdown--;
document.getElementById("logout-countdown").textContent = countdown;
if (countdown <= 0) {
clearInterval(countdownInterval);
autoSaveIfEditing();
signOut(auth).then(() => {
window.location.href = "admin-login.html";
});
}
}, 1000);
}

function removeLogoutWarning() {
const warning = document.querySelector(".logout-warning");
if (warning) warning.remove();
}

function autoSaveIfEditing() {
// Implementation remains the same
}

// ================ TOAST NOTIFICATIONS ================
function showToast(message, isError = false) {
const toast = document.createElement("div");
toast.className = `toast ${isError ? "error" : ""}`;
toast.textContent = message;
document.body.appendChild(toast);

setTimeout(() => toast.classList.add("show"), 100);
setTimeout(() => {
toast.classList.remove("show");
setTimeout(() => toast.remove(), 300);
}, 3000);
}

// ================ DATA MANAGEMENT ================
// Fetch appointments from Firestore
async function fetchAppointments() {
showLoading(true);
try {
const snapshot = await getDocs(appointmentsCollection);
appointments = snapshot.docs.map((doc) => {
const data = doc.data();
return {
id: doc.id,
...data,
dateObj: data.date ? data.date.toDate() : new Date()
};
});
renderAppointmentsTable();
updateStats();
renderCalendar();
updateCalendarSummary();
updatePerformanceMetrics();
initChart();
} catch (error) {
console.error("Error fetching appointments:", error);
showToast("Failed to fetch appointments", true);
} finally {
showLoading(false);
}
}

// Fetch customers from Firestore
async function fetchCustomers() {
logToPanel("👥 Customers view activated");
showLoading(true);
try {
const snapshot = await getDocs(customersCollection);
customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
renderCustomersTable();
} catch (error) {
console.error("Error fetching customers:", error);
showToast("Failed to load customers", true);
} finally {
showLoading(false);
}
}

// Fetch parts from Firestore
async function fetchParts() {
showLoading(true);
try {
const snapshot = await getDocs(partsCollection);
parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
renderPartsTable();
} catch (error) {
showToast("Failed to load parts", true);
console.error(error);
} finally {
showLoading(false);
}
}

// Save (add or update) appointment in Firestore
async function saveAppointment(data) {
showLoading(true);
try {
if (editingAppointmentId) {
const docRef = doc(db, "appointments", editingAppointmentId);
await updateDoc(docRef, data);
showToast("Appointment updated successfully");
logAction("Appointment updated", auth.currentUser?.email || "guest");
} else {
await addDoc(appointmentsCollection, data);
showToast("Appointment added successfully");
logAction("Appointment added", auth.currentUser?.email || "guest");
}
editingAppointmentId = null;
await fetchAppointments();
} catch (error) {
console.error("Error saving appointment:", error);
showToast("Failed to save appointment", true);
logAction("Appointment save failed", auth.currentUser?.email || "guest");
} finally {
showLoading(false);
}
}

// Delete appointment from Firestore
async function deleteAppointment(id) {
if (!confirm("Are you sure you want to delete this appointment?")) return;

showLoading(true);
try {
await deleteDoc(doc(db, "appointments", id));
showToast("Appointment deleted successfully");
logAction("Appointment deleted", auth.currentUser?.email || "guest");
await fetchAppointments();
} catch (error) {
console.error("Error deleting appointment:", error);
showToast("Failed to delete appointment", true);
logAction("Appointment delete failed", auth.currentUser?.email || "guest");
} finally {
showLoading(false);
}
}

// Save customer to Firestore
async function saveCustomer() {
showLoading(true);
const customerData = {
name: document.getElementById('customer-name').value.trim(),
phone: document.getElementById('customer-phone').value.trim(),
email: document.getElementById('customer-email').value.trim(),
address: document.getElementById('customer-address').value.trim(),
notes: document.getElementById('customer-notes').value.trim(),
createdAt: new Date().toISOString()
};

try {
if (editingCustomerId) {
await updateDoc(doc(db, "customers", editingCustomerId), customerData);
showToast("Customer updated!");
} else {
await addDoc(customersCollection, customerData);
showToast("Customer added!");
}
document.getElementById('customer-modal').classList.remove('active');
fetchCustomers();
} catch (error) {
showToast("Failed to save customer", true);
} finally {
showLoading(false);
}
}

// ================ RENDERING FUNCTIONS ================
// Render appointments table
function renderAppointmentsTable(list = appointments) {
const tbody = document.getElementById("appointments-body");
tbody.innerHTML = "";

const start = (currentPage - 1) * appointmentsPerPage;
const pageApps = list.slice(start, start + appointmentsPerPage);

pageApps.forEach((app) => {
const statusInfo = statusMap[app.status] || {
text: app.status || "",
class: "",
};
const row = document.createElement("tr");
row.innerHTML = `
<td>#${app.id}</td>
<td>${app.customer}</td>
<td>${app.equipment || ""}</td>
<td>${formatTimestamp(app.dateObj)}</td>
<td><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></td>
<td>$${app.price || 0}</td>
<td class="action-cell">
<button class="action-btn edit-btn" data-id="${app.id}" aria-label="Edit appointment"><i class="fas fa-edit"></i></button>
<button class="action-btn delete-btn" data-id="${app.id}" aria-label="Delete appointment"><i class="fas fa-trash"></i></button>
</td>
`;
tbody.appendChild(row);
});

// Add click listeners to buttons
tbody.querySelectorAll(".edit-btn").forEach((btn) => {
btn.onclick = () => {
openEditModal(btn.dataset.id);
};
});

tbody.querySelectorAll(".delete-btn").forEach((btn) => {
btn.onclick = () => {
deleteAppointment(btn.dataset.id);
};
});

// Update page indicator
const totalPages = Math.ceil(list.length / appointmentsPerPage);
document.getElementById("page-indicator").textContent = `Page ${currentPage} of ${totalPages || 1}`;

// Enable/disable pagination buttons
document.getElementById("prev-page").disabled = currentPage === 1;
document.getElementById("next-page").disabled = currentPage >= totalPages;
}

// Render customers table
function renderCustomersTable() {
const tbody = document.getElementById('customers-body');
tbody.innerHTML = '';

customers.forEach(customer => {
const row = document.createElement('tr');
row.innerHTML = `
<td>${customer.name}</td>
<td>${customer.phone}</td>
<td>${customer.email || '-'}</td>
<td>${customer.favoriteEquipment || '-'}</td>
<td>${customer.lastAppointment || 'Never'}</td>
<td class="action-cell">
<button class="action-btn edit-btn" data-id="${customer.id}">
<i class="fas fa-edit"></i>
</button>
<button class="action-btn delete-btn" data-id="${customer.id}">
<i class="fas fa-trash"></i>
</button>
</td>
`;
tbody.appendChild(row);
});

// Attach event listeners to each edit/delete button
document.querySelectorAll('.edit-btn').forEach(btn => {
btn.addEventListener('click', () => openEditCustomerModal(btn.dataset.id));
});
document.querySelectorAll('.delete-btn').forEach(btn => {
btn.addEventListener('click', () => {
if (confirm("Are you sure you want to delete this customer?")) {
deleteCustomer(btn.dataset.id);
}
});
});
}

// Delete customer
async function deleteCustomer(id) {
showLoading(true);
try {
await deleteDoc(doc(db, "customers", id));
showToast("Customer deleted successfully");
fetchCustomers();
} catch (error) {
showToast("Failed to delete customer", true);
console.error(error);
} finally {
showLoading(false);
}
}

// Render parts table
function renderPartsTable() {
const tbody = document.getElementById('parts-body');
tbody.innerHTML = '';

parts.forEach(part => {
const row = document.createElement('tr');
row.innerHTML = `
<td>${part.name}</td>
<td>${part.number}</td>
<td>${part.equipmentType}</td>
<td class="${part.quantity < 5 ? 'text-danger' : ''}">
${part.quantity} ${part.quantity < 5 ? '⚠️' : ''}
</td>
<td>$${part.price?.toFixed(2) || '0.00'}</td>
<td>${part.supplier}</td>
<td class="action-cell">
<button class="action-btn edit-btn" data-id="${part.id}">✏️</button>
<button class="action-btn delete-btn" data-id="${part.id}">🗑️</button>
</td>
`;
tbody.appendChild(row);
});
}

// Stats update
function updateStats() {
document.getElementById("total-appointments").textContent =
appointments.length;
document.getElementById("scheduled-count").textContent =
appointments.filter((a) => a.status === "scheduled").length;
document.getElementById("released-count").textContent =
appointments.filter((a) => a.status === "released").length;
document.getElementById("inprogress-count").textContent =
appointments.filter((a) => a.status === "in_progress").length;
}

// Calendar rendering and summary - FIXED
function renderCalendar() {
logToPanel("🗓 Calendar view activated");
const calendarGrid = document.getElementById("calendar-days");
calendarGrid.innerHTML = "";

document.getElementById("current-month-year").textContent =
formatMonthYear(currentMonth, currentYear);

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
daysOfWeek.forEach((day) => {
const dayHeader = document.createElement("div");
dayHeader.className = "calendar-day-header";
dayHeader.textContent = day;
calendarGrid.appendChild(dayHeader);
});

const firstDay = new Date(currentYear, currentMonth, 1).getDay();
const totalDays = new Date(
currentYear,
currentMonth + 1,
0
).getDate();

for (let i = 0; i < firstDay; i++) {
const emptyCell = document.createElement("div");
emptyCell.className = "calendar-day empty";
calendarGrid.appendChild(emptyCell);
}

// Precompute appointments by day
const appointmentsByDay = Array(totalDays + 1).fill().map(() => []);

appointments.forEach(app => {
if (app.dateObj) {
const appMonth = app.dateObj.getMonth();
const appYear = app.dateObj.getFullYear();
const appDay = app.dateObj.getDate();

if (appMonth === currentMonth && appYear === currentYear && appDay >= 1 && appDay <= totalDays) {
appointmentsByDay[appDay].push(app);
}
}
});

for (let day = 1; day <= totalDays; day++) {
const dayCell = document.createElement("div");
dayCell.className = "calendar-day";

const dayNumber = document.createElement("div");
dayNumber.className = "day-number";
dayNumber.textContent = day;
dayCell.appendChild(dayNumber);

const dayAppointments = appointmentsByDay[day];

if (dayAppointments.length > 0) {
const container = document.createElement("div");
container.className = "calendar-appointments";

dayAppointments.forEach((app) => {
const item = document.createElement("div");
item.className = "appointment-item";

// Format time from the Date object
const timeString = app.dateObj.toLocaleTimeString('en-US', {
hour: 'numeric', 
minute: '2-digit'
});

item.textContent = `${app.customer.split(" ")[0]} - ${timeString}`;
container.appendChild(item);
});

dayCell.appendChild(container);
}
calendarGrid.appendChild(dayCell);
}

updateCalendarSummary();
}

function updateCalendarSummary() {
const monthlyApps = appointments.filter((app) => {
if (!app.dateObj) return false;
const d = app.dateObj;
return (
d.getMonth() === currentMonth && d.getFullYear() === currentYear
);
});

const businessDays = getBusinessDays(currentMonth, currentYear);
const monthlyRevenue = monthlyApps
.filter((a) => a.status === "released")
.reduce((sum, a) => sum + (a.price || 0), 0);

document.getElementById("summary-total").textContent =
monthlyApps.length;
document.getElementById("summary-days").textContent = businessDays;
document.getElementById(
"summary-revenue"
).textContent = `$${monthlyRevenue}`;

const utilizationRate = Math.min(
100,
Math.round((monthlyApps.length / (businessDays * 3)) * 100)
);
document.getElementById("summary-utilization").textContent =
utilizationRate + "%";
}

// Performance metrics
function updatePerformanceMetrics() {
const monthlyApps = appointments.filter((app) => {
if (!app.dateObj) return false;
const d = app.dateObj;
return (
d.getMonth() === currentMonth && d.getFullYear() === currentYear
);
});

const releasedThisMonth = monthlyApps.filter(
(a) => a.status === "released"
).length;
const monthlyRevenue = monthlyApps
.filter((a) => a.status === "released")
.reduce((sum, a) => sum + (a.price || 0), 0);

document.getElementById("current-appointments").textContent =
appointments.length;
document.getElementById("monthly-released").textContent =
releasedThisMonth;
document.getElementById(
"monthly-revenue"
).textContent = `$${monthlyRevenue}`;
}

// Chart.js setup
function initChart() {
logToPanel("📈 Statistics view activated");
const ctx = document
.getElementById("appointmentsChart")
.getContext("2d");

// Destroy existing chart if it exists
if (chartInstance) {
chartInstance.destroy();
}

const counts = {
draft: appointments.filter((a) => a.status === "draft").length,
scheduled: appointments.filter((a) => a.status === "scheduled")
.length,
in_progress: appointments.filter((a) => a.status === "in_progress")
.length,
released: appointments.filter((a) => a.status === "released")
.length,
cancelled: appointments.filter((a) => a.status === "cancelled")
.length,
};

chartInstance = new Chart(ctx, {
type: "doughnut",
data: {
labels: [
"Draft",
"Scheduled",
"In Progress",
"Released",
"Cancelled",
],
datasets: [
{
data: Object.values(counts),
backgroundColor: [
"rgba(149, 165, 166, 0.7)",
"rgba(93, 93, 255, 0.7)",
"rgba(52, 152, 219, 0.7)",
"rgba(46, 204, 113, 0.7)",
"rgba(231, 76, 60, 0.7)",
],
borderColor: [
"rgba(149, 165, 166, 1)",
"rgba(93, 93, 255, 1)",
"rgba(52, 152, 219, 1)",
"rgba(46, 204, 113, 1)",
"rgba(231, 76, 60, 1)",
],
borderWidth: 1,
},
],
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
position: "right",
labels: { color: "#f0f0f0", font: { size: 12 } },
},
title: {
display: true,
text: "Appointment Status Distribution",
color: "#f0f0f0",
font: { size: 16 },
},
tooltip: {
callbacks: {
label: (context) => {
const label = context.label || "";
const value = context.raw || 0;
const total = context.dataset.data.reduce(
(a, b) => a + b,
0
);
const pct = total ? Math.round((value / total) * 100) : 0;
return `${label}: ${value} (${pct}%)`;
},
},
},
},
},
});
}
// ================ SETTINGS FUNCTIONS ================
async function loadSettings() {
logToPanel("⚙️ Settings view activated");
try {
// In a real app, this would load from Firestore or localStorage
const settings = {
companyName: "Canadian Fitness Repair",
defaultPrice: 150,
businessHours: "9:00 AM - 6:00 PM",
enablePastEdits: true,
smsEnabled: false,
smsTime: "1",
smsMessage: "Hi {name}! Reminder: Your fitness repair is scheduled for {date} at {time}."
};

document.getElementById("company-name").value = settings.companyName;
document.getElementById("default-price").value = settings.defaultPrice;
document.getElementById("business-hours").value = settings.businessHours;
document.getElementById("enable-past-edits").value = settings.enablePastEdits.toString();
document.getElementById("sms-enabled").value = settings.smsEnabled.toString();
document.getElementById("sms-time").value = settings.smsTime;
document.getElementById("sms-message").value = settings.smsMessage;

showToast("Settings loaded successfully");
} catch (error) {
console.error("Error loading settings:", error);
showToast("Failed to load settings", true);
}
}

// ================ REPORTS FUNCTIONS ================
function generateReports() {
// Generate completed repairs report
logToPanel("📊 Reports view activated");
const completedRepairs = appointments.filter(app => 
app.status === "repair_completed"
);

const tbody = document.getElementById("completed-repairs-body");
tbody.innerHTML = "";

completedRepairs.forEach(app => {
const row = document.createElement("tr");
row.innerHTML = `
<td>#${app.id}</td>
<td>${app.customer}</td>
<td>${app.equipment || "N/A"}</td>
<td>${formatTimestamp(app.dateObj)}</td>
<td>$${app.price || 0}</td>
<td>${calculateRepairTime(app)}</td>
`;
tbody.appendChild(row);
});

// Generate revenue metrics
const monthlyRevenue = completedRepairs
.filter(app => isThisMonth(app.dateObj))
.reduce((sum, app) => sum + (app.price || 0), 0);

const avgRepairCost = completedRepairs.length > 0 
? Math.round(completedRepairs.reduce((sum, app) => sum + (app.price || 0), 0) / completedRepairs.length)
: 0;

document.getElementById("monthly-revenue-report").textContent = `$${monthlyRevenue}`;
document.getElementById("avg-repair-cost").textContent = `$${avgRepairCost}`;

// Generate equipment stats
const equipmentCounts = {};
completedRepairs.forEach(app => {
if (app.equipment) {
equipmentCounts[app.equipment] = (equipmentCounts[app.equipment] || 0) + 1;
}
});

const mostRepaired = Object.keys(equipmentCounts).reduce((a, b) => 
equipmentCounts[a] > equipmentCounts[b] ? a : b, "N/A"
);

document.getElementById("most-repaired").textContent = mostRepaired;

// Generate revenue chart
generateRevenueChart();
}

function generateRevenueChart() {
const ctx = document.getElementById("revenueChart").getContext("2d");

// Generate revenue data for last 6 months
const monthlyRevenue = [];
const now = new Date();

for (let i = 5; i >= 0; i--) {
const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
const revenue = appointments
.filter(app => 
app.status === "repair_completed" && 
isSameMonth(app.dateObj, month)
)
.reduce((sum, app) => sum + (app.price || 0), 0);

monthlyRevenue.push(revenue);
}

// Destroy existing chart if it exists
if (window.revenueChartInstance) {
window.revenueChartInstance.destroy();
}

// Create new chart
window.revenueChartInstance = new Chart(ctx, {
type: "line",
data: {
labels: ["6m", "5m", "4m", "3m", "2m", "1m"],
datasets: [{
label: "Monthly Revenue ($)",
data: monthlyRevenue,
borderColor: "rgba(93, 93, 255, 1)",
backgroundColor: "rgba(93, 93, 255, 0.1)",
tension: 0.3,
fill: true
}]
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
labels: { color: "#f0f0f0" }
}
},
scales: {
y: {
beginAtZero: true,
ticks: { color: "#f0f0f0" },
grid: { color: "rgba(255, 255, 255, 0.1)" }
},
x: {
ticks: { color: "#f0f0f0" },
grid: { color: "rgba(255, 255, 255, 0.1)" }
}
}
}
});
}

// ================ HELP FUNCTIONS ================
function loadHelpContent() {
// Content is static HTML so nothing to load dynamically
logToPanel("🆘 Help view activated");
}

// ================ UTILITY FUNCTIONS ================
function calculateRepairTime(appointment) {
if (!appointment.createdAt || !appointment.completedAt) return "N/A";

try {
const created = appointment.createdAt.toDate 
? appointment.createdAt.toDate() 
: new Date(appointment.createdAt);

const completed = appointment.completedAt.toDate 
? appointment.completedAt.toDate() 
: new Date(appointment.completedAt);

const diffDays = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
} catch (e) {
return "N/A";
}
}

function isThisMonth(date) {
const today = new Date();
return date.getMonth() === today.getMonth() && 
date.getFullYear() === today.getFullYear();
}

function isSameMonth(date1, date2) {
return date1.getMonth() === date2.getMonth() && 
date1.getFullYear() === date2.getFullYear();
}

// ================ EVENT LISTENERS ================
document.addEventListener("DOMContentLoaded", () => {
// Generate Reports button
document.getElementById("generate-monthly-report")?.addEventListener("click", generateReports);

// Export Reports button
document.getElementById("export-reports")?.addEventListener("click", () => {
showToast("Export feature coming soon!");
});
});
// ================ MODAL MANAGEMENT ================
// Modal open/close functions
const modal = document.getElementById("appointment-modal");
const addBtn = document.getElementById("add-appointment");
const closeBtn = document.querySelector(".close-modal");
const cancelBtn = document.getElementById("cancel-appointment");

function openEditModal(id) {
const app = appointments.find((a) => a.id === id);
if (!app) return;

editingAppointmentId = id;

document.getElementById("customer-name").value = app.customer;
document.getElementById("customer-phone").value = app.phone || "";

// Use the dateObj for editing
const dateObj = app.dateObj || new Date();
document.getElementById("appointment-date").value = dateObj
.toISOString()
.split("T")[0];

// Format time as HH:MM
const hours = dateObj.getHours().toString().padStart(2, '0');
const minutes = dateObj.getMinutes().toString().padStart(2, '0');
document.getElementById("appointment-time").value = `${hours}:${minutes}`;

document.getElementById("equipment").value = app.equipment || "";
document.getElementById("appointment-price").value =
app.price || defaultPrice;
document.getElementById("issue-description").value = app.issue || "";
document.getElementById("repair-notes").value =
app.repair_notes || "";
document.getElementById("appointment-status").value =
app.status || "";

document.getElementById("modal-title").textContent =
"Edit Appointment";
document.getElementById("save-appointment").textContent =
"Update Appointment";

modal.classList.add("active");
}

function openAddModal() {
editingAppointmentId = null;

document.getElementById("appointment-form").reset();

const today = new Date();
document.getElementById("appointment-date").value = today
.toISOString()
.split("T")[0];

const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
document.getElementById("appointment-time").value = `${nextHour
.getHours()
.toString()
.padStart(2, "0")}:${nextHour
.getMinutes()
.toString()
.padStart(2, "0")}`;

document.getElementById("appointment-price").value = defaultPrice;
document.getElementById("modal-title").textContent =
"Add New Appointment";
document.getElementById("save-appointment").textContent =
"Save Appointment";

modal.classList.add("active");
}

function closeModal() {
modal.classList.remove("active");
}

// Customer modal functions
function openAddCustomerModal() {
editingCustomerId = null;
document.getElementById('customer-form').reset();
document.getElementById('customer-modal-title').textContent = "New Customer";
document.getElementById('customer-modal').classList.add('active');
}

function openEditCustomerModal(id) {
const customer = customers.find(c => c.id === id);
if (!customer) return;

editingCustomerId = id;
document.getElementById('customer-name').value = customer.name || '';
document.getElementById('customer-phone').value = customer.phone || '';
document.getElementById('customer-email').value = customer.email || '';
document.getElementById('customer-address').value = customer.address || '';
document.getElementById('customer-notes').value = customer.notes || '';

document.getElementById('customer-modal-title').textContent = "Edit Customer";
document.getElementById('customer-modal').classList.add('active');
}

function closeCustomerModal() {
document.getElementById('customer-modal').classList.remove('active');
}

// ================ EVENT LISTENERS ================
function setupEventListeners() {
// Sidebar navigation
document.querySelectorAll(".nav-links a").forEach(link => {
link.addEventListener("click", (e) => {
e.preventDefault();
const view = link.dataset.view;
logToPanel("🔗 Sidebar clicked: " + view);
activateView(view);
});
});

// Top tab navigation
document.querySelectorAll(".tab").forEach(tab => {
tab.addEventListener("click", () => {
const targetView = tab.getAttribute("data-tab");
activateView(targetView);
});
});

// Month navigation buttons
document.getElementById("prev-month").addEventListener("click", () => {
currentMonth--;
if (currentMonth < 0) {
currentMonth = 11;
currentYear--;
}
renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
currentMonth++;
if (currentMonth > 11) {
currentMonth = 0;
currentYear++;
}
renderCalendar();
});

// Settings save/reset
document
.getElementById("save-settings")
.addEventListener("click", () => {
defaultPrice =
parseFloat(document.getElementById("default-price").value) ||
defaultPriceInitial;
allowPastEdits =
document.getElementById("enable-past-edits").value === "true";
showToast("Settings saved successfully");
logAction("Settings updated", auth.currentUser?.email || "guest");
});

document
.getElementById("reset-settings")
.addEventListener("click", () => {
document.getElementById("company-name").value =
"Canadian Fitness Repair";
document.getElementById("default-price").value =
defaultPriceInitial.toString();
document.getElementById("business-hours").value =
"9:00 AM - 6:00 PM";
document.getElementById("enable-past-edits").value = "true";
defaultPrice = defaultPriceInitial;
allowPastEdits = true;
showToast("Settings reset to defaults");
});

// Search functionality
document
.getElementById("search-appointments")
.addEventListener("input", function () {
const keyword = this.value.toLowerCase();
const filtered = appointments.filter(
(app) =>
app.customer.toLowerCase().includes(keyword) ||
(app.phone && app.phone.toLowerCase().includes(keyword))
);
renderAppointmentsTable(filtered);
});

// Print button
document
.getElementById("print-schedule")
.addEventListener("click", () => {
window.print();
});

// Save appointment button (form submission)
document
.getElementById("save-appointment")
.addEventListener("click", async () => {
const customerName = cleanInput(document.getElementById("customer-name").value.trim());
const phone = cleanInput(document.getElementById("customer-phone").value.trim());
const dateInput = document.getElementById("appointment-date").value;
const timeInput = document.getElementById("appointment-time").value;
const dateObj = new Date(`${dateInput}T${timeInput}`);
const timestamp = Timestamp.fromDate(dateObj);
const equipment = cleanInput(document.getElementById("equipment").value.trim());
const price = parseFloat(document.getElementById("appointment-price").value) || 0;
const issue = cleanInput(document.getElementById("issue-description").value.trim());
const status = cleanInput(document.getElementById("appointment-status").value);
const repairNotes = cleanInput(document.getElementById("repair-notes").value.trim());

if (!customerName) {
showToast("Please enter customer name", true);
return;
}
if (!dateInput || !timeInput) {
showToast("Please select date and time", true);
return;
}

const appointmentData = {
customer: customerName,
phone,
equipment,
date: timestamp,
price,
issue,
status,
repair_notes: repairNotes,
};

await saveAppointment(appointmentData);
closeModal();
});

// Modal controls
addBtn.addEventListener("click", openAddModal);
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => {
if (e.key === "Escape" && modal.classList.contains("active"))
closeModal();
});

// Customer modal controls
document.getElementById('add-customer').addEventListener('click', openAddCustomerModal);
document.getElementById('save-customer').addEventListener('click', saveCustomer);
document.getElementById('cancel-customer').addEventListener('click', closeCustomerModal);
document.querySelectorAll('#customer-modal .close-modal').forEach(btn => {
btn.addEventListener('click', closeCustomerModal);
});

// Setup logout button
document
.querySelector('.nav-links a[data-view="logout"]')
.addEventListener("click", (e) => {
e.preventDefault();
logout();
});

// Pagination buttons
document.getElementById("prev-page").addEventListener("click", () => {
if (currentPage > 1) {
currentPage--;
renderAppointmentsTable();
}
});

document.getElementById("next-page").addEventListener("click", () => {
const totalPages = Math.ceil(appointments.length / appointmentsPerPage);
if (currentPage < totalPages) {
currentPage++;
renderAppointmentsTable();
}
});
}

// ================ INITIALIZATION ================
// Initialize the application
function initialize() {
setupEventListeners();
activateView('list');

// Create loading overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.style.display = 'none';
loadingOverlay.style.position = 'fixed';
loadingOverlay.style.top = '0';
loadingOverlay.style.left = '0';
loadingOverlay.style.width = '100%';
loadingOverlay.style.height = '100%';
loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
loadingOverlay.style.zIndex = '2000';
loadingOverlay.style.justifyContent = 'center';
loadingOverlay.style.alignItems = 'center';
loadingOverlay.innerHTML = `
<div style="color: white; text-align: center;">
<i class="fas fa-spinner fa-spin fa-3x"></i>
<p style="margin-top: 20px; font-size: 1.2rem;">Loading data...</p>
</div>
`;
document.body.appendChild(loadingOverlay);

// Default form setup
const today = new Date();
document.getElementById("appointment-date").value = today
.toISOString()
.split("T")[0];
const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
document.getElementById("appointment-time").value = `${nextHour
.getHours()
.toString()
.padStart(2, "0")}:${nextHour
.getMinutes()
.toString()
.padStart(2, "0")}`;
document.getElementById("appointment-price").value =
defaultPriceInitial;
}

// Start the application
initialize();
}
function logToPanel(message) {
    const panel = document.getElementById("debug-panel") || createPanel();
    const entry = document.createElement("div");
    entry.textContent = message;
    panel.appendChild(entry);
  }

  function createPanel() {
    const panel = document.createElement("div");
    panel.id = "debug-panel";
    panel.style.position = "fixed";
    panel.style.bottom = "0";
    panel.style.right = "0";
    panel.style.width = "300px";
    panel.style.maxHeight = "200px";
    panel.style.overflowY = "auto";
    panel.style.background = "rgba(0,0,0,0.85)";
    panel.style.color = "#0f0";
    panel.style.fontSize = "12px";
    panel.style.padding = "8px";
    panel.style.zIndex = "9999";
    panel.style.border = "1px solid #0f0";
    panel.innerText = "🧪 Debug panel initialized...";
    document.body.appendChild(panel);
    return panel;
  }

  // Example usage on load
  document.addEventListener("DOMContentLoaded", () => {
    logToPanel("✅ DOM loaded");
  });
<script type="module">
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
  Timestamp, // ✅ ADD THIS
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function logAction(action, user = "guest") {
  fetch("https://cfr-backend-1.onrender.com/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, user }),
  }).catch((err) => {
    console.error("Logging failed:", err);
  });
}

// 🔐 Fetch Firebase config from your backend
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

// 🚀 Async IIFE to initialize Firebase and launch the app
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
  let customers = [];
let editingCustomerId = null;
const customersCollection = collection(db, "customers");
let parts = [];
const partsCollection = collection(db, "parts");


  // 🧼 Cleans potentially harmful input
  function cleanInput(input) {
    return input.replace(/<[^>]*>/g, '').trim();
  }

  document.getElementById('add-customer').addEventListener('click', openAddCustomerModal);
  document.getElementById('save-customer').addEventListener('click', saveCustomer);
  function openAddCustomerModal() {
editingCustomerId = null;
document.getElementById('customer-form').reset();
document.getElementById('customer-modal-title').textContent = "New Customer";
document.getElementById('customer-modal').classList.add('active');
}

async function saveCustomer() {
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
}
}
// Add this at the VERY TOP of your initApp function
document.getElementById('test-tab-button').addEventListener('click', () => {
alert("JavaScript is working!");
document.getElementById('list-view').classList.add('active');
});

  // ✅ Start your app logic
  initApp(auth, db, appointmentsCollection);
})();

function initApp(auth, db, appointmentsCollection) {
  // Add this RIGHT AFTER: function initApp(auth, db, appointmentsCollection) {
console.log("Fixing tabs...");

// Function to show different views
function showView(viewName) {
// Hide all views
document.querySelectorAll('.tab-content').forEach(view => {
view.classList.remove('active');
});

// Show the view we want
const viewToShow = document.getElementById(`${viewName}-view`);
if (viewToShow) viewToShow.classList.add('active');
// Add to showView function
console.log(`Showing view: ${viewName}`);

// Add to setupTabs
console.log("Setting up tab listeners");
}

// Function to handle tab clicks
function setupTabListeners() {
// Sidebar tabs
document.querySelectorAll('.nav-links a').forEach(tab => {
tab.addEventListener('click', (e) => {
e.preventDefault();
const viewName = tab.getAttribute('data-view');
showView(viewName);
});
});

// Top tabs (List, Calendar, etc.)
document.querySelectorAll('.tab').forEach(tab => {
tab.addEventListener('click', () => {
const viewName = tab.getAttribute('data-tab');
showView(viewName);
});
});
}

// Call this function to set up the tabs
setupTabListeners();
  // ================ AUTHENTICATION HANDLING ================
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "admin-login.html";
    } else {
      // ✅ Show logged-in user's email
      document.getElementById("user-name").textContent = user.email;
      // ✅ Log when dashboard is opened
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
  let sessionTimer;

  let logoutWarningTimer;
  let countdownInterval;
  let currentPage = 1;
  const appointmentsPerPage = 20;


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
    const form = document.getElementById("appointment-form");
    if (!form || form.style.display === "none") return;

    const customer = document
      .getElementById("customer-name")
      .value.trim();
    if (!customer) return;

    const data = {
    customer: cleanInput(document.getElementById("customer-name").value.trim()),
    phone: cleanInput(document.getElementById("customer-phone").value.trim()),
    equipment: cleanInput(document.getElementById("equipment").value.trim()),
    date: `${document.getElementById("appointment-date").value} - ${document.getElementById("appointment-time").value}`,
    price: parseFloat(document.getElementById("appointment-price").value) || 0,
    issue: cleanInput(document.getElementById("issue-description").value.trim()),
    status: cleanInput(document.getElementById("appointment-status").value),
    repair_notes: cleanInput(document.getElementById("repair-notes").value.trim()),
  };


    saveAppointment(data); // Calls your existing logic
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

  // ================ APPLICATION CODE ================
  // Globals & state
  let appointments = [];
  let editingAppointmentId = null;
  let chartInstance = null;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  const defaultPriceInitial = 150;
  let defaultPrice = defaultPriceInitial;
  let allowPastEdits = true;

  // Utility functions
  function formatTimeForDisplay(time24) {
  const [hours, minutes] = time24.split(':');
  const hourNum = parseInt(hours, 10);
  if (hourNum === 0) return `12:${minutes} AM`;
  if (hourNum < 12) return `${hourNum}:${minutes} AM`;
  if (hourNum === 12) return `12:${minutes} PM`;
  return `${hourNum - 12}:${minutes} PM`;
}
// Add to JavaScript
async function sendSMS(appointmentId) {
const app = appointments.find(a => a.id === appointmentId);
if (!app) return;

const customer = customers.find(c => c.phone === app.phone);
if (!customer) {
showToast("Customer not found for SMS", true);
return;
}

try {
// This would connect to your SMS service
const response = await fetch('https://your-sms-service.com/send', {
method: 'POST',
headers: {'Content-Type': 'application/json'},
body: JSON.stringify({
  to: app.phone,
  message: `Hi ${customer.name}! Your appointment is on ${app.date}`
})
});

if (response.ok) {
showToast("SMS reminder sent!");
} else {
showToast("Failed to send SMS", true);
}
} catch (error) {
showToast("SMS service error", true);
}
}

// Add event listener for SMS buttons
document.querySelectorAll('.sms-btn').forEach(btn => {
btn.onclick = () => sendSMS(btn.dataset.id);
});

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

  // Fetch appointments from Firestore
  async function fetchAppointments() {
    try {
      const snapshot = await getDocs(appointmentsCollection);
      appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      renderAppointmentsTable();
      updateStats();
      renderCalendar();
      updateCalendarSummary();
      updatePerformanceMetrics();
      initChart();
    } catch (error) {
      console.error("Error fetching appointments:", error);
      showToast("Failed to fetch appointments", true);
    }
  }

  // Save (add or update) appointment in Firestore
  async function saveAppointment(data) {
    try {
      if (editingAppointmentId) {
        const docRef = doc(db, "appointments", editingAppointmentId);
        await updateDoc(docRef, data);
        showToast("Appointment updated successfully");
        // ✅ Log update
        logAction(
          "Appointment updated",
          auth.currentUser?.email || "guest"
        );
      } else {
        await addDoc(appointmentsCollection, data);
        showToast("Appointment added successfully");
        // ✅ Log add
        logAction(
          "Appointment added",
          auth.currentUser?.email || "guest"
        );
      }
      editingAppointmentId = null;
      await fetchAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
      showToast("Failed to save appointment", true);
      // ✅ Log failure
      logAction(
        "Appointment save failed",
        auth.currentUser?.email || "guest"
      );
    }
  }

  // Delete appointment from Firestore
  async function deleteAppointment(id) {
    try {
      await deleteDoc(doc(db, "appointments", id));
      showToast("Appointment deleted successfully");
      // ✅ Log success
      logAction(
        "Appointment deleted",
        auth.currentUser?.email || "guest"
      );
      await fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      showToast("Failed to delete appointment", true);
      // ✅ Log failure
      logAction(
        "Appointment delete failed",
        auth.currentUser?.email || "guest"
      );
    }
  }
  // ✅ Update status and open part selector if needed
  function updateAppointmentStatus(id, status) {
const appRef = doc(db, "appointments", id);
updateDoc(appRef, { status })
.then(() => {
showToast("Status updated");
if (status === "needs_parts") {
  openPartsSelector(id);
}
})
.catch((error) => {
showToast("Failed to update status", true);
console.error(error);
});
}

// ✅ Placeholder for future modal
function openPartsSelector(appointmentId) {
alert("Open part selector for appointment #" + appointmentId);
// You can replace this with a real modal later
}

  async function fetchCustomers() {
try {
const snapshot = await getDocs(customersCollection);
customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
renderCustomersTable();
} catch (error) {
console.error("Error fetching customers:", error);
showToast("Failed to load customers", true);
}
}
// ========== PARTS MANAGEMENT ==========

async function fetchParts() {
try {
const snapshot = await getDocs(partsCollection);
parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
renderPartsTable();
} catch (error) {
showToast("Failed to load parts", true);
console.error(error);
}
}

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

// Optional: add event listeners for edit/delete buttons
}

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
btn.addEventListener('click', () => deleteCustomer(btn.dataset.id));
});
}
function showCustomersView() {
// Hide all views
document.querySelectorAll('.tab-content').forEach(view => {
view.classList.remove('active');
});

// Show customers view
document.getElementById('customers-view').classList.add('active');

// Load customers
fetchCustomers();
}

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

    const [datePart, timePart = "12:00"] = app.date.split(" - ");
    const dateObj = new Date(datePart);
    document.getElementById("appointment-date").value = dateObj
      .toISOString()
      .split("T")[0];

    const timeValue =
      timePart.includes("AM") || timePart.includes("PM")
        ? convertTo24Hour(timePart)
        : timePart;
    document.getElementById("appointment-time").value = timeValue;

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

  // Render appointment table
  function renderAppointmentsTable(list = appointments) {
const tbody = document.getElementById("appointments-body");
tbody.innerHTML = "";

const start = (currentPage - 1) * appointmentsPerPage;
const pageApps = list.slice(start, start + appointmentsPerPage);

// your existing row generation code goes here — unchanged
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
<td>${formatTimestamp(app.date)}</td>
<td><span class="status-badge ${statusInfo.class}">${
statusInfo.text
}</span></td>
<td>$${app.price || 0}</td>
<td class="action-cell">
  <button class="action-btn edit-btn" data-id="${
    app.id
  }" aria-label="Edit appointment"><i class="fas fa-edit"></i></button>
  <button class="action-btn delete-btn" data-id="${
    app.id
  }" aria-label="Delete appointment"><i class="fas fa-trash"></i></button>
</td>
<td class="action-cell">
<button class="action-btn edit-btn" data-id="${app.id}" aria-label="Edit appointment"><i class="fas fa-edit"></i></button>
<button class="action-btn delete-btn" data-id="${app.id}" aria-label="Delete appointment"><i class="fas fa-trash"></i></button>
<button class="action-btn sms-btn" data-id="${app.id}" aria-label="Send SMS"><i class="fas fa-sms"></i></button>
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
if (confirm("Are you sure you want to delete this appointment?")) {
  deleteAppointment(btn.dataset.id);
}
};
});

// Update page indicator
const totalPages = Math.ceil(list.length / appointmentsPerPage);
document.getElementById("page-indicator").textContent = `Page ${currentPage} of ${totalPages}`;

// Enable/disable pagination buttons
document.getElementById("prev-page").disabled = currentPage === 1;
document.getElementById("next-page").disabled = currentPage >= totalPages;
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
  function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) return "";
    const dateObj = timestamp.toDate(); // Converts Firestore Timestamp to JS Date
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return dateObj.toLocaleString("en-US", options);
  }

  // Calendar rendering and summary
  function renderCalendar() {
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

    for (let day = 1; day <= totalDays; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "calendar-day";

      const dayNumber = document.createElement("div");
      dayNumber.className = "day-number";
      dayNumber.textContent = day;
      dayCell.appendChild(dayNumber);

      const dayAppointments = appointments.filter((app) => {
        const d = new Date(app.date.split(" - ")[0]);
        return (
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          d.getDate() === day
        );
      });

      if (dayAppointments.length > 0) {
        const container = document.createElement("div");
        container.className = "calendar-appointments";

        dayAppointments.forEach((app) => {
          const item = document.createElement("div");
          item.className = "appointment-item";
          const timeRaw = app.date.split(" - ")[1] || "00:00";
          const formattedTime = formatTimeForDisplay(timeRaw);
          item.textContent = `${app.customer.split(" ")[0]} - ${formattedTime}`;

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
      const d = new Date(app.date.split(" - ")[0]);
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
      const d = new Date(app.date.split(" - ")[0]);
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
    const ctx = document
      .getElementById("appointmentsChart")
      .getContext("2d");
    if (chartInstance) chartInstance.destroy();

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

    chartInstance = new Chart({
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

  // Tab navigation
  const sidebarLinks = document.querySelectorAll(".nav-links a");
  const tabs = document.querySelectorAll(".tab");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = link.getAttribute("data-view");

      if (targetView === "logout") {
        logout();
        return;
      }

      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      tabs.forEach((tab) => {
        if (tab.getAttribute("data-tab") === targetView) {
          tab.classList.add("active");
        } else {
          tab.classList.remove("active");
        }
      });

      // ✅ This ensures calendar renders when tab is clicked
      if (targetView === "stats") {
        initChart();
      } else if (targetView === "calendar") {
        renderCalendar();
      }else if (targetView === "customers") {
        showCustomersView();
      }
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

      const formattedDate = new Date(dateInput).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
      const formattedTime = new Date(
        `2000-01-01T${timeInput}`
      ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

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

      renderAppointmentsTable();
      updateStats();
      renderCalendar();
      updateCalendarSummary();
      updatePerformanceMetrics();
      initChart();
    });

  // Modal controls
  addBtn.addEventListener("click", openAddModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active"))
      closeModal();
  });

  // Setup logout button
  document
    .querySelector('.nav-links a[data-view="logout"]')
    .addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });

  // Real-time listener
  onSnapshot(appointmentsCollection, (snapshot) => {
    appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    renderAppointmentsTable();
    updateStats();
    renderCalendar();
    updateCalendarSummary();
    updatePerformanceMetrics();
    initChart();
  });

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
    // ================ PAGINATION BUTTON HANDLERS ================
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
  // Add this at the END of initApp function (before the closing curly brace)
showView('list'); // Show the list view by default
}
</script>
console.log("✅ Admin dashboard initialized");
        
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
            orderBy,
            limit,
            Timestamp,
            query,
            where,
            setDoc,
            getDoc,
            onSnapshot
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
        import {
            getAuth,
            onAuthStateChanged,
            signOut,
        } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

        let allLogs = [];
        let currentPage = 1;
        let currentLogPage = 1;
        const logsPerPage = 20;
        let db;
        let auth, appointmentsCollection;
        let map = null;
        let marker = null;
        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth(); // 0-based: 0 = Jan, 11 = Dec
// ===== PAGINATION FOR CUSTOMERS =====
            let currentStep = 1;
        const totalSteps = 4;
        let currentCustomerPage = 1;
        const customersPerPage = 10;
        const statusMap = {
    "All": "All",
    "Scheduled / Confirmed": "Scheduled",
    "In Progress": "In Progress",
    "Awaiting Parts": "Awaiting Parts",
    "Parts Arrived": "Parts Arrived",
    "Scheduled for Parts Installation": "Scheduled for Parts Installation",
    "Repaired": "Repaired",
    "Completed": "Completed",
    "Cancelled": "Cancelled"
            };
        const statusGroups = {
            "All": null,
            "Scheduled": ["Scheduled", "Confirmed"],
            "In Progress": ["In Progress"],
            "Awaiting Parts": ["Awaiting Parts"],
            "Parts Arrived": ["Parts Arrived"],
            "Scheduled for Parts Installation": ["Scheduled for Parts Installation"],
            "Repaired": ["Repaired"],
            "Completed": ["Completed"],
            "Cancelled": ["Cancelled"]
};
        const customerNameInput = document.getElementById('customer-name');
const customerPhoneInput = document.getElementById('customer-phone');
const customerEmailInput = document.getElementById('customer-email');

// Sample customer data (replace with your actual customer data)
const customers = [
  { id: 1, name: "John Smith", phone: "4165551234", email: "john@example.com" },
  { id: 2, name: "Sarah Johnson", phone: "6475555678", email: "sarah@example.com" },
  // Add more customers
];

        async function getFirebaseConfig() {
            try {
                const response = await fetch(
                    "https://cfr-backend-1.onrender.com/api/firebase-config"
                );
                return await response.json();
            } catch (error) {
                console.error("Error fetching Firebase config:", error);
                showToast("Failed to initialize Firebase", true);
                return null;
            }
        }
    
        (async () => {
            const firebaseConfig = await getFirebaseConfig();
            if (!firebaseConfig) {
                showToast("App configuration failed to load.", true);
                return;
            }
    
            const app = initializeApp(firebaseConfig);
             db = getFirestore(app);
             auth = getAuth(app);
                appointmentsCollection = collection(db, "appointments");

            const customersCollection = collection(db, "customers");
 
            initApp(auth, db, appointmentsCollection, customersCollection);
        })();
        // ===== CACHING MECHANISM =====
    let cachedAppointments = null;
    let lastFetchTime = 0;
    let originalAppointmentData = {};
    let currentPreviewAppointment = null;
    let originalEmail = "";
    let originalSMS = "";
    let statusFilter = "All"; // Default filter
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    // Your fixed base address (starting point)
    const baseAddress = "22 Canary Grass Blvd, Hamilton, Ontario, L0R 1P0";
    
    let appointmentsChartInstance = null;


    const apiKey = document.getElementById('gomaps-widget').dataset.apiKey;
    const routeMapDiv = document.getElementById('route-map');

    let routeMap;
    let routeLine;
    // ===== ERROR HANDLING FOR FIREBASE =====
    async function initializeFirebaseWithRetry(retries = 3, delay = 2000) {
      try {
        const firebaseConfig = await getFirebaseConfig();
        if (!firebaseConfig) throw new Error("Invalid Firebase config");
        
        const app = initializeApp(firebaseConfig);
        return {
          db: getFirestore(app),
          auth: getAuth(app),
          appointmentsCollection: collection(getFirestore(app), "appointments"),
          customersCollection: collection(getFirestore(app), "customers")
        };
      } catch (error) {
        if (retries > 0) {
          console.log(`Retrying Firebase initialization... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return initializeFirebaseWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    }
    function setupStatusCardClickHandlers() {
    const cards = document.querySelectorAll('#dashboard-view .card');
    console.log("Cards found for click handlers:", cards.length);

    cards.forEach(card => {
        card.addEventListener('click', function() {
            const status = this.getAttribute('data-status');
            console.log("Card clicked:", status);

            // If you want to map statuses, make sure statusMap is defined correctly
            statusFilter = statusMap ? (statusMap[status] || "") : status;

            // Sync dropdown if exists
            const statusDropdown = document.getElementById('appointment-status');
            if (statusDropdown) {
                statusDropdown.value = statusFilter || 'All';
            }

            activateView("appointments");
            fetchAppointments();
        });
    });
}
    async function saveAdminSettings(db) {
    const rawAdminPhone = document.getElementById("admin-phone").value.trim();
    const encryptedPhone = await encryptData(rawAdminPhone);

    const fullName = document.getElementById("settings-full-name").value.trim();
    const businessName = document.getElementById("settings-business-name").value.trim();
    const province = document.getElementById("business-province").value;
    const timeZone = document.getElementById("timezone").value;
    const smsNotifications = document.getElementById("sms-notifications").checked;
    const smsCarrier = document.getElementById("sms-carrier").value;

    const gst = parseFloat(document.getElementById("gst-rate").value || 0);
    const pst = parseFloat(document.getElementById("pst-rate").value || 0);
    document.addEventListener('DOMContentLoaded', function() {
    // Get status filter from URL if exists
    const urlParams = new URLSearchParams(window.location.search);
    const urlStatus = urlParams.get('status');
    
    if (urlStatus) {
        statusFilter = urlStatus;
        // Set the dropdown to match URL filter
        document.getElementById('status-filter').value = urlStatus;
    }
    
    // Initialize appointments
    fetchAppointments();
    setupStatusCardClickHandlers();
});
    // Clear previous errors
    document.querySelectorAll(".validation-error").forEach(el => {
        el.textContent = "";
        el.style.display = "none";
    });
    document.querySelectorAll(".form-control").forEach(field => {
        field.classList.remove("invalid");
    });
// Add click handlers to status cards
document.querySelectorAll('.card-grid .card').forEach(card => {
    card.addEventListener('click', function() {
        const status = this.getAttribute('data-status');
        
        // For the "Total Appointments" card, show all appointments
        const statusParam = status === 'All' ? '' : `?status=${encodeURIComponent(status)}`;
        
        // Navigate to appointments page with status filter
        window.location.href = `appointments.html${statusParam}`;
    });
});
    let isValid = true;

    // Validate required fields
    if (!fullName) {
        showValidationError("settings-full-name", "Full name is required");
        isValid = false;
    }
    if (!businessName) {
        showValidationError("settings-business-name", "Business name is required");
        isValid = false;
    }

    // ✅ Validate Canadian phone format
    if (rawAdminPhone && !validatePhone(rawAdminPhone)) {
        showValidationError("admin-phone", "Invalid Canadian phone format");
        isValid = false;
    }

    if (!isValid) return; // Stop if validation fails

    const adminSettings = {
        fullName,
        businessName,
        province,
        timeZone,
        smsNotifications,
        adminPhone: encryptedPhone,
        smsCarrier,
        gst,
        pst
    };

    try {
        await setDoc(doc(db, "settings", "admin"), adminSettings);  // Save to Firebase
        localStorage.setItem("fitnessRepairSettings", JSON.stringify(adminSettings));  // Save to browser
        showToast("Settings saved successfully");
    } catch (error) {
        console.error("❌ Error saving settings:", error);
        showToast("Failed to save settings", true);
    }
}
async function MSPreviewTemplate(appointment, type = "confirmation") {
  try {
    const res = await fetch(`https://cfr-backend-1.onrender.com/api/dev/preview-template?type=${type}&format=sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    return await res.text();
  } catch (err) {
    console.error("❌ Failed to fetch SMS preview:", err);
    
    const dateStr = appointment.date?.toDate?.()?.toLocaleDateString('en-CA') || '[DATE]';
    const timeStr = appointment.date?.toDate?.()?.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) || '[TIME]';

    return `📅 Appointment with Canadian Fitness Repair on ${dateStr} at ${timeStr}.
🛠️ Equipment: ${appointment.equipment || '[Equipment]'}
🔧 Issue: ${appointment.issue || '[Issue]'}
📍 Status: ${appointment.status || 'Scheduled'}

Questions? Call 289-925-7239`;
  }
}

async function fetchSMSPreviewTemplate(appointment, type = "confirmation") {
  try {
    const res = await fetch(`https://cfr-backend-1.onrender.com/api/dev/preview-template?type=${type}&format=sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    return await res.text();
  } catch (err) {
    console.error("❌ Failed to fetch SMS preview:", err);
    return "Failed to load SMS preview.";
  }
}

async function fetchEmailPreviewTemplate(appointment, type = "confirmation") {
  try {
    const res = await fetch(`https://cfr-backend-1.onrender.com/api/dev/preview-template?type=${type}&format=email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    return await res.text();
  } catch (err) {
    console.error("❌ Failed to fetch email preview:", err);
    return "Failed to load email preview.";
  }
}


function initMap() {
            if (!map) {
                map = L.map('map-preview').setView([43.6532, -79.3832], 13); // Default to Toronto
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
            }
            return map;
        }
function formatCanadianAddress(address) {
    // Ensure standard Canadian format: [Street], [City], [Province] [Postal Code]
    return address
        .replace(/, QC, Canada$/, ', Québec, Canada')
        .replace(/, BC, Canada$/, ', British Columbia, Canada')
        .replace(/, ON, Canada$/, ', Ontario, Canada')
        // Add other provinces as needed
        .replace(/([A-Z]\d[A-Z]) (\d[A-Z]\d)/, '$1 $2'); // Fix postal code spacing
}
    async function fetchCustomers() {
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
        function displaySuggestions(suggestions) {
            const container = document.getElementById('address-suggestions');
            container.innerHTML = '';
            
            if (suggestions.length === 0) {
                container.style.display = 'none';
                return;
            }
            
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = suggestion.display_name;
                item.onclick = () => {
                    selectSuggestion(suggestion);
                };
                container.appendChild(item);
            });
            
            container.style.display = 'block';
        }      

    function renderCustomersTable() {
      const tbody = document.getElementById('customers-body');
      tbody.innerHTML = '';
      
      if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">No customers found</td></tr>`;
        return;
      }
      
      const start = (currentCustomerPage - 1) * customersPerPage;
      const pageCustomers = customers.slice(start, start + customersPerPage);
      
      pageCustomers.forEach(customer => {
        // ... existing customer row code
      });
      
      // Add pagination controls for customers
      const totalPages = Math.ceil(customers.length / customersPerPage);
      document.getElementById("customer-page-indicator").textContent = 
        `Page ${currentCustomerPage} of ${totalPages}`;
      
      document.getElementById("customer-prev-page").disabled = currentCustomerPage === 1;
      document.getElementById("customer-next-page").disabled = currentCustomerPage >= totalPages;
    }

    // ===== SEARCH FUNCTIONALITY FOR APPOINTMENTS =====
    function setupAdvancedSearch() {
      const searchInput = document.getElementById('search-appointments');
      searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        
        if (!term) {
          renderAppointmentsTable(appointments);
          return;
        }
        
        const filtered = appointments.filter(app => 
          app.customer.toLowerCase().includes(term) ||
          (app.phone && app.phone.toLowerCase().includes(term)) ||
          (app.equipment && app.equipment.toLowerCase().includes(term)) ||
          (app.status && statusMap[app.status]?.text.toLowerCase().includes(term))
        );
        
        renderAppointmentsTable(filtered);
      });
    }
    
    // ===== LOADING SKELETONS =====
    function showSkeletonLoader(containerId, rows = 5) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      
      for (let i = 0; i < rows; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-row';
        skeleton.innerHTML = `
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
        `;
        container.appendChild(skeleton);
      }
    }

    function showSuggestions(list) {
  const container = document.getElementById("address-suggestions");
  container.innerHTML = ""; // Clear previous results

  if (!list.length) {
    container.style.display = "none";
    return;
  }

  list.forEach(result => {
    const item = document.createElement("div");
    item.className = "suggestion-item"; // matches your CSS
    item.textContent = result.display_name;

    item.onclick = () => {
      document.getElementById("house-address-input").value = result.display_name;
      container.style.display = "none";

      // Parse lat/lon safely
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        showMap(lat, lon);
      } else {
        console.warn("Invalid coordinates:", result.lat, result.lon);
      }
    };

    container.appendChild(item);
  });

  container.style.display = "block";
}


    async function openPreviewModal(appointment) {
  currentPreviewAppointment = appointment;
  const docRef = doc(db, "appointments", appointment.id);
  const snap = await getDoc(docRef);
  const data = snap.data();

  // Determine preview type
  const wasConfirmed = !!appointment.confirmationSent;
  const lastStatus = appointment.lastStatusSent;
  const statusChanged = lastStatus && appointment.status !== lastStatus;
  const previewType = wasConfirmed && statusChanged ? "update" : "confirmation";

  // ✅ Show visual preview type label
const typeLabel = document.getElementById("previewTypeLabel");
if (typeLabel) {
  typeLabel.textContent = previewType === "update" ? "Repair Update Preview" : "Confirmation Preview";
  typeLabel.style.color = previewType === "update" ? "#e67e22" : "#3498db";
}


const defaultSMS = await fetchSMSPreviewTemplate(appointment, previewType);
console.log("✅ SMS preview loaded:", defaultSMS);

const defaultEmail = await fetchEmailPreviewTemplate(appointment, previewType);
console.log("✅ Email preview loaded:", defaultEmail);


  const emailField = document.getElementById("emailPreview");
  const smsField = document.getElementById("smsPreview");

  originalEmail = data.editedEmailBody || defaultEmail;
  originalSMS = data.editedSmsBody || defaultSMS;

  // Convert HTML <br> to newlines and strip tags for textarea preview
  function htmlToPlainText(html) {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();
  }

  emailField.value = htmlToPlainText(originalEmail);
  smsField.value = originalSMS;

  const resetBtn = document.getElementById("resetPreviewBtn");
  const hasCustom = !!(data.editedEmailBody || data.editedSmsBody);
  resetBtn.disabled = !hasCustom;

  emailField.readOnly = true;
  smsField.readOnly = true;
  document.getElementById("savePreviewBtn").style.display = "none";

  document.getElementById("previewModal").classList.add("active");

  const countLabel = document.getElementById("smsCharCount");
  const updateCharCount = () => {
    const len = smsField.value.length;
    countLabel.textContent = `${len} / 160 characters`;
    countLabel.style.color = len > 160 ? "red" : "gray";
  };

  updateCharCount();
  smsField.removeEventListener("input", updateCharCount); // no duplicate handlers
  smsField.addEventListener("input", updateCharCount);
}


function closePreviewModal() {
        document.getElementById("previewModal").classList.remove("active");
        }
        // ================ UTILITY FUNCTIONS ================
        function showLoading(show = true) {
            const loadingElement = document.getElementById('loading-overlay');
            if (loadingElement) {
                loadingElement.style.display = show ? 'flex' : 'none';
            }
        }
        
        function showToast(message, isError = false) {
          if (isError) {
            console.error(message);
          }
            const toast = document.createElement("div");
            toast.className = `toast ${isError ? "error" : "success"}`;
            toast.innerHTML = `
                <i class="fas ${isError ? "fa-exclamation-circle" : "fa-check-circle"}"></i>
                <div>${message}</div>
            `;
            document.getElementById("toast-container").appendChild(toast);
            
            setTimeout(() => toast.classList.add("show"), 100);
            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        
        function formatTimestamp(dateObj) {
            if (!dateObj) return "N/A";
            
            try {
                // Get timezone from settings or default to Toronto
                const settings = window.fitnessRepairSettings || {}
                const timeZone = settings.timeZone || 'America/Toronto';

                return dateObj.toLocaleString('en-CA', {
                    timeZone: timeZone,
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                });
            } catch (e) {
                console.error("Date formatting error:", e);
                return "Invalid Date";
            }
        }
        
        function showMap(lat, lon) {
  const mapContainer = document.getElementById("map-preview");
  mapContainer.innerHTML = `
    <iframe
      width="100%"
      height="200"
      frameborder="0"
      style="border:0"
      referrerpolicy="no-referrer-when-downgrade"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}"
      allowfullscreen>
    </iframe>
  `;
  mapContainer.style.display = "block";
}
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function generateEmailBody(appointment, type) {
  const greeting = getGreeting();
  const { customer, equipment, issue, dateObj, status, totalPrice } = appointment;

  // Check for missing required fields
  if (!customer || !equipment || !status) {
    console.warn("⚠️ Missing required fields in appointment:", { customer, equipment, status });
    return "Error: Missing required fields.";
  }

  // Validate dateObj
  const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString("en-CA") : "Invalid date";
  const timeStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }) : "Invalid time";

  let emailBody = "";

  if (type === "confirmation") {
    emailBody = `
      <p>${greeting}, ${customer},</p>
      <p>This is a <strong>service appointment booking confirmation</strong> from <strong>Canadian Fitness Repair</strong>.</p>
      <p><strong>Appointment Details:</strong></p>
      <p>📅 <strong>Date:</strong> ${dateStr}<br>⏰ <strong>Time:</strong> ${timeStr}<br>🔧 <strong>Equipment:</strong> ${equipment}<br>📝 <strong>Issue:</strong> ${issue || "N/A"}<br>💵 <strong>Total:</strong> $${totalPrice || "0.00"} (includes 13% Ontario tax)<br>📌 <strong>Status:</strong> ${status}</p>
      <p>If you need to reschedule, please contact us <strong>at least 24 hours in advance</strong> by replying to this email or calling <strong>289-925-7239</strong>.</p>
      <p>To help us prepare, please send clear photos of your <strong>${equipment}</strong>, especially any labels showing the <strong>part number</strong>, <strong>model number</strong>, or <strong>serial number</strong>. You can reply to this email or text us — whichever is more convenient for you.</p>
      <p>Thank you!<br><br>– <strong>Canadian Fitness Repair</strong><br>📧 canadianfitnessrepair@gmail.com<br>📞 289-925-7239<br>🌐 <a href="https://canadianfitnessrepair.com">canadianfitnessrepair.com</a></p>
    `;
  } else if (type === "update") {
    emailBody = `
      <p>${greeting}, ${customer},</p>
      <p>We’d like to update you regarding your repair with <strong>Canadian Fitness Repair</strong>.</p>
      <p><strong>Equipment:</strong> ${equipment}<br><strong>New Status:</strong> ${status}</p>
      <p>If you have any questions or need clarification, feel free to reply to this email or call us at <strong>289-925-7239</strong>.</p>
      <p>Thank you!<br><br>– <strong>Canadian Fitness Repair</strong><br>📧 canadianfitnessrepair@gmail.com<br>📞 289-925-7239<br>🌐 <a href="https://canadianfitnessrepair.com">canadianfitnessrepair.com</a></p>
    `;
  }

  return emailBody;
}

function generateSMSBody(appointment, type) {
  const greeting = getGreeting();
  const { customer, equipment, status, dateObj, totalPrice, issue } = appointment;

  // Check for missing required fields
  if (!customer || !equipment || !status) {
    console.warn("⚠️ Missing required fields in appointment:", { customer, equipment, status });
    return "Error: Missing required fields.";
  }

  // Validate dateObj
  const dateStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString("en-CA") : "Invalid date";
  const timeStr = dateObj && !isNaN(dateObj) ? dateObj.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }) : "Invalid time";

  if (type === "confirmation") {
    return `
${greeting}, ${customer},
Your service appointment with Canadian Fitness Repair is confirmed:
📅 ${dateStr} at ${timeStr}
🔧 Equipment: ${equipment}
📝 Issue: ${issue || "N/A"}
💵 Total: $${totalPrice || "0.00"} (includes 13% ON tax)
📌 Status: ${status}
Please notify us 24 hours in advance if you need to reschedule: 289-925-7239
To help us prepare, please send photos of your equipment labels (part, model, serial numbers).
– Canadian Fitness Repair
canadianfitnessrepair.com
canadianfitnessrepair@gmail.com
    `.trim();
  } else if (type === "update") {
    return `
${greeting}, ${customer},
Repair update from Canadian Fitness Repair:
🔧 Equipment: ${equipment}
📌 New Status: ${status}
Questions? Reply or call 289-925-7239
– Canadian Fitness Repair
canadianfitnessrepair.com
canadianfitnessrepair@gmail.com
    `.trim();
  }

  return "";
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
                // ================ HOLIDAY CALENDAR ================
                function getCanadianHolidays(year, province) {
    // Helper Functions
    function adjustToNextMonday(date) {
        const day = date.getDay();
        if (day === 0) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // Sunday → next Monday
        if (day === 6) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2); // Saturday → next Monday
        return date;
    }

    function getEasterSunday(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }

    function getGoodFriday(year) {
        const easter = getEasterSunday(year);
        const goodFriday = new Date(easter);
        goodFriday.setDate(easter.getDate() - 2);
        return goodFriday;
    }

    function getNthMondayInMonth(n, year, month) {
        const firstDay = new Date(year, month, 1);
        const dayOfWeek = firstDay.getDay();
        const addDays = (dayOfWeek === 1) ? (n - 1) * 7 : (8 - dayOfWeek) % 7 + (n - 1) * 7;
        return new Date(year, month, 1 + addDays);
    }

    function getVictoriaDay(year) {
        const may24 = new Date(year, 4, 24);
        const dayOfWeek = may24.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return new Date(year, 4, 24 - diff);
    }

    function getNearestMonday(year, month, day) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0) return new Date(year, month, day + 1); // Sunday → next Monday
        return new Date(year, month, day - (dayOfWeek - 1)); // Move to Monday of the same week
    }



    // Common Federal Holidays (observed nationwide)
    const holidays = {
        NEW_YEAR: adjustToNextMonday(new Date(year, 0, 1)), // Jan 1
        GOOD_FRIDAY: getGoodFriday(year),
        CANADA_DAY: adjustToNextMonday(new Date(year, 6, 1)), // Jul 1
        LABOUR_DAY: getNthMondayInMonth(1, year, 8), // First Monday in September
        THANKSGIVING: getNthMondayInMonth(2, year, 9), // Second Monday in October
        CHRISTMAS: adjustToNextMonday(new Date(year, 11, 25)), // Dec 25
    };
    async function saveEditedPreview() {
  if (!currentPreviewAppointment) return;

  const email = document.getElementById("emailPreview").value.trim();
  const sms = document.getElementById("smsPreview").value.trim();

  const docRef = doc(db, "appointments", currentPreviewAppointment.id);

  try {
    await updateDoc(docRef, {
      editedEmailBody: email,
      editedSmsBody: sms
    });

    showToast("✅ Message saved successfully.");
    closePreviewModal();
  } catch (err) {
    console.error("❌ Failed to save preview:", err);
    showToast("Failed to save message", "error");
  }
}
function enableEditing() {
  const emailField = document.getElementById("emailPreview");
  const smsField = document.getElementById("smsPreview");
  const saveBtn = document.getElementById("savePreviewBtn");

  emailField.readOnly = false;
  smsField.readOnly = false;
  saveBtn.style.display = "inline-block";
  saveBtn.disabled = true;

  function checkChanges() {
    const email = emailField.value.trim();
    const sms = smsField.value.trim();
    saveBtn.disabled = (email === originalEmail.trim() && sms === originalSMS.trim());
  }

  emailField.addEventListener("input", checkChanges);
  smsField.addEventListener("input", checkChanges);
}
function updateSMSCharCount() {
  const sms = document.getElementById("smsPreview").value;
  document.getElementById("smsCharCount").textContent = `${sms.length} / 160 characters`;
}

    // Province-Specific Holidays
    switch(province) {
        case 'AB': // Alberta
            holidays.FAMILY_DAY = getNthMondayInMonth(3, year, 1); // Third Mon in Feb
            holidays.VICTORIA_DAY = getVictoriaDay(year);
            break;
        case 'BC': // British Columbia
            holidays.FAMILY_DAY = getNthMondayInMonth(3, year, 1);
            holidays.BC_DAY = getNthMondayInMonth(1, year, 7); // First Mon in Aug
            holidays.VICTORIA_DAY = getVictoriaDay(year);
            break;
        case 'MB': // Manitoba
            holidays.LOUIS_RIEL_DAY = getNthMondayInMonth(3, year, 1); // Third Mon in Feb
            holidays.CIVIC_HOLIDAY = getNthMondayInMonth(1, year, 7); // First Mon in Aug
            holidays.VICTORIA_DAY = getVictoriaDay(year);
            break;
        case 'NB': // New Brunswick
            holidays.FAMILY_DAY = getNthMondayInMonth(3, year, 1);
            holidays.NEW_BRUNSWICK_DAY = getNthMondayInMonth(1, year, 7);
            holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26)); // Dec 26
            break;
        case 'NL': // Newfoundland & Labrador
            holidays.ST_PATRICKS_DAY = getNearestMonday(year, 2, 17); // Nearest Mon to Mar 17
            holidays.ST_GEORGES_DAY = getNearestMonday(year, 3, 23); // Nearest Mon to Apr 23
            holidays.DISCOVERY_DAY = getNearestMonday(year, 5, 24); // Nearest Mon to Jun 24
            holidays.ORANGEMENS_DAY = getNearestMonday(year, 6, 12); // Nearest Mon to Jul 12
            holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26));
            break;
        case 'NS': // Nova Scotia
            holidays.HERITAGE_DAY = getNthMondayInMonth(3, year, 1); // Third Mon in Feb
            holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26));
            break;
        case 'NT': // Northwest Territories
            holidays.CIVIC_HOLIDAY = getNthMondayInMonth(1, year, 7);
            holidays.VICTORIA_DAY = getVictoriaDay(year);
            holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26));
            break;
        case 'NU': // Nunavut
            holidays.CIVIC_HOLIDAY = getNthMondayInMonth(1, year, 7);
            holidays.NUNAVUT_DAY = adjustToNextMonday(new Date(year, 6, 9)); // Jul 9
            holidays.VICTORIA_DAY = getVictoriaDay(year);
            holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26));
            break;
        case 'ON': // Ontario
            holidays.FAMILY_DAY = getNthMondayInMonth(3, year, 1);
            holidays.CIVIC_HOLIDAY = getNthMondayInMonth(1, year, 7);
            holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26));
            break;
        case 'PE': // Prince Edward Island
            holidays.ISLANDER_DAY = getNthMondayInMonth(3, year, 1); // Third Mon in Feb
            holidays.CIVIC_HOLIDAY = getNthMondayInMonth(1, year, 7);
            break;
        case 'QC': // Quebec
            holidays.NATIONAL_PATRIOTS_DAY = getVictoriaDay(year); // Same as Victoria Day
            holidays.ST_JEAN_BAPTISTE_DAY = adjustToNextMonday(new Date(year, 5, 24)); // Jun 24
            break;
        case 'SK': // Saskatchewan
            holidays.FAMILY_DAY = getNthMondayInMonth(3, year, 1);
            holidays.SASKATCHEWAN_DAY = getNthMondayInMonth(1, year, 7);
            break;
        case 'YT': // Yukon
            holidays.DISCOVERY_DAY = getNthMondayInMonth(3, year, 7); // Third Mon in Aug
            holidays.YUKON_HERITAGE_DAY = new Date(year, 1, 1 + (8 - new Date(year, 1, 1).getDay()) % 7 + 14); // Third Fri in Feb
            holidays.VICTORIA_DAY = getVictoriaDay(year);
            holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26));
            break;
    }

    // Conditional Holidays (based on province)
    const victoriaDayProvinces = ['AB', 'BC', 'MB', 'NT', 'NU', 'ON', 'SK', 'YT'];
    if (victoriaDayProvinces.includes(province)) {
        holidays.VICTORIA_DAY = getVictoriaDay(year);
    }

    const remembranceDayProvinces = ['AB', 'BC', 'MB', 'NT', 'NU', 'PE', 'SK', 'YT', 'NL', 'NB'];
    if (remembranceDayProvinces.includes(province)) {
        holidays.REMEMBRANCE_DAY = adjustToNextMonday(new Date(year, 10, 11)); // Nov 11
    }

    const boxingDayProvinces = ['ON', 'NB', 'NL', 'NS', 'NT', 'NU', 'YT'];
    if (boxingDayProvinces.includes(province)) {
        holidays.BOXING_DAY = adjustToNextMonday(new Date(year, 11, 26));
    }

    return holidays;
}
function validatePhone(phone) {
  const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digit characters
  return /^1?[2-9]\d{2}[2-9]\d{6}$/.test(cleanPhone);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
        // ================ TAX CALCULATION ================
        function getTaxRate(province) {
            const taxRates = {
                'ON': 0.13,  // Ontario HST
                'QC': 0.14975, // Quebec GST + QST
                'BC': 0.12,   // British Columbia GST + PST
                'AB': 0.05,   // Alberta GST
                'MB': 0.12,   // Manitoba GST + PST
                'SK': 0.11,   // Saskatchewan GST + PST
                'NS': 0.15,   // Nova Scotia HST
                'NB': 0.15,   // New Brunswick HST
                'NL': 0.15,   // Newfoundland and Labrador HST
                'PE': 0.15,   // Prince Edward Island HST
                'NT': 0.05,   // Northwest Territories GST
                'NU': 0.05,   // Nunavut GST
                'YT': 0.05    // Yukon GST
            };
            return taxRates[province] || 0.13; // Default to Ontario rate
        }
    
        function calculateTax() {
            const settings = window.fitnessRepairSettings || {};
            const province = settings.province || 'ON';
            const taxRate = getTaxRate(province);
            
            const basePrice = parseFloat(document.getElementById('appointment-base-price').value) || 0;
            const taxAmount = Math.round(basePrice * taxRate * 100) / 100;
            const totalPrice = Math.round((basePrice + taxAmount) * 100) / 100; 

            document.getElementById('appointment-tax-rate').value = (taxRate * 100).toFixed(2) + '%';
            document.getElementById('appointment-tax-amount').value = taxAmount.toFixed(2);
            document.getElementById('appointment-price').value = totalPrice.toFixed(2);
        }
        

        document.getElementById("editPreviewBtn").onclick = () => {
  document.getElementById("emailPreview").readOnly = false;
  document.getElementById("smsPreview").readOnly = false;
  document.getElementById("savePreviewBtn").style.display = "inline-block";
};



document.addEventListener("DOMContentLoaded", () => {
  // ✅ Now this won't throw if button exists in HTML
  const resetBtn = document.getElementById("resetPreviewBtn");
  if (resetBtn) {
    resetBtn.onclick = async () => {
      if (!currentPreviewAppointment) return;

      const confirmed = confirm("Are you sure you want to reset to the default message?");
      if (!confirmed) return;

      const docRef = doc(db, "appointments", currentPreviewAppointment.id);

      try {
        await updateDoc(docRef, {
          editedEmailBody: "",
          editedSmsBody: ""
        });

        showToast("✏️ Custom message reset to default.");
        closePreviewModal();
      } catch (err) {
        console.error("Reset preview failed:", err);
        showToast("Failed to reset message", "error");
      }
    };
  } else {
    console.warn("⚠️ resetPreviewBtn not found in DOM");
  }
});

// Save button
document.getElementById("savePreviewBtn").onclick = async () => {
  if (!currentPreviewAppointment) return;

  const email = document.getElementById("emailPreview").value.trim();
  const sms = document.getElementById("smsPreview").value.trim();

  const docRef = doc(db, "appointments", currentPreviewAppointment.id);

  try {
    await updateDoc(docRef, {
      editedEmailBody: email,
      editedSmsBody: sms
    });

    showToast("✅ Message saved successfully.");
    closePreviewModal();
  } catch (err) {
    console.error("Save preview failed:", err);
    showToast("Failed to save preview", "error");
  }
};
    // Encrypt sensitive data (e.g., phone number)
        async function encryptData(data) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error("Encryption failed:", error);
            return data; // fallback
        }
        }


   // ================ MAIN APPLICATION ================
        function initApp(auth, db, appointmentsCollection, customersCollection) {
            // ================ GLOBAL STATE ================
            let appointments = [];
            let customers = [];
            let editingAppointmentId = null;
            let editingCustomerId = null;
            let chartInstance = null;
           
            let currentMonth = new Date().getMonth();
            let currentYear = new Date().getFullYear();
            let currentPage = 1;
            const appointmentsPerPage = 10;
            
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
            // ================ VALIDATION UTILITIES ================
    const validators = {
        required: value => value.trim() !== '',
        validDate: value => new Date(value).toString() !== 'Invalid Date',
        validTime: value => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
        validPrice: value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0
    };
 
    function showValidationError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorId = `${fieldId}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (field && errorElement) {
            field.classList.add('invalid');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.opacity = '1';
        }
    }
    
    function showValidationToast(message, isError = true) {
        const toast = document.createElement("div");
        toast.className = `toast ${isError ? "error" : "success"}`;
        toast.innerHTML = `
            <i class="fas ${isError ? "fa-exclamation-circle" : "fa-check-circle"}"></i>
            <div>${message}</div>
        `;
        document.getElementById("toast-container").appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add("show"), 100);
        
        // Auto-remove after delay
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    function clearValidationError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorId = `${fieldId}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (field) field.classList.remove('invalid');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = ''; // Clear message text
        }
    }
    
    function clearAllValidationErrors() {
        document.querySelectorAll('.validation-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.form-control').forEach(field => {
            field.classList.remove('invalid');
        });
    }
    function initReportsView() {
        const reportsView = document.getElementById('reports-view');
        reportsView.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Reports Dashboard</div>
                </div>
                <div class="card-content">
                    <p>Revenue reports, appointment analytics, and performance metrics coming soon</p>
                    <button class="btn" id="export-reports">
                        <i class="fas fa-file-export"></i> Export Data
                    </button>
                </div>
            </div>
        `;
    }
    
    function initReminderSystem() {
        // Check for appointments needing reminders
        // checkAppointmentReminders();
        
        // Check every hour
        // setInterval(checkAppointmentReminders, 60 * 60 * 1000);
    }
    
    async function checkAppointmentReminders() {
        console.log("🛑 checkAppointmentReminders() is disabled — server handles reminders now.");
}

    function setupFieldValidation(fieldId, validator) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        field.addEventListener('blur', () => {
            if (!validator(field.value)) {
                field.classList.add('invalid');
            } else {
                field.classList.remove('invalid');
            }
        });
        
        field.addEventListener('input', () => {
            if (validator(field.value)) {
                field.classList.remove('invalid');
            } else {
                field.classList.add('invalid');
            }
        });
    }
    function initializeValidation() {
          // Define validators
          const validators = {
            required: value => value.trim() !== '',
            validDate: value => !isNaN(Date.parse(value)),
            validTime: value => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value.trim()),
            validPrice: value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0
        };
        // Customer fields
        setupFieldValidation('customer-name', validators.required, 'Customer name is required');
        setupFieldValidation('appointment-date', validators.validDate, 'Please select a valid date');
        setupFieldValidation('appointment-time', validators.validTime, 'Please select a valid time');
        setupFieldValidation('appointment-price', validators.validPrice, 'Please enter a valid price');
    }
          
    // GoogleMaps 
   
    const baseAddress = "22 Canary Grass Blvd, Hamilton, Ontario, L0R 1P0";
  const apiKey = "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c";


  document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("house-address-input");
  const suggestionsEl = document.getElementById("address-suggestions");

  let debounceTimer;
  inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    const query = inputEl.value.trim();
    if (query.length < 3) {
      suggestionsEl.style.display = "none";
      suggestionsEl.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const apiKey = "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c"; // your GoMaps API key
        const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ca|administrative_area:ON&key=${apiKey}`;


        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || !data.predictions.length) {
          suggestionsEl.style.display = "none";
          suggestionsEl.innerHTML = "";
          return;
        }

        suggestionsEl.innerHTML = data.predictions.map(prediction => 
          `<li style="
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s ease;
          ">${prediction.description}</li>`
        ).join("");
        suggestionsEl.style.display = "block";

        // Add hover and click handlers
        Array.from(suggestionsEl.children).forEach((li) => {
          li.addEventListener("mouseenter", () => {
            li.style.backgroundColor = "#f0f0f0";
          });
          li.addEventListener("mouseleave", () => {
            li.style.backgroundColor = "transparent";
          });
          li.addEventListener("click", () => {
            inputEl.value = li.textContent;
            suggestionsEl.style.display = "none";
            suggestionsEl.innerHTML = "";
            inputEl.focus();

            // Optional: Trigger validation or route update here
          });
        });

      } catch (err) {
        console.error("Autocomplete error:", err);
        suggestionsEl.style.display = "none";
        suggestionsEl.innerHTML = "";
      }
    }, 300); // debounce delay
  });

  // Optional: close suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!suggestionsEl.contains(e.target) && e.target !== inputEl) {
      suggestionsEl.style.display = "none";
      suggestionsEl.innerHTML = "";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("house-address-input");
  const suggestionsEl = document.getElementById("address-suggestions");
  const apiKey = "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c";

  inputEl.addEventListener("input", async () => {
    const query = inputEl.value.trim();
    if (query.length < 3) {
      suggestionsEl.style.display = "none";
      suggestionsEl.innerHTML = "";
      return;
    }

    try {
        const response = await fetch(`https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ca&key=${apiKey}`);
      const data = await response.json();

      if (data.status === "OK" && data.predictions.length > 0) {
        suggestionsEl.innerHTML = data.predictions.map(prediction =>
          `<li style="padding: 8px; cursor: pointer;">${prediction.description}</li>`
        ).join("");
        suggestionsEl.style.display = "block";

        Array.from(suggestionsEl.children).forEach((li, index) => {
          li.addEventListener("click", () => {
            inputEl.value = data.predictions[index].description;
            suggestionsEl.style.display = "none";
            suggestionsEl.innerHTML = "";
            inputEl.focus();

            // Optional: call your route update or validation here, e.g.:
            // updateRoute();
          });
        });
      } else {
        suggestionsEl.innerHTML = "<li style='padding: 8px;'>No suggestions found</li>";
        suggestionsEl.style.display = "block";
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
      suggestionsEl.style.display = "none";
      suggestionsEl.innerHTML = "";
    }
  });
});

document.addEventListener("click", (e) => {
  if (!inputEl.contains(e.target) && !suggestionsEl.contains(e.target)) {
    suggestionsEl.style.display = "none";
    suggestionsEl.innerHTML = "";
  }
});

  async function fetchRouteInfo(destination) {
    if (!destination) {
      document.getElementById("gomaps-distance").textContent = "0";
      return;
    }

    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${encodeURIComponent(baseAddress)}&destination=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("Directions API error: " + data.status);
      }

      // Sum distance from all legs
      const distanceMeters = data.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0);
      const distanceKm = (distanceMeters / 1000).toFixed(2);

      document.getElementById("gomaps-distance").textContent = distanceKm;
    } catch (error) {
      console.error("Error fetching directions:", error);
      document.getElementById("gomaps-distance").textContent = "N/A";
    }
  }

  // Listen for user input changes (on blur or change)
  const addressInput = document.getElementById("house-address-input");

  addressInput.addEventListener("change", () => {
    const destination = addressInput.value.trim();
    fetchRouteInfo(destination);
  });

  // Optional: also fetch on blur (user leaves input)
  addressInput.addEventListener("blur", () => {
    const destination = addressInput.value.trim();
    fetchRouteInfo(destination);
  });
  async function validateAddress(address) {
  if (!address) return false;

  const apiKey = "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c";
  const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address + ', Ontario, Canada')}&region=ca&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      // Optionally, you can check result types or components here
      return true;  // Valid address
    } else {
      return false; // Invalid address
    }
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
}
async function formatAddress(rawAddress) {
  const apiKey = "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c";
  const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(rawAddress)}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "OK" && data.results.length > 0) {
    // Use the first formatted address
    return data.results[0].formatted_address;
  }
  return null; // no valid address found
}
async function getAddressSuggestions(query) {
  const apiKey = "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c";
  const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ca|administrative_area:ON&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "OK") {
    return data.predictions; // array of suggested places
  }
  return [];
}

// Show suggestions in a dropdown under input
const inputEl = document.getElementById("house-address-input");
const suggestionsEl = document.createElement("ul");
suggestionsEl.style.position = "absolute";
suggestionsEl.style.background = "white";
suggestionsEl.style.border = "1px solid #ccc";
suggestionsEl.style.zIndex = "1000";
inputEl.parentNode.appendChild(suggestionsEl);

inputEl.addEventListener("input", async () => {
  const query = inputEl.value;
  if (query.length < 3) {
    suggestionsEl.innerHTML = "";
    return;
  }
  const suggestions = await getAddressSuggestions(query);
  
  if (suggestions.length === 0) {
    suggestionsEl.innerHTML = "<li>No suggestions found</li>";
    return;
  }
  
  suggestionsEl.innerHTML = suggestions.map(s => `<li style="padding:5px; cursor:pointer;">${s.description}</li>`).join("");
  
  // Add click handler on suggestions
  Array.from(suggestionsEl.children).forEach((li, idx) => {
    li.onclick = () => {
      inputEl.value = suggestions[idx].description;
      suggestionsEl.innerHTML = "";
      inputEl.focus();
    };
  });
});

// When input loses focus or selection made:
document.getElementById("house-address-input").addEventListener("blur", async () => {
  const input = document.getElementById("house-address-input");
  const formatted = await formatAddress(input.value);
  if (formatted) {
    input.value = formatted;
  }
});

// Use this on input blur or form submit
document.getElementById("house-address-input").addEventListener("blur", async function () {
  const errorDiv = document.getElementById("house-address-error");
  const isValid = await validateAddress(this.value);
  if (!isValid) {
    errorDiv.textContent = "Please enter a valid address.";
  } else {
    errorDiv.textContent = "";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const apiKey = document.getElementById("gomaps-widget").dataset.apiKey;
  const originAddress = document.getElementById("gomaps-widget").dataset.distanceFrom;
  const houseInput = document.getElementById("house-address-input");
  const distanceDisplay = document.getElementById("gomaps-distance");

  async function fetchDirections(destination) {
    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${encodeURIComponent(originAddress)}&destination=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Calculate total distance from all legs (in meters)
        const totalMeters = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
        const distanceKm = (totalMeters / 1000).toFixed(2);
        distanceDisplay.textContent = distanceKm;

        // Now update the map using GoMaps Pro's own JS render method
        // (assuming gomaps pro exposes a method to draw routes on the widget container)
        // This part depends on their SDK, so if you have their JS SDK or docs,
        // you might do something like:
        //
        // GoMapsPro.renderRoute('gomaps-widget', route);
        //
        // But if not exposed, their widget may automatically handle it after setting the input.
      } else {
        distanceDisplay.textContent = "N/A";
        console.warn("No routes found or error:", data.status);
      }
    } catch (err) {
      console.error("Directions fetch error:", err);
      distanceDisplay.textContent = "N/A";
    }
  }

  // Trigger directions fetch when user finishes typing or leaves the input
  houseInput.addEventListener("change", () => {
    const destination = houseInput.value.trim();
    if (destination.length > 0) {
      fetchDirections(destination);
    } else {
      distanceDisplay.textContent = "0";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const baseAddress = "22 Canary Grass Blvd, Hamilton, Ontario, L0R 1P0";
  const apiKey = "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c";

  const inputEl = document.getElementById("house-address-input");
  const suggestionsEl = document.getElementById("address-suggestions");
  const errorDiv = document.getElementById("house-address-error");
  const distanceDisplay = document.getElementById("gomaps-distance");

  let debounceTimer;

  // Debounced autocomplete
  inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = inputEl.value.trim();

    if (query.length < 3) {
      suggestionsEl.style.display = "none";
      suggestionsEl.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        // Add Ontario + Canada restriction in components param
        const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ca|administrative_area:ON&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || !data.predictions.length) {
          suggestionsEl.style.display = "none";
          suggestionsEl.innerHTML = "";
          return;
        }

        suggestionsEl.innerHTML = data.predictions.map(prediction => 
          `<li style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee;">${prediction.description}</li>`
        ).join("");
        suggestionsEl.style.display = "block";

        Array.from(suggestionsEl.children).forEach((li, index) => {
          li.addEventListener("mouseenter", () => li.style.backgroundColor = "#f0f0f0");
          li.addEventListener("mouseleave", () => li.style.backgroundColor = "transparent");
          li.addEventListener("click", () => {
            inputEl.value = data.predictions[index].description;
            suggestionsEl.style.display = "none";
            suggestionsEl.innerHTML = "";
            inputEl.focus();
            errorDiv.textContent = "";

            fetchRouteInfo(inputEl.value);
          });
        });
      } catch (err) {
        console.error("Autocomplete error:", err);
        suggestionsEl.style.display = "none";
        suggestionsEl.innerHTML = "";
      }
    }, 300);
  });

  // Hide suggestions if click outside
  document.addEventListener("click", e => {
    if (!suggestionsEl.contains(e.target) && e.target !== inputEl) {
      suggestionsEl.style.display = "none";
      suggestionsEl.innerHTML = "";
    }
  });

  // Validate and format on blur
  inputEl.addEventListener("blur", async () => {
    const rawAddress = inputEl.value.trim();
    if (!rawAddress) return;

    const formatted = await formatAddress(rawAddress);
    if (formatted) inputEl.value = formatted;

    const isValid = await validateAddress(inputEl.value);
    if (!isValid) {
      errorDiv.textContent = "Please enter a valid address.";
    } else {
      errorDiv.textContent = "";
      fetchRouteInfo(inputEl.value);
    }
  });

  // Fetch route info when input changes (change event)
  inputEl.addEventListener("change", () => {
    const destination = inputEl.value.trim();
    if (destination.length > 0) fetchRouteInfo(destination);
    else distanceDisplay.textContent = "0";
  });

  async function fetchRouteInfo(destination) {
    if (!destination) {
      distanceDisplay.textContent = "0";
      return;
    }

    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${encodeURIComponent(baseAddress)}&destination=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") throw new Error("Directions API error: " + data.status);

      const distanceMeters = data.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0);
      distanceDisplay.textContent = (distanceMeters / 1000).toFixed(2);
    } catch (err) {
      console.error("Error fetching directions:", err);
      distanceDisplay.textContent = "N/A";
    }
  }

  async function validateAddress(address) {
    if (!address) return false;

    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.status === "OK" && data.results.length > 0;
    } catch {
      return false;
    }
  }

  async function formatAddress(rawAddress) {
    if (!rawAddress) return null;

    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(rawAddress)}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) return data.results[0].formatted_address;
      return null;
    } catch {
      return null;
    }
  }
});
// Show specific step
function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(el => {
    el.classList.remove('active');
  });
  
  // Show current step
  document.getElementById(`step-${step}`).classList.add('active');
  
  // Update progress bar
  document.getElementById('form-progress').style.width = `${(step/totalSteps)*100}%`;
  
  // Update step indicator
  document.getElementById('step-indicator').textContent = `Step ${step} of ${totalSteps}`;
  
  // Update navigation buttons
  const prevBtn = document.querySelector('.prev-step');
  const nextBtn = document.querySelector('.next-step');
  
  prevBtn.disabled = (step === 1);
  nextBtn.textContent = (step === totalSteps) ? 'Review Complete' : 'Next';
  
  // Move form actions to last step
  const formActions = document.querySelector('.form-actions');
  if (step === totalSteps) {
    document.getElementById('step-4').appendChild(formActions);
    buildConfirmationSummary();
  } else {
    document.getElementById('appointment-form').appendChild(formActions);
  }
}



// Step validation
function validateStep(step) {
  let isValid = true;
  
  if (step === 1) {
    const nameField = document.getElementById('customer-name');
    if (!nameField.value.trim()) {
      showValidationError(nameField, 'Customer name is required');
      isValid = false;
    }
  }
  
  if (step === 2) {
    const dateField = document.getElementById('appointment-date');
    if (!dateField.value) {
      showValidationError(dateField, 'Date is required');
      isValid = false;
    }
    
    const timeField = document.getElementById('appointment-time');
    if (!timeField.value) {
      showValidationError(timeField, 'Time is required');
      isValid = false;
    }
    
    const addressField = document.getElementById('house-address-input');
    if (!addressField.value.trim()) {
      showValidationError(addressField, 'Address is required');
      isValid = false;
    }
  }
  
  return isValid;
}

// Build confirmation summary
function buildConfirmationSummary() {
  const summary = document.getElementById('confirmation-summary');
  const date = document.getElementById('appointment-date').value;
  const time = document.getElementById('appointment-time').value;
  
  summary.innerHTML = `
    <div class="summary-item">
      <strong>Customer:</strong> ${document.getElementById('customer-name').value}
    </div>
    <div class="summary-item">
      <strong>Contact:</strong> ${document.getElementById('customer-phone').value || 'N/A'} | 
      ${document.getElementById('customer-email').value || 'N/A'}
    </div>
    <div class="summary-item">
      <strong>When:</strong> ${date} at ${time}
    </div>
    <div class="summary-item">
      <strong>Where:</strong> ${document.getElementById('house-address-input').value}
      <br><small>Distance: ${document.getElementById('gomaps-distance').textContent} km</small>
    </div>
    <div class="summary-item">
      <strong>Equipment:</strong> ${document.getElementById('equipment').value || 'N/A'}
    </div>
    <div class="summary-item">
      <strong>Total Price:</strong> $${document.getElementById('appointment-price').value || '0.00'}
    </div>
  `;
}

// Initialize form on modal open
document.getElementById('add-appointment').addEventListener('click', () => {
  currentStep = 1;
  showStep(1);
});

// Helper function to show validation errors
function showValidationError(field, message) {
  const errorId = `${field.id}-error`;
  const errorElement = document.getElementById(errorId);
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  field.classList.add('invalid');
  field.focus();
}
    
    // ================ VIEW MANAGEMENT ================
            function activateView(viewName) {
        // Remove active class from ALL sidebar links first
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class ONLY to the current view
        const currentLink = document.querySelector(`.nav-links a[data-view="${viewName}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
        
        // Hide all views
        document.querySelectorAll('.tab-content').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show requested view
        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) viewElement.classList.add('active');
        
        // Initialize view-specific content
        switch(viewName) {
            case "dashboard":
            initReminderSystem();
            updateStats();
            fetchAppointments().then(() => {
                initChart();              // init chart after appointments loaded
                renderAppointmentsChart();
            });
            break;
            case "appointments":
                fetchAppointments();
                break;
            case "calendar":
                renderCalendar();
                updateCalendarSummary();
                setupCalendarEventHandlers();
                break;
            case "customers":
                fetchCustomers();
                break;
            case "reports":
                initReportsView();
                break;
            case "logs":
            fetchLogs();
            break;
            case "settings":
                loadSettings();
                break;
            case "help":
                initHelpView();
                break;
        }
        
        // Auto-close sidebar on mobile
        if (window.innerWidth <= 576) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    }           
            // ================ AUTHENTICATION HANDLING ================
            onAuthStateChanged(auth, (user) => {
              if (!user){
                window.location.href = "admin-login.html";
                } else {
                    // Show logged-in user's email
                    document.getElementById("user-name").textContent = user.email;
                    fetchAppointments();
                }
            });
            
            // Logout function
            function logout() {
                if (confirm("Are you sure you want to logout?")) {
                    signOut(auth)
                        .then(() => {
                            window.location.href = "admin-login.html";
                        })
                        .catch((error) => {
                            console.error("Logout error:", error);
                            showToast("Logout failed", true);
                        });
                }
            }
      
                const pageSize = 10;
            function getPage(items, page = 1, size = 10) {
    const start = (page - 1) * size;
    return items.slice(start, start + size);
            }
function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const info = document.getElementById('pagination-info');
    const prev = document.getElementById('prev-page');
    const next = document.getElementById('next-page');

    // 💥 Safety check to prevent errors if any element is missing
    if (!info || !prev || !next) {
        console.warn('⚠️ Pagination controls not found in DOM. Skipping rendering.');
        return;
    }

    info.textContent = `Page ${currentPage} of ${totalPages}`;
    prev.disabled = currentPage <= 1;
    next.disabled = currentPage >= totalPages;

    prev.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchAppointments(); // reload current page
        }
    };

    next.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchAppointments();
        }
    };
}


            // Helper function for search
function appointmentMatchesSearch(appointment, query) {
    return (
        appointment.customer?.toLowerCase().includes(query) ||
        appointment.phone?.includes(query) ||
        appointment.email?.toLowerCase().includes(query) ||
        appointment.houseAddress?.toLowerCase().includes(query)
    );
}
            // ================ DATA MANAGEMENT ================
            // Fetch appointments from Firestore
            async function fetchAppointmentsWithCache() {
                const now = Date.now();
                if (cachedAppointments && now - lastFetchTime < CACHE_DURATION) {
                    return cachedAppointments;
                }
                
                showLoading(true);
                // Show skeleton loader while data is loading
                showSkeletonLoader('appointments-body', 7);
                
                try {
                    // Create optimized query with ordering and limit
                    const q = query(
                        appointmentsCollection,
                        orderBy("date", "desc"),
                        limit(100) // Get only the most recent 100 appointments
                    );
                    
                    const snapshot = await getDocs(q);
                    
                    cachedAppointments = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            dateObj: data.date ? data.date.toDate() : new Date()
                        };
                    });
                    
                    lastFetchTime = now;
                    return cachedAppointments;
                } catch (error) {
                    console.error("Error fetching appointments:", error);
                    showToast("Failed to fetch appointments", true);
                    return [];
                } finally {
                    showLoading(false);
                }
            }
    
            async function fetchAppointments() {
    try {
        const allAppointments = await fetchAppointmentsWithCache();

        if (!Array.isArray(allAppointments)) {
            throw new Error("Fetched data is not an array.");
        }

        // Attach dateObj for easy sorting/filtering
        appointments = allAppointments.map(app => ({
            ...app,
            dateObj: new Date(app.date)
        }));

        // 🩺 Debug
        console.log("✅ Current statusFilter:", statusFilter);
        console.log("✅ All appointment statuses:", allAppointments.map(app => app.status));

        // Determine allowed statuses
        let allowedStatuses = null; // null = no filter

        if (statusFilter && statusFilter !== "All") {
            allowedStatuses = statusGroups[statusFilter] || [statusFilter];
        }

        const filteredAppointments =
            allowedStatuses === null
                ? allAppointments
                : allAppointments.filter(app => allowedStatuses.includes(app.status));

        console.log("✅ Filtered Appointments:", filteredAppointments);

        // Reminder toast if applicable
        if (auth?.currentUser && !sessionStorage.getItem(`reminderShown_${auth.currentUser.uid}`)) {
            const tomorrowReminders = filteredAppointments.filter(app =>
                app.reminderEnabled && app.dateObj && isTomorrow(app.dateObj)
            );

            if (tomorrowReminders.length > 0) {
                showToast(`📅 Reminder: You have ${tomorrowReminders.length} appointment(s) for tomorrow.`);
                sessionStorage.setItem(`reminderShown_${auth.currentUser.uid}`, "true");
            }
        }

        // Render appointments
        const currentPageData = getPage(filteredAppointments, currentPage, pageSize);
            renderAppointmentsTable(currentPageData);
            renderPaginationControls(filteredAppointments.length); // Coming next
        updateStats();

        // Initialize charts/calendar if active
        setTimeout(() => {
            if (document.getElementById('calendar-view').classList.contains('active')) {
                renderCalendar();
                updateCalendarSummary();
            }
            if (document.getElementById('dashboard-view').classList.contains('active')) {
                initChart();
                renderAppointmentsChart();
                updateMonthYearLabel();
            }
        }, 50);

        setupRealtimeListeners();

    } catch (error) {
        console.error("❌ Error in fetchAppointments:", error);
        showToast("Failed to load appointments", true);
    }
}


function renderAppointmentsChart() {
    const ctx = document.getElementById("appointmentsPerDayChart").getContext("2d");

    if (appointmentsChartInstance) {
        appointmentsChartInstance.destroy();
    }

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
    const dayCounts = new Array(daysInMonth).fill(0);

    const monthlyApps = appointments.filter(app => {
        const appDate = app.dateObj;
        return appDate.getMonth() === currentMonth &&
               appDate.getFullYear() === currentYear;
    });
    monthlyApps.forEach(app => {
        const day = app.dateObj.getDate();
        dayCounts[day - 1]++;
    });

    appointmentsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Appointments',
                data: dayCounts,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Appointments This Month',
                    color: '#e5e7eb',
                    font: { size: 16 }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

          
            function setupRealtimeListeners() {
  const appointmentsQuery = query(appointmentsCollection, orderBy("date", "desc"));
  
  onSnapshot(appointmentsQuery, (snapshot) => {
    appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateObj: doc.data().date.toDate()
    }));
    renderAppointmentsTable();
    updateStats();
    if (document.getElementById('calendar-view').classList.contains('active')) {
      renderCalendar();
    }
  });
}
async function fetchLogs() {
  const logsBody = document.getElementById("logs-body");
  logsBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading logs...</td></tr>`;

  try {
    const logsQuery = query(collection(db, "logs"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(logsQuery);
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Step 1: Collect unique appointment IDs
    const appointmentIds = [...new Set(logs.map(log => log.appointmentId).filter(Boolean))];

    // Step 2: Fetch appointments in parallel
    const appointmentMap = {};
    const fetchPromises = appointmentIds.map(async (id) => {
      try {
        const apptSnap = await getDoc(doc(db, "appointments", id));
        if (apptSnap.exists()) {
          appointmentMap[id] = apptSnap.data();
        }
      } catch (err) {
        console.warn(`❌ Failed to fetch appointment ${id}:`, err.message);
      }
    });
    await Promise.all(fetchPromises);

    // Step 3: Render table
    const rows = logs.map(log => {
      const time = log.timestamp?.toDate?.().toLocaleString() || "N/A";
      const appt = appointmentMap[log.appointmentId];
      const customerName = appt?.customer || "N/A";

      return `
        <tr>
          <td>${log.type}</td>
          <td>${customerName}</td>
          <td>${log.emailSent ? "✅" : "❌"}</td>
          <td>${log.smsSent ? "✅" : "❌"}</td>
          <td>${log.status || "-"}</td>
          <td>${time}</td>
          <td>${log.smsError || "-"}</td>
        </tr>
      `;
    });

    logsBody.innerHTML = rows.length > 0 ? rows.join("") : `
      <tr><td colspan="7" style="text-align:center;">No logs found.</td></tr>`;
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    logsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Failed to load logs</td></tr>`;
  }
}
function logErrorToServer(error) {
        // Send error to backend for logging
        fetch('/api/log-error', {
            method: 'POST',
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            })
        });
    }
            // Fetch customers from Firestore
            async function fetchCustomers() {
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
            
            function initReportsCharts() {
        // Repair Time Chart
        const repairTimeCtx = document.getElementById('repairTimeChart').getContext('2d');
        new Chart(repairTimeCtx, {
            type: 'bar',
            data: {
                labels: ['Treadmills', 'Ellipticals', 'Bikes', 'Rowers', 'Strength'],
                datasets: [{
                    label: 'Avg. Repair Time (hours)',
                    data: [3.2, 2.8, 1.5, 2.1, 4.2],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
    
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        new Chart(revenueCtx, {
            type: 'doughnut',
            data: {
                labels: ['Treadmills', 'Ellipticals', 'Bikes', 'Rowers', 'Strength'],
                datasets: [{
                    label: 'Revenue by Type',
                    data: [1850, 1200, 650, 430, 150],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(241, 196, 15, 0.7)',
                        'rgba(230, 126, 34, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if necessary
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if necessary
    return `${year}-${month}-${day}`;
}
    // ===== SETTINGS VIEW INITIALIZATION =====
    function updateNotificationStatusIndicators() {
        const emailEnabled = document.getElementById('email-notifications').checked;
        const smsEnabled = document.getElementById('sms-notifications').checked;
        
        const emailStatus = document.getElementById('email-notification-status');
        const smsStatus = document.getElementById('sms-notification-status');
        
        emailStatus.className = 'notification-status ' + (emailEnabled ? 'enabled' : '');
        smsStatus.className = 'notification-status ' + (smsEnabled ? 'enabled' : '');
    }
    
    async function loadSettings() {
        // Show loading state
        const btn = document.getElementById('save-settings');
        const originalHTML = btn ? btn.innerHTML : '';
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading settings...';
            btn.disabled = true;
        }
    
        try {
            // Clear any previous validation errors
            clearAllValidationErrors();
            
            // Check if user is authenticated
            const user = auth.currentUser;
            let settings = null;
            
            // 1. Try loading from Firestore
            if (user) {
                try {
                    const settingsRef = doc(db, "settings", user.uid);
                    const docSnap = await getDoc(settingsRef);
                    
                    if (docSnap.exists()) {
                        settings = docSnap.data();
                        console.log("Settings loaded from Firestore:", settings);
                        // Store in localStorage for faster access
                        localStorage.setItem('fitnessRepairSettings', JSON.stringify(settings));
                    }
                } catch (firestoreError) {
                    console.warn("Firestore load failed, falling back to localStorage:", firestoreError);
                }
            }
            
            // 2. If not found in Firestore, try localStorage
            if (!settings) {
                const localData = localStorage.getItem('fitnessRepairSettings');
                if (localData) {
                    settings = JSON.parse(localData);
                    console.log("Settings loaded from localStorage:", settings);
                }
            }
            
            // 3. Apply settings to form or use defaults
            if (settings) {
                window.fitnessRepairSettings = settings;
                document.getElementById('settings-full-name').value = settings.fullName || "Admin User";
                document.getElementById('settings-business-name').value = settings.businessName || "Canadian Fitness Repair";
                document.getElementById('settings-start-time').value = settings.startTime || "08:00";
                document.getElementById('settings-end-time').value = settings.endTime || "18:00";
                document.getElementById('email-notifications').checked = settings.emailNotifications !== false; // default true
                document.getElementById('sms-notifications').checked = !!settings.smsNotifications;
                document.getElementById('admin-phone').value = settings.adminPhone || "";
                document.getElementById('sms-carrier').value = settings.smsCarrier || "";
                if (settings.province) {
                    document.getElementById('business-province').value = settings.province;
                }
                if (settings.timeZone) {
                    document.getElementById('timezone').value = settings.timeZone;
                } else {
                    // Set default based on user's location
                    const defaultTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    document.getElementById('timezone').value = 
                        defaultTZ.startsWith('America') ? defaultTZ : 'America/Toronto';
                }
                // Update business name in UI
                if (settings.businessName) {
                    document.querySelector('.brand h2').textContent = settings.businessName;
                }
            } else {
                // Set default values if no settings found
                document.getElementById('settings-full-name').value = "Admin User";
                document.getElementById('settings-business-name').value = "Canadian Fitness Repair";
                document.getElementById('settings-start-time').value = "08:00";
                document.getElementById('settings-end-time').value = "18:00";
                document.getElementById('email-notifications').checked = true;
                document.getElementById('sms-notifications').checked = false;
                document.getElementById('admin-phone').value = "";
                document.getElementById('sms-carrier').value = "";
            }
            
            // Update notification indicators
            updateNotificationStatusIndicators();
            
            // Show success message
            showToast("Settings loaded successfully");
            
        } catch (error) {
            console.error("Error loading settings:", error);
            showToast("Failed to load settings", true);
        } finally {
            // Restore button state
            if (btn) {
                btn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
                btn.disabled = false;
            }
        }
    }
    
    async function saveSettings() {
        const btn = document.getElementById('save-settings');
        if (!btn) return;
        
        const originalHTML = btn.innerHTML;
        
        // Show loading state
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;
        
        try {
            // Authentication State Check
            const user = auth.currentUser;
            if (!user) {
                showToast("You need to be logged in to save settings", true);
                return;
            }
            
            // Get form values
            const fullName = document.getElementById('settings-full-name').value.trim();
            const businessName = document.getElementById('settings-business-name').value.trim();
            const startTime = document.getElementById('settings-start-time').value;
            const endTime = document.getElementById('settings-end-time').value;
            const emailNotifications = document.getElementById('email-notifications').checked;
            const smsNotifications = document.getElementById('sms-notifications').checked;
            const adminPhone = document.getElementById('admin-phone').value.trim();
            const smsCarrier = document.getElementById('sms-carrier').value;
            const province = document.getElementById('business-province').value;
            const timeZone = document.getElementById('timezone').value;
            
            
            // Clear previous errors
            clearAllValidationErrors();
            
            // Validate inputs
            let isValid = true;
            
            if (!fullName) {
                showValidationError('settings-full-name', 'Full name is required');
                isValid = false;
            }
            
            if (!businessName) {
                showValidationError('settings-business-name', 'Business name is required');
                isValid = false;
            }
            
            // CANADIAN PHONE VALIDATION (supports 10-digit format)
            if (adminPhone) {
                const cleanPhone = adminPhone.replace(/\D/g, '');
                // Validates 10-digit Canadian numbers (without country code)
                if (cleanPhone.length !== 10) {
                    showValidationError('admin-phone', 'Canadian phone must be 10 digits (e.g., 4165551234)');
                    isValid = false;
                }
            } else if (smsNotifications) {
                showValidationError('admin-phone', 'Phone number is required for SMS notifications');
                isValid = false;
            }
            
            // CANADIAN CARRIER VALIDATION
            const canadianCarriers = ['rogers', 'fido', 'bell', 'telus', 'koodo', 'virgin', 'freedom', 'chatr', 'public'];
            if (smsNotifications) {
                if (!smsCarrier) {
                    showToast("Please select a mobile carrier for SMS notifications", true);
                    isValid = false;
                } else if (!canadianCarriers.includes(smsCarrier)) {
                    showToast("Selected carrier is not supported in Canada", true);
                    isValid = false;
                }
            }
    
            if (!startTime || !endTime) {
                showToast("Business hours are required", true);
                isValid = false;
            } else if (startTime >= endTime) {
                showToast("Closing time must be after opening time", true);
                isValid = false;
            }
            
            if (!isValid) {
                showToast("Please fix validation errors", true);
                return;
            }
            
            // Prepare settings data
            const settings = {
                fullName,
                businessName,
                startTime,
                endTime,
                emailNotifications,
                smsNotifications,
                province,
                timeZone,
                // Store cleaned Canadian phone number
                adminPhone: adminPhone.replace(/\D/g, ''),
                smsCarrier,
                lastUpdated: new Date().toISOString(),
                country: "CA" // Add country identifier
            };
            
            // Store in localStorage
            localStorage.setItem('fitnessRepairSettings', JSON.stringify(settings));
            
            // Save to Firestore
            try {
                const settingsRef = doc(db, "settings", user.uid);
                await setDoc(settingsRef, settings, { merge: true });
            } catch (firestoreError) {
                console.error("Firestore save error:", firestoreError);
                // Special handling for Canadian users
                if (firestoreError.code === 'permission-denied') {
                    showToast("Permission error. Please contact support.", true);
                } else {
                    showToast(`Failed to save settings: ${firestoreError.message}`, true);
                }
                return;
            }
            
            // Update UI
            document.querySelector('.brand h2').textContent = businessName;
            showToast("Settings saved successfully!");
            updateNotificationStatusIndicators();
            
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast(`Failed to save settings: ${error.message}`, true);
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    }
    function checkAndShowReminder(appointments) {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  
  // Create a unique key for today's reminder check
  const reminderKey = `reminderShown_${todayStr}`;
  
  // Only run once per day per tab session
  if (sessionStorage.getItem(reminderKey)) return;

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

  const hasReminder = appointments.some(app => {
    const dateStr = app.dateObj?.toLocaleDateString('en-CA');
    return dateStr === tomorrowStr && app.reminderEnabled;
  });

  if (hasReminder) {
    showToast("📅 Reminder: You have appointments scheduled for tomorrow.");
    // Set session storage with date-specific key
    sessionStorage.setItem(reminderKey, 'true');
  }
}
    async function fetchLogs() {
  const logsBody = document.getElementById("logs-body");
  logsBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading logs...</td></tr>`;

  try {
    const logsQuery = query(collection(db, "logs"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(logsQuery);
    allLogs = [];

    for (const logDoc of snapshot.docs) {
      const log = logDoc.data();
      const time = log.timestamp?.toDate?.().toLocaleString() || "N/A";
      let customerName = "N/A";

      if (log.appointmentId) {
        try {
          const apptSnap = await getDoc(doc(db, "appointments", log.appointmentId));
          if (apptSnap.exists()) {
            customerName = apptSnap.data().customer || "Unknown";
          }
        } catch (err) {
          console.warn("Error fetching appointment:", err.message);
        }
      }

      allLogs.push({
        ...log,
        customer: customerName,
        timeStr: time
      });
    }

    renderLogsPage(); // Render page 1
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    logsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Failed to load logs</td></tr>`;
  }
}
        function renderLogsPage() {
            const logsBody = document.getElementById("logs-body");
            const start = (currentLogPage - 1) * logsPerPage;
            const pageLogs = allLogs.slice(start, start + logsPerPage);

            const rows = pageLogs.map(log => `
                <tr>
                <td>${log.type}</td>
                <td>${log.customer || "N/A"}</td>
                <td>${log.emailSent ? "✅" : "❌"}</td>
                <td>${log.smsSent ? "✅" : "❌"}</td>
                <td>${log.status || "-"}</td>
                <td>${log.timeStr || "-"}</td>
                <td>${log.smsError || "-"}</td>
                </tr>
            `);

            logsBody.innerHTML = rows.length > 0
                ? rows.join("")
                : `<tr><td colspan="7" style="text-align:center;">No logs found.</td></tr>`;

            // Update pagination UI
            const totalPages = Math.ceil(allLogs.length / logsPerPage);
            document.getElementById("log-page-indicator").textContent = `Page ${currentLogPage} of ${totalPages}`;
            document.getElementById("prev-log-page").disabled = currentLogPage === 1;
            document.getElementById("next-log-page").disabled = currentLogPage >= totalPages;
            }

    function checkAndShowReminder(appointments) {
  // 🔁 Only run once per tab session
  if (sessionStorage.getItem('reminderShown') === 'true') return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

  const hasReminder = appointments.some(app => {
    const dateStr = app.dateObj?.toLocaleDateString('en-CA');
    return dateStr === tomorrowStr && app.reminderEnabled;
  });

  if (hasReminder) {
    showToast("📅 Reminder: You have appointments scheduled for tomorrow.");
    sessionStorage.setItem('reminderShown', 'true');
  }
}

    // Email notification service
    async function sendEmailNotification(eventType, appointment) {
        let subject, body;
        
        switch(eventType) {
            case 'appointment_created':
                subject = "New Appointment Created";
                body = `You have a new appointment with ${appointment.customer} on ${appointment.dateObj.toLocaleDateString()}`;
                break;
            case 'appointment_updated':
                subject = "Appointment Updated";
                body = `Appointment with ${appointment.customer} has been updated`;
                break;
            case 'appointment_reminder':
                subject = "Appointment Reminder";
                body = `Reminder: You have an appointment with ${appointment.customer} tomorrow`;
                break;
        }
        
        try {
            await fetch('https://cfr-backend-1.onrender.com/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            recipient: "canadianfitnessrepair@gmail.com",
            subject,
            body
        })
    });
} catch (error) {
    console.error('Email sending failed:', error);
}

    }
    
    // SMS notification service
    async function sendSMSNotification(eventType, appointment) {
        try {
            // Get admin notification settings
            const settings = JSON.parse(localStorage.getItem('fitnessRepairSettings') || '{}');
            
            // Check if SMS notifications are enabled
            if (eventType !== 'test' && !settings.smsNotifications) {
                console.log("SMS notifications are disabled");
                return false;
            }
            
            // Ensure we have required information
            if (!settings.adminPhone || !settings.smsCarrier) {
                const errorMsg = "Missing admin phone or carrier information";
                if (eventType === 'test') {
                    showToast("Cannot send SMS: " + errorMsg, true);
                }
                console.error(errorMsg);
                return false;
            }
    
            // Format message based on event type
            let message;
            switch(eventType) {
                case 'appointment_created':
                    message = `📅 New appt: ${appointment.customer} on ${appointment.dateObj.toLocaleDateString('en-CA')} at ${appointment.dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    break;
                case 'appointment_updated':
                    message = `🔄 Updated: ${appointment.customer}'s appt on ${appointment.dateObj.toLocaleDateString('en-CA')}`;
                    break;
                case 'appointment_reminder':
                    message = `⏰ Reminder: Appt with ${appointment.customer} tomorrow at ${appointment.dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    break;
                case 'test':
                    message = "✅ Test: Canadian Fitness Repair notifications are working!";
                    break;   
                default:
                    message = `ℹ️ Appointment update: ${appointment.customer}`;
            }
            
            // Truncate message to SMS length limit
            const smsMessage = message.substring(0, 160);
            
            // Show sending notification for test SMS
            if (eventType === 'test') {
                showToast("Sending test SMS...");
            }
    
            // CANADIAN CARRIER GATEWAYS
            const canadianCarrierGateways = {
                rogers: "pcs.rogers.com",
                fido: "fido.ca",
                bell: "txt.bell.ca",
                telus: "msg.telus.com",
                koodo: "msg.koodomobile.com",
                virgin: "vmobile.ca",
                freedom: "txt.freedommobile.ca",
                chatr: "pcs.rogers.com",  // Same as Rogers
                public: "msg.telus.com"   // Same as Telus
            };
    
            // Get domain for selected carrier
            const domain = canadianCarrierGateways[settings.smsCarrier];
            if (!domain) {
                const errorMsg = `Unsupported Canadian carrier: ${settings.smsCarrier}`;
                if (eventType === 'test') {
                    showToast(errorMsg, true);
                }
                console.error(errorMsg);
                return false;
            }
    
            // Format phone number for Canadian SMS gateway (1 + 10-digit number)
            const cleanPhone = settings.adminPhone.replace(/\D/g, '');
            if (cleanPhone.length !== 10) {
                const errorMsg = "Canadian phone must be 10 digits";
                if (eventType === 'test') {
                    showToast(errorMsg, true);
                }
                console.error(errorMsg);
                return false;
            }
    
            // Create email address for SMS gateway (1 + 10 digits)
            const smsEmail = `1${cleanPhone}@${domain}`;
    
            // Send via email-to-SMS gateway
            const response = await fetch('https://cfr-backend-1.onrender.com/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        recipient: smsEmail,
        subject: "CFR Notification",
        body: smsMessage
    })
});
         
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log(`[📱 SMS SENT] ${eventType} to 1${cleanPhone} via ${settings.smsCarrier}`);
                
                if (eventType === 'test') {
                    showToast("Test SMS sent successfully! Check your phone.");
                }
                return true;
            } else {
                const errorMsg = result.error || "Unknown error";
                console.error('SMS sending failed:', errorMsg);
                
                if (eventType === 'test') {
                    showToast(`Failed to send SMS: ${errorMsg}`, true);
                }
                return false;
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
            
            if (eventType === 'test') {
                showToast(`SMS failed: ${error.message}`, true);
            }
            return false;
        }
    }
    // Run this check periodically (e.g., every hour)
    // setInterval(checkUpcomingAppointments, 60 * 60 * 1000);
    // ===== HELP VIEW INITIALIZATION =====
    function initHelpView() {
        // This could fetch FAQs from your backend
        // For now, we'll just initialize the support form
        document.getElementById('support-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const subject = document.getElementById('support-subject').value;
            const message = document.getElementById('support-message').value;
            
            if (!subject || !message) {
                showToast("Please fill all fields", true);
                return;
            }
            
            // Simulate sending support request
            showLoading(true);
            setTimeout(() => {
                showLoading(false);
                showToast("Your support request has been submitted!");
                document.getElementById('support-form').reset();
            }, 1500);
        });
    }
         // Notification trigger function
         function triggerNotifications(eventType, appointmentData) {
        console.log("🔥 triggerNotifications() started");
    console.log("📨 Sending notification type:", eventType, appointmentData);

    // Get current settings
    const settings = JSON.parse(localStorage.getItem('fitnessRepairSettings') || '{}');


    if (settings.emailNotifications) {
        sendEmailNotification(eventType, appointmentData);
    }

    if (settings.smsNotifications) {
        sendSMSNotification(eventType, appointmentData);
    }
}

document.getElementById("close-preview-icon").addEventListener("click", closePreviewModal);
document.getElementById("close-preview-btn").addEventListener("click", closePreviewModal);


function resetForm() {
    // Reset the form fields
    document.getElementById('customer-form').reset();
    
    // Clear all error messages
    document.querySelectorAll('.error-message').forEach(msg => msg.innerText = '');
    
    // Reset modal title to "Add New Customer"
    document.getElementById('customer-modal-title').textContent = "Add New Customer";
    
    // Reset editingCustomerId to null, as it's no longer editing
    editingCustomerId = null;

    // Optionally, you can close the modal
    document.getElementById('customer-modal').classList.remove('active');
}

function showCustomerDetailsModal(customer) {
    const modalContent = `
  <div style="
  padding: 24px 28px;
  max-width: 420px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #2c3e50;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  line-height: 1.5;
">
  <h3 style="
    margin: 0 0 18px;
    font-size: 1.75rem;
    font-weight: 700;
    color: #34495e;
    border-bottom: 2px solid #2980b9;
    padding-bottom: 8px;
  ">Customer Details</h3>

  <div style="margin-bottom: 14px;">
    <div style="font-weight: 600; color: #2980b9; font-size: 1rem;">Name</div>
    <div style="font-size: 1.1rem; color: #34495e;">${customer.name}</div>
  </div>

  <div style="margin-bottom: 14px;">
    <div style="font-weight: 600; color: #2980b9; font-size: 1rem;">Phone</div>
    <div style="font-size: 1.1rem; color: #7f8c8d;">${customer.phone || 'N/A'}</div>
  </div>

  <div style="margin-bottom: 14px;">
    <div style="font-weight: 600; color: #2980b9; font-size: 1rem;">Email</div>
    <div style="font-size: 1.1rem; color: #7f8c8d;">${customer.email || 'N/A'}</div>
  </div>

  <div style="margin-bottom: 14px;">
    <div style="font-weight: 600; color: #2980b9; font-size: 1rem;">Equipment</div>
    <div style="font-size: 1.1rem; color: #7f8c8d;">${customer.equipment || 'N/A'}</div>
  </div>

  <div style="margin-bottom: 24px;">
    <div style="font-weight: 600; color: #2980b9; font-size: 1rem;">Last Appointment</div>
    <div style="font-size: 1.1rem; color: #7f8c8d;">${customer.lastAppointment ? formatDate(customer.lastAppointment) : 'Never'}</div>
  </div>

  <button id="close-customer-modal" style="
    width: 100%;
    padding: 12px 0;
    background-color: #2980b9;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    cursor: pointer;
    transition: background-color 0.25s ease;
    box-shadow: 0 5px 15px rgba(41, 128, 185, 0.5);
  "
  onmouseover="this.style.backgroundColor='#1c5980'; this.style.boxShadow='0 7px 20px rgba(28, 89, 128, 0.7)';"
  onmouseout="this.style.backgroundColor='#2980b9'; this.style.boxShadow='0 5px 15px rgba(41, 128, 185, 0.5)';">
    Close
  </button>
</div>

`;

    openModal(modalContent);

    document.getElementById('close-customer-modal').addEventListener('click', () => {
        closeModal();
    });
}

function openModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.querySelector('.modal.active');
    if (modal) modal.remove();
}



// Validation functions
function isValidPhone(phone) {
    // This regex allows numbers with or without dashes.
    const phonePattern = /^(\d{3}[-\s]?)?(\d{3}[-\s]?)?(\d{4})$/;
    return phonePattern.test(phone);
}

function isValidEmail(email) {
    // Simple email validation pattern (can be more complex if needed)
   const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
}

async function saveCustomer() {
    const name = document.getElementById('customer-modal-name').value.trim();
    const phone = document.getElementById('customer-modal-phone').value.trim();
    const email = document.getElementById('customer-modal-email').value.trim();
    const address = document.getElementById('customer-modal-address').value.trim();
    const notes = document.getElementById('customer-modal-notes').value.trim();
    const equipment = document.getElementById('customer-modal-equipment').value.trim(); // New field for equipment
    const lastAppointment = document.getElementById('customer-modal-last-appointment').value.trim(); // New field for last appointment
    // Reset all previous error messages
    document.querySelectorAll('.error-message').forEach(msg => msg.innerText = '');
    
    // ✅ Validate required fields
    let isValid = true; // Flag to track validity

    // Validate name
    if (!name) {
        document.getElementById('name-error').innerText = "Full name is required";
        isValid = false;
    }

    // Ensure that either phone or email is provided
    if (!phone && !email) {
        document.getElementById('phone-error').innerText = "Either phone or email is required";
        isValid = false;
    }

    // Validate phone number if provided
    if (phone && !isValidPhone(phone)) {
        document.getElementById('phone-error').innerText = "Valid phone number is required";
        isValid = false;
    }

    // Validate email address if provided
    if (email && !isValidEmail(email)) {
        document.getElementById('email-error').innerText = "Valid email is required";
        isValid = false;
    }

    // Ensure address is provided
    if (!address) {
        document.getElementById('address-error').innerText = "Address is required";
        isValid = false;
    }

    if (!isValid) {
        showToast("Please fix the errors before saving.", true);
        return; // Stop execution if the form is invalid
    }
    // Equipment validation (optional if you require it)
    if (!equipment) {
        document.getElementById('equipment-error').innerText = "Equipment is required";
        isValid = false;
    }
    // Last Appointment validation (optional if you require it)
    if (!lastAppointment) {
        document.getElementById('last-appointment-error').innerText = "Last Appointment date is required";
        isValid = false;
    }
    // Show loading state while saving the data
    showLoading(true);

    const customerData = {
        name,
        phone,
        email,
        address,
        notes,
        equipment,           // Include equipment field
        lastAppointment,     // Include last appointment field
        createdAt: new Date().toISOString()
    };

    try {
        // Check if we are editing an existing customer or adding a new one
        if (editingCustomerId) {
            await updateDoc(doc(db, "customers", editingCustomerId), customerData);
            showToast("Customer updated!");
        } else {
            await addDoc(customersCollection, customerData);
            showToast("Customer added!");
        }

        // Close the modal and refresh customer data
        document.getElementById('customer-modal').classList.remove('active');
        fetchCustomers();
        resetForm(); // Reset form after successful save
    } catch (error) {
        // Handle errors and show feedback to the user
        showToast(`Failed to save customer: ${error.message}`, true);
        console.error(error);
    } finally {
        // Hide loading state when operation is complete
        showLoading(false);
    }
}
              // Helper to open default SMS app with prefilled message
function openSmsApp(phoneNumber, smsBody) {
  const encodedMessage = encodeURIComponent(smsBody);
  const smsUrl = `sms:${phoneNumber}?body=${encodedMessage}`;

  // Redirect browser to open SMS app
  window.location.href = smsUrl;

  // Show info toast to user
  showToast('SMS prepared. Please review and send it.', 'info');
}

            // Delete appointment from Firestore
            async function deleteAppointment(id) {
                if (!confirm("Are you sure you want to delete this appointment?")) return;
                
                showLoading(true);
                try {
                    await deleteDoc(doc(db, "appointments", id));
                    showToast("Appointment deleted successfully");
                    await fetchAppointments();
                } catch (error) {
                    console.error("Error deleting appointment:", error);
                    showToast("Failed to delete appointment", true);
                } finally {
                    showLoading(false);
                }
            }
  
          // Save (add or update) appointment in Firestore
async function saveAppointment() {
  // === Collect Form Data ===
  const customer = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const dateStr = document.getElementById('appointment-date').value;
  const timeStr = document.getElementById('appointment-time').value;
  const equipment = document.getElementById('equipment').value.trim();
  const basePrice = parseFloat(document.getElementById('appointment-base-price').value) || 0;
  const price = parseFloat(document.getElementById('appointment-price').value) || 0;
  const issue = document.getElementById('issue-description').value.trim();
  const status = document.getElementById('appointment-status').value;
  const reminderEnabled = document.getElementById('reminder-enabled').checked;
  const houseAddress = document.getElementById('house-address-input').value.trim();
  const distanceFromShopKm = parseFloat(document.getElementById('distance-value').value) || 0;
  const repairNotes = document.getElementById('repair-notes')?.value.trim() || '';
  const carrier = document.getElementById('customer-carrier')?.value || '';

  // === Combine date & time ===
  const dateTime = new Date(`${dateStr}T${timeStr}:00`);

  // === Prepare Firestore data object ===
  const data = {
    customer,
    phone,
    email,
    date: Timestamp.fromDate(dateTime),
    equipment,
    basePrice,
    price,
    issue,
    status,
    reminderEnabled,
    houseAddress,
    distanceFromShopKm,
    repairNotes,
    carrier
  };

  // === VALIDATION ===
  if (!data.customer) {
    showToast("Customer name is required", true);
    return;
  }

  if (!data.phone && !data.email) {
    showToast("At least one contact (phone or email) is required", true);
    return;
  }

  if (!data.date || data.date.toDate?.().toString() === 'Invalid Date') {
    showToast("Invalid date/time selected", true);
    return;
  }

  if (!data.equipment) {
    showToast("Equipment is required", true);
    return;
  }

  if (data.basePrice == null || isNaN(data.basePrice)) {
    showToast("Base price is required", true);
    return;
  }

  if (data.price == null || isNaN(data.price)) {
    showToast("Total price is required", true);
    return;
  }

  if (!data.issue) {
    showToast("Issue description is required", true);
    return;
  }

  if (!data.status) {
    showToast("Appointment status is required", true);
    return;
  }

  if (!data.houseAddress) {
    showToast("House address is required", true);
    return;
  }

  // === SUBMIT DATA ===
  showLoading(true);

  try {
    const notificationData = { ...data, dateObj: data.date.toDate() };

    if (editingAppointmentId) {
      // 🔄 Update existing appointment
      const docRef = doc(db, "appointments", editingAppointmentId);
      await updateDoc(docRef, data);
      showToast("Appointment updated successfully");
    } else {
      // ➕ Add new appointment
      await addDoc(appointmentsCollection, data);
      showToast("Appointment added successfully");
    }

    // === Customer last appointment sync ===
    const customersQuery = query(customersCollection, where("name", "==", data.customer));
    const customerSnapshot = await getDocs(customersQuery);

    if (!customerSnapshot.empty) {
      const customerDoc = customerSnapshot.docs[0];
      const customerRef = doc(db, "customers", customerDoc.id);
      await updateDoc(customerRef, {
        lastAppointment: data.date
      });
    } else {
      await addDoc(customersCollection, {
        name: data.customer,
        phone: data.phone || '',
        email: data.email || '',
        equipment: data.equipment || '',
        lastAppointment: data.date,
        houseAddress: data.houseAddress || ''
      });
    }

    // === Trigger notifications ===
    triggerNotifications(
      editingAppointmentId ? 'appointment_updated' : 'appointment_created',
      notificationData
    );

    editingAppointmentId = null;
    await fetchAppointments();
    document.getElementById('appointment-modal')?.classList.remove('active');
  } catch (error) {
    const action = editingAppointmentId ? "updating" : "creating";
    showToast(`Failed ${action} appointment: ${error.message}`, true);
    console.error("❌ Error:", error);
  } finally {
    showLoading(false);
  }
}


            // ================ RENDERING FUNCTIONS ================
            // Render appointments table
            function renderAppointmentsTable(list = appointments) {
    console.log("Appointments list being passed to render:", list); 
    // Create a filtered appointments list based on the status filter and search query
    let filteredAppointments = [...appointments];

    // Apply status filter
    if (statusFilter !== "All") {
        filteredAppointments = filteredAppointments.filter(app => app.status === statusFilter);
    }

    // Apply search filter if needed
    const searchQuery = document.getElementById('search-appointments')?.value.toLowerCase() || '';
    if (searchQuery) {
        filteredAppointments = filteredAppointments.filter(app => 
            (app.customer?.toLowerCase().includes(searchQuery)) ||
            (app.phone?.includes(searchQuery)) ||
            (app.email?.toLowerCase().includes(searchQuery)) ||
            (app.houseAddress?.toLowerCase().includes(searchQuery))
        );
    }

    const tbody = document.getElementById("appointments-body");
    tbody.innerHTML = ""; // Clear the current table contents

    if (filteredAppointments.length === 0) {
        console.log("No appointments to display."); 
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 30px;">
                    No appointments found
                </td>
            </tr>
        `;
        return;
    }

    // Pagination logic
    const start = (currentPage - 1) * appointmentsPerPage;
    const pageApps = filteredAppointments.slice(start, start + appointmentsPerPage); // Paginate filtered appointments

    // Render appointments
    pageApps.forEach((app) => {
        const statusInfo = statusMap[app.status] || {
            text: app.status || "",
            class: "",
            icon: ""
        };

        const confirmStatus = app.confirmationSentAt
            ? (app.lastAttemptStatus === "success"
                ? "✅"
                : app.lastAttemptStatus === "partial_success"
                    ? "⚠️"
                    : "❌")
            : "⏳";

        const confirmTooltip = {
            "✅": "Confirmation sent successfully",
            "⚠️": app.email
                ? "Partial success (email sent, SMS failed/skipped)"
                : "Partial success (SMS sent, email missing)",
            "❌": "Failed to send confirmation",
            "⏳": "Confirmation not sent yet"
        }[confirmStatus];

        const confirmTimestamp = app.confirmationSentAt
            ? formatTimestamp(app.confirmationSentAt.toDate?.() || new Date())
            : "";

        const isSent = app.confirmationSent;
        const hasChanges = !isSent || app.lastStatusSent !== app.status;
        const canSend = app.needsResend || !app.confirmationSent;
        const row = document.createElement("tr");
        const reminderIcon = app.reminderEnabled ? "🕒" : "";
        const isEdited = !!(app.editedEmailBody || app.editedSmsBody);
        // FIXED: Add unique address to each row
        const encodedAddress = app.houseAddress ? encodeURIComponent(app.houseAddress) : '';
        // ADDED: Directions button column
        row.innerHTML = `
            <td>#${app.id}</td>
            <td>${app.customer}</td>
            <td>${app.equipment || ""}</td>
            <td>${formatTimestamp(app.dateObj)}</td>
            <td>
                <span class="status-badge ${statusInfo.class}" title="${statusInfo.text}">
                    ${statusInfo.icon || ""} ${statusInfo.text}
                </span>
            </td>
            <td>$${(Number(app.price) || 0).toFixed(2)}</td>
            <td>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <span title="${confirmTooltip}" style="font-size: 18px;">${confirmStatus}</span>
                    ${confirmTimestamp ? `<small style="font-size: 11px; color: #ccc;">${confirmTimestamp}</small>` : ""}
                    ${reminderIcon ? `<span title="Reminder enabled">${reminderIcon}</span>` : ""}
                    ${isEdited ? `<span title="Custom message saved" style="font-size: 13px;">✏️</span>` : ""}
                </div>
            </td>
            <td class="action-cell">
                <button class="action-btn send-btn" data-id="${app.id}" title="Send Confirmation" ${canSend ? '' : 'disabled'}>
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button class="action-btn preview-btn" data-id="${app.id}" title="Preview Email & SMS">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${app.id}" aria-label="Edit appointment">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${app.id}" aria-label="Delete appointment">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="action-btn details-btn" data-id="${app.id}" title="View Details">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
            <!-- FIXED: Pass appointment-specific address -->
            <td>
                <button class="action-btn directions-btn" 
                        data-id="${app.id}" 
                        data-address="${encodedAddress}" 
                        title="Get Directions">
                    <i class="fas fa-map-marked-alt"></i>
                </button>
            </td>
                <td>
      ${app.distanceFromShopKm ? `${app.distanceFromShopKm} km` : 'N/A'}
    </td>
        `;

        tbody.appendChild(row);
    });

    // Attach button actions
    tbody.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.onclick = () => openEditModal(btn.dataset.id);
    });

    tbody.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.onclick = () => deleteAppointment(btn.dataset.id);
    });

    tbody.querySelectorAll(".send-btn").forEach((btn) => {
  // Detect mobile devices via user agent
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

  if (!isMobile) {
    btn.disabled = true;
    btn.innerHTML = "SMS not available on desktop";
    showToast("SMS functionality is only available on mobile.");
    return; // skip attaching onclick for desktop
  }

  btn.onclick = () => {
    const id = btn.dataset.id;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
    showToast("Sending confirmation...");

    fetch("https://cfr-backend-1.onrender.com/api/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, type: "confirmation" })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("Confirmation sent!");

        if (data.warnings && data.warnings.length > 0) {
          data.warnings.forEach(warning => {
            showToast(warning, true);  // Show warnings as error toasts
          });
        }

        // Open SMS app if backend sends smsBody and phoneNumber
        if (data.smsBody && data.phoneNumber) {
          openSmsApp(data.phoneNumber, data.smsBody);
        }

        fetchAppointments(); // Refresh appointment list
      } else {
        showToast("Failed to send confirmation", "error");
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane"></i>`;
      }
    })
    .catch(err => {
      console.error("Send confirmation error:", err);
      showToast("Network error while sending", "error");
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-paper-plane"></i>`;
    });
  };
});




    tbody.querySelectorAll(".details-btn").forEach((btn) => {
    btn.onclick = () => {
        showAppointmentDetails(btn.dataset.id);
    };
});


    tbody.querySelectorAll(".preview-btn").forEach((btn) => {
        btn.onclick = () => {
            const appointment = appointments.find(a => a.id === btn.dataset.id);
            if (appointment) openPreviewModal(appointment);
        };
    });
    
    // ADDED: Directions button handler
  // FIXED: Directions button handler with proper data binding
  tbody.querySelectorAll(".directions-btn").forEach(btn => {
        btn.onclick = () => {
            const address = btn.dataset.address;
            if (address) {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
            } else {
                showToast('No address available for this appointment', true);
            }
        };
    });
    // Pagination
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
    document.getElementById("page-indicator").textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById("prev-page").disabled = currentPage === 1;
    document.getElementById("next-page").disabled = currentPage >= totalPages;
}
        
            // Render customers table
            function renderCustomersTable() {
                const tbody = document.getElementById('customers-body');
                tbody.innerHTML = '';
                
                if (customers.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 30px;">
                                No customers found
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                customers.forEach(customer => {
                    const lastAppointment = customer.lastAppointment 
        ? formatDate(customer.lastAppointment.toDate ? customer.lastAppointment.toDate() : new Date(customer.lastAppointment))
        : 'Never';
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${customer.name}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.email || '-'}</td>
                        <td>${customer.equipment || '-'}</td>
                        <td>${lastAppointment}</td>
                        <td class="action-cell">
                            <button class="action-btn view-btn" data-id="${customer.id}" title="View Customer Details">
                                <i class="fas fa-eye"></i>
                            </button>
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
                document.querySelectorAll('.view-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        const customer = customers.find(c => c.id === id);
                        if (!customer) {
                            alert("Customer not found");
                            return;
                        }
                        showCustomerDetailsModal(customer);
                    });
                });
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (confirm("Are you sure you want to delete this customer?")) {
                            deleteCustomer(btn.dataset.id);
                        }
                    });
                });
                tbody.querySelectorAll(".send-btn").forEach((btn) => {
    btn.onclick = () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        showToast("Sending confirmation...");

        fetch("https://cfr-backend-1.onrender.com/api/send-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointmentId: id, type: "confirmation" })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast("Confirmation sent!");
                fetchAppointments();
            } else {
                showToast("Failed to send confirmation", "error");
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-paper-plane"></i>`;
            }
        })
        .catch((err) => {
            console.error("Send confirmation error:", err);
            showToast("Network error while sending", "error");
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-paper-plane"></i>`;
        });
    };
});
            }
            
            // Delete customer
            async function deleteCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    const confirmed = confirm(`Delete customer "${customer.name}" and all their appointments?`);
    if (!confirmed) return;

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
customerNameInput.addEventListener('input', function() {
  const value = this.value.toLowerCase();
  if (value.length < 2) return;
  
  const matches = customers.filter(customer => 
    customer.name.toLowerCase().includes(value)
  );
  
  showCustomerSuggestions(matches);
});

function showCustomerSuggestions(customers) {
  // Remove existing suggestions if any
  const existingList = document.getElementById('customer-suggestions');
  if (existingList) existingList.remove();
  
  if (customers.length === 0) return;
  
  const suggestions = document.createElement('ul');
  suggestions.id = 'customer-suggestions';
  suggestions.style.position = 'absolute';
  suggestions.style.background = 'var(--dark-card)';
  suggestions.style.border = '1px solid var(--dark-border)';
  suggestions.style.borderRadius = '8px';
  suggestions.style.zIndex = '1000';
  suggestions.style.width = customerNameInput.offsetWidth + 'px';
  
  customers.forEach(customer => {
    const item = document.createElement('li');
    item.textContent = customer.name;
    item.style.padding = '10px';
    item.style.cursor = 'pointer';
    item.style.borderBottom = '1px solid var(--dark-border)';
    
    item.addEventListener('click', () => {
      customerNameInput.value = customer.name;
      customerPhoneInput.value = customer.phone || '';
      customerEmailInput.value = customer.email || '';
      suggestions.remove();
    });
    
    suggestions.appendChild(item);
  });
  
  customerNameInput.parentNode.appendChild(suggestions);
}

// Close suggestions when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!e.target.matches('#customer-name, #customer-suggestions *')) {
    const suggestions = document.getElementById('customer-suggestions');
    if (suggestions) suggestions.remove();
  }
});
// Place this near your other Firestore functions
async function backfillCustomersFromAppointments() {
    showLoading(true);
    try {
        console.log("🚀 Starting backfill...");
        const snapshot = await getDocs(appointmentsCollection);
        let createdCount = 0;
        let skippedCount = 0;

        for (const docSnap of snapshot.docs) {
            const app = docSnap.data();
            if (!app.customer) continue;

            // Check if customer already exists by email or phone
            let customerExists = false;

            if (app.email) {
                const emailQuery = query(customersCollection, where("email", "==", app.email));
                const emailSnap = await getDocs(emailQuery);
                if (!emailSnap.empty) customerExists = true;
            }

            if (!customerExists && app.phone) {
                const phoneQuery = query(customersCollection, where("phone", "==", app.phone));
                const phoneSnap = await getDocs(phoneQuery);
                if (!phoneSnap.empty) customerExists = true;
            }

            if (customerExists) {
                console.log(`✅ Customer exists for ${app.customer}, skipping.`);
                skippedCount++;
                continue;
            }

            // Create customer
            await addDoc(customersCollection, {
                name: app.customer,
                phone: app.phone || '',
                email: app.email || '',
                equipment: app.equipment || '',
                houseAddress: app.houseAddress || '',
                lastAppointment: app.date || null
            });
            console.log(`✅ Created customer for ${app.customer}`);
            createdCount++;
        }

        showToast(`Backfill complete: Created ${createdCount}, Skipped ${skippedCount}`);
        console.log(`🎉 Backfill complete: Created ${createdCount}, Skipped ${skippedCount}`);
    } catch (error) {
        console.error("❌ Backfill error:", error);
        showToast(`Backfill failed: ${error.message}`, true);
    } finally {
        showLoading(false);
    }
}


document.getElementById('backfill-customers-btn').addEventListener('click', async () => {
  if (confirm("Are you sure you want to backfill customers from appointments? This may create duplicates if run multiple times.")) {
    try {
      await backfillCustomersFromAppointments();
    } catch (error) {
      console.error("Backfill failed:", error);
      alert("Backfill failed. Check console for details.");
    }
  }
});

            // Stats update
            function updateStats() {
    if (!appointments || appointments.length === 0) {
        console.log("No appointments available");
        // Clear counts to 0 for all cards
        const ids = [
            "total-appointments",
            "scheduled-count",
            "inprogress-count",
            "awaiting-parts-count",
            "parts-arrived-count",
            "scheduled-installation-count",
            "repaired-count",
            "completed-count",
            "cancelled-count"
        ];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = "0";
        });
        return;
    }

    // Count each status
    const statusCountMap = {};
    appointments.forEach(app => {
        statusCountMap[app.status] = (statusCountMap[app.status] || 0) + 1;
    });

    // Total appointments
    document.getElementById("total-appointments").textContent = appointments.length;
    document.getElementById('total-appointments-text').textContent = `${appointments.length} appointments`;

    // Update counts for each status card
    function updateCard(status, countId, textId, textSuffix) {
        const count = statusCountMap[status] || 0;
        const countEl = document.getElementById(countId);
        const textEl = document.getElementById(textId);
        if (countEl) countEl.textContent = count;
        if (textEl) textEl.textContent = `${count} ${textSuffix}`;
    }

    updateCard("Scheduled / Confirmed", "scheduled-count", "scheduled-text", "scheduled");
    updateCard("In Progress", "inprogress-count", "inprogress-text", "in progress");
    updateCard("Awaiting Parts", "awaiting-parts-count", "awaiting-parts-text", "awaiting parts");
    updateCard("Parts Arrived", "parts-arrived-count", "parts-arrived-text", "parts arrived");
    updateCard("Scheduled for Parts Installation", "scheduled-installation-count", "scheduled-installation-text", "scheduled for installation");
    updateCard("Repaired", "repaired-count", "repaired-text", "repaired");
    updateCard("Completed", "completed-count", "completed-text", "completed");
    updateCard("Cancelled", "cancelled-count", "cancelled-text", "cancelled");
}
            async function addOrUpdateCustomerFromAppointment(appointment) {
  try {
    const customersRef = collection(db, "customers");

    // Try to find existing customer by phone or email
    let q;
    if (appointment.phone) {
      q = query(customersRef, where("phone", "==", appointment.phone));
    } else if (appointment.email) {
      q = query(customersRef, where("email", "==", appointment.email));
    } else {
      // No contact info, so skip updating customers
      return;
    }

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Found existing customer — update it
      const customerDoc = querySnapshot.docs[0];
      await updateDoc(customerDoc.ref, {
        name: appointment.customer,
        phone: appointment.phone,
        email: appointment.email,
        equipment: appointment.equipment,
        lastAppointment: appointment.date.toDate?.() || new Date(),
      });
      console.log("Updated existing customer");
    } else {
      // No customer found — create new one
      await addDoc(customersRef, {
        name: appointment.customer,
        phone: appointment.phone,
        email: appointment.email,
        equipment: appointment.equipment,
        lastAppointment: appointment.date.toDate?.() || new Date(),
      });
      console.log("Added new customer");
    }
  } catch (error) {
    console.error("Error adding/updating customer:", error);
  }
}

            // Calendar rendering and summary
            function renderCalendar() {
                // Only render if calendar is visible
                if (!document.getElementById('calendar-view').classList.contains('active')) {
                    return;
                }
                const settings = JSON.parse(localStorage.getItem('fitnessRepairSettings') || '{}');
                const holidays = getCanadianHolidays(currentYear, settings.province || 'ON');
                const calendarGrid = document.getElementById("calendar-days");
                calendarGrid.innerHTML = "";
                
                const monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
                
                document.getElementById("current-month-year").textContent = 
                    `${monthNames[currentMonth]} ${currentYear}`;
                
                const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                daysOfWeek.forEach((day) => {
                    const dayHeader = document.createElement("div");
                    dayHeader.className = "calendar-day-header";
                    dayHeader.textContent = day;
                    calendarGrid.appendChild(dayHeader);
                });
                
                const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
                
                for (let i = 0; i < firstDay; i++) {
                    const emptyCell = document.createElement("div");
                    emptyCell.className = "calendar-day empty";
                    calendarGrid.appendChild(emptyCell);
                }
                
                for (let day = 1; day <= totalDays; day++) {
                    const dayCell = document.createElement("div");
                    dayCell.className = "calendar-day";
                    
                    // Check if holiday
                    const isHoliday = Object.values(holidays).some(holiday => 
                        holiday.getDate() === day && 
                        holiday.getMonth() === currentMonth
                    );
                    
                    if (isHoliday) {
                        dayCell.classList.add('holiday');
                    }
                    
                    const dayNumber = document.createElement("div");
                    dayNumber.className = "day-number";
                    dayNumber.textContent = day;
                    dayCell.appendChild(dayNumber);
                    
                    // Get appointments for this day
                    const dayApps = appointments.filter(app => {
                        if (!app.dateObj) return false;
                        const d = app.dateObj;
                        return d.getDate() === day && 
                               d.getMonth() === currentMonth && 
                               d.getFullYear() === currentYear;
                    });
                    
                    if (dayApps.length > 0) {
                        const container = document.createElement("div");
                        container.className = "calendar-appointments";
                        
                        dayApps.forEach(app => {
                            const item = document.createElement("div");
                            item.className = "appointment-item";
                            item.dataset.id = app.id;
                            const time = app.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            item.textContent = `${app.customer.split(" ")[0]} - ${time}`;
                            container.appendChild(item);
                        });
                        
                        dayCell.appendChild(container);
                    }
                    calendarGrid.appendChild(dayCell);
                }
                setupCalendarEventHandlers();
            }
            function setupCalendarEventHandlers() {
                document.querySelectorAll('.appointment-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        const appointmentId = e.currentTarget.dataset.id;
                        showAppointmentDetails(appointmentId);
                    });
                });
            }
     

            function showAppointmentDetails(id) {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;
    const basePrice = appointment.basePrice || 0;
    const price = appointment.price || basePrice;
    const totalPrice = price;
    const modalContent = `
  <style>
    /* Modal background assumed #1F2937 from your card */
    .modal-header {
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      margin-bottom: 20px;
      border-bottom: 2px solid #3b82f6; /* lighter blue accent */
      padding-bottom: 12px;
    }
    .modal-header-left {
      display: flex; 
      align-items: center; 
      gap: 14px;
    }
    .modal-header-left i {
      color: #3b82f6;  /* lighter blue */
      font-size: 1.6rem;
    }
    .modal-header-left h3 {
      margin: 0; 
      font-weight: 700; 
      font-size: 1.8rem; 
      color: #e0e7ff; /* very light blueish white */
    }
    .modal-header-right {
      display: flex; 
      gap: 12px; 
      align-items: center;
    }
    .btn-link {
      display: inline-flex; 
      align-items: center; 
      gap: 8px; 
      padding: 8px 14px; 
      border-radius: 8px; 
      font-weight: 700; 
      text-decoration: none; 
      font-size: 1rem; 
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
      user-select: none;
    }
    .btn-directions {
      background-color: #3b82f6; /* blue */
      color: white;
    }
    .btn-directions:hover {
      background-color: #2563eb; /* darker blue */
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.8);
    }
    .btn-call {
      background-color: #22c55e; /* bright green */
      color: white;
    }
    .btn-call:hover {
      background-color: #15803d; /* dark green */
      box-shadow: 0 6px 20px rgba(21, 128, 61, 0.8);
    }
    .modal-content {
      font-family: 'Helvetica Neue', Arial, sans-serif; 
      color: #d1d5db; /* light gray for text on dark */
      font-size: 1.1rem; 
      line-height: 1.6;
    }
    .modal-content p {
      margin: 6px 0;
    }
    .modal-content strong {
      color: #3b82f6; /* lighter blue for strong text */
    }
    .modal-actions {
      display: flex; 
      gap: 14px; 
      justify-content: flex-end;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .btn-primary {
      padding: 12px 26px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 5px 18px rgba(59, 130, 246, 0.6);
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
      flex: 1 1 auto;
      min-width: 140px;
      text-align: center;
      user-select: none;
    }
    .btn-primary:hover {
      background-color: #2563eb;
      box-shadow: 0 7px 22px rgba(37, 99, 235, 0.8);
    }
    .btn-secondary {
      padding: 12px 26px;
      background-color: #374151; /* dark gray */
      color: #d1d5db;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 5px 18px rgba(55, 65, 81, 0.5);
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
      flex: 1 1 auto;
      min-width: 140px;
      text-align: center;
      user-select: none;
    }
    .btn-secondary:hover {
      background-color: #1f2937; /* same as background, but can adjust */
      box-shadow: 0 7px 22px rgba(31, 41, 55, 0.7);
    }

    /* Responsive for screens < 380px */
    @media (max-width: 379px) {
      .modal-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      .modal-header-right {
        width: 100%;
        justify-content: space-between;
      }
      .modal-header-left h3 {
        font-size: 1.4rem;
      }
      .btn-link {
        font-size: 0.9rem;
        padding: 6px 10px;
      }
      .modal-content {
        font-size: 1rem;
      }
      .modal-actions {
        flex-direction: column;
        gap: 12px;
      }
      .btn-primary, .btn-secondary {
        min-width: 100%;
        font-size: 1rem;
        padding: 10px;
      }
    }
  </style>

  <div class="modal-header">
    <div class="modal-header-left">
      <i class="fas fa-info-circle"></i>
      <h3>Appointment Details</h3>
    </div>
    <div class="modal-header-right">
      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.houseAddress || '')}" target="_blank" title="Get Directions"
         class="btn-link btn-directions"
      >
        <i class="fas fa-location-arrow"></i> Directions
      </a>

      <a href="tel:${appointment.phone || ''}" title="Call Customer"
         class="btn-link btn-call"
      >
        <i class="fas fa-phone"></i> Call
      </a>
    </div>
  </div>

  <div class="modal-content">
    <p><strong>Customer:</strong> ${appointment.customer}</p>
    <p><strong>Date:</strong> ${formatTimestamp(appointment.dateObj)}</p>
    <p><strong>Phone:</strong> ${appointment.phone || 'N/A'}</p>
    <p><strong>Address:</strong> ${appointment.houseAddress || 'N/A'}</p>
    <p><strong>Equipment:</strong> ${appointment.equipment || 'N/A'}</p>
    <p><strong>Status:</strong> ${statusMap[appointment.status]?.text || appointment.status || 'N/A'}</p>
    <p><strong>Issue:</strong> ${appointment.issue || 'N/A'}</p>
    <p><strong>Base Price:</strong> $${(appointment.basePrice || 0).toFixed(2)}</p>
    <p><strong>Tax:</strong> $${((appointment.price || 0) - (appointment.basePrice || 0)).toFixed(2)}</p>
    <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
  </div>

  <div class="modal-actions">
    <button id="edit-details" class="btn-primary">Edit Appointment</button>
    <button id="close-details" class="btn-secondary">Close</button>
  </div>
`;

 
    openDetailsModal(modalContent, id);
}

            function exportAppointmentsCSV() {
  if (!appointments || appointments.length === 0) {
    showToast("No appointments to export", true);
    return;
  }

  const headers = ['ID', 'Customer', 'Phone', 'Date', 'Equipment', 'Status', 'Price'];
  const csvContent = [
    headers.join(','),
    ...appointments.map(a => [
      a.id,
      `"${a.customer}"`,
      a.phone || '',
      a.dateObj?.toISOString() || '',
      `"${a.equipment}"`,
      a.status || '',
      a.price || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `appointments-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // ✅ Success toast
  showToast("✅ Appointments exported as CSV");
}
            function isTomorrow(date) {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                return (
                    date.getFullYear() === tomorrow.getFullYear() &&
                    date.getMonth() === tomorrow.getMonth() &&
                    date.getDate() === tomorrow.getDate()
                );
                }

                function updateCalendarSummary() {
    // Get appointments for current month
    const monthlyApps = appointments.filter(app => {
        const appDate = app.dateObj;
        return appDate.getMonth() === currentMonth && 
               appDate.getFullYear() === currentYear;
    });

    // Get completed appointments using consistent status filter
    const completedAppointments = monthlyApps.filter(app => 
        app.status === "Completed"  // Use the same status string everywhere
    );

    // Calculate total revenue
    const totalRevenue = completedAppointments.reduce((sum, app) => {
        // Handle different price formats
        const price = typeof app.price === 'string' ? 
            parseFloat(app.price.replace(/[^0-9.]/g, '')) : 
            app.price;
            
        return sum + (price || 0);
    }, 0);

    const businessDays = getBusinessDays(currentMonth, currentYear);
    // Call it after DOM is loaded:
document.addEventListener('DOMContentLoaded', () => {
    setupStatusCardClickHandlers();
});
    // Update all elements consistently
    document.getElementById("summary-total").textContent = monthlyApps.length;
    document.getElementById("summary-days").textContent = businessDays;
    document.getElementById('summary-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('monthly-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('monthly-released').textContent = completedAppointments.length;
    const currentAppointments = monthlyApps.filter(app => app.status !== "Completed");
    document.getElementById("current-appointments").textContent = currentAppointments.length;

    const utilizationRate = Math.min(100, Math.round((monthlyApps.length / (businessDays * 3)) * 100));
    document.getElementById("summary-utilization").textContent = utilizationRate + "%";
}
            
            
            window.addEventListener('DOMContentLoaded', async () => {
  await fetchAppointments(); // ✅ Make sure appointments are loaded
  checkUpcomingAppointments(); // ✅ Run reminder logic after fetch
});
            document.getElementById("prev-log-page").addEventListener("click", () => {
            if (currentLogPage > 1) {
                currentLogPage--;
                renderLogsPage();
            }
            });
            document.addEventListener("geomap:address-selected", function (e) {
    const result = e.detail;

    // Fill hidden input with selected address
    document.getElementById("house-address-input").value = result.full_address;

    // Optional: display distance
    if (result.distance_km !== undefined) {
      document.getElementById("geomap-distance").textContent = result.distance_km.toFixed(2);
    }

    // Clear validation error
    const errorBox = document.getElementById("house-address-error");
    if (errorBox) errorBox.textContent = "";
  });
            document.getElementById("next-log-page").addEventListener("click", () => {
  const totalPages = Math.ceil(allLogs.length / logsPerPage);
  if (currentLogPage < totalPages) {
    currentLogPage++;
    renderLogsPage();
  }
});
            document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".close-modal").addEventListener("click", closePreviewModal);
});
                document.addEventListener('DOMContentLoaded', () => {
                loadGoogleMapsApi()
                    .then(() => initAutocomplete())
                    .catch(error => {
                    console.error('Google Maps API failed to load:', error);
                    });
                });
                // Dashboard card navigation
                document.getElementById('total-appointments-card').addEventListener('click', () => {
                    activateView('appointments');
                });

                document.getElementById('scheduled-card').addEventListener('click', () => {
                    activateView('appointments');
                    // Optional: Filter to show only scheduled appointments
                });

                document.getElementById('inprogress-card').addEventListener('click', () => {
                    activateView('appointments');
                    // Optional: Filter to show only in-progress appointments
                });

                document.getElementById('completed-card').addEventListener('click', () => {
                    activateView('appointments');
                    // Optional: Filter to show only completed appointments
                });
            
                window.addEventListener('DOMContentLoaded', () => {
  const distanceSpan = document.getElementById('gomaps-distance');

  // Assuming GoMaps triggers a custom event "gomaps:addressSelected"
  // with detail containing the distance (in km) or lat/lon to calculate it

  document.getElementById('gomaps-widget').addEventListener('gomaps:addressSelected', (e) => {
    // e.detail.distanceKm is assumed distance in kilometers
    if (e.detail && typeof e.detail.distanceKm === 'number') {
      distanceSpan.textContent = e.detail.distanceKm.toFixed(2);
    }
  });
});

            
            
                // Chart.js setup
                function initChart() {
    const ctx = document.getElementById("appointmentsStatusChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    const statusLabels = [
        "Scheduled / Confirmed",
        "In Progress",
        "Awaiting Parts",
        "Parts Arrived",
        "Scheduled for Parts Installation",
        "Repaired",
        "Completed",
        "Cancelled"
    ];

    const statusColors = [
    "rgba(93, 93, 255, 0.7)",    // Scheduled / Confirmed (blue)
    "rgba(52, 152, 219, 0.7)",   // In Progress (light blue)
    "rgba(241, 196, 15, 0.7)",   // Awaiting Parts (yellow)
    "rgba(155, 89, 182, 0.7)",   // Parts Arrived (purple)
    "rgba(0, 168, 150, 0.7)",    // Scheduled for Parts Installation (teal)
    "rgba(230, 126, 34, 0.7)",   // Repaired (orange)
    "rgba(39, 174, 96, 0.7)",    // Completed (green)
    "rgba(231, 76, 60, 0.7)"     // Cancelled (red)
];

    const statusBorderColors = statusColors.map(color => color.replace("0.7", "1"));

    const counts = statusLabels.map(status => 
        appointments.filter(a => a.status === status).length
    );

    chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: statusLabels,
            datasets: [{
                data: counts,
                backgroundColor: statusColors,
                borderColor: statusBorderColors,
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: { color: "#e5e7eb", font: { size: 12 } },
                },
                title: {
                    display: true,
                    text: "Appointment Status Distribution",
                    color: "#e5e7eb",
                    font: { size: 16 },
                },
            },
        },
    });
}

const monthYearLabel = document.getElementById('monthYearLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

function updateMonthYearLabel() {
  const date = new Date(currentYear, currentMonth);
  const options = { year: 'numeric', month: 'long' };
  monthYearLabel.textContent = date.toLocaleDateString(undefined, options);
monthYearLabel.style.color = "#ffffff";
monthYearLabel.style.fontWeight = "bold";
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateMonthYearLabel();
  renderAppointmentsChart(); // your function that draws chart for currentYear/currentMonth
}

prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

// Initialize label and chart on load, but **only after appointments data is ready**
function initAppointmentsView() {
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();
  updateMonthYearLabel();
  renderAppointmentsChart();
}



            // ================ MODAL MANAGEMENT ================
function openEditModal(id) {
  document.getElementById('toast-container').innerHTML = '';

  const app = appointments.find((a) => a.id === id);
  if (!app) return;

  editingAppointmentId = id;

  // 🧠 Store original values to detect changes
  const dateObj = app.dateObj || new Date();
  const dateStr = dateObj.toISOString().split("T")[0];
  const timeStr = dateObj.toTimeString().slice(0, 5);
  originalAppointmentData = {
    date: dateStr,
    time: timeStr,
    status: app.status || ""
  };

  // Clear validation & set values
  document.querySelectorAll('.validation-error').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.form-control').forEach(field => field.classList.remove('invalid'));

  document.getElementById("customer-name").value = app.customer;
  document.getElementById("customer-phone").value = app.phone || "";
  document.getElementById("customer-email").value = app.email || "";
  document.getElementById("customer-carrier").value = app.carrier || "unknown";
  document.getElementById("appointment-date").value = dateStr;
  document.getElementById("appointment-time").value = timeStr;
  document.getElementById("equipment").value = app.equipment || "";
  document.getElementById("appointment-base-price").value = app.basePrice || app.price || 0;
  document.getElementById("issue-description").value = app.issue || "";
  document.getElementById("repair-notes").value = app.repair_notes || "";
  document.getElementById("appointment-status").value = app.status || "";
  document.getElementById("reminder-enabled").checked = !!app.reminderEnabled;
  document.getElementById("house-address-input").value = app.houseAddress || "";
  document.getElementById('gomaps-distance').textContent = app.distanceFromShopKm || '0';

  calculateTax();

  document.getElementById("modal-title").textContent = "Edit Appointment";
  document.getElementById("save-appointment").textContent = "Update Appointment";

  // ✅ Set up click handler fresh
  const saveBtn = document.getElementById("save-appointment");
  saveBtn.onclick = null;
  saveBtn.onclick = () => saveAppointment();

  document.getElementById('appointment-modal').classList.add('active');
}


document.addEventListener('DOMContentLoaded', function() {
    fetchAppointments();
    setupStatusCardClickHandlers(); // ✅ this is good
});

function openAddModal() {
  // Clear existing toasts
  document.getElementById('toast-container').innerHTML = '';

  // Clear validation states
  const fields = document.querySelectorAll('#appointment-form .form-control');
  fields.forEach(field => {
    field.classList.remove('invalid');
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    if (errorElement) errorElement.textContent = '';
  });

  editingAppointmentId = null;

  // Reset form and set default values
  document.getElementById("appointment-form").reset();

  // ✅ Clear house address separately
  document.getElementById("house-address-input").value = "";

// ✅ Clear distance display
document.getElementById('gomaps-distance').textContent = '0';
document.getElementById('distance-value').value = '0';        // hidden input for form data

  // Clear validation errors
  document.querySelectorAll('.validation-error').forEach(el => {
    el.textContent = "";
    el.style.display = 'none';
  });

  document.querySelectorAll('.form-control').forEach(field => {
    field.classList.remove('invalid');
  });

  const today = new Date();
  document.getElementById("appointment-date").value = today.toISOString().split("T")[0];

  const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
  document.getElementById("appointment-time").value =
    `${nextHour.getHours().toString().padStart(2, "0")}:${nextHour.getMinutes().toString().padStart(2, "0")}`;

  document.getElementById("appointment-base-price").value = 120;
  calculateTax(); // Calculate initial tax

  // Update modal title
  document.getElementById("modal-title").innerHTML =
    '<i class="fas fa-calendar-plus"></i> Add New Appointment';
  document.getElementById("save-appointment").textContent = "Save Appointment";

  // ✅ Set up click handler for save button (fresh each time)
  const saveBtn = document.getElementById("save-appointment");
  saveBtn.onclick = null; // remove any previous handlers
  saveBtn.onclick = saveAppointment;

  // Show modal
  document.getElementById('appointment-modal').classList.add('active');
}       
                
    function closeAppointmentModal() {
                document.getElementById('appointment-modal').classList.remove('active');
            }
            
            function openAddCustomerModal() {
                editingCustomerId = null;
                document.getElementById('customer-form').reset();
                
                // Update modal title
                document.getElementById("customer-modal-title").innerHTML = 
                    '<i class="fas fa-user-plus"></i> Add New Customer';
                
                // Show modal
                document.getElementById('customer-modal').classList.add('active');
            }  
            function openEditCustomerModal(id) {
                const customer = customers.find(c => c.id === id);
                if (!customer) return;
                
                editingCustomerId = id;
                document.getElementById('customer-modal-name').value = customer.name || '';
                document.getElementById('customer-modal-phone').value = customer.phone || '';
                document.getElementById('customer-modal-email').value = customer.email || '';
                document.getElementById('customer-modal-address').value = customer.address || '';
                document.getElementById('customer-modal-notes').value = customer.notes || '';
                document.getElementById('customer-modal-equipment').value = customer.equipment || '';  // New field for equipment
                document.getElementById('customer-modal-last-appointment').value = customer.lastAppointment || '';  // New field for last appointment
                document.getElementById('customer-modal-title').textContent = "Edit Customer";
                document.getElementById('customer-modal').classList.add('active');
            }
            async function updateAppointmentField(id, data) {
  const db = firebase.firestore();
  await db.collection("appointments").doc(id).update(data);
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
                        activateView(view);
                    });
                });
                
                document.querySelectorAll(".nav-links a").forEach(link => {
                    link.addEventListener("click", (e) => {
                        e.preventDefault();
                        const view = link.dataset.view;
                        activateView(view);
                        
                        // Auto-close sidebar on mobile
                        if (window.innerWidth <= 576) {
                            document.querySelector('.sidebar').classList.remove('active');
                        }
                    });
                });
    
                // Logout button
                document.querySelector('.nav-links a[data-view="logout"]').addEventListener("click", (e) => {
                    e.preventDefault();
                    logout();
                });
                // View switcher for sidebar links (including logs)
document.querySelectorAll('[data-view]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const view = link.getAttribute('data-view');
    activateView(view);
  });
});
                // Top tab navigation
                document.querySelectorAll(".tab").forEach(tab => {
                    tab.addEventListener("click", () => {
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        activateView(tab.dataset.tab);
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
                    updateCalendarSummary();
                });
                
                document.getElementById("next-month").addEventListener("click", () => {
                    currentMonth++;
                    if (currentMonth > 11) {
                        currentMonth = 0;
                        currentYear++;
                    }
                    renderCalendar();
                    updateCalendarSummary();
                });
                
                // Appointment pagination
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
                
                // Search functionality
                document.getElementById("search-appointments").addEventListener("input", function () {
                    const keyword = this.value.toLowerCase();
                    const filtered = appointments.filter(
                        (app) => app.customer.toLowerCase().includes(keyword) ||
                                 (app.phone && app.phone.toLowerCase().includes(keyword))
                    );
                    currentPage = 1;
                    renderAppointmentsTable(filtered);
                });
                
                // Print button
                document.getElementById("print-schedule").addEventListener("click", () => {
                    window.print();
                });
                document.getElementById('export-appointments').addEventListener('click', exportAppointmentsCSV);

                // Add tax calculation to base price input
                const basePriceInput = document.getElementById('appointment-base-price');
                if (basePriceInput) {
                    basePriceInput.addEventListener('input', calculateTax);
                }
                
                // Add appointment button
                document.getElementById("add-appointment").addEventListener("click", openAddModal);
                
                document.getElementById("save-appointment").addEventListener("click", async () => {
    const customerName = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const email = document.getElementById("customer-email")?.value?.trim() || "";
    const houseAddress = document.getElementById("house-address-input").value.trim();

    if (!houseAddress) {
        showValidationError('house-address-input', 'House address is required');
        return;
    }

    const carrier = (document.getElementById("customer-carrier")?.value || "").toLowerCase();

    if (!phone && !email) {
        alert("Please enter at least a phone number or email address.");
        return;
    }

    const dateInput = document.getElementById("appointment-date").value;
    const timeInput = document.getElementById("appointment-time").value;
    const dateObj = new Date(`${dateInput}T${timeInput}`);
    const timestamp = Timestamp.fromDate(dateObj);
    const equipment = document.getElementById("equipment").value.trim();
    const basePrice = parseFloat(document.getElementById("appointment-base-price").value) || 0;
    const issue = document.getElementById("issue-description").value.trim();
    const status = document.getElementById("appointment-status").value;
    const repairNotes = document.getElementById("repair-notes").value.trim();

    const settings = JSON.parse(localStorage.getItem('fitnessRepairSettings') || '{}');
    const province = settings.province || 'ON';
    const taxRate = getTaxRate(province);
    const totalPrice = parseFloat((basePrice * (1 + taxRate)).toFixed(2));

    const reminderEnabled = document.getElementById("reminder-enabled").checked;

    // ✅ NEW: Capture GoMaps calculated distance
    const distanceKm = parseFloat(document.getElementById("gomaps-distance").textContent) || 0;

    // 🔍 Compare with original values
    const hasChanges =
        editingAppointmentId &&
        (dateInput !== originalAppointmentData.date ||
            timeInput !== originalAppointmentData.time ||
            status !== originalAppointmentData.status);

    const appointmentData = {
        customer: customerName,
        phone,
        email,
        carrier,
        equipment,
        houseAddress,
        distanceFromShopKm: distanceKm, // ✅ SAVE DISTANCE TO FIRESTORE
        date: timestamp,
        basePrice,
        price: totalPrice,
        taxRate,
        issue,
        status,
        repair_notes: repairNotes,
        createdAt: Timestamp.now(),
        createdBy: auth.currentUser.uid,
        confirmationSent: false,
        confirmationSentAt: null,
        lastStatusSent: "",
        lastAttemptStatus: "",
        reminderEnabled,
        needsResend: hasChanges // ✅ flag if changed
    };

    console.log("📝 Saving appointment:", appointmentData);

    await saveAppointment(appointmentData);
});


                // Modal controls
                document.querySelectorAll('.close-modal').forEach(btn => {
                    btn.addEventListener('click', () => {
                        closeAppointmentModal();
                        closeCustomerModal();
                    });
                });
                document.querySelector('.main-content').addEventListener('click', function(e) {
    const card = e.target.closest('.card-grid .card');
    if (card) {
    const status = card.getAttribute('data-status');
    if (status) {
        // Update statusFilter (Ensure this is declared somewhere in your code)
        statusFilter = status;

        // Correct the ID to appointment-status
        const statusDropdown = document.getElementById('appointment-status');

        // Ensure statusDropdown exists before setting its value
        if (statusDropdown) {
            statusDropdown.value = status;
            activateView("appointments");
        } else {
            console.error('Status dropdown not found');
        }
    }
}
});
                document.getElementById("cancel-appointment").addEventListener("click", closeAppointmentModal);
                
                // Customer modals
                document.getElementById('add-customer').addEventListener('click', openAddCustomerModal);
                document.getElementById('save-customer').addEventListener('click', saveCustomer);
                document.getElementById('cancel-customer').addEventListener('click', closeCustomerModal);
                document.getElementById('search-appointments').addEventListener('input', function() {
    renderAppointmentsTable();
});
                // Mobile menu toggle
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                const sidebar = document.querySelector('.sidebar');
                const closeSidebarBtn = document.querySelector('.close-sidebar-mobile');
                // Add mobile close functionality
                document.querySelector('.close-sidebar-mobile')?.addEventListener('click', () => {
                    document.querySelector('.sidebar').classList.remove('active');
                });
                mobileMenuBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });
                
                // Close sidebar when close button is clicked
                closeSidebarBtn?.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                });
                
                // Add this in setupEventListeners()
                const saveSettingsBtn = document.getElementById('save-settings');
                if (saveSettingsBtn) {
                    saveSettingsBtn.addEventListener('click', saveSettings);
                }   
                const cancelSettingsBtn = document.getElementById('cancel-settings');
                if (cancelSettingsBtn) {
                    cancelSettingsBtn.addEventListener('click', () => {
                        loadSettings(); // Revert form to saved values
                        showToast("Changes reverted");
                    });
                }        
    }

    document.getElementById('lookup-carrier')?.addEventListener('click', async () => {
  const phone = document.getElementById('customer-phone')?.value?.trim();
  if (!phone) return alert("Please enter a phone number first");

  try {
    // 📋 Copy to clipboard
    await navigator.clipboard.writeText(phone);
    alert("Phone number copied to clipboard. You can now paste it into the search box.");

    // 🌐 Open freecarrierlookup search page
    window.open("https://freecarrierlookup.com/", "_blank");
  } catch (err) {
    console.error("Clipboard error:", err);
    alert("Failed to copy phone number.");
  }
});
// Next button handler
document.querySelector('.next-step').addEventListener('click', () => {
  if (validateStep(currentStep)) {
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    } else {
      // On last step, next button becomes "Complete"
      document.getElementById('save-appointment').click();
    }
  }
});
// Add to initApp function
document.getElementById('save-appointment').addEventListener('click', saveAppointment);
// Previous button handler
document.querySelector('.prev-step').addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
});
    window.addEventListener('DOMContentLoaded', function () {
        // Use setInterval to repeatedly check if 'status-filter' exists
        const checkStatusFilter = setInterval(function() {
            const statusFilter = document.getElementById('appointment-status');
           console.log("Current statusFilter:", statusFilter);  // Add this line for debugging


            if (statusFilter) {
                // Stop checking once it's found
                clearInterval(checkStatusFilter); 

                // Add event listener for change event
                statusFilter.addEventListener('change', function () {
                    const selectedStatus = this.value;
                    const url = selectedStatus === 'All'
                        ? 'appointments.html'
                        : `appointments.html?status=${encodeURIComponent(selectedStatus)}`;
                    window.history.pushState({}, '', url);
                    fetchAppointments(); // Assuming fetchAppointments is defined elsewhere
                });
            }
        }, 100); // Check every 100ms
    });

    document.addEventListener("DOMContentLoaded", () => {
  if (typeof GoMaps !== "undefined") {
    GoMaps.init({
      widgetId: "gomaps-widget",
      apiKey: "AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c",
      outputId: "house-address-input",
      distanceFrom: "22 Canary Grass Blvd, Hamilton, Ontario, L0R 1P0",
      mapHeight: "200px",
      showMap: true,
      label: "Start typing your address..."
    });
  } else {
    console.error("GoMaps script not loaded");
  }
});


  // Add to setupEventListeners()
    document.getElementById('test-sms-btn')?.addEventListener('click', sendTestSMS);
    // Add to initApp function
document.getElementById('customer-phone').addEventListener('blur', function() {
    if (this.value && !validatePhone(this.value)) {
        showValidationError('customer-phone', 'Invalid Canadian phone format');
    }
});

document.getElementById('customer-email').addEventListener('blur', function() {
    if (this.value && !validateEmail(this.value)) {
        showValidationError('customer-email', 'Invalid email format');
    }
});
    function sendTestSMS() {
        // Get current settings
        const settings = JSON.parse(localStorage.getItem('fitnessRepairSettings') || '{}');
        
        // Check if settings are saved
        if (!settings.adminPhone || !settings.smsCarrier) {
            showToast("Please save your phone and carrier settings first", true);
            return;
        }
        
        // Create test appointment data
        const testAppointment = {
            customer: "Test User",
            dateObj: new Date(),
            id: "test-123"
        };
        
        // Show sending notification
        showToast("Sending test SMS...");
        
        // Send test notification
        sendSMSNotification('test', testAppointment);
    }
    document.addEventListener("DOMContentLoaded", function() {
    // Add event listener for the reset button
    document.getElementById('reset-customer').addEventListener('click', resetForm);
});
function openDetailsModal(content, id) {
  // Remove any existing modal first (optional)
  const existingModal = document.querySelector('.modal.active');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      ${content}
    </div>
  `;
  document.body.appendChild(modal);

  // Close button listener - remove modal immediately
  const closeBtn = modal.querySelector('#close-details');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
  }

  // Edit button listener
  const editBtn = modal.querySelector('#edit-details');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      // Remove details modal immediately
      modal.remove();

      // If you have a function to switch views, call it (optional)
      if (typeof activateView === 'function') {
        activateView('appointments');
      }

      // Open edit modal after a short delay to ensure DOM updates
      setTimeout(() => {
        openEditModal(id);
      }, 100); // 100ms is usually enough
    });
  }
}

            // ================ INITIALIZATION ================
            function initialize() {
                setupEventListeners();
                activateView('dashboard');
                
                // Set current date for appointment form
                const today = new Date();
                document.getElementById("appointment-date").value = today.toISOString().split("T")[0];
                
                const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
                document.getElementById("appointment-time").value = 
                    `${nextHour.getHours().toString().padStart(2, "0")}:${nextHour.getMinutes().toString().padStart(2, "0")}`;
                
                // Initialize form validation
                initializeValidation();
                
                // Hide loading overlay after 1.5s
                setTimeout(() => {
                    document.getElementById('loading-overlay').style.display = 'none';
                }, 1500);
            }
            
            // Start the application
            initialize();
        }


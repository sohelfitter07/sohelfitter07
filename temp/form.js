
document.addEventListener("DOMContentLoaded", function () {
  emailjs.init("Y3qHd9eGkrVsfM-Fs");
  const yourPhone = "12899257239";
const yourEmail = "canadianfitnessrepair@gmail.com";
let lastSubmission = null; // Store form data
// Add this AFTER declaring yourPhone/yourEmail
document.getElementById("emailLink").addEventListener("click", function(e) {
e.preventDefault();

if (!lastSubmission) {
alert("Please submit the form before sending media");
return;
}

const { name, phone, city, service, brand, model } = lastSubmission;

const message = `Hi! I just submitted a repair request. Here are my details:
Name: ${name}
Phone: ${phone}
City: ${city}
Service: ${service}
Brand: ${brand}
Model: ${model}

Please attach photos/videos below this line:
-------------------------------------------`;

const encodedMessage = encodeURIComponent(message);

if (confirm("This will open your email client to send photos/videos. Continue?")) {
window.location.href = `mailto:${yourEmail}?subject=Repair%20Media%20From%20${encodeURIComponent(name)}&body=${encodedMessage}`;
}
});
  // Form elements
  const quoteForm = document.getElementById("quoteForm");
  const successMessage = document.getElementById("successMessage");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const newRequestBtn = document.getElementById("newRequestBtn");
  const submitButton = document.getElementById("submitButton");
  const typeSelect = document.getElementById("equipmentType");
  const brandSelect = document.getElementById("brand");
  const modelSelect = document.getElementById("model");
  const manualBrandInput = document.getElementById("manualBrand");
  const manualModelInput = document.getElementById("manualModel");

  // Enhanced equipment-to-brand mapping
  const equipmentBrandMap = {
    Treadmill: [
      "NordicTrack", "ProForm", "Life Fitness", "Precor", "Matrix Fitness", 
      "Sole Fitness", "Horizon Fitness", "Bowflex", "Technogym", "Woodway",
      "True Fitness", "Reebok", "Spirit Fitness", "Cybex", "Star Trac",
      "Octane Fitness", "Freemotion", "Peloton", "BH Fitness", "Schwinn",
      "Kettler", "JTX Fitness", "York Fitness", "Nautilus"
    ],
    Elliptical: [
      "NordicTrack", "ProForm", "Life Fitness", "Precor", "Matrix Fitness",
      "Sole Fitness", "Spirit Fitness", "Technogym", "Horizon Fitness",
      "Octane Fitness", "Freemotion", "Bowflex", "Nautilus"
    ],
    "Exercise Bike": [
      "Peloton", "Schwinn", "NordicTrack", "ProForm", "Life Fitness",
      "Spirit Fitness", "Cybex", "Matrix Fitness", "BH Fitness", "Bowflex",
      "Nautilus", "Horizon Fitness", "Technogym"
    ],
    "Rowing Machine": [
      "Concept2", "Hydrow", "WaterRower", "NordicTrack", "Life Fitness",
      "ProForm", "Sole Fitness"
    ],
    "Strength Equipment": [
      "Hoist", "Hammer Strength", "Body-Solid", "Life Fitness", "Precor",
      "Bowflex", "Technogym", "Cybex", "Matrix Fitness", "Freemotion"
    ],
    "Stair Climber": [
      "StairMaster", "Jacobs Ladder", "Technogym", "Life Fitness", "Precor"
    ],
    "Spin Bike": [
      "Peloton", "Keiser", "NordicTrack", "ProForm", "Schwinn", "Bowflex"
    ],
    "Recumbent Bike": [
      "Nautilus", "Schwinn", "ProForm", "Life Fitness", "Matrix Fitness",
      "Bowflex", "Horizon Fitness"
    ],
    "Upright Bike": [
      "Schwinn", "Life Fitness", "Precor", "Matrix Fitness", "ProForm",
      "Bowflex", "Technogym"
    ],
    "Arc Trainer": ["Cybex", "Octane Fitness"],
    Other: []
  };

  // Comprehensive model data organized by brand and equipment type
  const modelData = {
    // NordicTrack Models
    "NordicTrack": {
      "Treadmill": [
        "Commercial 1750", "Commercial 2450", "Commercial 2950", "X22i", 
        "X32i", "T 6.5 S", "T 8.5 S", "C 990", "C 700", "Incline Trainer X11i",
        "VR25", "EXP 10i", "Elite 900"
      ],
      "Elliptical": [
        "FS14i", "FS10i", "FS7i", "AudioStrider 990", "E11.5", "Commercial 14.9",
        "SpaceSaver SE7i", "E7.0", "Elliptical 7.0", "Elliptical 11.5"
      ],
      "Exercise Bike": [
        "S22i Studio Cycle", "S27i Studio Cycle", "VU 19", "R35 Recumbent Bike",
        "U35 Upright Bike", "GX 4.7", "VR25", "Grand Tour Pro"
      ],
      "Rowing Machine": ["RW900", "RW500", "RW200"],
      "Spin Bike": ["S15i", "S22i", "GX 4.5"]
    },

    // Life Fitness Models
    "Life Fitness": {
      "Treadmill": [
        "T5", "T7", "T9", "Run CX", "Elevation Series T7", "Integrity Series T5",
        "Club Series Plus", "95T", "F3 Folding", "95T Inspire"
      ],
      "Elliptical": [
        "E5", "E7", "E9", "CrossTrainer CX", "Elevation Series E7", "Integrity Series E5",
        "95E", "X3", "Elliptical X3", "95E Inspire"
      ],
      "Exercise Bike": [
        "C5", "C7", "C9", "Lifecycle Exercise Bike", "Elevation Series C7",
        "Integrity Series C5", "95Ci", "R3 Recumbent", "U3 Upright"
      ],
      "Strength Equipment": [
        "Signature Series", "Optima Series", "Circuit Series", "G7", "Hammer Strength"
      ],
      "Stair Climber": ["Stepmill 5", "Stepmill 7", "Stepmill 9"]
    },

    // Precor Models
    "Precor": {
      "Treadmill": [
        "TRM 835", "TRM 885", "Experience Series", "EFX 5.23", "9.35", "9.31",
        "Commercial Series 932", "TRM 211", "TRM 445"
      ],
      "Elliptical": [
        "EFX 833", "EFX 885", "EFX 5.23", "Experience Series", "AMT 885", "AMT 835",
        "CrossRater 546", "EFX 447", "EFX 885"
      ],
      "Exercise Bike": [
        "RBK 835", "UBK 885", "Spinner® Chrono Power", "9.35", "Recumbent Series 546",
        "Upright Series 532"
      ],
      "Stair Climber": ["StairMaster 8G", "StairMaster 7G", "StairMaster 5G"]
    },

    // Peloton Models
    "Peloton": {
      "Exercise Bike": ["Bike", "Bike+"],
      "Treadmill": ["Tread", "Tread+"],
      "Rowing Machine": ["Row"],
      "Spin Bike": ["Bike", "Bike+"]
    },

    // Bowflex Models
    "Bowflex": {
      "Treadmill": [
        "Treadmill 10", "Treadmill 7", "TreadClimber TC200", "TreadClimber TC100",
        "Max Trainer M9", "Max Trainer M6", "BXT216", "T10", "T22"
      ],
      "Strength Equipment": [
        "Bowflex Xtreme 2 SE", "Bowflex Blaze", "Bowflex Revolution", "Bowflex PR3000",
        "Bowflex SelectTech 552", "Bowflex Max Trainer", "Bowflex Home Gym"
      ],
      "Exercise Bike": ["C6", "Velocore", "C7"],
      "Recumbent Bike": ["C6", "C7"]
    },

    // Sole Fitness Models
    "Sole Fitness": {
      "Treadmill": ["F85", "F80", "F63", "TT8", "ST90", "S77", "F65"],
      "Elliptical": ["E98", "E95", "E35", "E25", "E55"],
      "Exercise Bike": [
        "R92 Recumbent", "R93 Recumbent", "U77 Upright", "LCR Light Commercial Rower",
        "SB700 Spin Bike"
      ],
      "Rowing Machine": ["LCR", "SR500", "SR800"]
    },

    // Technogym Models
    "Technogym": {
      "Treadmill": [
        "Run Excite", "Run Personal", "Run Performance", "Skillrun", "Skillmill"
      ],
      "Elliptical": [
        "Elliptical Excite", "Elliptical Personal", "Skillbike", "Skillup"
      ],
      "Exercise Bike": [
        "Bike Excite", "Bike Personal", "Bike Performance", "Cycle Excite", "Skillbike"
      ],
      "Strength Equipment": ["Selection", "Pure Strength", "Personal Line"],
      "Stair Climber": ["Climber", "Skillclimber"]
    },

    // Matrix Fitness Models
    "Matrix Fitness": {
      "Treadmill": ["T75", "T7X", "T5X", "T3X"],
      "Elliptical": ["E7X", "E5X", "E3X", "A7X"],
      "Exercise Bike": ["C7X", "C5X", "U7X", "R7X"],
      "Strength Equipment": ["ClimbMill", "Chest Press", "Leg Press"],
      "Upright Bike": ["U7X", "U5X"],
      "Recumbent Bike": ["R7X", "R5X"]
    },

    // Schwinn Models
    "Schwinn": {
      "Treadmill": ["870", "810", "830"],
      "Exercise Bike": ["IC8", "IC4", "270 Recumbent", "170 Upright"],
      "Spin Bike": ["IC4", "IC8"],
      "Recumbent Bike": ["270", "230"],
      "Upright Bike": ["170", "130"]
    },

    // Nautilus Models
    "Nautilus": {
      "Treadmill": ["T618", "T616", "T614"],
      "Exercise Bike": ["U618", "R618"],
      "Recumbent Bike": ["R618", "R616"],
      "Upright Bike": ["U618", "U616"]
    },

    // Other Manufacturers (flat list)
    "ProForm": [
      "Carbon TL", "Pro 2000", "Smart Pro 2000", "Studio Bike Pro", "ProForm 440",
      "ProForm 680", "Power 995i", "Performance 600i", "Carbon T7", "City L6"
    ],
    "Horizon Fitness": [
      "7.0 AT", "7.8 T", "Paragon X", "Adventure 5", "Studio 7.8", "T101"
    ],
    "True Fitness": [
      "PS800", "M30", "CS9.0", "HRC", "Z5.0", "T800"
    ],
    "Spirit Fitness": [
      "XT685", "XT385", "CS800", "CRW800", "BUF800", "XT485"
    ],
    "Cybex": [
      "750T", "770T", "625A", "VR3", "Eagle", "Arc Trainer 770A"
    ],
    "Star Trac": [
      "4TR", "E-TR", "E-SPX", "UB", "RB", "4ST"
    ],
    "BH Fitness": [
      "G6545", "G6418", "G6436", "H917", "H915", "G6480"
    ],
    "Octane Fitness": [
      "LateralX", "Zero Runner", "Q47", "Q37", "Q65"
    ],
    "Woodway": [
      "4Front", "Desmo", "Curve", "Elite", "Pro"
    ],
    "York Fitness": [
      "C510", "C410", "T520", "E520", "S520"
    ],
    "Freemotion": [
      "Reflex Treadmill", "Incline Trainer", "Dual Cable Cross", "22.7 Treadmill"
    ],
    "Concept2": [
      "Model D", "Model E", "RowErg", "SkiErg", "BikeErg"
    ],
    "StairMaster": [
      "StepMill 7000 PT", "Gauntlet", "StepMill 4400 PT", "StepMill 4600 PT"
    ],
    "Keiser": [
      "M3i", "M3", "M5i", "M5", "Rower"
    ]
  };

  // Initialize form
  resetModel();
  resetManualBrand();
  populateBrands();

  // Equipment Type → Brand
  typeSelect.addEventListener("change", populateBrands);

  function populateBrands() {
    const type = typeSelect.value;
    brandSelect.innerHTML = '<option value="">-- Select Manufacturer --</option>';
    
    (equipmentBrandMap[type] || []).forEach((brand) => {
      const opt = document.createElement("option");
      opt.value = brand;
      opt.textContent = brand;
      brandSelect.appendChild(opt);
    });
    
    const otherOpt = document.createElement("option");
    otherOpt.value = "Other";
    otherOpt.textContent = "🔧 My manufacturer is not listed";
    brandSelect.appendChild(otherOpt);
    
    resetModel();
    resetManualBrand();
  }

  // Brand → Model
  brandSelect.addEventListener("change", populateModels);

  function populateModels() {
    const brand = brandSelect.value;
    resetModel();

    if (brand === "Other") {
      showManualBrandInput();
      showManualModelInput();
      return;
    }

    hideManualBrandInput();
    const equipmentType = typeSelect.value;
    const brandModels = modelData[brand];
    
    if (!brandModels) {
      modelSelect.style.display = "block";
      modelSelect.required = true;
      return;
    }

    // Check if brand has equipment-specific models
    if (typeof brandModels === 'object' && !Array.isArray(brandModels)) {
      const equipmentModels = brandModels[equipmentType];
      
      if (equipmentModels && equipmentModels.length > 0) {
        equipmentModels.forEach(model => {
          const opt = new Option(model, model);
          modelSelect.appendChild(opt);
        });
      } else {
        // Fallback to any equipment type if specific not found
        Object.values(brandModels).flat().forEach(model => {
          const opt = new Option(model, model);
          modelSelect.appendChild(opt);
        });
      }
    } 
    // Flat model list
    else if (Array.isArray(brandModels)) {
      brandModels.forEach(model => {
        const opt = new Option(model, model);
        modelSelect.appendChild(opt);
      });
    }

    // Add "Other" option
    const otherOpt = new Option("🔧 My model is not listed", "Other");
    modelSelect.appendChild(otherOpt);
    
    modelSelect.style.display = "block";
    modelSelect.required = true;
  }

  // Model → Manual input toggle
  modelSelect.addEventListener("change", function() {
    if (modelSelect.value === "Other") {
      showManualModelInput();
    } else {
      hideManualModelInput();
    }
  });

  // Form submission
  quoteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    clearErrors();

    if (!validateForm()) {
      const error = document.querySelector(".error");
      if (error) {
        error.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    loadingOverlay.style.display = "flex";

    emailjs
      .sendForm("service_15f1fcs", "template_pq3tpbe", quoteForm)
      .then(() => {
        loadingOverlay.style.display = "none";
        successMessage.style.display = "block";
        const name = document.getElementById("firstName").value.trim();
        const phone = document.getElementById("contactNumber").value.trim();
        const city = document.getElementById("city").value;
        const service = document.getElementById("serviceRequest").value;
        const brand = brandSelect.value === "Other" 
          ? manualBrandInput.value 
          : brandSelect.value;
        const model = modelSelect.value === "Other" || modelSelect.style.display === "none"
          ? manualModelInput.value 
          : modelSelect.value;

        const message = `Hi! I just submitted a repair request. Here are my details:
Name: ${name}
Phone: ${phone}
City: ${city}
Service: ${service}
Brand: ${brand}
Model: ${model}

I'd like to send a photo/video to help with the repair.`;

        const encodedMessage = encodeURIComponent(message);
        const yourPhone = "13653662162";
        const yourEmail = "canadianfitnessrepair@gmail.com";

        document.getElementById("whatsappLink").href = `https://wa.me/${yourPhone}?text=${encodedMessage}`;
        document.getElementById("smsLink").href = `sms:${yourPhone}?&body=${encodedMessage}`;
        lastSubmission = { 
name: name, 
phone: phone, 
city: city, 
service: service, 
brand: brand, 
model: model 
};

// Keep these two lines for WhatsApp/SMS:
document.getElementById("whatsappLink").href = `https://wa.me/${yourPhone}?text=${encodedMessage}`;
document.getElementById("smsLink").href = `sms:${yourPhone}?&body=${encodedMessage}`;

        document.getElementById("contactOptions").style.display = "block";
        quoteForm.style.display = "none";
        
        setTimeout(() => {
          successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 200);
      })
      .catch(() => {
        loadingOverlay.style.display = "none";
        alert("Submission failed. Please try again.");
      });
  });

  // New request button
  if (newRequestBtn) {
    newRequestBtn.addEventListener("click", () => {
      quoteForm.reset();
      clearErrors();
      quoteForm.style.display = "grid";
      successMessage.style.display = "none";
      populateBrands();
      lastSubmission = null;
    });
  }

  // Form helpers
  function showManualBrandInput() {
    manualBrandInput.style.display = "block";
    manualBrandInput.required = true;
  }

  function hideManualBrandInput() {
    manualBrandInput.style.display = "none";
    manualBrandInput.required = false;
  }

  function resetManualBrand() {
    hideManualBrandInput();
    manualBrandInput.value = "";
  }

  function showManualModelInput() {
    manualModelInput.style.display = "block";
    manualModelInput.required = true;
    modelSelect.required = false;
  }

  function hideManualModelInput() {
    manualModelInput.style.display = "none";
    manualModelInput.required = false;
    modelSelect.required = true;
  }

  function resetModel() {
    modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
    modelSelect.style.display = "none";
    modelSelect.required = false;
    hideManualModelInput();
  }

  // Validation
  function validateForm() {
    let valid = true;
    const required = [
      "firstName", "contactNumber", "email", "preferredContact", 
      "address", "city", "postal", "serviceRequest", "equipmentType",
      "bookingDateTime", "description"
    ];

    required.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        showError(el, id + "Error", "Required");
        valid = false;
      }
    });

    const clientType = document.querySelector('input[name="clientType"]:checked');
    if (!clientType) {
      showError(null, "clientTypeError", "Please select client type");
      valid = false;
    }

    const brand = brandSelect.value;
    if (brand === "Other" && !manualBrandInput.value.trim()) {
      showError(manualBrandInput, "brandError", "Please enter manufacturer");
      valid = false;
    }

    const modelValue = modelSelect.value;
    if (modelValue === "Other" || brand === "Other") {
      if (!manualModelInput.value.trim()) {
        showError(manualModelInput, "modelError", "Please enter model");
        valid = false;
      }
    } else if (modelSelect.style.display !== "none" && !modelValue) {
      showError(modelSelect, "modelError", "Please select a model");
      valid = false;
    }

    const email = document.getElementById("email");
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, "emailError", "Invalid email address");
      valid = false;
    }

    const phone = document.getElementById("contactNumber");
    if (phone.value && !/^\d{10}$/.test(phone.value)) {
      showError(phone, "contactNumberError", "Invalid phone number");
      valid = false;
    }

    const postal = document.getElementById("postal");
    if (postal.value && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postal.value)) {
      showError(postal, "postalError", "Invalid postal code");
      valid = false;
    }

    return valid;
  }

  function showError(el, id, msg) {
    const err = document.getElementById(id);
    if (err) {
      err.textContent = msg;
      err.style.display = "block";
    }
    if (el) el.classList.add("error");
  }

  function hideError(el, id) {
    const err = document.getElementById(id);
    if (err) err.style.display = "none";
    if (el) el.classList.remove("error");
  }

  function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.style.display = "none");
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
  }

  // Field validation
  document.querySelectorAll("input, select, textarea").forEach((f) => {
    f.addEventListener("input", () => validateField(f));
    f.addEventListener("blur", () => validateField(f));
  });

  function validateField(f) {
    hideError(f, f.id + "Error");
    const val = f.value.trim();

    if (f.required && !val) showError(f, f.id + "Error", "Required");

    if (f.id === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showError(f, "emailError", "Invalid email");
    }

    if (f.id === "contactNumber" && val && !/^\d{10}$/.test(val)) {
      showError(f, "contactNumberError", "Invalid phone");
    }

    if (f.id === "postal" && val && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val)) {
      showError(f, "postalError", "Invalid postal code");
    }
  }

  // Initialize submit button
  submitButton.addEventListener("click", function () {
    quoteForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
});

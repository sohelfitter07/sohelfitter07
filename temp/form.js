<!-- Appointment Modal -->
<div id="appointment-modal" class="modal">
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2 id="modal-title"><i class="fas fa-calendar-plus"></i> Add New Appointment</h2>
      <form id="appointment-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <label>Customer Name</label>
            <input type="text" id="customer-name" class="form-control" placeholder="Enter customer name" required>
            <div class="validation-error" id="customer-name-error"></div>
          </div>
          <div>
            <label>Phone Number</label>
            <input type="tel" id="customer-phone" class="form-control" placeholder="Enter phone number">
          </div>
        </div>
        
        <!-- ✅ Email Address Field -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label for="customer-email">Email Address</label>
          <input type="email" id="customer-email" class="form-control" placeholder="example@email.com">
        </div>
  
        <!-- ✅ Carrier Dropdown -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label for="customer-carrier">Carrier</label>
          <select id="customer-carrier" class="form-control">
            <option value="">-- Select Carrier --</option>
            <option value="rogers">Rogers</option>
            <option value="bell">Bell</option>
            <option value="telus">Telus</option>
            <option value="fido">Fido</option>
            <option value="virgin">Virgin</option>
            <option value="koodo">Koodo</option>
            <option value="freedom">Freedom</option>
            <option value="chatr">Chatr</option>
            <option value="public">Public Mobile</option>
            <option value="sasktel">SaskTel</option>
            <option value="videotron">Videotron</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        
        <!-- ✅ Lookup Carrier Button -->
        <div class="form-group" style="margin-bottom: 20px;">
          <button type="button" class="btn btn-secondary" id="lookup-carrier">Lookup Carrier</button>
        </div>
        
        <div style="margin-bottom: 20px; position: relative;">
            <label for="house-address-input">House Address</label>
          
            <!-- Visible input for user typing -->
            <input
              type="text"
              id="house-address-input"
              class="form-control"
              name="houseAddress"
              placeholder="Enter house address"
              required
              autocomplete="off"
              style="margin-bottom: 10px; padding: 8px; width: 100%; box-sizing: border-box;"
            />
            <ul id="address-suggestions" style="
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            list-style: none;
            margin: 0;
            padding: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
          "></ul>          

          
            <!-- GoMaps widget container: just for the map & autocomplete UI -->
            <div
            id="gomaps-widget"
            data-api-key="AlzaSyT7Sa-m79jL64rRoxfdkn7k6wlFRwiJX0c"
            data-label="Start typing your address..."
            data-map="true"
            data-map-height="200px"
            data-distance-from="22 Canary Grass Blvd, Hamilton, Ontario, L0R 1P0"
            data-output-id="house-address-input"
            style="margin-bottom: 10px;"
          ></div>
          
            <div class="validation-error" id="house-address-error"></div>
          
            <p>
              <strong>Distance:</strong> <span id="gomaps-distance" style="color: inherit;">0</span> km
            </p>
          </div>
          
          
  

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <label>Date</label>
            <input type="date" id="appointment-date" class="form-control" required>
            <div class="validation-error" id="appointment-date-error"></div>
          </div>
          <div>
            <label>Time</label>
            <input type="time" id="appointment-time" class="form-control" required>
            <div class="validation-error" id="appointment-time-error"></div>
          </div>
        </div>
  
        <div style="margin-bottom: 20px;">
          <label>Equipment</label>
          <input type="text" id="equipment" class="form-control" placeholder="Enter equipment type">
          <div class="validation-error" id="equipment-error"></div>
        </div>
  
        <div class="form-group" style="margin-bottom: 20px;">
          <label>Service Price (before tax)</label>
          <input type="number" id="appointment-base-price" class="form-control" step="0.01" placeholder="0.00">
        </div>
  
        <div class="form-group" style="margin-bottom: 20px;">
          <label>Tax</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <input type="text" id="appointment-tax-rate" class="form-control" readonly>
              <div class="card-footer" style="text-align: center; padding: 5px;">Rate</div>
            </div>
            <div>
              <input type="number" id="appointment-tax-amount" class="form-control" readonly>
              <div class="card-footer" style="text-align: center; padding: 5px;">Amount</div>
            </div>
          </div>
        </div>
  
        <div class="form-group" style="margin-bottom: 20px;">
          <label>Total Price (including tax)</label>
          <input type="number" id="appointment-price" class="form-control" readonly>
        </div>
  
        <div style="margin-bottom: 20px;">
          <label>Issue Description</label>
          <textarea id="issue-description" class="form-control" placeholder="Describe the issue"></textarea>
          <div class="validation-error" id="issue-description-error"></div>
        </div>
  
        <div style="margin-bottom: 20px;">
          <label>Repair Notes</label>
          <textarea id="repair-notes" class="form-control" placeholder="Add repair notes"></textarea>
          <div class="validation-error" id="repair-notes-error"></div>
        </div>
  
        <div style="margin-bottom: 20px;">
            <label>Status</label>
            <select id="appointment-status" class="form-control">
              <option value="Scheduled / Confirmed">📅 Scheduled / Confirmed</option>
              <option value="In Progress">🔧 In Progress</option>
              <option value="Awaiting Parts">⏳ Awaiting Parts</option>
              <option value="Parts Arrived">📦 Parts Arrived</option>
              <option value="Scheduled for Parts Installation">🛠️ Install Scheduled</option>
              <option value="Repaired">✅ Repaired</option>
              <option value="Completed">🏁 Completed</option>
              <option value="Cancelled">❌ Cancelled</option>
            </select>
          </div>
          

        <div style="margin-bottom: 20px;">
            <label>
              <input type="checkbox" id="reminder-enabled" />
              Send reminder 24 hours before appointment
            </label>
          </div>       
          
        <div class="form-actions">
          <button type="button" id="save-appointment" class="btn">Save Appointment</button>
          <button type="button" id="cancel-appointment" class="btn secondary">Cancel</button>
        </div>
      </form>
    </div>
    <div id="pagination-controls" class="pagination-controls">
  <button id="prev-page" disabled>&laquo; Prev</button>
  <span id="pagination-info">Page 1</span>
  <button id="next-page">Next &raquo;</button>
</div>
  </div>
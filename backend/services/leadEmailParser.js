const QUOTE_MARKER = /\bNEW\s+SERVICE\s+QUOTE\s+REQUEST\b/i;
const CONTACT_MARKER = /\bNEW\s+CONTACT\s+FORM\s+SUBMISSION\b/i;

// The EmailJS template flattens every label and value into one run of text, so
// fields are located by the fixed labels rather than by line breaks.
const QUOTE_FIELDS = [
  ["firstName", "First Name"],
  ["lastName", "Last Name"],
  ["phone", "Contact Number"],
  ["email", "Email Address"],
  ["preferredContact", "Preferred Contact Method"],
  ["street", "Street Address"],
  ["city", "City/Town"],
  ["postal", "Postal Code"],
  ["province", "Province"],
  ["country", "Country"],
  ["serviceRequest", "Service Request"],
  ["clientType", "Client Type"],
  ["equipmentType", "Equipment Type"],
  ["manufacturer", "Equipment Manufacturer"],
  ["model", "Model Number"],
  ["serial", "Serial Number"],
  ["preferredDateTime", "Preferred Booking Date & Time"],
];

const CONTACT_FIELDS = [
  ["name", "Name:"],
  ["email", "Email:"],
  ["phone", "Phone:"],
  ["subject", "Subject:"],
];

function collapseWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseLabeledFields(text, labels) {
  const positions = [];

  for (const [key, label] of labels) {
    const index = text.indexOf(label);
    if (index !== -1) {
      positions.push({ key, label, index });
    }
  }

  positions.sort((a, b) => a.index - b.index);

  const fields = {};
  positions.forEach((position, index) => {
    const start = position.index + position.label.length;
    const end =
      index + 1 < positions.length ? positions[index + 1].index : text.length;
    fields[position.key] = text.slice(start, end).trim();
  });

  return fields;
}

function parseQuoteRequest(body) {
  const normalized = collapseWhitespace(body);
  const descriptionLabel = "Description of Issue";
  const descriptionIndex = normalized.indexOf(descriptionLabel);
  const headerText =
    descriptionIndex === -1
      ? normalized
      : normalized.slice(0, descriptionIndex);

  const fields = parseLabeledFields(headerText, QUOTE_FIELDS);
  fields.description =
    descriptionIndex === -1
      ? ""
      : normalized.slice(descriptionIndex + descriptionLabel.length).trim();

  return fields;
}

function parseContactRequest(body) {
  const normalized = collapseWhitespace(body);
  const messageLabel = "Message:";
  const messageIndex = normalized.indexOf(messageLabel);
  const headerText =
    messageIndex === -1 ? normalized : normalized.slice(0, messageIndex);

  const fields = parseLabeledFields(headerText, CONTACT_FIELDS);
  let message =
    messageIndex === -1
      ? ""
      : normalized.slice(messageIndex + messageLabel.length).trim();

  const footerIndex = message.indexOf("Response required:");
  if (footerIndex > 0) {
    message = message.slice(0, footerIndex).trim();
  }

  fields.message = message;
  return fields;
}

function parseQuoteSubject(subject) {
  const match = String(subject || "").match(
    /New Quote Request:\s*(.+?)\s+-\s+(.+?)\s*$/i
  );

  return {
    customer: match ? match[1].trim() : "",
    service: match ? match[2].trim() : "",
  };
}

function parseContactSubject(subject) {
  const match = String(subject || "").match(/New Contact Request:\s*(.+?)\s*$/i);
  return match ? match[1].trim() : "";
}

function parseEmailLead({ subject, body }) {
  const normalized = collapseWhitespace(body);

  if (QUOTE_MARKER.test(normalized)) {
    const fields = parseQuoteRequest(body);
    const fromSubject = parseQuoteSubject(subject);
    const name =
      [fields.firstName, fields.lastName].filter(Boolean).join(" ").trim() ||
      fromSubject.customer;
    const equipment = [fields.equipmentType, fields.manufacturer, fields.model]
      .filter(Boolean)
      .join(" ")
      .trim();
    const address = [fields.street, fields.city, fields.postal]
      .filter(Boolean)
      .join(", ");

    return {
      type: "quote",
      status: "Quote Requested",
      name,
      phone: fields.phone || "",
      email: fields.email || "",
      address,
      equipment,
      issue: fields.description || fields.serviceRequest || "",
      service: fromSubject.service || fields.serviceRequest || "",
    };
  }

  if (CONTACT_MARKER.test(normalized)) {
    const fields = parseContactRequest(body);
    const topic = (parseContactSubject(subject) || fields.subject || "").trim();
    const message = fields.message || "";

    return {
      type: "contact",
      status: "New Lead",
      name: fields.name || "",
      phone: fields.phone || "",
      email: fields.email || "",
      address: "",
      equipment: "",
      issue: topic ? (message ? `${topic}: ${message}` : topic) : message,
      service: topic,
    };
  }

  return null;
}

module.exports = { parseEmailLead };

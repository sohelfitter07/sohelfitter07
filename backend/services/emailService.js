const gmailService = require('./gmailService');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

exports.sendEmail = async (recipient, subject, body) => {
  try {
    await gmailService.sendEmail({
      to: recipient,
      subject,
      text: body,
      html: `<p>${escapeHtml(body)}</p>`,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

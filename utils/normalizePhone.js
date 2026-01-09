module.exports = function normalizePhone(raw) {
  if (!raw) return null;

  // Remove everything except digits and +
  let phone = raw.replace(/[^\d+]/g, "");

  // Convert 00 → +
  if (phone.startsWith("00")) {
    phone = "+" + phone.slice(2);
  }

  // If starts with 0XXXXXXXX
  if (phone.startsWith("0")) {
    phone = "+961" + phone.slice(1);
  }

  // If starts with +9610XXXXXXXX → remove ALL zeros after +961
  if (phone.startsWith("+961")) {
    phone = "+961" + phone.slice(4).replace(/^0+/, "");
  }

  // If 8 digits only
  if (/^\d{8}$/.test(phone)) {
    phone = "+961" + phone;
  }

  // Final validation
  if (!/^\+961[1-9]\d{6,7}$/.test(phone)) {
    return null;
  }

  return phone;
};

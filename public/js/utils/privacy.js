export function maskPhone(value) {
  const phone = String(value ?? "").trim();
  if (!phone) return "-";

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "*".repeat(phone.length);

  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function maskEmail(value) {
  const email = String(value ?? "").trim();
  if (!email) return "-";

  const separatorIndex = email.indexOf("@");
  if (separatorIndex <= 0 || separatorIndex === email.length - 1) {
    return "*".repeat(email.length);
  }

  const mailbox = email.slice(0, separatorIndex);
  const domain = email.slice(separatorIndex);
  return `${mailbox[0]}${"*".repeat(Math.max(1, mailbox.length - 1))}${domain}`;
}

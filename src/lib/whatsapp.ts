export function generateWhatsAppLink(phone: string, message: string): string {
  // Remove spaces/dashes, add country code if missing
  const cleaned = phone.replace(/\D/g, "");
  const withCode = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${withCode}?text=${encoded}`;
}

export function generateParentMessage(student: {
  name: string;
  attendancePercent: number;
  lastTestScore?: number;
  lastTestTotal?: number;
}): string {
  const { name, attendancePercent, lastTestScore, lastTestTotal } = student;
  let msg = `Dear Parent,\n\nHere is ${name}'s progress update:\n`;
  msg += `📅 Attendance: ${attendancePercent}%\n`;
  if (lastTestScore !== undefined) {
    msg += `📝 Last test: ${lastTestScore}/${lastTestTotal}\n`;
  }
  if (attendancePercent < 70) {
    msg += `\n⚠️ Attendance is low. Please ensure regular attendance.`;
  }
  msg += `\n\nRegards,\nYour Coaching Center`;
  return msg;
}

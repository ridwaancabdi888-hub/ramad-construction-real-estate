const previewFields = [
  ["name", "Full name"],
  ["phone", "Phone number"],
  ["email", "Email address"],
  ["service", "Service required"],
  ["date", "Preferred date"],
  ["message", "Project brief"],
];

export function createConsultationPreview(formData) {
  return previewFields.map(([name, label]) => ({
    name,
    label,
    value: String(formData.get(name) ?? "").trim(),
  }));
}

import test from "node:test";
import assert from "node:assert/strict";

import { createConsultationPreview } from "../consultation-preview.mjs";

test("creates a complete consultation preview in display order", () => {
  const values = new Map([
    ["name", "  Ayaan Cabdi  "],
    ["phone", "+252 63 0000000"],
    ["email", "ayaan@example.com"],
    ["service", "Architectural Design"],
    ["date", "2026-12-01"],
    ["message", "A three-bedroom family home."],
  ]);

  assert.deepEqual(createConsultationPreview(values), [
    { name: "name", label: "Full name", value: "Ayaan Cabdi" },
    { name: "phone", label: "Phone number", value: "+252 63 0000000" },
    { name: "email", label: "Email address", value: "ayaan@example.com" },
    { name: "service", label: "Service required", value: "Architectural Design" },
    { name: "date", label: "Preferred date", value: "2026-12-01" },
    { name: "message", label: "Project brief", value: "A three-bedroom family home." },
  ]);
});

test("normalizes missing values without inventing content", () => {
  const preview = createConsultationPreview(new Map());

  assert.equal(preview.length, 6);
  assert.ok(preview.every((field) => field.value === ""));
});

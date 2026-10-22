import test from "node:test";
import assert from "node:assert/strict";

import { collectFormFields } from "../form-fields.mjs";

test("collectFormFields returns every supported form control", () => {
  const controls = [
    { tagName: "INPUT" },
    { tagName: "SELECT" },
    { tagName: "TEXTAREA" },
  ];
  let receivedSelector = "";
  const form = {
    querySelectorAll(selector) {
      receivedSelector = selector;
      return controls;
    },
  };

  const fields = collectFormFields(form);

  assert.equal(receivedSelector, "input, select, textarea");
  assert.deepEqual(fields, controls);
  assert.ok(Array.isArray(fields));
});

test("the returned array supports validation iteration and filtering", () => {
  const controls = [{ valid: true }, { valid: false }, { valid: false }];
  const form = { querySelectorAll: () => controls };
  const visited = [];

  const fields = collectFormFields(form);
  fields.forEach((field) => visited.push(field));
  const invalid = fields.filter((field) => !field.valid);

  assert.deepEqual(visited, controls);
  assert.deepEqual(invalid, controls.slice(1));
});

// Run with: npm test   (uses Node's built-in test runner, no extra library)
import { test } from "node:test";
import assert from "node:assert/strict";
import { STEPS, getNextStatus } from "../lib/workflow.js";
import { TEMPLATES, fillTemplate } from "../lib/templates.js";

test("booking moves through the steps in order", () => {
  assert.equal(getNextStatus("Booking Confirmed"), "Puja Started");
  assert.equal(getNextStatus("Puja Started"), "Puja Completed");
  assert.equal(getNextStatus("Puja Completed"), "Video Available");
});

test("there is no step after Video Available", () => {
  assert.equal(getNextStatus("Video Available"), null);
});

test("unknown status throws an error", () => {
  assert.throws(() => getNextStatus("Cancelled"));
});

test("every step has a message template", () => {
  for (const step of STEPS) assert.ok(TEMPLATES[step], `missing template for ${step}`);
});

test("template placeholders are filled with booking data", () => {
  const msg = fillTemplate(TEMPLATES["Booking Confirmed"], {
    devoteeName: "Ravi",
    pujaName: "Lakshmi Puja",
    bookingId: "AS-1001",
  });
  assert.match(msg, /Namaste Ravi/);
  assert.match(msg, /Lakshmi Puja/);
  assert.match(msg, /AS-1001/);
  assert.doesNotMatch(msg, /{{/); // nothing left unfilled
});

test("missing placeholder value throws instead of sending a broken message", () => {
  assert.throws(() => fillTemplate("Hi {{devoteeName}}", {}), /Missing value/);
});

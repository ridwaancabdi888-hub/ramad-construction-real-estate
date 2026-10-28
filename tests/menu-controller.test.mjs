import test from "node:test";
import assert from "node:assert/strict";

import { createMenuController } from "../menu-controller.mjs";

function classList() {
  const values = new Set();
  return {
    contains: value => values.has(value),
    toggle(value, force) {
      if (force) values.add(value);
      else values.delete(value);
    },
  };
}

function element() {
  const attributes = new Map();
  return {
    classList: classList(),
    isConnected: true,
    focusCount: 0,
    focus() { this.focusCount += 1; },
    getAttribute: name => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
  };
}

function createHarness() {
  const menu = element();
  const toggle = element();
  const body = element();
  const first = element();
  const last = element();
  let activeElement = toggle;
  const controller = createMenuController({
    menu,
    toggle,
    body,
    getFocusables: () => [first, last],
    getActiveElement: () => activeElement,
  });

  return {
    body,
    controller,
    first,
    last,
    menu,
    setActiveElement: element => { activeElement = element; },
    toggle,
  };
}

test("opening exposes the menu, locks the page and focuses its first control", () => {
  const { body, controller, first, menu, toggle } = createHarness();

  controller.toggle();

  assert.equal(controller.isOpen(), true);
  assert.equal(menu.inert, false);
  assert.equal(menu.getAttribute("aria-hidden"), "false");
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(body.classList.contains("menu-open"), true);
  assert.equal(first.focusCount, 1);
});

test("Escape closes the menu and restores the original focus", () => {
  const { controller, toggle } = createHarness();
  controller.toggle();
  const event = { key: "Escape", preventDefaultCalled: false, preventDefault() { this.preventDefaultCalled = true; } };

  controller.handleKeyDown(event);

  assert.equal(event.preventDefaultCalled, true);
  assert.equal(controller.isOpen(), false);
  assert.equal(toggle.focusCount, 1);
});

test("Tab and Shift+Tab remain inside the open menu", () => {
  const { controller, first, last, setActiveElement } = createHarness();
  controller.toggle();
  setActiveElement(last);
  controller.handleKeyDown({ key: "Tab", shiftKey: false, preventDefault() {} });
  assert.equal(first.focusCount, 2);

  setActiveElement(first);
  controller.handleKeyDown({ key: "Tab", shiftKey: true, preventDefault() {} });
  assert.equal(last.focusCount, 1);
});

test("desktop breakpoint closes the overlay without focusing the hidden toggle", () => {
  const { body, controller, menu, toggle } = createHarness();
  controller.toggle();

  controller.handleDesktopChange({ matches: true });

  assert.equal(controller.isOpen(), false);
  assert.equal(menu.inert, true);
  assert.equal(menu.getAttribute("aria-hidden"), "true");
  assert.equal(body.classList.contains("menu-open"), false);
  assert.equal(toggle.focusCount, 0);
});

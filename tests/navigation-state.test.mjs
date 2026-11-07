import test from "node:test";
import assert from "node:assert/strict";

import { setCurrentNavigation, uniqueNavigationSections } from "../navigation-state.mjs";

function link(href) {
  const attributes = new Map([["href", href]]);
  const classes = new Set();
  return {
    classList: {
      contains: value => classes.has(value),
      toggle(value, enabled) {
        if (enabled) classes.add(value);
        else classes.delete(value);
      },
    },
    getAttribute: name => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
  };
}

test("desktop and mobile links expose the same current section", () => {
  const desktopHome = link("#home");
  const mobileHome = link("#home");
  const desktopProjects = link("#projects");
  const mobileProjects = link("#projects");
  const links = [desktopHome, mobileHome, desktopProjects, mobileProjects];

  setCurrentNavigation(links, "#projects");

  for (const current of [desktopProjects, mobileProjects]) {
    assert.equal(current.classList.contains("active"), true);
    assert.equal(current.getAttribute("aria-current"), "location");
  }
  for (const inactive of [desktopHome, mobileHome]) {
    assert.equal(inactive.classList.contains("active"), false);
    assert.equal(inactive.getAttribute("aria-current"), null);
  }
});

test("a section name without a hash is normalized", () => {
  const home = link("#home");
  setCurrentNavigation([home], "home");
  assert.equal(home.getAttribute("aria-current"), "location");
});

test("tracked sections are resolved once even when two menus link to them", () => {
  const homeSection = { id: "home" };
  const projectsSection = { id: "projects" };
  const resolved = [];
  const sections = uniqueNavigationSections(
    [link("#home"), link("#projects"), link("#home"), link("https://example.com")],
    target => {
      resolved.push(target);
      return target === "#home" ? homeSection : projectsSection;
    },
  );

  assert.deepEqual(sections, [homeSection, projectsSection]);
  assert.deepEqual(resolved, ["#home", "#projects"]);
});

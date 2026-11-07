/**
 * Keep every navigation link for the same section in sync.
 * Desktop and mobile navigation both expose the current section to assistive
 * technology through aria-current while retaining the existing active class.
 */
export function setCurrentNavigation(links, target) {
  const normalizedTarget = target?.startsWith("#") ? target : `#${target || "home"}`;

  links.forEach(link => {
    const isCurrent = link.getAttribute("href") === normalizedTarget;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

export function uniqueNavigationSections(links, findSection) {
  const sections = new Map();
  links.forEach(link => {
    const target = link.getAttribute("href");
    if (!target?.startsWith("#") || sections.has(target)) return;
    const section = findSection(target);
    if (section) sections.set(target, section);
  });
  return [...sections.values()];
}

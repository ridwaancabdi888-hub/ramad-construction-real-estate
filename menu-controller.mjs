export function createMenuController({ menu, toggle, body, getFocusables, getActiveElement }) {
  let returnFocus = null;

  const isOpen = () => menu.classList.contains("open");

  const setOpen = (open, { restoreFocus = true } = {}) => {
    if (open === isOpen()) return;
    if (open) returnFocus = getActiveElement();

    menu.classList.toggle("open", open);
    menu.inert = !open;
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    body.classList.toggle("menu-open", open);

    if (open) {
      getFocusables()[0]?.focus();
      return;
    }

    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  };

  const handleKeyDown = event => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusables = getFocusables();
    const first = focusables[0];
    const last = focusables.at(-1);
    if (!first || !last) return;

    const activeElement = getActiveElement();
    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleDesktopChange = event => {
    if (event.matches) setOpen(false, { restoreFocus: false });
  };

  return {
    close: options => setOpen(false, options),
    handleDesktopChange,
    handleKeyDown,
    isOpen,
    toggle: () => setOpen(!isOpen()),
  };
}

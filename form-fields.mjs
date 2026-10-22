/**
 * Return the interactive fields in a form as a real array.
 *
 * querySelector returns one element, while querySelectorAll returns a
 * NodeList. Normalising the NodeList here gives callers the array methods
 * used by validation without depending on a browser-specific collection.
 */
export function collectFormFields(form) {
  return [...form.querySelectorAll("input, select, textarea")];
}

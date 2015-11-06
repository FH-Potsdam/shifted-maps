export default function offset(element) {
  let rect = element.getBoundingClientRect(),
    body = document.body;

  return {
    left: rect.left + body.scrollLeft,
    top: rect.top + body.scrollTop
  };
}
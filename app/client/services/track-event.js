export default function trackEvent(category, action, name, value) {
  let func = ['trackEvent', category, action];

  if (name != null) func.push(name);
  if (value != null) func.push(value);

  _paq.push(func);
};
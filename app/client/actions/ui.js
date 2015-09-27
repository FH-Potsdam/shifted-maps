export const CHANGE_VIEW = 'CHANGE_VIEW';
export const CHANGE_TIME_SPAN = 'CHANGE_TIME_SPAN';

export function changeView(view) {
  return { type: CHANGE_VIEW, view };
}

export function changeTimeSpan(timeSpan) {
  return { type: CHANGE_TIME_SPAN, timeSpan };
}
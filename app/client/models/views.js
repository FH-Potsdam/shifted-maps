import { geographicView, frequencyView, durationView } from '../services/views';

export const GEOGRAPHIC_VIEW = 'GEOGRAPHIC_VIEW';
export const DURATION_VIEW = 'DURATION_VIEW';
export const FREQUENCY_VIEW = 'FREQUENCY_VIEW';

export const VIEW_SERVICES = {
  [GEOGRAPHIC_VIEW]: geographicView,
  [FREQUENCY_VIEW]: frequencyView,
  [DURATION_VIEW]: durationView
};
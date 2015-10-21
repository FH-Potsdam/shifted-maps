import { geographicView, frequencyView, durationView, geographicLabel, frequencyLabel, durationLabel } from '../services/views';

export const GEOGRAPHIC_VIEW = 'GEOGRAPHIC_VIEW';
export const DURATION_VIEW = 'DURATION_VIEW';
export const FREQUENCY_VIEW = 'FREQUENCY_VIEW';

export const VIEW_SERVICES = {
  [GEOGRAPHIC_VIEW]: geographicView,
  [DURATION_VIEW]: durationView,
  [FREQUENCY_VIEW]: frequencyView
};

export const CONNECTION_LABEL_SERVICES = {
  [GEOGRAPHIC_VIEW]: geographicLabel,
  [DURATION_VIEW]: durationLabel,
  [FREQUENCY_VIEW]: frequencyLabel
};
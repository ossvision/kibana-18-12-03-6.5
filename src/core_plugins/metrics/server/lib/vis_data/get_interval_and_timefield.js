import { metricTypes } from '../../../common/metric_types';
export default function getIntervalAndTimefield(panel, series = {}) {
  const timeField =
    (series.override_index_pattern && series.series_time_field) ||
    panel.time_field;
  const interval =
    (series.override_index_pattern && series.series_interval) || panel.interval;
  if (metricTypes.includes(panel.type) && panel.timerange_mode === 'last') {
    return { timeField, interval: panel.timerange_mode_interval || interval };
  }
  return { timeField, interval };
}

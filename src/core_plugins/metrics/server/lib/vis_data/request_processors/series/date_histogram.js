import getBucketSize from '../../helpers/get_bucket_size';
import offsetTime from '../../offset_time';
import getIntervalAndTimefield from '../../get_interval_and_timefield';
import { set } from 'lodash';
import { metricTypes } from '../../../../../common/metric_types';
import { hasSiblingAggs } from '../../helpers/has_sibling_aggs';

export default function dateHistogram(req, panel, series) {
  return next => doc => {
    const { timeField, interval } = getIntervalAndTimefield(panel, series);
    const { bucketSize, intervalString } = getBucketSize(req, interval);
    const { from, to }  = offsetTime(req, series.offset_time, panel);
    const { timezone } = req.payload.timerange;

    if (metricTypes.includes(panel.type) && panel.timerange_mode === 'all') {
      set(doc, `aggs.${series.id}.aggs.timeseries.filters`, { filters: { _all: { match_all: {} } } });
    } else {
      const useTruncatedTimerange = metricTypes.includes(panel.type) && !hasSiblingAggs(series);
      const boundsMin = useTruncatedTimerange ? to.clone().subtract(5 * bucketSize, 's') : from;

      set(doc, `aggs.${series.id}.aggs.timeseries.date_histogram`, {
        field: timeField,
        interval: intervalString,
        min_doc_count: 0,
        time_zone: timezone,
        extended_bounds: {
          min: boundsMin.valueOf(),
          max: to.valueOf()
        }
      });
    }
    set(doc, `aggs.${series.id}.meta`, {
      to: to.toISOString(),
      from: from.toISOString(),
      timeField,
      intervalString,
      bucketSize
    });
    set(doc, `aggs.${series.id}.meta`, {
      timeField,
      intervalString,
      bucketSize
    });
    return next(doc);
  };
}

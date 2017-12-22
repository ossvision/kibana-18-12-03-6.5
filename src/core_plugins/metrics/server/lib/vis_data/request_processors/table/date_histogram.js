import { set } from 'lodash';
import getBucketSize from '../../helpers/get_bucket_size';
import getIntervalAndTimefield from '../../get_interval_and_timefield';
import getTimerange from '../../helpers/get_timerange';
import { calculateAggRoot } from './calculate_agg_root';
import { metricTypes } from '../../../../../common/metric_types';
import { hasSiblingAggs } from '../../helpers/has_sibling_aggs';

export default function dateHistogram(req, panel) {
  return next => doc => {
    const { timeField, interval } = getIntervalAndTimefield(panel);
    const { bucketSize, intervalString } = getBucketSize(req, interval);
    const { from, to }  = getTimerange(req);
    panel.series.forEach(column => {
      const aggRoot = calculateAggRoot(doc, column);
      if (metricTypes.includes(panel.type) && panel.timerange_mode === 'all') {
        set(doc, `${aggRoot}.timeseries.filters`, { filters: { _all: { match_all: {} } } });
      } else {
        const useTruncatedTimerange = metricTypes.includes(panel.type) && !panel.series.some(hasSiblingAggs);
        const boundsMin = useTruncatedTimerange ? to.clone().subtract(5 * bucketSize, 's') : from;

        set(doc, `${aggRoot}.timeseries.date_histogram`, {
          field: timeField,
          interval: intervalString,
          min_doc_count: 0,
          extended_bounds: {
            min: boundsMin.valueOf(),
            max: to.valueOf()
          }
        });
      }
      set(doc, aggRoot.replace(/\.aggs$/, '.meta'), {
        to: to.toISOString(),
        from: from.toISOString(),
        timeField,
        intervalString,
        bucketSize
      });
      set(doc, aggRoot.replace(/\.aggs$/, '.meta'), {
        timeField,
        intervalString,
        bucketSize
      });
    });
    return next(doc);
  };
}

import { get } from 'lodash';
import moment from 'moment';
export function dropLastBucket(resp, panel, series) {
  return next => results => {
    const bucketSize = get(resp, `aggregations.${series.id}.meta.bucketSize`);
    const maxString = get(resp, `aggregations.${series.id}.meta.to`);
    const max = moment.utc(maxString);
    const seriesDropLastBucket = get(series, 'override_drop_last_bucket', 1);
    const dropLastBucket = get(panel, 'drop_last_bucket', seriesDropLastBucket);

    if (dropLastBucket) {
      results.forEach(item => {
        const lastIndex = item.data.reduceRight((acc, row) => {
          const date = moment.utc(row[0] + bucketSize);
          return date.isAfter(max) ? --acc : acc;
        }, item.data.length);
        item.data = item.data.slice(0, lastIndex);
      });
    }

    return next(results);
  };
}


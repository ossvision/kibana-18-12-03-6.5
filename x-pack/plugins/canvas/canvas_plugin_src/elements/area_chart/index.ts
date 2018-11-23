/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import header from './header.png';

export const areaChart: CanvasElement = () => ({
  name: 'areaChart',
  image: header,
  expression: `filters
  | demodata
  | pointseries x="time" y="mean(price)"
  | plot defaultStyle={seriesStyle lines=1 fill=1}
  | render`,
});

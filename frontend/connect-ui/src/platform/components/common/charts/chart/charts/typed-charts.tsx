import React, { forwardRef } from 'react';
import { Chart as ChartJS, LineController, BarController } from 'chart.js';
import { ChartType, ChartComponentLike } from 'chart.js';

import {
  ChartProps,
  ChartJSOrUndefined,
  TypedChartComponent,
} from './types';
import { Chart } from './chart';

function createTypedChart<T extends ChartType>(
  type: T,
  registerables: ChartComponentLike,
) {
  ChartJS.register(registerables);

  return forwardRef<ChartJSOrUndefined<T>, Omit<ChartProps<T>, 'type'>>(
    (props, ref) => <Chart {...props} ref={ref} type={type} />,
  ) as TypedChartComponent<T, true>;
}

export const Line = /* #__PURE__ */ createTypedChart('line', LineController);
export const Bar = /* #__PURE__ */ createTypedChart('bar', BarController);
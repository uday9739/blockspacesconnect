import { Chart as ChartJS, ChartDataset, ChartOptions, DatasetChartOptions } from 'chart.js';
import { useEffect, useRef, useState } from 'react';

type Props = {
  labels: string[],
  datasets: ChartDataset[]
  options: ChartOptions
}

export const UsageChart = ({ labels, datasets, options }: Props) => {

  const chartCanvas = useRef();
  const chart = useRef<ChartJS>();
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (chart.current) return
    chart.current = new ChartJS(
      chartCanvas.current,
      { type: 'line', data: { datasets: [] } }
    )
  }, [])

  useEffect(() => {
    if (!datasets) return

    chart.current.data.labels = labels
    chart.current.data.datasets = datasets
    chart.current.options = options
    chart.current.update()
    setForceUpdate(forceUpdate + 1);

  }, [chart.current, datasets])

  return (
    <canvas ref={chartCanvas} />
  )
}
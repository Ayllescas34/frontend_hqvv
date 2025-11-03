import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

const Stats = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold mb-6 text-center">Estadísticas</h2>
    <BarChart
      series={[
        { data: [10, 30] },
        { data: [20] },
        { data: [15] },
        { data: [30] },
      ]}
      height={290}
      xAxis={[{ data: ['Q1'] }]}
    />
    <h2 className="text-2xl font-bold mb-6 text-center">Gráfica 2</h2>
    <PieChart
    series={[
        {
        data: [
            { id: 0, value: 50, label: 'series A' },
            { id: 1, value: 30, label: 'series B' },
            { id: 2, value: 20, label: 'series C' },
        ],
        },
    ]}
    width={500}
    height={500}
    />
  </div>
);

export default Stats;


/**
 *  stats por tipo de pagos por mes
 *  stats por año 
 */
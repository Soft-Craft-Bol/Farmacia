import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const ChartComponent = ({ data }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' }, // fondo blanco
        textColor: '#333333', // texto gris oscuro
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: {
          color: '#f0f0f0',
        },
        horzLines: {
          color: '#f0f0f0',
        },
      },
    });

    chart.timeScale().fitContent();

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#3b82f6',        // azul medio para la línea
      topColor: 'rgba(59, 130, 246, 0.5)',   // azul más suave arriba
      bottomColor: 'rgba(59, 130, 246, 0.1)', // azul más tenue abajo
    });

    areaSeries.setData(data);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} />;
};

export default ChartComponent;

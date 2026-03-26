"use client";

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type TrendDataPoint = {
  date: string;
  interest: number;
};

type TrendChartProps = {
  data: TrendDataPoint[];
};

export default function TrendChart({ data }: TrendChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Cleanup previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Determine if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#e5e7eb' : '#333';
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item.date),
        datasets: [{
          label: 'Interest Index',
          data: data.map(item => item.interest),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 0.5,
          pointRadius: 1,
          pointHoverRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: textColor
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          }
        }
      }
    });
    
    // Update chart when theme changes
    const observer = new MutationObserver(() => {
      if (!chartInstance.current) return;
      
      const isDarkMode = document.documentElement.classList.contains('dark');
      const textColor = isDarkMode ? '#e5e7eb' : '#333';
      const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
      
      // Update chart colors
      if (chartInstance.current.options.scales?.x?.grid) {
        chartInstance.current.options.scales.x.grid.color = gridColor;
      }
      if (chartInstance.current.options.scales?.x?.ticks) {
        chartInstance.current.options.scales.x.ticks.color = textColor;
      }
      
      if (chartInstance.current.options.scales?.y?.grid) {
        chartInstance.current.options.scales.y.grid.color = gridColor;
      }
      if (chartInstance.current.options.scales?.y?.ticks) {
        chartInstance.current.options.scales.y.ticks.color = textColor;
      }
      
      if (chartInstance.current.options.plugins?.legend?.labels) {
        chartInstance.current.options.plugins.legend.labels.color = textColor;
      }
      
      if (chartInstance.current.options.plugins?.tooltip) {
        chartInstance.current.options.plugins.tooltip.backgroundColor = isDarkMode ? '#1f2937' : '#fff';
        chartInstance.current.options.plugins.tooltip.titleColor = textColor;
        chartInstance.current.options.plugins.tooltip.bodyColor = textColor;
        chartInstance.current.options.plugins.tooltip.borderColor = isDarkMode ? '#374151' : '#e5e7eb';
      }
      
      chartInstance.current.update();
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => {
      observer.disconnect();
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);
  
  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

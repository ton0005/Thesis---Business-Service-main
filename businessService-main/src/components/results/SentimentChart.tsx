"use client";

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type SentimentDataPoint = {
  sentiment: string;
  value: number;
};

type SentimentChartProps = {
  data: SentimentDataPoint[];
};

export default function SentimentChart({ data }: SentimentChartProps) {
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
    const backgroundColor = isDarkMode ? '#1f2937' : '#fff';
    
    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(item => item.sentiment),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: [
            '#22c55e', // Positive - green
            '#3b82f6', // Neutral - blue
            '#ef4444', // Negative - red
            '#f59e0b' // Mixed - yellow
          ],
          borderColor: isDarkMode ? '#1f2937' : '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: backgroundColor,
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = (context.dataset.data as number[]).reduce((acc, val) => acc + val, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${percentage}%`;
              }
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
      const backgroundColor = isDarkMode ? '#1f2937' : '#fff';
      
      // Update chart colors
      if (chartInstance.current.options.plugins?.legend?.labels) {
        chartInstance.current.options.plugins.legend.labels.color = textColor;
      }
      
      if (chartInstance.current.options.plugins?.tooltip) {
        chartInstance.current.options.plugins.tooltip.backgroundColor = backgroundColor;
        chartInstance.current.options.plugins.tooltip.titleColor = textColor;
        chartInstance.current.options.plugins.tooltip.bodyColor = textColor;
        chartInstance.current.options.plugins.tooltip.borderColor = isDarkMode ? '#374151' : '#e5e7eb';
      }
      
      if (chartInstance.current.data.datasets[0]) {
        chartInstance.current.data.datasets[0].borderColor = isDarkMode ? '#1f2937' : '#fff';
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

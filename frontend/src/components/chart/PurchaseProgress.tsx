import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

interface PurchaseProgressProps {
  purchased: number;
  remaining: number;
}

const PurchaseProgress: React.FC<PurchaseProgressProps> = ({
  purchased,
  remaining,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [""],
        datasets: [
          {
            label: "還剩",
            data: [remaining],
            backgroundColor: "rgba(0, 0, 0, 0.8)", // 黑色
            borderColor: "rgba(0, 0, 0, 1)",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20, // 設置條形的固定厚度
          },
          {
            label: "已購",
            data: [purchased],
            backgroundColor: "rgba(128, 128, 128, 0.8)", // 灰色
            borderColor: "rgba(128, 128, 128, 1)",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20, // 設置條形的固定厚度
          },
        ],
      },
      options: {
        indexAxis: "y",
        scales: {
          x: {
            stacked: true,
            display: false,
          },
          y: {
            stacked: true,
            display: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [purchased, remaining]);

  return <canvas ref={canvasRef}></canvas>;
};

export default PurchaseProgress;

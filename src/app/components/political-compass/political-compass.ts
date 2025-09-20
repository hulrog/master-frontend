import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  Chart,
  ScatterDataPoint,
  ScatterController,
  ChartOptions,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required components
Chart.register(LinearScale, PointElement, ScatterController, Tooltip, Legend);

interface Ideology {
  user_id: number;
  economicValue: number; // -3 to 3
  authorityValue: number; // -3 to 3
  socialValue: number; // -3 to 3
}

interface User {
  user_id: number;
  name: string;
  ideology?: Ideology;
}

@Component({
  selector: 'standalone-political-compass',
  template: `<canvas #chartCanvas></canvas>`,
  styles: [
    `
      canvas {
        width: 100%;
        height: 400px;
      }
    `,
  ],
})
export class PoliticalCompassComponent implements AfterViewInit {
  @Input() users: User[] = [];
  @ViewChild('chartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;

  ngAfterViewInit() {
    this.renderChart();
  }

  renderChart() {
    if (!this.chart) {
      this.chart = new Chart(this.chartRef.nativeElement, {
        type: 'scatter',
        data: {
          datasets: [],
        },
        options: this.getChartOptions(),
      });
    }

    // Izlvacenje podataka iz niza korisnika
    const datasets = this.users
      .filter((u) => u.ideology)
      .map((u) => ({
        label: u.name,
        data: [
          {
            x: u.ideology!.economicValue,
            y: u.ideology!.authorityValue,
          },
        ] as ScatterDataPoint[],
        pointStyle: 'triangle',
        rotation: this.getTriangleRotation(u.ideology!.socialValue),
        backgroundColor: this.getGrayScale(u.ideology!.socialValue),
        radius: 12,
      }));

    this.chart.data.datasets = datasets;
    this.chart.update();
  }

  getGrayScale(social: number) {
    // -3 (crna, najkonzervativnije) i +3 (bela, najprogresivnije)
    const val = Math.floor(((social + 3) / 6) * 255);
    return `rgb(${val}, ${val}, ${val})`;
  }
  getTriangleRotation(social: number) {
    return social > 0 ? 0 : 180; //
  }

  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const dataset = ctx.dataset;
              const point = ctx.raw as ScatterDataPoint;
              const user = this.users.find((u) => u.name === dataset.label);
              return `${dataset.label}: Econ ${point.x}, Auth ${point.y}, Social ${user?.ideology?.socialValue}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          min: -3,
          max: 3,
          title: { display: true, text: 'Economic' },
        },
        y: {
          type: 'linear',
          min: -3,
          max: 3,
          title: { display: true, text: 'Authority' },
        },
      },
    };
  }
}

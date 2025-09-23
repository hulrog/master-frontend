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
  templateUrl: './political-compass.component.html',
  styleUrls: ['./political-compass.component.scss'],
})
export class PoliticalCompassComponent implements AfterViewInit {
  @Input() users: User[] = [];
  @ViewChild('chartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;

  ngAfterViewInit() {
    this.renderChart();

    window.addEventListener('resize', () => {
      this.chart?.resize();
    });
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
        backgroundColor: 'black',
        radius: 8,
      }));

    this.chart.data.datasets = datasets;
    this.chart.update();
  }

  // Ne koristi se trenutno
  getGrayScale(social: number) {
    social = Number(social);

    const val = Math.round(((social + 3) / 6) * 255);

    console.log('social:', social, 'val:', val);
    return `rgb(${val}, ${val}, ${val})`;
  }

  getTriangleRotation(social: number) {
    return social > 0 ? 0 : 180; // na gore (default): prog, na dole (180 rotacija): kon
  }

  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      plugins: {
        legend: { display: false },
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
          title: { display: true, text: 'Economic Left - Economic Right' },
          min: -3,
          max: 3,
          offset: true,
          grid: {
            drawTicks: true,
            drawOnChartArea: true,
            color: (ctx) =>
              ctx.tick.value === 0 ? 'black' : 'rgba(0,0,0,0.1)', // ako je origin, crna, u suprotnom, slaba siva
          },
          ticks: {
            stepSize: 1,
          },
        },
        y: {
          type: 'linear',
          title: { display: true, text: ' Libertarian - Authoritarian' },
          min: -3,
          max: 3,
          offset: true,
          grid: {
            drawTicks: true,
            drawOnChartArea: true,
            color: (ctx) =>
              ctx.tick.value === 0 ? 'black' : 'rgba(0,0,0,0.1)', // ako je origin, crna, u suprotnom, slaba siva
          },
          ticks: {
            stepSize: 1,
          },
        },
      },
    };
  }
}

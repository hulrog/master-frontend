import {
  Component,
  Input,
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

Chart.register(LinearScale, PointElement, ScatterController, Tooltip, Legend);

interface UserActivity {
  user_id: number;
  name: string;
  submitted: number;
  supported: number;
  denied: number;
}

@Component({
  selector: 'standalone-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
})
export class UserActivityComponent implements AfterViewInit {
  @Input() users: UserActivity[] = [];

  @ViewChild('submittedSupportedCanvas')
  submittedSupportedRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('submittedDeniedCanvas')
  submittedDeniedRef!: ElementRef<HTMLCanvasElement>;

  submittedSupportedChart!: Chart;
  submittedDeniedChart!: Chart;

  ngAfterViewInit() {
    this.renderSubmittedSupportedChart();
    this.renderSubmittedDeniedChart();
    window.addEventListener('resize', () => {
      this.submittedSupportedChart?.resize();
      this.submittedDeniedChart?.resize();
    });
  }

  private renderSubmittedSupportedChart() {
    this.submittedSupportedChart = new Chart(
      this.submittedSupportedRef.nativeElement,
      {
        type: 'scatter',
        data: {
          datasets: this.users.map((u) => ({
            label: u.name,
            data: [{ x: u.submitted, y: u.supported }] as ScatterDataPoint[],
            backgroundColor: 'black',
            radius: 6,
          })),
        },
        options: this.getChartOptions('Submitted', 'Supported'),
      }
    );
  }

  private renderSubmittedDeniedChart() {
    this.submittedDeniedChart = new Chart(
      this.submittedDeniedRef.nativeElement,
      {
        type: 'scatter',
        data: {
          datasets: this.users.map((u) => ({
            label: u.name,
            data: [{ x: u.submitted, y: u.denied }] as ScatterDataPoint[],
            backgroundColor: 'black',
            radius: 6,
          })),
        },
        options: this.getChartOptions('Submitted', 'Denied'),
      }
    );
  }

  private getChartOptions(xLabel: string, yLabel: string): ChartOptions {
    return {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const point = ctx.raw as ScatterDataPoint;
              return `${ctx.dataset.label}: ${xLabel} ${point.x}, ${yLabel} ${point.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: xLabel },
          beginAtZero: true,
        },
        y: {
          type: 'linear',
          title: { display: true, text: yLabel },
          beginAtZero: true,
        },
      },
    };
  }
}

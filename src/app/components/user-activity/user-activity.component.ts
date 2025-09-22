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
  CategoryScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  TimeScale,
} from 'chart.js';

Chart.register(
  LinearScale,
  PointElement,
  ScatterController,
  Tooltip,
  Legend,
  CategoryScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  TimeScale
);

interface UserActivity {
  user_id: number;
  name: string;
  submitted: number;
  supported: number;
  denied: number;
}

interface Fact {
  fact_id: number;
  date_entered: string;
  user_name: string;
}

@Component({
  selector: 'standalone-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
})
export class UserActivityComponent implements AfterViewInit {
  @Input() users: UserActivity[] = [];
  @Input() facts: Fact[] = [];

  @ViewChild('submittedSupportedCanvas')
  submittedSupportedRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('submittedDeniedCanvas')
  submittedDeniedRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('factsPerDayCanvas')
  factsPerDayRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topUsersCanvas') topUsersRef!: ElementRef<HTMLCanvasElement>;

  submittedSupportedChart!: Chart;
  submittedDeniedChart!: Chart;
  factsPerDayChart!: Chart;
  topUsersChart!: Chart;

  ngAfterViewInit() {
    this.renderSubmittedSupportedChart();
    this.renderSubmittedDeniedChart();
    this.renderFactsPerDayChart(this.facts);
    this.renderTopUsersChart(this.facts);

    window.addEventListener('resize', () => {
      this.submittedSupportedChart?.resize();
      this.submittedDeniedChart?.resize();
      this.factsPerDayChart?.resize();
      this.topUsersChart?.resize();
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

  private renderFactsPerDayChart(facts: Fact[]) {
    const counts: Record<string, number> = {};

    facts.forEach((f) => {
      const date = f.date_entered.split('T')[0]; // YYYY-MM-DD
      counts[date] = (counts[date] || 0) + 1;
    });

    const labels = Object.keys(counts).sort();
    const dataPoints = labels.map((date) => counts[date]);

    this.factsPerDayChart = new Chart(this.factsPerDayRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Facts Submitted',
            data: dataPoints,
            borderColor: 'black',
            backgroundColor: 'transparent',
            fill: true,
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }

  private renderTopUsersChart(facts: Fact[]) {
    const counts: Record<string, number> = {};

    facts.forEach((f) => {
      counts[f.user_name] = (counts[f.user_name] || 0) + 1;
    });

    const sortedUsers = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sortedUsers.map(([name]) => name);
    const dataPoints = sortedUsers.map(([_, count]) => count);

    this.topUsersChart = new Chart(this.topUsersRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Facts Submitted',
            data: dataPoints,
            backgroundColor: 'black',
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }
}

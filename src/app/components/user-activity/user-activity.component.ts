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
  @ViewChild('factRatingsCanvas')
  factRatingsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('verificationStatusCanvas')
  verificationStatusRef!: ElementRef<HTMLCanvasElement>;

  submittedSupportedChart!: Chart;
  submittedDeniedChart!: Chart;
  factsPerDayChart!: Chart;
  topUsersChart!: Chart;
  factRatingsChart!: Chart;
  verificationStatusChart!: Chart;

  rootStyles = getComputedStyle(document.documentElement);
  successColor = this.rootStyles.getPropertyValue('--ion-color-success').trim();
  dangerColor = this.rootStyles.getPropertyValue('--ion-color-danger').trim();

  ngAfterViewInit() {
    this.renderSubmittedSupportedChart();
    this.renderSubmittedDeniedChart();
    this.renderFactsPerDayChart(this.facts);
    this.renderTopUsersChart(this.facts);
    this.renderFactRatingsChart(this.facts);
    this.renderVerificationStatusChart(this.users);

    window.addEventListener('resize', () => {
      this.submittedSupportedChart?.resize();
      this.submittedDeniedChart?.resize();
      this.factsPerDayChart?.resize();
      this.topUsersChart?.resize();
      this.factRatingsChart?.resize();
      this.verificationStatusChart?.resize();
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

  private renderFactRatingsChart(facts: Fact[]) {
    const topicCounts: Record<string, { true: number; false: number }> = {};

    facts.forEach((f: any) => {
      const topic = f.topic_name || 'Unknown';
      if (!topicCounts[topic]) topicCounts[topic] = { true: 0, false: 0 };
      topicCounts[topic].true += f.true_ratings || 0;
      topicCounts[topic].false += f.false_ratings || 0;
    });

    const sortedTopics = Object.entries(topicCounts)
      .map(([topic, counts]) => ({
        topic,
        ...counts,
        total: counts.true + counts.false,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const labels = sortedTopics.map((t) => t.topic);
    const trueCounts = sortedTopics.map((t) => t.true);
    const falseCounts = sortedTopics.map((t) => t.false);

    this.factRatingsChart = new Chart(this.factRatingsRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'True Ratings',
            data: trueCounts,
            backgroundColor: this.successColor,
          },
          {
            label: 'False Ratings',
            data: falseCounts,
            backgroundColor: this.dangerColor,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true },
        },
      },
    });
  }

  private renderVerificationStatusChart(users: any[]) {
    const verified = users.filter((u) => u.verified == 1).length;
    const unverified = users.length - verified;

    this.verificationStatusChart = new Chart(
      this.verificationStatusRef.nativeElement,
      {
        type: 'pie',
        data: {
          labels: ['Verified', 'Unverified'],
          datasets: [
            {
              data: [verified, unverified],
              backgroundColor: [this.successColor, this.dangerColor],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
          },
        },
      }
    );
  }
}

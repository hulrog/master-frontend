import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Chart, ChartOptions, registerables } from 'chart.js';
import {
  ChoroplethController,
  GeoFeature,
  ProjectionScale,
  ColorScale,
} from 'chartjs-chart-geo';
import * as topojson from 'topojson-client';

Chart.register(
  ...registerables,
  ChoroplethController,
  GeoFeature,
  ProjectionScale,
  ColorScale
);

@Component({
  selector: 'standalone-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.scss'],
})
export class WorldMapComponent implements AfterViewInit, OnChanges {
  @Input() countries: any[] = [];
  @Input() trueCountries: any[] = [];
  @Input() falseCountries: any[] = [];
  @Input() mode: 'population' | 'fact' = 'population';
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart;

  rootStyles = getComputedStyle(document.documentElement);
  successRgb = this.rootStyles
    .getPropertyValue('--ion-color-success-rgb')
    .trim();
  dangerRgb = this.rootStyles.getPropertyValue('--ion-color-danger-rgb').trim();
  warningRgb = this.rootStyles
    .getPropertyValue('--ion-color-warning-rgb')
    .trim();

  async ngAfterViewInit() {
    await this.renderChart();
  }

  async ngOnChanges() {
    if (this.chart) {
      this.chart.destroy();
      await this.renderChart();
    }
  }

  private async renderChart() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const world = await fetch(
      'https://unpkg.com/world-atlas/countries-110m.json'
    ).then((r) => r.json());

    const geo = topojson.feature(world, world.objects.countries) as any;

    let data, backgroundColors;

    // Fact mode: za prikaz dve boje
    if (this.mode === 'fact') {
      data = geo.features.map((f: any) => {
        const trueMatch = this.trueCountries.find((c) => c.iso_code === f.id);
        const falseMatch = this.falseCountries.find((c) => c.iso_code === f.id);

        const supporters = trueMatch ? trueMatch.weight : 0;
        const deniers = falseMatch ? falseMatch.weight : 0;
        const total = supporters + deniers;

        return {
          feature: f,
          value: total,
          supporters,
          deniers,
          ratio: total > 0 ? supporters / total : 0.5, // neutralci su 0.5
          trueCountry: trueMatch,
          falseCountry: falseMatch,
        };
      });

      // Color based on supporter/denier ratio
      backgroundColors = data.map((d: any) => {
        if (d.value === 0) return '#B9A37E';

        const ratio = d.ratio;

        if (ratio > 0.6) {
          const intensity = Math.min(1, (ratio - 0.6) / 0.4);
          return `rgba(${this.successRgb}, ${0.3 + intensity * 0.7})`;
        } else if (ratio < 0.4) {
          const intensity = Math.min(1, (0.4 - ratio) / 0.4);
          return `rgba(${this.dangerRgb}, ${0.3 + intensity * 0.7})`;
        } else {
          return `rgba(${this.warningRgb}, 0.88)`; // neutralci
        }
      });
    } else {
      // Population mode: za prikaz jedne boje
      data = geo.features.map((f: any) => {
        const match = this.countries.find((c) => c.code.toUpperCase() === f.id);
        return { feature: f, value: match ? match.population : 0 };
      });

      const maxValue = Math.max(...data.map((d: any) => d.value));
      backgroundColors = data.map((d: any) => {
        if (d.value === 0) return '#B9A37E';
        const intensity = d.value / maxValue;
        return `rgba(${this.successRgb}, ${0.3 + intensity * 0.7})`;
      });
    }

    this.chart = new Chart(ctx, {
      type: 'choropleth',
      data: {
        labels: data.map((d: any) => d.feature.properties.name),
        datasets: [
          {
            label:
              this.mode === 'fact'
                ? 'Fact Support vs Opposition'
                : 'Users by Country',
            data,
            borderColor: '#B9A37E',
            borderWidth: 1,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                if (this.mode === 'fact') {
                  const data = ctx.raw;
                  const country = ctx.chart.data.labels?.[ctx.dataIndex];
                  const tooltipLines = [`${country}`];

                  if (data.supporters > 0) {
                    tooltipLines.push(`Supporters: ${data.supporters}`);
                  }
                  if (data.deniers > 0) {
                    tooltipLines.push(`Deniers: ${data.deniers}`);
                  }
                  if (data.value > 0) {
                    const percentage = (
                      (data.supporters / data.value) *
                      100
                    ).toFixed(1);
                    tooltipLines.push(`Support: ${percentage}%`);
                  }

                  return tooltipLines;
                }
                return `${ctx.chart.data.labels?.[ctx.dataIndex]}: ${
                  ctx.raw.value
                }`;
              },
            },
          },
        },
        scales: {
          projection: {
            type: 'projection',
            projection: 'equirectangular',
            axis: 'x',
          },
          color: {
            type: 'color',
            axis: 'color',
            display: false,
            legend: {
              display: false,
            },
          } as any,
        },
      } as ChartOptions,
    });

    this.canvas.nativeElement.classList.add('loaded');
  }
}

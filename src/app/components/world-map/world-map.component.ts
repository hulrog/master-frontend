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
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

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

    const data = geo.features.map((f: any) => {
      const match = this.countries.find((c) => c.code.toUpperCase() === f.id);
      return { feature: f, value: match ? match.population : 0 };
    });

    this.chart = new Chart(ctx, {
      type: 'choropleth',
      data: {
        labels: data.map((d: any) => d.feature.properties.name),
        datasets: [
          {
            label: 'Users by Country',
            data,
            borderColor: 'black',
            borderWidth: 0.5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) =>
                `${ctx.chart.data.labels?.[ctx.dataIndex]}: ${ctx.raw.value}`,
            },
          },
        },
        scales: {
          projection: {
            type: 'projection',
            projection: 'equirectangular',
            axis: 'x',
          },
        },
      } as ChartOptions,
    });
  }
}

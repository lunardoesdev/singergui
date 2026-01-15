// Simple canvas-based chart component
export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  padding?: number;
  lineColor?: string;
  fillColor?: string;
  gridColor?: string;
  textColor?: string;
  showGrid?: boolean;
  showPoints?: boolean;
  yMin?: number;
  yMax?: number;
}

export class LineChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: Required<ChartOptions>;

  constructor(container: HTMLElement, options: ChartOptions = {}) {
    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;

    this.options = {
      width: options.width ?? 400,
      height: options.height ?? 200,
      padding: options.padding ?? 40,
      lineColor: options.lineColor ?? '#0ea5e9',
      fillColor: options.fillColor ?? 'rgba(14, 165, 233, 0.1)',
      gridColor: options.gridColor ?? '#e5e7eb',
      textColor: options.textColor ?? '#6b7280',
      showGrid: options.showGrid ?? true,
      showPoints: options.showPoints ?? false,
      yMin: options.yMin ?? 0,
      yMax: options.yMax ?? 100,
    };

    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
  }

  draw(points: ChartPoint[]): void {
    const { width, height, padding, lineColor, fillColor, gridColor, textColor, showGrid, showPoints, yMin } = this.options;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (points.length === 0) {
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.font = '14px sans-serif';
      ctx.fillText('No data', width / 2, height / 2);
      return;
    }

    // Calculate scales
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMaxActual = Math.max(...points.map(p => p.y), this.options.yMax);

    const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin || 1)) * chartWidth;
    const scaleY = (y: number) => height - padding - ((y - yMin) / (yMaxActual - yMin || 1)) * chartHeight;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y-axis labels
        const value = yMaxActual - ((yMaxActual - yMin) / 4) * i;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';
        ctx.font = '10px sans-serif';
        ctx.fillText(this.formatValue(value), padding - 5, y + 3);
      }
    }

    // Draw line and fill
    ctx.beginPath();
    ctx.moveTo(scaleX(points[0].x), scaleY(points[0].y));

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(scaleX(points[i].x), scaleY(points[i].y));
    }

    // Fill under the line
    ctx.lineTo(scaleX(points[points.length - 1].x), height - padding);
    ctx.lineTo(scaleX(points[0].x), height - padding);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Draw the line itself
    ctx.beginPath();
    ctx.moveTo(scaleX(points[0].x), scaleY(points[0].y));
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(scaleX(points[i].x), scaleY(points[i].y));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    if (showPoints) {
      ctx.fillStyle = lineColor;
      for (const point of points) {
        ctx.beginPath();
        ctx.arc(scaleX(point.x), scaleY(point.y), 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private formatValue(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  }

  resize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

export class BarChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: Required<ChartOptions>;

  constructor(container: HTMLElement, options: ChartOptions = {}) {
    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;

    this.options = {
      width: options.width ?? 400,
      height: options.height ?? 200,
      padding: options.padding ?? 40,
      lineColor: options.lineColor ?? '#0ea5e9',
      fillColor: options.fillColor ?? '#0ea5e9',
      gridColor: options.gridColor ?? '#e5e7eb',
      textColor: options.textColor ?? '#6b7280',
      showGrid: options.showGrid ?? true,
      showPoints: options.showPoints ?? false,
      yMin: options.yMin ?? 0,
      yMax: options.yMax ?? 100,
    };

    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
  }

  draw(data: { label: string; value: number; color?: string }[]): void {
    const { width, height, padding, gridColor, textColor, showGrid, yMin } = this.options;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.font = '14px sans-serif';
      ctx.fillText('No data', width / 2, height / 2);
      return;
    }

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const yMax = Math.max(...data.map(d => d.value), this.options.yMax);
    const barWidth = chartWidth / data.length * 0.7;
    const barGap = chartWidth / data.length * 0.3;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
    }

    // Draw bars
    data.forEach((item, i) => {
      const x = padding + (chartWidth / data.length) * i + barGap / 2;
      const barHeight = ((item.value - yMin) / (yMax - yMin)) * chartHeight;
      const y = height - padding - barHeight;

      ctx.fillStyle = item.color || this.options.fillColor;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.font = '10px sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 15);
    });
  }
}

/**
 * Animation Engine - 3Blue1Brown Style Canvas Animations
 * Provides smooth, mathematical animations with morphing shapes,
 * flowing lines, and elegant transitions.
 */

export interface Point {
  x: number;
  y: number;
}

export interface AnimationElement {
  id: string;
  type: 'circle' | 'line' | 'arrow' | 'text' | 'equation' | 'graph' | 'shape' | 'number' | 'grid' | 'atom' | 'molecule' | 'bond' | 'rect' | 'ellipse' | 'dna' | 'flowbox' | 'reactionArrow' | 'pendulum' | 'spring' | 'wave' | 'vector' | 'matrix' | 'tree' | 'cell_membrane' | 'protein' | 'orbital';
  props: Record<string, unknown>;
  style: ElementStyle;
  animation?: ElementAnimation;
}

export interface ElementStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
  glow?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  // New properties for chemistry/biology
  textColor?: string;
  atomColor?: string;
  bondColor?: string;
}

export interface ElementAnimation {
  type: 'fadeIn' | 'fadeOut' | 'draw' | 'morph' | 'move' | 'scale' | 'pulse' | 'typewriter' | 'oscillate';
  duration: number; // milliseconds
  delay?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'elastic' | 'bounce';
}

export interface Scene {
  id: string;
  duration: number; // milliseconds
  elements: AnimationElement[];
  narration: string;
  background?: string;
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface LectureScript {
  title: string;
  totalDuration: number;
  scenes: Scene[];
}

// 3Blue1Brown color palette
export const COLORS = {
  background: '#1c1c1c',
  blue: '#58c4dd',
  teal: '#5cd0b3',
  green: '#83c167',
  yellow: '#ffff00',
  gold: '#e1a158',
  red: '#fc6255',
  maroon: '#cf5044',
  purple: '#9a72ac',
  white: '#ece6e2',
  gray: '#888888',
  darkGray: '#444444',
};

// Easing functions
const easings = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

export class AnimationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private currentScene: Scene | null = null;
  private animationFrame: number | null = null;
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private onSceneComplete?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.setupCanvas();
  }

  private setupCanvas() {
    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  public resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = width;
    this.height = height;
  }

  public playScene(scene: Scene, onComplete?: () => void) {
    this.currentScene = scene;
    this.onSceneComplete = onComplete;
    this.startTime = performance.now();
    this.isPlaying = true;
    this.animate();
  }

  public stop() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private animate = () => {
    if (!this.isPlaying || !this.currentScene) return;

    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.currentScene.duration, 1);

    this.render(progress);

    if (progress < 1) {
      this.animationFrame = requestAnimationFrame(this.animate);
    } else {
      this.isPlaying = false;
      this.onSceneComplete?.();
    }
  };

  private render(sceneProgress: number) {
    if (!this.currentScene) return;

    // Clear and fill background
    this.ctx.fillStyle = this.currentScene.background || COLORS.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render each element
    for (const element of this.currentScene.elements) {
      this.renderElement(element, sceneProgress);
    }
  }

  private getElementProgress(element: AnimationElement, sceneProgress: number): number {
    if (!element.animation) return 1;

    const { duration, delay = 0 } = element.animation;
    const sceneDuration = this.currentScene?.duration || 1;
    const startProgress = delay / sceneDuration;
    const endProgress = (delay + duration) / sceneDuration;

    if (sceneProgress < startProgress) return 0;
    if (sceneProgress > endProgress) return 1;

    const localProgress = (sceneProgress - startProgress) / (endProgress - startProgress);
    const easing = element.animation.easing || 'easeInOut';
    return easings[easing](localProgress);
  }

  private renderElement(element: AnimationElement, sceneProgress: number) {
    const progress = this.getElementProgress(element, sceneProgress);
    if (progress === 0 && element.animation?.type === 'fadeIn') return;

    this.ctx.save();

    // Apply common styles
    const style = element.style;
    if (style.opacity !== undefined) {
      this.ctx.globalAlpha = style.opacity;
    }

    // Apply glow effect
    if (style.glow) {
      this.ctx.shadowColor = style.glowColor || COLORS.blue;
      this.ctx.shadowBlur = (style.glowIntensity || 20) * progress;
    }

    // Handle animation effects
    if (element.animation) {
      switch (element.animation.type) {
        case 'fadeIn':
          this.ctx.globalAlpha = progress * (style.opacity ?? 1);
          break;
        case 'fadeOut':
          this.ctx.globalAlpha = (1 - progress) * (style.opacity ?? 1);
          break;
        case 'scale':
          const scale = progress;
          this.ctx.translate(this.width / 2, this.height / 2);
          this.ctx.scale(scale, scale);
          this.ctx.translate(-this.width / 2, -this.height / 2);
          break;
        case 'pulse':
          const pulseScale = 1 + 0.1 * Math.sin(progress * Math.PI * 4);
          this.ctx.translate(this.width / 2, this.height / 2);
          this.ctx.scale(pulseScale, pulseScale);
          this.ctx.translate(-this.width / 2, -this.height / 2);
          break;
      }
    }

    // Render based on type
    switch (element.type) {
      case 'circle':
        this.renderCircle(element, progress);
        break;
      case 'line':
        this.renderLine(element, progress);
        break;
      case 'arrow':
        this.renderArrow(element, progress);
        break;
      case 'text':
        this.renderText(element, progress);
        break;
      case 'equation':
        this.renderEquation(element, progress);
        break;
      case 'graph':
        this.renderGraph(element, progress);
        break;
      case 'shape':
        this.renderShape(element, progress);
        break;
      case 'number':
        this.renderNumber(element, progress);
        break;
      case 'grid':
        this.renderGrid(element, progress);
        break;
    }

    this.ctx.restore();
  }

  private renderCircle(element: AnimationElement, progress: number) {
    const { x, y, radius } = element.props as { x: number; y: number; radius: number };
    const style = element.style;

    // For draw animation, draw the circle arc progressively
    const endAngle = element.animation?.type === 'draw'
      ? -Math.PI / 2 + (Math.PI * 2 * progress)
      : Math.PI * 2;
    const startAngle = -Math.PI / 2; // Start from top

    this.ctx.beginPath();
    if (element.animation?.type === 'draw') {
      this.ctx.arc(x, y, radius, startAngle, endAngle);
    } else {
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    if (style.fillColor && (element.animation?.type !== 'draw' || progress >= 1)) {
      this.ctx.fillStyle = style.fillColor;
      this.ctx.fill();
    }
    if (style.strokeColor) {
      this.ctx.strokeStyle = style.strokeColor;
      this.ctx.lineWidth = style.strokeWidth || 2;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }
  }

  private renderLine(element: AnimationElement, progress: number) {
    const { x1, y1, x2, y2 } = element.props as { x1: number; y1: number; x2: number; y2: number };
    const style = element.style;

    const drawX2 = element.animation?.type === 'draw' ? x1 + (x2 - x1) * progress : x2;
    const drawY2 = element.animation?.type === 'draw' ? y1 + (y2 - y1) * progress : y2;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(drawX2, drawY2);
    this.ctx.strokeStyle = style.strokeColor || COLORS.white;
    this.ctx.lineWidth = style.strokeWidth || 2;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
  }

  private renderArrow(element: AnimationElement, progress: number) {
    const { x1, y1, x2, y2 } = element.props as { x1: number; y1: number; x2: number; y2: number };
    const style = element.style;

    const drawX2 = element.animation?.type === 'draw' ? x1 + (x2 - x1) * progress : x2;
    const drawY2 = element.animation?.type === 'draw' ? y1 + (y2 - y1) * progress : y2;

    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(drawX2, drawY2);
    this.ctx.strokeStyle = style.strokeColor || COLORS.white;
    this.ctx.lineWidth = style.strokeWidth || 2;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Draw arrowhead
    if (progress > 0.8) {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLength = 15;
      const arrowProgress = (progress - 0.8) / 0.2;

      this.ctx.beginPath();
      this.ctx.moveTo(drawX2, drawY2);
      this.ctx.lineTo(
        drawX2 - headLength * Math.cos(angle - Math.PI / 6) * arrowProgress,
        drawY2 - headLength * Math.sin(angle - Math.PI / 6) * arrowProgress
      );
      this.ctx.moveTo(drawX2, drawY2);
      this.ctx.lineTo(
        drawX2 - headLength * Math.cos(angle + Math.PI / 6) * arrowProgress,
        drawY2 - headLength * Math.sin(angle + Math.PI / 6) * arrowProgress
      );
      this.ctx.stroke();
    }
  }

  private renderText(element: AnimationElement, progress: number) {
    const { text, x, y } = element.props as { text: string; x: number; y: number };
    const style = element.style;

    this.ctx.font = `${style.fontSize || 24}px ${style.fontFamily || 'Arial'}`;
    this.ctx.fillStyle = style.fillColor || COLORS.white;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    if (element.animation?.type === 'typewriter') {
      const chars = Math.floor(text.length * progress);
      this.ctx.fillText(text.substring(0, chars), x, y);
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  private renderEquation(element: AnimationElement, progress: number) {
    const { equation, x, y } = element.props as { equation: string; x: number; y: number };
    const style = element.style;

    // Convert LaTeX to Unicode using MathRenderer
    const { MathRenderer } = require('./MathRenderer');
    const unicodeEquation = MathRenderer.toUnicode(equation);

    const fontFamily = "'Cambria Math', 'Latin Modern Math', 'STIX Two Math', Georgia, serif";
    this.ctx.font = `italic ${style.fontSize || 32}px ${fontFamily}`;
    this.ctx.fillStyle = style.fillColor || COLORS.white;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    if (element.animation?.type === 'typewriter') {
      const chars = Math.floor(unicodeEquation.length * progress);
      this.ctx.fillText(unicodeEquation.substring(0, chars), x, y);
    } else {
      this.ctx.fillText(unicodeEquation, x, y);
    }
  }

  private renderGraph(element: AnimationElement, progress: number) {
    const { fn, xMin, xMax, xScale, yScale, originX, originY } = element.props as {
      fn: string;
      xMin: number;
      xMax: number;
      xScale: number;
      yScale: number;
      originX: number;
      originY: number;
    };
    const style = element.style;

    // Evaluate function (simple parser for common functions)
    const evalFn = (x: number): number => {
      try {
        // Simple function parser - supports x, x^2, sin(x), cos(x), etc.
        let expr = fn;
        expr = expr.replace(/\^/g, '**');
        expr = expr.replace(/sin/g, 'Math.sin');
        expr = expr.replace(/cos/g, 'Math.cos');
        expr = expr.replace(/tan/g, 'Math.tan');
        expr = expr.replace(/sqrt/g, 'Math.sqrt');
        expr = expr.replace(/abs/g, 'Math.abs');
        expr = expr.replace(/PI/g, 'Math.PI');
        expr = expr.replace(/e\b/g, 'Math.E');
        // eslint-disable-next-line no-new-func
        return new Function('x', `return ${expr}`)(x);
      } catch {
        return 0;
      }
    };

    const drawMax = xMin + (xMax - xMin) * progress;
    const steps = 200;
    const stepSize = (drawMax - xMin) / steps;

    this.ctx.beginPath();
    this.ctx.strokeStyle = style.strokeColor || COLORS.blue;
    this.ctx.lineWidth = style.strokeWidth || 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    let started = false;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * stepSize;
      const y = evalFn(x);
      const canvasX = originX + x * xScale;
      const canvasY = originY - y * yScale;

      if (!isFinite(y) || Math.abs(y) > 1000) {
        started = false;
        continue;
      }

      if (!started) {
        this.ctx.moveTo(canvasX, canvasY);
        started = true;
      } else {
        this.ctx.lineTo(canvasX, canvasY);
      }
    }
    this.ctx.stroke();
  }

  private renderShape(element: AnimationElement, progress: number) {
    const { points } = element.props as { points: Point[] };
    const style = element.style;

    if (points.length < 2) return;

    const drawCount = element.animation?.type === 'draw'
      ? Math.floor(points.length * progress)
      : points.length;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < drawCount; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    if (drawCount === points.length && style.fillColor) {
      this.ctx.closePath();
      this.ctx.fillStyle = style.fillColor;
      this.ctx.fill();
    }

    if (style.strokeColor) {
      this.ctx.strokeStyle = style.strokeColor;
      this.ctx.lineWidth = style.strokeWidth || 2;
      this.ctx.stroke();
    }
  }

  private renderNumber(element: AnimationElement, progress: number) {
    const { value, x, y, decimals = 0 } = element.props as {
      value: number;
      x: number;
      y: number;
      decimals?: number;
    };
    const style = element.style;

    const displayValue = value * progress;
    const formattedValue = displayValue.toFixed(decimals);

    this.ctx.font = `${style.fontSize || 48}px ${style.fontFamily || 'Arial'}`;
    this.ctx.fillStyle = style.fillColor || COLORS.yellow;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(formattedValue, x, y);
  }

  private renderGrid(element: AnimationElement, progress: number) {
    const { originX, originY, width, height, spacing, showLabels } = element.props as {
      originX: number;
      originY: number;
      width: number;
      height: number;
      spacing: number;
      showLabels?: boolean;
    };
    const style = element.style;

    const halfW = width / 2;
    const halfH = height / 2;
    const opacity = (style.opacity ?? 0.5) * progress;

    this.ctx.strokeStyle = style.strokeColor || COLORS.darkGray;
    this.ctx.lineWidth = style.strokeWidth || 1;
    this.ctx.globalAlpha = opacity;

    // Draw vertical lines
    for (let x = -halfW; x <= halfW; x += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(originX + x, originY - halfH);
      this.ctx.lineTo(originX + x, originY + halfH);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = -halfH; y <= halfH; y += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(originX - halfW, originY + y);
      this.ctx.lineTo(originX + halfW, originY + y);
      this.ctx.stroke();
    }

    // Draw labels if enabled
    if (showLabels && progress > 0.5) {
      const labelOpacity = (progress - 0.5) * 2;
      this.ctx.globalAlpha = labelOpacity * 0.7;
      this.ctx.fillStyle = COLORS.gray;
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';

      // X-axis labels
      for (let x = -halfW; x <= halfW; x += spacing) {
        if (x !== 0) {
          const label = Math.round(x / spacing).toString();
          this.ctx.fillText(label, originX + x, originY + 5);
        }
      }

      // Y-axis labels
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      for (let y = -halfH; y <= halfH; y += spacing) {
        if (y !== 0) {
          const label = Math.round(-y / spacing).toString();
          this.ctx.fillText(label, originX - 5, originY + y);
        }
      }
    }
  }

  // Utility methods for creating common elements
  public static createAxes(
    originX: number,
    originY: number,
    width: number,
    height: number,
    delay: number = 0
  ): AnimationElement[] {
    return [
      {
        id: 'x-axis',
        type: 'arrow',
        props: { x1: originX - width / 2, y1: originY, x2: originX + width / 2, y2: originY },
        style: { strokeColor: COLORS.gray, strokeWidth: 2 },
        animation: { type: 'draw', duration: 500, delay, easing: 'easeOut' },
      },
      {
        id: 'y-axis',
        type: 'arrow',
        props: { x1: originX, y1: originY + height / 2, x2: originX, y2: originY - height / 2 },
        style: { strokeColor: COLORS.gray, strokeWidth: 2 },
        animation: { type: 'draw', duration: 500, delay: delay + 200, easing: 'easeOut' },
      },
    ];
  }

  public static createGrid(
    originX: number,
    originY: number,
    width: number,
    height: number,
    spacing: number = 50,
    delay: number = 0
  ): AnimationElement[] {
    const elements: AnimationElement[] = [];
    const halfW = width / 2;
    const halfH = height / 2;

    // Vertical lines
    for (let x = -halfW; x <= halfW; x += spacing) {
      elements.push({
        id: `grid-v-${x}`,
        type: 'line',
        props: { x1: originX + x, y1: originY - halfH, x2: originX + x, y2: originY + halfH },
        style: { strokeColor: COLORS.darkGray, strokeWidth: 1, opacity: 0.5 },
        animation: { type: 'fadeIn', duration: 300, delay, easing: 'easeOut' },
      });
    }

    // Horizontal lines
    for (let y = -halfH; y <= halfH; y += spacing) {
      elements.push({
        id: `grid-h-${y}`,
        type: 'line',
        props: { x1: originX - halfW, y1: originY + y, x2: originX + halfW, y2: originY + y },
        style: { strokeColor: COLORS.darkGray, strokeWidth: 1, opacity: 0.5 },
        animation: { type: 'fadeIn', duration: 300, delay, easing: 'easeOut' },
      });
    }

    return elements;
  }
}

export default AnimationEngine;

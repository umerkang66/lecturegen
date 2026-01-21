'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LectureScript, Scene, COLORS } from '@/lib/animation/AnimationEngine';
import TTSController from '@/lib/audio/TTSController';
import VideoRecorder from '@/lib/video/VideoRecorder';

type GenerationStatus = 'idle' | 'generating' | 'ready' | 'playing' | 'recording' | 'error';

// Fast Animation Engine - No async operations, instant rendering
class FastAnimationEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width = 800;
    private height = 600;
    private currentScene: Scene | null = null;
    private animationFrame: number | null = null;
    private startTime = 0;
    private isPlaying = false;
    private onSceneComplete?: () => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');
        this.ctx = ctx;
        this.setupCanvas();
    }

    private setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    // Synchronous - no await, instant start
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

    private ease(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    private getProgress(element: Scene['elements'][0], sceneProgress: number): number {
        if (!element.animation) return 1;
        const { duration, delay = 0 } = element.animation;
        const sceneDuration = this.currentScene?.duration || 1;
        const start = delay / sceneDuration;
        const end = (delay + duration) / sceneDuration;
        if (sceneProgress < start) return 0;
        if (sceneProgress > end) return 1;
        return this.ease((sceneProgress - start) / (end - start));
    }

    private render(sceneProgress: number) {
        if (!this.currentScene) return;
        this.ctx.fillStyle = this.currentScene.background || COLORS.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        for (const el of this.currentScene.elements) {
            this.renderElement(el, sceneProgress);
        }
    }

    private renderElement(el: Scene['elements'][0], sceneProgress: number) {
        const p = this.getProgress(el, sceneProgress);
        if (p === 0 && el.animation?.type === 'fadeIn') return;

        this.ctx.save();
        const s = el.style || {};
        let alpha = (s.opacity as number) ?? 1;
        if (el.animation?.type === 'fadeIn') alpha *= p;
        if (el.animation?.type === 'fadeOut') alpha *= (1 - p);
        this.ctx.globalAlpha = alpha;

        if (s.glow) {
            this.ctx.shadowColor = (s.glowColor as string) || COLORS.blue;
            this.ctx.shadowBlur = 15 * Math.min(p * 2, 1);
        }

        switch (el.type) {
            case 'circle': this.drawCircle(el, p); break;
            case 'line': this.drawLine(el, p); break;
            case 'arrow': this.drawArrow(el, p); break;
            case 'text': this.drawText(el, p); break;
            case 'equation': this.drawEquation(el, p); break;
            case 'graph': this.drawGraph(el, p); break;
            case 'shape': this.drawShape(el, p); break;
            case 'number': this.drawNumber(el, p); break;
            case 'grid': this.drawGrid(el, p); break;
        }
        this.ctx.restore();
    }

    private drawCircle(el: Scene['elements'][0], p: number) {
        const { x, y, radius } = el.props as { x: number; y: number; radius: number };
        const s = el.style || {};
        const endAngle = el.animation?.type === 'draw' ? -Math.PI / 2 + Math.PI * 2 * p : Math.PI * 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, -Math.PI / 2, endAngle);
        if (s.strokeColor) {
            this.ctx.strokeStyle = s.strokeColor as string;
            this.ctx.lineWidth = (s.strokeWidth as number) || 2;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
        if (s.fillColor && p >= 1) {
            this.ctx.fillStyle = s.fillColor as string;
            this.ctx.fill();
        }
    }

    private drawLine(el: Scene['elements'][0], p: number) {
        const { x1, y1, x2, y2 } = el.props as { x1: number; y1: number; x2: number; y2: number };
        const s = el.style || {};
        const dx = el.animation?.type === 'draw' ? x1 + (x2 - x1) * p : x2;
        const dy = el.animation?.type === 'draw' ? y1 + (y2 - y1) * p : y2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(dx, dy);
        this.ctx.strokeStyle = (s.strokeColor as string) || '#888';
        this.ctx.lineWidth = (s.strokeWidth as number) || 2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    private drawArrow(el: Scene['elements'][0], p: number) {
        const { x1, y1, x2, y2 } = el.props as { x1: number; y1: number; x2: number; y2: number };
        const s = el.style || {};
        const dx = el.animation?.type === 'draw' ? x1 + (x2 - x1) * p : x2;
        const dy = el.animation?.type === 'draw' ? y1 + (y2 - y1) * p : y2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(dx, dy);
        this.ctx.strokeStyle = (s.strokeColor as string) || '#888';
        this.ctx.lineWidth = (s.strokeWidth as number) || 2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        if (p > 0.8) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const len = 10;
            const ap = (p - 0.8) / 0.2;
            this.ctx.beginPath();
            this.ctx.moveTo(dx, dy);
            this.ctx.lineTo(dx - len * Math.cos(angle - Math.PI / 6) * ap, dy - len * Math.sin(angle - Math.PI / 6) * ap);
            this.ctx.moveTo(dx, dy);
            this.ctx.lineTo(dx - len * Math.cos(angle + Math.PI / 6) * ap, dy - len * Math.sin(angle + Math.PI / 6) * ap);
            this.ctx.stroke();
        }
    }

    private drawText(el: Scene['elements'][0], p: number) {
        const { text, x, y } = el.props as { text: string; x: number; y: number };
        const s = el.style || {};
        const fontSize = (s.fontSize as number) || 24;
        this.ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`;
        this.ctx.fillStyle = (s.fillColor as string) || '#ece6e2';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const t = el.animation?.type === 'typewriter' ? text.slice(0, Math.floor(text.length * p)) : text;
        const cx = Math.max(50, Math.min(750, x));
        this.ctx.fillText(t, cx, y);
    }

    // Direct Unicode equation rendering - handles powers and fractions visually
    private drawEquation(el: Scene['elements'][0], p: number) {
        const { equation, x, y } = el.props as { equation: string; x: number; y: number };
        const s = el.style || {};
        const fontSize = (s.fontSize as number) || 32;

        // Convert to display-friendly format
        let display = this.formatEquation(equation);

        if (el.animation?.type === 'typewriter' || el.animation?.type === 'fadeIn') {
            if (el.animation.type === 'typewriter') {
                display = display.slice(0, Math.floor(display.length * p));
            }
        }

        this.ctx.font = `italic ${fontSize}px 'Cambria', 'Times New Roman', Georgia, serif`;
        this.ctx.fillStyle = (s.fillColor as string) || '#ece6e2';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Clamp position to keep on screen
        const textWidth = this.ctx.measureText(display).width;
        const cx = Math.max(textWidth / 2 + 30, Math.min(this.width - textWidth / 2 - 30, x));
        const cy = Math.max(50, Math.min(this.height - 50, y));

        this.ctx.fillText(display, cx, cy);
    }

    // Format equation - convert LaTeX-like syntax to Unicode
    private formatEquation(eq: string): string {
        let result = eq;

        // Greek letters
        const greek: Record<string, string> = {
            '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
            '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ', '\\pi': 'π', '\\sigma': 'σ',
            '\\phi': 'φ', '\\omega': 'ω', '\\Sigma': 'Σ', '\\Pi': 'Π', '\\Omega': 'Ω',
            '\\Delta': 'Δ', '\\Gamma': 'Γ', '\\Lambda': 'Λ', '\\Phi': 'Φ', '\\Psi': 'Ψ',
            '\\rho': 'ρ', '\\tau': 'τ', '\\chi': 'χ', '\\psi': 'ψ', '\\eta': 'η',
            '\\zeta': 'ζ', '\\xi': 'ξ', '\\nu': 'ν', '\\kappa': 'κ', '\\iota': 'ι'
        };
        for (const [tex, uni] of Object.entries(greek)) {
            result = result.replace(new RegExp(tex.replace('\\', '\\\\'), 'g'), uni);
        }

        // Math symbols
        const symbols: Record<string, string> = {
            '\\infty': '∞', '\\pm': '±', '\\times': '×', '\\div': '÷', '\\neq': '≠',
            '\\leq': '≤', '\\geq': '≥', '\\approx': '≈', '\\equiv': '≡', '\\rightarrow': '→',
            '\\leftarrow': '←', '\\Rightarrow': '⇒', '\\partial': '∂', '\\nabla': '∇',
            '\\sum': 'Σ', '\\prod': 'Π', '\\int': '∫', '\\sqrt': '√', '\\cdot': '·',
            '\\bullet': '•', '\\degree': '°', '\\angle': '∠', '\\triangle': '△',
            '\\forall': '∀', '\\exists': '∃', '\\in': '∈', '\\notin': '∉',
            '\\subset': '⊂', '\\supset': '⊃', '\\cup': '∪', '\\cap': '∩',
            '\\emptyset': '∅', '\\land': '∧', '\\lor': '∨', '\\neg': '¬'
        };
        for (const [tex, uni] of Object.entries(symbols)) {
            result = result.replace(new RegExp(tex.replace('\\', '\\\\'), 'g'), uni);
        }

        // Remove \frac{a}{b} -> (a)/(b)
        result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

        // Handle sqrt
        result = result.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
        result = result.replace(/\\sqrt\s*(\d)/g, '√$1');

        // Superscripts: ^{...} or ^x
        const sup: Record<string, string> = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
            '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ',
            'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'k': 'ᵏ', 'm': 'ᵐ', 'o': 'ᵒ', 'p': 'ᵖ',
            'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'z': 'ᶻ'
        };
        result = result.replace(/\^{([^}]+)}/g, (_, content) =>
            content.split('').map((c: string) => sup[c.toLowerCase()] || c).join('')
        );
        result = result.replace(/\^([a-zA-Z0-9])/g, (_, c) => sup[c.toLowerCase()] || `^${c}`);

        // Subscripts: _{...} or _x
        const sub: Record<string, string> = {
            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
            '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ',
            'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ',
            'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
        };
        result = result.replace(/_{([^}]+)}/g, (_, content) =>
            content.split('').map((c: string) => sub[c.toLowerCase()] || c).join('')
        );
        result = result.replace(/_([a-zA-Z0-9])/g, (_, c) => sub[c.toLowerCase()] || `_${c}`);

        // Clean up remaining LaTeX commands
        result = result.replace(/\\[a-zA-Z]+/g, '');
        result = result.replace(/[{}]/g, '');
        result = result.replace(/\s+/g, ' ').trim();

        return result;
    }

    private drawGraph(el: Scene['elements'][0], p: number) {
        const props = el.props as { fn: string; xMin: number; xMax: number; xScale: number; yScale: number; originX: number; originY: number };
        const s = el.style || {};
        const evalFn = (x: number): number => {
            try {
                const expr = props.fn.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos')
                    .replace(/tan/g, 'Math.tan').replace(/sqrt/g, 'Math.sqrt').replace(/abs/g, 'Math.abs')
                    .replace(/PI/g, 'Math.PI').replace(/e(?![a-z])/g, 'Math.E');
                return new Function('x', `return ${expr}`)(x);
            } catch { return 0; }
        };
        const drawMax = props.xMin + (props.xMax - props.xMin) * p;
        const steps = 150;
        const step = (drawMax - props.xMin) / steps;
        this.ctx.beginPath();
        this.ctx.strokeStyle = (s.strokeColor as string) || COLORS.blue;
        this.ctx.lineWidth = (s.strokeWidth as number) || 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        let started = false;
        for (let i = 0; i <= steps; i++) {
            const x = props.xMin + i * step;
            const y = evalFn(x);
            const cx = props.originX + x * props.xScale;
            const cy = props.originY - y * props.yScale;
            if (!isFinite(y) || Math.abs(y) > 50) { started = false; continue; }
            if (!started) { this.ctx.moveTo(cx, cy); started = true; }
            else { this.ctx.lineTo(cx, cy); }
        }
        this.ctx.stroke();
    }

    private drawShape(el: Scene['elements'][0], p: number) {
        const { points } = el.props as { points: { x: number; y: number }[] };
        const s = el.style || {};
        if (!points || points.length < 2) return;
        const count = el.animation?.type === 'draw' ? Math.max(2, Math.floor(points.length * p) + 1) : points.length;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < Math.min(count, points.length); i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        if (p >= 1) this.ctx.closePath();
        if (s.fillColor && p >= 1) {
            this.ctx.fillStyle = s.fillColor as string;
            this.ctx.fill();
        }
        if (s.strokeColor) {
            this.ctx.strokeStyle = s.strokeColor as string;
            this.ctx.lineWidth = (s.strokeWidth as number) || 2;
            this.ctx.stroke();
        }
    }

    private drawNumber(el: Scene['elements'][0], p: number) {
        const { value, x, y, decimals } = el.props as { value: number; x: number; y: number; decimals?: number };
        const s = el.style || {};
        const fontSize = (s.fontSize as number) || 48;
        this.ctx.font = `bold ${fontSize}px 'Segoe UI', Arial`;
        this.ctx.fillStyle = (s.fillColor as string) || COLORS.yellow;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText((value * p).toFixed(decimals || 0), x, y);
    }

    private drawGrid(el: Scene['elements'][0], p: number) {
        const { originX, originY, width, height, spacing } = el.props as { originX: number; originY: number; width: number; height: number; spacing: number };
        const s = el.style || {};
        const hw = width / 2, hh = height / 2;
        this.ctx.strokeStyle = (s.strokeColor as string) || '#444';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = ((s.opacity as number) ?? 0.5) * p;
        for (let x = -hw; x <= hw; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(originX + x, originY - hh);
            this.ctx.lineTo(originX + x, originY + hh);
            this.ctx.stroke();
        }
        for (let y = -hh; y <= hh; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(originX - hw, originY + y);
            this.ctx.lineTo(originX + hw, originY + y);
            this.ctx.stroke();
        }
    }
}

export default function VideoLectureGenerator({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<FastAnimationEngine | null>(null);
    const ttsRef = useRef<TTSController | null>(null);
    const recorderRef = useRef<VideoRecorder | null>(null);

    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState<2 | 5 | 10>(2);
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [lectureScript, setLectureScript] = useState<LectureScript | null>(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            ttsRef.current = new TTSController();
            recorderRef.current = new VideoRecorder();
        }
    }, []);

    useEffect(() => {
        if (canvasRef.current && !engineRef.current) {
            engineRef.current = new FastAnimationEngine(canvasRef.current);
        }
    }, []);

    const generateLecture = async () => {
        if (!title.trim()) { setError('Please enter a lecture title'); return; }
        setStatus('generating');
        setError(null);
        setVideoBlob(null);
        setProgress(0);

        try {
            const response = await fetch('/api/generate/lecture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, duration }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate lecture');
            }
            const script: LectureScript = await response.json();
            setLectureScript(script);
            setStatus('ready');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setStatus('error');
        }
    };

    // Synchronous scene play - no await, instant transition
    const playScene = useCallback((scene: Scene): Promise<void> => {
        return new Promise((resolve) => {
            if (!engineRef.current) { resolve(); return; }
            if (ttsRef.current && scene.narration) {
                ttsRef.current.speak(scene.narration).catch(() => { });
            }
            engineRef.current.playScene(scene, resolve);
        });
    }, []);

    const playAllScenes = useCallback(async () => {
        if (!lectureScript || !engineRef.current) return;
        setStatus('playing');
        for (let i = 0; i < lectureScript.scenes.length; i++) {
            setCurrentSceneIndex(i);
            setProgress(((i + 1) / lectureScript.scenes.length) * 100);
            await playScene(lectureScript.scenes[i]);
        }
        setStatus('ready');
    }, [lectureScript, playScene]);

    const recordVideo = useCallback(async () => {
        if (!lectureScript || !canvasRef.current || !recorderRef.current) return;
        setStatus('recording');
        setCurrentSceneIndex(0);
        setProgress(0);
        try {
            await recorderRef.current.startRecording(canvasRef.current);
            for (let i = 0; i < lectureScript.scenes.length; i++) {
                setCurrentSceneIndex(i);
                setProgress(((i + 1) / lectureScript.scenes.length) * 100);
                await playScene(lectureScript.scenes[i]);
            }
            const blob = await recorderRef.current.stopRecording();
            setVideoBlob(blob);
            setStatus('ready');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Recording failed');
            setStatus('error');
        }
    }, [lectureScript, playScene]);

    const downloadVideo = () => {
        if (videoBlob) VideoRecorder.downloadBlob(videoBlob, `${title.replace(/\s+/g, '_')}_lecture.webm`);
    };

    const stopPlayback = () => {
        engineRef.current?.stop();
        ttsRef.current?.stop();
        setStatus('ready');
    };

    return (
        <div className={`video-lecture-generator ${className || ''}`}>
            <motion.div className="input-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="form-group">
                    <label htmlFor="lecture-title">Lecture Topic</label>
                    <input id="lecture-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., The Beauty of Euler's Identity" disabled={status === 'generating' || status === 'playing' || status === 'recording'} />
                </div>
                <div className="form-group">
                    <label>Video Duration</label>
                    <div className="duration-buttons">
                        {([2, 5, 10] as const).map((d) => (
                            <button key={d} className={`duration-btn ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)} disabled={status === 'generating' || status === 'playing' || status === 'recording'}>{d} min</button>
                        ))}
                    </div>
                </div>
                <motion.button className="generate-btn" onClick={generateLecture} disabled={status === 'generating' || status === 'playing' || status === 'recording'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {status === 'generating' ? (<><span className="spinner" />Generating...</>) : (<><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>Generate Lecture</>)}
                </motion.button>
            </motion.div>

            <motion.div className="canvas-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <canvas ref={canvasRef} width={800} height={600} style={{ width: '100%', height: 'auto', aspectRatio: '4/3' }} />
                <AnimatePresence>
                    {status === 'idle' && (
                        <motion.div className="canvas-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="overlay-content">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <p>Enter a topic and generate your AI lecture</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {(status === 'playing' || status === 'recording') && (
                    <div className="progress-bar"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} /></div>
                )}
            </motion.div>

            <AnimatePresence>
                {(status === 'ready' || status === 'playing' || status === 'recording') && lectureScript && (
                    <motion.div className="controls" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                        <div className="scene-info">
                            <span className="scene-label">Scene {currentSceneIndex + 1} of {lectureScript.scenes.length}</span>
                            {lectureScript.scenes[currentSceneIndex]?.narration && <p className="narration-text">{lectureScript.scenes[currentSceneIndex].narration}</p>}
                        </div>
                        <div className="control-buttons">
                            {status === 'ready' && (
                                <>
                                    <motion.button className="control-btn play" onClick={playAllScenes} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>Preview</motion.button>
                                    <motion.button className="control-btn record" onClick={recordVideo} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>Record</motion.button>
                                    {videoBlob && <motion.button className="control-btn download" onClick={downloadVideo} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Download</motion.button>}
                                </>
                            )}
                            {(status === 'playing' || status === 'recording') && (
                                <motion.button className="control-btn stop" onClick={stopPlayback} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" /></svg>Stop</motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.div className="error-message" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                        {error}
                        <button onClick={() => setError(null)}>&times;</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

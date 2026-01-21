/**
 * TTS Controller - Web Speech API Text-to-Speech with timing events
 * Handles narration synchronized with animations
 */

export interface TTSOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
}

export interface NarrationSegment {
    text: string;
    startTime: number; // when to start speaking (ms from scene start)
    onStart?: () => void;
    onEnd?: () => void;
}

export class TTSController {
    private synth: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private voices: SpeechSynthesisVoice[] = [];
    private defaultOptions: TTSOptions = {
        rate: 0.9,
        pitch: 1,
        volume: 1,
    };
    private isReady: boolean = false;

    constructor() {
        this.synth = window.speechSynthesis;
        this.loadVoices();

        // Voices may load asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    private loadVoices() {
        this.voices = this.synth.getVoices();
        this.isReady = this.voices.length > 0;

        // Prefer high-quality English voices
        const preferredVoices = [
            'Google UK English Male',
            'Google UK English Female',
            'Microsoft David',
            'Microsoft Zira',
            'Alex', // macOS
            'Daniel', // macOS UK
        ];

        for (const preferred of preferredVoices) {
            const voice = this.voices.find(v => v.name.includes(preferred));
            if (voice) {
                this.defaultOptions.voice = voice;
                break;
            }
        }

        // Fallback to first English voice
        if (!this.defaultOptions.voice) {
            this.defaultOptions.voice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        }
    }

    public getVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    public setVoice(voice: SpeechSynthesisVoice) {
        this.defaultOptions.voice = voice;
    }

    public setRate(rate: number) {
        this.defaultOptions.rate = Math.max(0.1, Math.min(2, rate));
    }

    public speak(text: string, options?: TTSOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            // Cancel any current speech
            this.stop();

            const utterance = new SpeechSynthesisUtterance(text);
            const opts = { ...this.defaultOptions, ...options };

            utterance.rate = opts.rate || 0.9;
            utterance.pitch = opts.pitch || 1;
            utterance.volume = opts.volume || 1;
            if (opts.voice) utterance.voice = opts.voice;

            utterance.onend = () => {
                this.currentUtterance = null;
                resolve();
            };

            utterance.onerror = (event) => {
                this.currentUtterance = null;
                // Ignore interrupted errors (from stop())
                if (event.error !== 'interrupted') {
                    reject(new Error(`Speech synthesis error: ${event.error}`));
                } else {
                    resolve();
                }
            };

            this.currentUtterance = utterance;
            this.synth.speak(utterance);
        });
    }

    public async speakWithTiming(
        segments: NarrationSegment[],
        sceneStartTime: number
    ): Promise<void> {
        for (const segment of segments) {
            // Wait until it's time to speak this segment
            const now = performance.now();
            const targetTime = sceneStartTime + segment.startTime;
            const waitTime = targetTime - now;

            if (waitTime > 0) {
                await this.delay(waitTime);
            }

            segment.onStart?.();
            await this.speak(segment.text);
            segment.onEnd?.();
        }
    }

    public stop() {
        this.synth.cancel();
        this.currentUtterance = null;
    }

    public pause() {
        this.synth.pause();
    }

    public resume() {
        this.synth.resume();
    }

    public isSpeaking(): boolean {
        return this.synth.speaking;
    }

    public isPaused(): boolean {
        return this.synth.paused;
    }

    public isAvailable(): boolean {
        return this.isReady;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Estimate speech duration based on text length and rate
    public estimateDuration(text: string, rate: number = this.defaultOptions.rate || 0.9): number {
        // Average speaking rate is about 150 words per minute
        // Adjusted for synthesis rate
        const words = text.split(/\s+/).length;
        const baseWPM = 150;
        const adjustedWPM = baseWPM * rate;
        const minutes = words / adjustedWPM;
        return minutes * 60 * 1000; // return milliseconds
    }
}

export default TTSController;

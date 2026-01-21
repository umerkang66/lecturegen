/**
 * Video Recorder - Uses MediaRecorder API to capture canvas animations with audio
 */

export interface RecordingOptions {
    mimeType?: string;
    videoBitsPerSecond?: number;
    audioBitsPerSecond?: number;
}

export class VideoRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private isRecording: boolean = false;

    public async startRecording(
        canvas: HTMLCanvasElement,
        options: RecordingOptions = {}
    ): Promise<void> {
        if (this.isRecording) {
            throw new Error('Already recording');
        }

        // Get canvas stream
        const canvasStream = canvas.captureStream(60); // 60 fps

        // Combine streams (video from canvas)
        this.stream = canvasStream;

        // Determine best supported format
        const mimeType = this.getSupportedMimeType(options.mimeType);

        const recorderOptions: MediaRecorderOptions = {
            mimeType,
            videoBitsPerSecond: options.videoBitsPerSecond || 5000000, // 5 Mbps
        };

        this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
        this.recordedChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.start(100); // Capture in 100ms chunks
        this.isRecording = true;
    }

    public stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                reject(new Error('Not recording'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
                const blob = new Blob(this.recordedChunks, { type: mimeType });
                this.cleanup();
                resolve(blob);
            };

            this.mediaRecorder.onerror = (event) => {
                this.cleanup();
                reject(new Error(`Recording error: ${event}`));
            };

            this.mediaRecorder.stop();
        });
    }

    public pauseRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.pause();
        }
    }

    public resumeRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
        }
    }

    public getRecordingState(): 'inactive' | 'recording' | 'paused' {
        return this.mediaRecorder?.state || 'inactive';
    }

    private cleanup() {
        this.isRecording = false;
        this.mediaRecorder = null;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.recordedChunks = [];
    }

    private getSupportedMimeType(preferred?: string): string {
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4',
        ];

        if (preferred && MediaRecorder.isTypeSupported(preferred)) {
            return preferred;
        }

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'video/webm';
    }

    public static downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    public static isSupported(): boolean {
        return typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream;
    }
}

export default VideoRecorder;

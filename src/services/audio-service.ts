export class AudioService {
	private audioContext: AudioContext | null = null;
	private enabled: boolean = true;

	constructor(enabled: boolean = true) {
		this.enabled = enabled;
		// Lazily init audio context on first user interaction if possible,
		// but here we might just init it when needed to avoid autoplay policies issues?
		// Actually, Obsidian apps run in an environment where audio is usually allowed.
	}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	private getContext(): AudioContext {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
		return this.audioContext;
	}

	private activeOscillators: OscillatorNode[] = [];
	private loopInterval: number | null = null;

	private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
		if (!this.enabled) return;
		const ctx = this.getContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

		gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
		gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + startTime + duration);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(ctx.currentTime + startTime);
		osc.stop(ctx.currentTime + startTime + duration);

		this.activeOscillators.push(osc);
		osc.onended = () => {
			this.activeOscillators = this.activeOscillators.filter((o) => o !== osc);
		};
	}

	playStart() {
		this.stopAlarm();
		// Simple high ping
		this.playTone(880, "sine", 0.5);
	}

	playPause() {
		this.stopAlarm();
		// Descending tone
		this.playTone(440, "sine", 0.1);
		this.playTone(330, "sine", 0.3, 0.1);
	}

	playResume() {
		this.stopAlarm();
		// Ascending tone
		this.playTone(330, "sine", 0.1);
		this.playTone(440, "sine", 0.3, 0.1);
	}

	playComplete(loop = false) {
		this.stopAlarm();
		const playMelody = () => {
			// Little melody: C - E - G - C
			const now = 0;
			this.playTone(523.25, "sine", 0.2, now);
			this.playTone(659.25, "sine", 0.2, now + 0.2);
			this.playTone(783.99, "sine", 0.2, now + 0.4);
			this.playTone(1046.5, "sine", 0.6, now + 0.6);
		};

		playMelody();

		if (loop) {
			this.loopInterval = window.setInterval(playMelody, 2000); // Repeat every 2s
		}
	}

	stopAlarm() {
		if (this.loopInterval) {
			window.clearInterval(this.loopInterval);
			this.loopInterval = null;
		}
		this.activeOscillators.forEach((osc) => {
			try {
				osc.stop();
			} catch {
				// Ignore if already stopped
			}
		});
		this.activeOscillators = [];
	}
}

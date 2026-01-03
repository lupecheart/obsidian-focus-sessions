export interface FocusSession {
	name: string;
	durationMinutes: number;
	startTime: number;
	status: "running" | "paused";
	elapsed: number; // accumulated time in seconds
	lastResumed: number; // timestamp when last resumed/started
}

import { FocusSessionSettings } from "@/settings";
import { AudioService } from "@/services/audio-service";
import { getRemainingTime } from "@/utils/time-utils";

export class SessionManager {
	private activeSession: FocusSession | null = null;
	private listeners: (() => void)[] = [];
	private settings: FocusSessionSettings;
	private audioService: AudioService;

	private customDuration: number;

	constructor(settings: FocusSessionSettings, audioService: AudioService) {
		this.settings = settings;
		this.audioService = audioService;
		this.audioService.setEnabled(settings.enableSound !== false); // Default true if undefined
		this.customDuration = settings.focusDuration;
	}

	setCustomDuration(minutes: number) {
		this.customDuration = Math.max(1, minutes); // Minimum 1 minute
		this.notifyListeners();
	}

	getCustomDuration(): number {
		return this.customDuration;
	}

	startSession(name: string, durationMinutes?: number) {
		const now = Date.now();
		let duration = durationMinutes;

		if (!duration) {
			// Determine default duration based on name or default to focus duration
			if (name === "Short Break") {
				duration = this.settings.shortBreakDuration;
			} else if (name === "Long Break") {
				duration = this.settings.longBreakDuration;
			} else {
				duration = this.customDuration;
			}
		}

		this.activeSession = {
			name,
			durationMinutes: duration,
			startTime: now,
			status: "running",
			elapsed: 0,
			lastResumed: now,
		};
		this.audioService.playStart();
		this.notifyListeners();
	}

	pauseSession() {
		if (this.activeSession && this.activeSession.status === "running") {
			const now = Date.now();
			const elapsedSinceLastResume = Math.floor((now - this.activeSession.lastResumed) / 1000);
			this.activeSession.elapsed += elapsedSinceLastResume;
			this.activeSession.status = "paused";
			this.audioService.playPause();
			this.notifyListeners();
		}
	}

	resumeSession() {
		if (this.activeSession && this.activeSession.status === "paused") {
			this.activeSession.status = "running";
			this.activeSession.lastResumed = Date.now();
			this.audioService.playResume();
			this.notifyListeners();
		}
	}

	stopSession() {
		this.activeSession = null;
		this.notifyListeners();
	}

	resetSession() {
		if (this.activeSession) {
			const now = Date.now();
			this.activeSession.elapsed = 0;
			this.activeSession.lastResumed = now;
			this.activeSession.startTime = now; // Technically a new start
			this.activeSession.status = "running";
			this.notifyListeners();
		}
	}

	addTime(minutes: number) {
		if (this.activeSession) {
			this.activeSession.durationMinutes += minutes;
			this.notifyListeners();
		}
	}

	tick() {
		if (this.activeSession && this.activeSession.status === "running") {
			const remaining = getRemainingTime(
				this.activeSession.durationMinutes,
				this.activeSession.elapsed,
				this.activeSession.status,
				this.activeSession.lastResumed,
			);

			if (remaining <= 0) {
				this.completeSession();
			}
		}
	}

	private completeSession() {
		this.activeSession = null; // Or move to a "completed" state if we had one
		this.audioService.playComplete();
		this.notifyListeners();
	}

	getActiveSession(): FocusSession | null {
		return this.activeSession;
	}

	onChange(callback: () => void) {
		this.listeners.push(callback);
	}

	removeListener(callback: () => void) {
		this.listeners = this.listeners.filter((l) => l !== callback);
	}

	private notifyListeners() {
		this.listeners.forEach((callback) => callback());
	}
}

export interface FocusSession {
	name: string;
	durationMinutes: number;
	startTime: number;
	status: "running" | "paused";
	elapsed: number; // accumulated time in seconds
	lastResumed: number; // timestamp when last resumed/started
}

import { FocusSessionSettings } from "@/settings";

export class SessionManager {
	private activeSession: FocusSession | null = null;
	private listeners: (() => void)[] = [];
	private settings: FocusSessionSettings;

	constructor(settings: FocusSessionSettings) {
		this.settings = settings;
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
				duration = this.settings.focusDuration;
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
		this.notifyListeners();
	}

	pauseSession() {
		if (this.activeSession && this.activeSession.status === "running") {
			const now = Date.now();
			const elapsedSinceLastResume = Math.floor((now - this.activeSession.lastResumed) / 1000);
			this.activeSession.elapsed += elapsedSinceLastResume;
			this.activeSession.status = "paused";
			this.notifyListeners();
		}
	}

	resumeSession() {
		if (this.activeSession && this.activeSession.status === "paused") {
			this.activeSession.status = "running";
			this.activeSession.lastResumed = Date.now();
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

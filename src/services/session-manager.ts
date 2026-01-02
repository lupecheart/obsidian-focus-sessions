export interface FocusSession {
	name: string;
	durationMinutes: number;
	startTime: number;
}

export class SessionManager {
	private activeSession: FocusSession | null = null;
	private listeners: (() => void)[] = [];

	startSession(name: string, durationMinutes: number) {
		this.activeSession = {
			name,
			durationMinutes,
			startTime: Date.now(),
		};
		this.notifyListeners();
	}

	stopSession() {
		this.activeSession = null;
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

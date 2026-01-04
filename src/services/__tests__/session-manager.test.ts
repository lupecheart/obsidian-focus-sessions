import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SessionManager } from "../session-manager";
import { AudioService } from "../audio-service";
import { DEFAULT_SETTINGS } from "../../settings";

describe("SessionManager", () => {
	let sessionManager: SessionManager;
	let mockAudioService: AudioService;

	beforeEach(() => {
		vi.useFakeTimers();
		mockAudioService = {
			playStart: vi.fn(),
			playPause: vi.fn(),
			playResume: vi.fn(),
			playComplete: vi.fn(),
			stopAlarm: vi.fn(),
			setEnabled: vi.fn(),
		} as unknown as AudioService;
		sessionManager = new SessionManager(DEFAULT_SETTINGS, mockAudioService);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should start a session correctly", () => {
		sessionManager.startSession("Test Session", 25);
		const session = sessionManager.getActiveSession();

		expect(session).not.toBeNull();
		expect(session?.name).toBe("Test Session");
		expect(session?.durationMinutes).toBe(25);
		expect(session?.status).toBe("running");
		expect(session?.elapsed).toBe(0);
	});

	it("should pause a running session", () => {
		sessionManager.startSession("Test Session", 25);

		// Advance time by 60 seconds
		vi.advanceTimersByTime(60000);

		sessionManager.pauseSession();
		const session = sessionManager.getActiveSession();

		expect(session?.status).toBe("paused");
		// Should have elapsed approx 60 seconds
		expect(session?.elapsed).toBeGreaterThanOrEqual(60);
	});

	it("should resume a paused session", () => {
		sessionManager.startSession("Test Session", 25);
		sessionManager.pauseSession();

		vi.advanceTimersByTime(1000); // Wait a bit while paused (should not count to elapsed of session logic if purely based on lastResumed diff, but elapsed is frozen on pause)

		const sessionBeforeResume = sessionManager.getActiveSession();
		const elapsedBeforeResume = sessionBeforeResume?.elapsed || 0;

		sessionManager.resumeSession();
		const session = sessionManager.getActiveSession();

		expect(session?.status).toBe("running");
		expect(session?.elapsed).toBe(elapsedBeforeResume);
	});

	it("should stop a session", () => {
		sessionManager.startSession("Test Session", 25);
		sessionManager.stopSession();
		expect(sessionManager.getActiveSession()).toBeNull();
	});

	it("should reset a session", () => {
		sessionManager.startSession("Test Session", 25);
		vi.advanceTimersByTime(60000);
		sessionManager.pauseSession(); // Pause adds to elapsed

		sessionManager.resetSession();
		const session = sessionManager.getActiveSession();

		expect(session?.status).toBe("running");
		expect(session?.elapsed).toBe(0);
		// startTime should be reset to current time (which is now start + 60s)
		// We can't easily check startTime exact value without tracking now, but logic says it resets.
	});

	it("should add time to a session", () => {
		sessionManager.startSession("Test Session", 25);
		sessionManager.addTime(5);
		const session = sessionManager.getActiveSession();
		expect(session?.durationMinutes).toBe(30);
	});

	it("should notify listeners on change", () => {
		const listener = vi.fn();
		sessionManager.onChange(listener);

		sessionManager.startSession("Test Session", 25);
		expect(listener).toHaveBeenCalledTimes(1);

		sessionManager.pauseSession();
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("should set custom duration", () => {
		sessionManager.setCustomDuration(50);
		expect(sessionManager.getCustomDuration()).toBe(50);
	});

	it("should not set custom duration below 1 minute", () => {
		sessionManager.setCustomDuration(0);
		expect(sessionManager.getCustomDuration()).toBe(1); // Min is 1
		sessionManager.setCustomDuration(-5);
		expect(sessionManager.getCustomDuration()).toBe(1);
	});

	it("should start a session with custom duration if no duration is provided", () => {
		sessionManager.setCustomDuration(40);
		sessionManager.startSession("Default Focus");
		const session = sessionManager.getActiveSession();

		expect(session?.durationMinutes).toBe(40);
	});

	it("should start a Short Break with configured duration if name is 'Short Break'", () => {
		sessionManager.startSession("Short Break");
		const session = sessionManager.getActiveSession();
		expect(session?.durationMinutes).toBe(DEFAULT_SETTINGS.shortBreakDuration);
	});

	it("should start a Long Break with configured duration if name is 'Long Break'", () => {
		sessionManager.startSession("Long Break");
		const session = sessionManager.getActiveSession();
		expect(session?.durationMinutes).toBe(DEFAULT_SETTINGS.longBreakDuration);
	});

	it("should complete session when time runs out", () => {
		sessionManager.startSession("Test", 1); // 1 minute
		vi.advanceTimersByTime(60000 + 1000); // 1m + 1s to be safe
		sessionManager.tick();

		const session = sessionManager.getActiveSession();
		expect(session?.status).toBe("completed");
		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(mockAudioService.playComplete).toHaveBeenCalledWith(true);
	});
});

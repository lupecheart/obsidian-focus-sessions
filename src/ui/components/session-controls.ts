import { setIcon } from "obsidian";
import { SessionManager } from "@/services/session-manager";

export class SessionControls {
	private container: HTMLElement;
	private sessionManager: SessionManager;
	private playBtn: HTMLElement | null = null;
	private onUpdate: () => void;

	constructor(container: HTMLElement, sessionManager: SessionManager, onUpdate: () => void) {
		this.container = container;
		this.sessionManager = sessionManager;
		this.onUpdate = onUpdate;
	}

	// Helper to create buttons
	private createBtn(
		container: HTMLElement,
		cls: string,
		icon: string,
		label: string,
		onClick: () => void,
	): HTMLElement {
		const btn = container.createDiv({ cls: `fs-control-btn ${cls}` });
		if (label) btn.setAttribute("aria-label", label);
		setIcon(btn, icon);
		btn.onclick = onClick;
		return btn;
	}

	render() {
		const controls = this.container.createDiv({ cls: "fs-controls" });
		this.controlsContainer = controls; // Save reference
		this.update();
	}

	private controlsContainer: HTMLElement;

	update() {
		if (!this.controlsContainer) return;
		this.controlsContainer.empty();

		const session = this.sessionManager.getActiveSession();
		const isRunning = session && session.status === "running";
		const isPaused = session && session.status === "paused";
		const isCompleted = session && session.status === "completed";
		const hasSession = isRunning || isPaused;

		// Row 1: Primary Controls
		const row1 = this.controlsContainer.createDiv({ cls: "fs-controls-row" });

		if (isCompleted) {
			row1.createDiv({ cls: "fs-status-msg", text: "Session Completed" });
			this.createBtn(row1, "fs-primary", "check", "Finish", () => {
				this.sessionManager.stopSession();
			});
		} else if (hasSession) {
			// STOP Button (Replacing Reset)
			// User said: "enter a number when I press reload it should stop"
			this.createBtn(row1, "fs-secondary", "square", "Stop Session", () => {
				this.sessionManager.stopSession();
			});

			// Play/Pause
			this.createBtn(row1, "fs-primary", isRunning ? "pause" : "play", isRunning ? "Pause" : "Resume", () => {
				if (isRunning) this.sessionManager.pauseSession();
				else this.sessionManager.resumeSession();
			});
		} else {
			// IDLE STATE

			// Short Break
			this.createBtn(row1, "fs-secondary", "coffee", "Short Break", () => {
				this.sessionManager.stopSession();
				this.sessionManager.startSession("Short Break");
			});

			// START (Play)
			this.createBtn(row1, "fs-primary", "play", "Start Focus", () => {
				this.sessionManager.startSession("Deep Work");
			});

			// Long Break
			this.createBtn(row1, "fs-secondary", "armchair", "Long Break", () => {
				this.sessionManager.stopSession();
				this.sessionManager.startSession("Long Break");
			});
		}

		// Row 2: Add Time (Only when session is active)
		if (hasSession) {
			const row2 = this.controlsContainer.createDiv({ cls: "fs-controls-row fs-mt-2" });

			const times = [
				{ label: "+30s", val: 0.5 },
				{ label: "+1m", val: 1 },
				{ label: "+5m", val: 5 },
			];

			times.forEach((t) => {
				const btn = row2.createDiv({ cls: "fs-control-text-btn" });
				btn.textContent = t.label;
				btn.onclick = () => this.sessionManager.addTime(t.val);
			});
		}
	}
}

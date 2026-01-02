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

	render() {
		const controls = this.container.createDiv({ cls: "fs-controls" });

		const resetBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		setIcon(resetBtn, "rotate-ccw");
		// Optional: Implement reset functionality if needed
		// resetBtn.onclick = () => ...

		this.playBtn = controls.createDiv({ cls: "fs-control-btn fs-primary" });
		this.playBtn.onclick = () => {
			const isRunning = !!this.sessionManager.getActiveSession();
			if (isRunning) {
				this.sessionManager.stopSession();
			} else {
				this.sessionManager.startSession("Deep Work", 25);
			}
			// The listener in the main view will trigger re-renders,
			// but we can also manually trigger update immediately if we wanted to
			// assuming the session manager notifies synchronously or we wait.
		};

		const skipBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		setIcon(skipBtn, "chevron-right");

		this.update();
	}

	update() {
		if (!this.playBtn) return;
		const isRunning = !!this.sessionManager.getActiveSession();
		this.playBtn.empty();
		setIcon(this.playBtn, isRunning ? "pause" : "play");
	}
}

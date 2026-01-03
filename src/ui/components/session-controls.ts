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

	update() {
		if (!this.playBtn) return;
		const session = this.sessionManager.getActiveSession();
		const isRunning = session && session.status === "running";

		this.playBtn.empty();
		setIcon(this.playBtn, isRunning ? "pause" : "play");
	}

	render() {
		const controls = this.container.createDiv({ cls: "fs-controls" });

		// Reset Button
		const resetBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		setIcon(resetBtn, "rotate-ccw");
		resetBtn.onclick = () => {
			this.sessionManager.resetSession();
		};

		// Play/Pause Button
		this.playBtn = controls.createDiv({ cls: "fs-control-btn fs-primary" });
		this.playBtn.onclick = () => {
			const session = this.sessionManager.getActiveSession();
			if (session) {
				if (session.status === "running") {
					this.sessionManager.pauseSession();
				} else {
					this.sessionManager.resumeSession();
				}
			} else {
				this.sessionManager.startSession("Deep Work");
			}
		};

		// Add Time Button (+5m) - replacing 'skip' for now as per plan
		const addTimeBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		setIcon(addTimeBtn, "plus");
		addTimeBtn.onclick = () => {
			this.sessionManager.addTime(5);
		};

		this.update();
	}
}

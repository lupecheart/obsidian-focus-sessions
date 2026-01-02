import { SessionManager } from "@/services/session-manager";

export class SessionFooter {
	private container: HTMLElement;
	private sessionManager: SessionManager;
	private pluginVersion: string;
	private statusTextRel: HTMLElement | null = null;

	constructor(container: HTMLElement, sessionManager: SessionManager, pluginVersion: string) {
		this.container = container;
		this.sessionManager = sessionManager;
		this.pluginVersion = pluginVersion;
	}

	render() {
		const footer = this.container.createDiv({ cls: "fs-footer" });
		const footerStatus = footer.createDiv({ cls: "fs-footer-status" });
		footerStatus.createSpan({ cls: "fs-status-dot-sm" });
		this.statusTextRel = footerStatus.createSpan();

		footer.createDiv({ cls: "fs-version", text: `v${this.pluginVersion}` });

		this.update();
	}

	update() {
		if (!this.statusTextRel) return;
		const isRunning = !!this.sessionManager.getActiveSession();
		this.statusTextRel.textContent = isRunning ? "RUNNING" : "ON STANDBY";
	}
}

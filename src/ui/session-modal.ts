import { App, Modal, ButtonComponent } from "obsidian";
import { SessionManager } from "../session-manager";

export class SessionModal extends Modal {
	private sessionManager: SessionManager;

	constructor(app: App, sessionManager: SessionManager) {
		super(app);
		this.sessionManager = sessionManager;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		const session = this.sessionManager.getActiveSession();

		if (session) {
			contentEl.createEl("h2", { text: session.name });

			// We could add a live timer here in the future
			const elapsed = Math.floor((Date.now() - session.startTime) / 60000);
			const total = session.durationMinutes;
			const remaining = Math.max(0, total - elapsed);

			contentEl.createEl("p", { text: `Duration: ${total} minutes` });
			contentEl.createEl("p", { text: `Time remaining: ~${remaining} minutes` });

			new ButtonComponent(contentEl)
				.setButtonText("Stop session")
				.setWarning()
				.onClick(() => {
					this.sessionManager.stopSession();
					this.close();
				});
		} else {
			contentEl.createEl("h2", { text: "No active session" });
			contentEl.createEl("p", { text: "Go to the side panel to start a new session." });
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

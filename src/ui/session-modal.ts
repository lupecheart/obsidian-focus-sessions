import { App, Modal, ButtonComponent } from "obsidian";
import { SessionManager } from "../services/session-manager";
import { getRemainingTime } from "../utils/time-utils";

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
			const total = session.durationMinutes;
			const remainingSec = getRemainingTime(session.startTime, session.durationMinutes);
			const remainingMin = Math.ceil(remainingSec / 60);

			contentEl.createEl("p", { text: `Duration: ${total} minutes` });
			contentEl.createEl("p", { text: `Time remaining: ~${remainingMin} minutes` });

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

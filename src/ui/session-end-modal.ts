import { App, Modal } from "obsidian";
import { SessionManager } from "@/services/session-manager";

export class SessionEndModal extends Modal {
	private sessionManager: SessionManager;

	constructor(app: App, sessionManager: SessionManager) {
		super(app);
		this.sessionManager = sessionManager;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClass("fs-session-end-modal");

		contentEl.createEl("h2", { text: "Focus session completed!" });

		const controls = contentEl.createDiv({ cls: "fs-modal-controls" });

		// Extension Options
		const extensionsDiv = controls.createDiv({ cls: "fs-extension-options" });
		extensionsDiv.createDiv({ cls: "fs-label", text: "Need more time?" });

		const btnRow = extensionsDiv.createDiv({ cls: "fs-controls-row" });

		const times = [
			{ label: "+30s", val: 0.5 },
			{ label: "+1m", val: 1 },
			{ label: "+5m", val: 5 },
		];

		times.forEach((t) => {
			const btn = btnRow.createEl("button", { cls: "fs-control-text-btn", text: t.label });
			btn.onclick = () => {
				this.sessionManager.addTime(t.val);
				this.close();
			};
		});

		// Separator or spacing
		controls.createDiv({ cls: "fs-spacer" });

		// Finish Action
		const finishBtn = controls.createEl("button", { cls: "mod-cta fs-finish-btn", text: "Finish session" });
		finishBtn.onclick = () => {
			this.sessionManager.stopSession(); // Explicit stop
			this.close();
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();

		// If the session is still "completed" (user dismissed modal without action),
		// we should treat it as finishing the session to stop the alarm.
		// However, if they clicked "Add Time", the specific handler would have already
		// changed the state to "running" (via addTime) before closing.
		const session = this.sessionManager.getActiveSession();
		if (session && session.status === "completed") {
			this.sessionManager.stopSession();
		}
	}
}

import { ItemView, WorkspaceLeaf, ButtonComponent, TextComponent } from "obsidian";
import { SessionManager } from "../session-manager";

export const FOCUS_SESSION_VIEW_TYPE = "focus-session-view";

export class FocusSessionView extends ItemView {
	private sessionManager: SessionManager;
	private container: HTMLElement;

	constructor(leaf: WorkspaceLeaf, sessionManager: SessionManager) {
		super(leaf);
		this.sessionManager = sessionManager;
	}

	getViewType() {
		return FOCUS_SESSION_VIEW_TYPE;
	}

	getDisplayText() {
		return "Focus sessions";
	}

	async onOpen() {
		this.container = this.contentEl;
		this.container.empty();
		this.render();

		// re-render when session changes
		this.sessionManager.onChange(() => {
			this.render();
		});
	}

	async onClose() {
		// Cleanup if needed
	}

	private render() {
		this.container.empty();
		const session = this.sessionManager.getActiveSession();

		const contentEl = this.container.createDiv({ cls: "focus-session-content" }) as HTMLElement;

		// Add some padding/styling inline for now or rely on styles.css
		// Content styling handled by CSS class .focus-session-content

		if (session) {
			contentEl.createEl("h2", { text: "Active session" });
			contentEl.createEl("p", { text: `Focused on: ${session.name}` });

			const elapsed = Math.floor((Date.now() - session.startTime) / 60000);
			const remaining = Math.max(0, session.durationMinutes - elapsed);

			contentEl.createEl("p", { text: `Time remaining: ~${remaining} min` });

			new ButtonComponent(contentEl)
				.setButtonText("Stop session")
				.setWarning()
				.onClick(() => {
					this.sessionManager.stopSession();
				});
		} else {
			contentEl.createEl("h2", { text: "Start a focus session" });

			const nameInput = new TextComponent(contentEl).setPlaceholder("Generic task").setValue("");

			// Simple spacer
			contentEl.createDiv({ cls: "focus-session-spacer" });

			const durationInput = new TextComponent(contentEl).setPlaceholder("Duration (minutes)").setValue("25");

			// Simple spacer
			contentEl.createDiv({ cls: "focus-session-spacer" });

			new ButtonComponent(contentEl)
				.setButtonText("Start session")
				.setCta()
				.onClick(() => {
					const name = nameInput.getValue() || "Generic task";
					const duration = parseInt(durationInput.getValue()) || 25;
					this.sessionManager.startSession(name, duration);
				});
		}
	}
}

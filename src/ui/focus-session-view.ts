import { ItemView, WorkspaceLeaf } from "obsidian";
import { SessionManager } from "@/services/session-manager";
import { SessionHeader } from "@/ui/components/session-header";
import { SessionTimer } from "@/ui/components/session-timer";
import { SessionControls } from "@/ui/components/session-controls";
import { SessionFooter } from "@/ui/components/session-footer";

export const FOCUS_SESSION_VIEW_TYPE = "focus-session-view";

export class FocusSessionView extends ItemView {
	private sessionManager: SessionManager;
	private container: HTMLElement;
	private pluginVersion: string;

	private headerComponent: SessionHeader;
	private timerComponent: SessionTimer;
	private controlsComponent: SessionControls;
	private footerComponent: SessionFooter;

	constructor(leaf: WorkspaceLeaf, sessionManager: SessionManager, pluginVersion: string) {
		super(leaf);
		this.sessionManager = sessionManager;
		this.pluginVersion = pluginVersion;
	}

	getViewType() {
		return FOCUS_SESSION_VIEW_TYPE;
	}

	getDisplayText() {
		return "Focus sessions";
	}

	async onOpen() {
		this.container = this.contentEl;
		this.container.addClass("focus-session-view");
		this.render();

		// re-render updates when session changes
		this.sessionManager.onChange(() => {
			this.refreshComponents();
		});

		// Refresh timer every second if running
		this.registerInterval(
			window.setInterval(() => {
				if (this.sessionManager.getActiveSession()) {
					this.timerComponent?.update();
				}
			}, 1000),
		);
	}

	async onClose() {
		// Cleanup if needed
	}

	private render() {
		this.container.empty();

		this.headerComponent = new SessionHeader(this.container);
		this.headerComponent.render();

		this.timerComponent = new SessionTimer(this.container, this.sessionManager);
		this.timerComponent.render();

		this.controlsComponent = new SessionControls(this.container, this.sessionManager, () =>
			this.refreshComponents(),
		);
		this.controlsComponent.render();

		this.footerComponent = new SessionFooter(this.container, this.sessionManager, this.pluginVersion);
		this.footerComponent.render();
	}

	private refreshComponents() {
		this.timerComponent?.update();
		this.controlsComponent?.update();
		this.footerComponent?.update();
	}
}

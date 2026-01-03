import { Plugin, WorkspaceLeaf } from "obsidian";
import { SessionManager } from "@/services/session-manager";
import { formatDuration, getRemainingTime } from "@/utils/time-utils";
import { FOCUS_SESSION_VIEW_TYPE, FocusSessionView } from "@/ui/focus-session-view";
import { SessionModal } from "@/ui/session-modal";

import { FocusSessionSettings, DEFAULT_SETTINGS } from "@/settings";
import { FocusSessionSettingTab } from "@/ui/settings-tab";

export default class FocusSessionsPlugin extends Plugin {
	sessionManager: SessionManager;
	statusBarItemEl: HTMLElement;
	settings: FocusSessionSettings;

	async onload() {
		await this.loadSettings();

		this.sessionManager = new SessionManager(this.settings);

		// Register the View
		this.registerView(
			FOCUS_SESSION_VIEW_TYPE,
			(leaf) => new FocusSessionView(leaf, this.sessionManager, this.manifest.version),
		);

		// Ribbon Icon
		this.addRibbonIcon("clock", "Open focus sessions", () => {
			void this.activateView();
		});

		// Status Bar
		this.statusBarItemEl = this.addStatusBarItem();
		this.updateStatusBar();

		// Update status bar on session change
		this.sessionManager.onChange(() => {
			this.updateStatusBar();
		});

		// Periodic update for timer in status bar
		this.registerInterval(setInterval(() => this.updateStatusBar(), 1000) as unknown as number);

		// Click on status bar to open modal
		this.statusBarItemEl.addClass("mod-clickable");
		this.statusBarItemEl.onClickEvent(() => {
			new SessionModal(this.app, this.sessionManager).open();
		});

		this.addSettingTab(new FocusSessionSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		// Clean up is handled by Obsidian primarily
	}

	updateStatusBar() {
		const session = this.sessionManager.getActiveSession();
		if (session) {
			const remainingSec = getRemainingTime(
				session.durationMinutes,
				session.elapsed,
				session.status,
				session.lastResumed,
			);
			const timeString = formatDuration(remainingSec);

			this.statusBarItemEl.setText(`${session.name} (${timeString})`);
		} else {
			this.statusBarItemEl.setText("");
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(FOCUS_SESSION_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0] as WorkspaceLeaf;
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({ type: FOCUS_SESSION_VIEW_TYPE, active: true });
			}
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			void workspace.revealLeaf(leaf);
		}
	}
}

import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import { SessionManager } from "../services/session-manager";
import { formatDuration, getRemainingTime } from "../utils/time-utils";

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
		this.container.addClass("focus-session-view");
		this.render();

		// re-render when session changes
		this.sessionManager.onChange(() => {
			this.render();
		});

		// Refresh timer every second if running
		this.registerInterval(
			window.setInterval(() => {
				if (this.sessionManager.getActiveSession()) {
					this.updateTimerDisplay();
				}
			}, 1000),
		);
	}

	async onClose() {
		// Cleanup if needed
	}

	private render() {
		this.container.empty();
		const session = this.sessionManager.getActiveSession();

		// --- Header ---
		const header = this.container.createDiv({ cls: "fs-header" });
		const titleGroup = header.createDiv({ cls: "fs-title-group" });
		const statusDot = titleGroup.createSpan({ cls: "fs-status-dot" });
		titleGroup.createSpan({ text: "FOCUS SESSION", cls: "fs-title" });

		// const settingsBtn = header.createDiv({ cls: "fs-icon-btn" });
		// setIcon(settingsBtn, "settings");

		// --- Navigation Tabs ---
		const nav = this.container.createDiv({ cls: "fs-nav" });
		const tabs = ["timer"];
		tabs.forEach((icon, index) => {
			const tab = nav.createDiv({ cls: `fs-nav-item ${index === 0 ? "active" : ""}` });
			setIcon(tab, icon);
		});

		// --- Main Content (Timer) ---
		const main = this.container.createDiv({ cls: "fs-main" });

		// Circular Timer Container
		const timerContainer = main.createDiv({ cls: "fs-timer-container" });

		// SVG Circle
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("class", "fs-timer-svg");
		svg.setAttribute("viewBox", "0 0 100 100");

		const circleBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circleBg.setAttribute("cx", "50");
		circleBg.setAttribute("cy", "50");
		circleBg.setAttribute("r", "40");
		circleBg.setAttribute("class", "fs-timer-circle-bg");

		const circleProgress = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circleProgress.setAttribute("cx", "50");
		circleProgress.setAttribute("cy", "50");
		circleProgress.setAttribute("r", "40");
		circleProgress.setAttribute("class", "fs-timer-circle-progress");

		svg.appendChild(circleBg);
		svg.appendChild(circleProgress);
		timerContainer.appendChild(svg);

		// Time Display
		const timeDisplay = timerContainer.createDiv({ cls: "fs-time-display" });

		let displayTime = "25:00";
		let labelText = "DEEP WORK";
		let isRunning = false;

		if (session) {
			const remainingSec = getRemainingTime(session.startTime, session.durationMinutes);
			displayTime = formatDuration(remainingSec);
			labelText = session.name.toUpperCase();
			isRunning = true;
		}

		timeDisplay.createDiv({ cls: "fs-timer-text", text: displayTime });
		timeDisplay.createDiv({ cls: "fs-timer-label", text: labelText });

		// --- Controls ---
		const controls = this.container.createDiv({ cls: "fs-controls" });

		const resetBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		setIcon(resetBtn, "rotate-ccw"); // or "refresh-ccw" usually implies reset

		const playBtn = controls.createDiv({ cls: "fs-control-btn fs-primary" });
		setIcon(playBtn, isRunning ? "pause" : "play");
		playBtn.onclick = () => {
			if (isRunning) {
				this.sessionManager.stopSession();
			} else {
				// For demo, just start a default session
				this.sessionManager.startSession("Deep Work", 25);
			}
		};

		const skipBtn = controls.createDiv({ cls: "fs-control-btn fs-secondary" });
		setIcon(skipBtn, "chevron-right");

		// --- Session Info Blocks ---
		// const infoBlocks = this.container.createDiv({ cls: "fs-info-blocks" });

		/*
		const sessionBlock = infoBlocks.createDiv({ cls: "fs-info-card" });
		const sessionIcon = sessionBlock.createDiv({ cls: "fs-card-icon" });
		setIcon(sessionIcon, "zap");
		sessionBlock.createDiv({ text: "Session #1", cls: "fs-card-text" });

		const breakBlock = infoBlocks.createDiv({ cls: "fs-info-card" });
		const breakIcon = breakBlock.createDiv({ cls: "fs-card-icon" });
		setIcon(breakIcon, "coffee");
		breakBlock.createDiv({ text: "Auto-Break", cls: "fs-card-text" });
		*/

		// --- Footer ---
		const footer = this.container.createDiv({ cls: "fs-footer" });
		const footerStatus = footer.createDiv({ cls: "fs-footer-status" });
		footerStatus.createSpan({ cls: "fs-status-dot-sm" });
		footerStatus.createSpan({ text: isRunning ? "RUNNING" : "ON STANDBY" });

		footer.createDiv({ cls: "fs-version", text: "v1.2.0" });
	}

	updateTimerDisplay() {
		const session = this.sessionManager.getActiveSession();
		const timeDisplay = this.container.querySelector(".fs-timer-text");
		if (timeDisplay && session) {
			const remainingSec = getRemainingTime(session.startTime, session.durationMinutes);
			timeDisplay.textContent = formatDuration(remainingSec);
		}
	}
}

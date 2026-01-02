import { SessionManager } from "@/services/session-manager";
import { formatTimerDisplay, getRemainingTime } from "@/utils/time-utils";

export class SessionTimer {
	private container: HTMLElement;
	private sessionManager: SessionManager;
	private timeDisplayEl: HTMLElement | null = null;
	private labelEl: HTMLElement | null = null;
	private circleProgress: SVGElement | null = null;
	private timerContainer: HTMLElement;

	constructor(container: HTMLElement, sessionManager: SessionManager) {
		this.container = container;
		this.sessionManager = sessionManager;
	}

	render() {
		const main = this.container.createDiv({ cls: "fs-main" });
		this.timerContainer = main.createDiv({ cls: "fs-timer-container" });
		const timerContainer = this.timerContainer;

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
		this.circleProgress = circleProgress;
		circleProgress.setAttribute("cx", "50");
		circleProgress.setAttribute("cy", "50");
		circleProgress.setAttribute("r", "40");
		circleProgress.setAttribute("class", "fs-timer-circle-progress");

		svg.appendChild(circleBg);
		svg.appendChild(circleProgress);
		timerContainer.appendChild(svg);

		// Time Display
		const timeDisplay = timerContainer.createDiv({ cls: "fs-time-display" });
		this.timeDisplayEl = timeDisplay.createDiv({ cls: "fs-timer-text" });
		this.labelEl = timeDisplay.createDiv({ cls: "fs-timer-label" });

		this.update();
	}

	update() {
		if (!this.timeDisplayEl || !this.labelEl) return;

		const session = this.sessionManager.getActiveSession();
		let displayTime = "25:00";
		let labelText = "DEEP WORK";

		if (session) {
			const remainingSec = getRemainingTime(session.startTime, session.durationMinutes);
			displayTime = formatTimerDisplay(remainingSec);
			labelText = session.name.toUpperCase();
			this.timerContainer.classList.add("fs-timer-running");

			if (this.circleProgress) {
				const radius = 40;
				const circumference = 2 * Math.PI * radius;
				const totalSeconds = session.durationMinutes * 60;
				const progress = Math.min(Math.max(remainingSec / totalSeconds, 0), 1);
				const offset = circumference - progress * circumference;

				this.circleProgress.setAttribute("stroke-dasharray", `${circumference} ${circumference}`);
				this.circleProgress.setAttribute("stroke-dashoffset", offset.toString());
			}
		} else {
			// Reset circle when no session
			this.timerContainer.classList.remove("fs-timer-running");
			if (this.circleProgress) {
				this.circleProgress.removeAttribute("stroke-dasharray");
				this.circleProgress.removeAttribute("stroke-dashoffset");
			}
		}

		this.timeDisplayEl.textContent = displayTime;
		this.labelEl.textContent = labelText;
	}
}

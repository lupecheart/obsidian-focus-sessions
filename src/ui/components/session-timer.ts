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

		// Clear only dynamic controls if needed, but for now we'll just handle display text
		// In a React/svelte app we'd bind state, here we're manipulating DOM.
		// Let's create the +/- controls if they don't exist and we are IDLE.

		if (session) {
			const remainingSec = getRemainingTime(
				session.durationMinutes,
				session.elapsed,
				session.status,
				session.lastResumed,
			);
			displayTime = formatTimerDisplay(remainingSec);
			labelText = session.name.toUpperCase();
			if (session.status === "paused") {
				labelText += " (PAUSED)";
				this.timerContainer.classList.add("fs-timer-paused");
				this.timerContainer.classList.remove("fs-timer-running");
			} else {
				this.timerContainer.classList.add("fs-timer-running");
				this.timerContainer.classList.remove("fs-timer-paused");
			}

			this.timeDisplayEl.removeClass("fs-timer-editable");
			// Hide +/- controls if they were appended
			const controls = this.timeDisplayEl.querySelectorAll(".fs-timer-adjust");
			controls.forEach((el) => el.remove());

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
			// IDLE STATE
			this.timerContainer.classList.remove("fs-timer-running");
			this.timerContainer.classList.remove("fs-timer-paused");

			const customDuration = this.sessionManager.getCustomDuration();
			displayTime = `${customDuration}:00`;
			labelText = "READY";

			if (this.circleProgress) {
				this.circleProgress.removeAttribute("stroke-dasharray");
				this.circleProgress.removeAttribute("stroke-dashoffset");
			}

			// Enhanced IDLE UI
			if (!this.timeDisplayEl.querySelector(".fs-timer-input")) {
				this.timeDisplayEl.addClass("fs-timer-editable");
				this.timeDisplayEl.empty(); // Clear text to rebuild structure

				// Duration Input
				const input = this.timeDisplayEl.createEl("input", {
					type: "number",
					cls: "fs-timer-input",
				});
				input.value = this.sessionManager.getCustomDuration().toString();
				input.placeholder = "25";
				input.onchange = () => {
					const val = parseInt(input.value);
					if (!isNaN(val) && val > 0) {
						this.sessionManager.setCustomDuration(val);
					} else {
						input.value = this.sessionManager.getCustomDuration().toString();
					}
				};

				// Quick Add Presets Container (Below the time, but for now inside the display area or we might need to adjust structure)
				// The implementation plan suggested "Implement Quick Add Buttons (+30s, +1m, +5m) that appear under the timer."
				// `timeDisplayEl` is centered in the circle. Let's put them below the input.

				const presetContainer = this.timeDisplayEl.createDiv({ cls: "fs-timer-presets" });

				const presets = [
					{ label: "+30s", val: 0.5 },
					{ label: "+1m", val: 1 },
					{ label: "+5m", val: 5 },
				];

				presets.forEach((p) => {
					const btn = presetContainer.createEl("button", { cls: "fs-preset-btn", text: p.label });
					btn.onclick = (e) => {
						e.stopPropagation();
						const current = this.sessionManager.getCustomDuration();
						this.sessionManager.setCustomDuration(current + p.val);
						input.value = this.sessionManager.getCustomDuration().toString();
					};
				});
			} else {
				// Update just the input value if it's not currently focused?
				// Actually, if user is typing, we shouldn't overwrite unless external change.
				// For now, let's just make sure it matches if not focused.
				const input = this.timeDisplayEl.querySelector("input");
				if (input && document.activeElement !== input) {
					input.value = this.sessionManager.getCustomDuration().toString();
				}
			}
			// Return early since we handled DOM manually for idle
			this.labelEl.textContent = labelText;
			return;
		}

		this.timeDisplayEl.textContent = displayTime;
		this.labelEl.textContent = labelText;
	}
}

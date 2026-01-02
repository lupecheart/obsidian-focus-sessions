import { setIcon } from "obsidian";

export class SessionHeader {
	private container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	render() {
		const header = this.container.createDiv({ cls: "fs-header" });
		const titleGroup = header.createDiv({ cls: "fs-title-group" });
		titleGroup.createSpan({ text: "FOCUS SESSION", cls: "fs-title" });

		// Navigation Tabs
		const nav = this.container.createDiv({ cls: "fs-nav" });
		const tabs = ["timer"];
		tabs.forEach((icon, index) => {
			const tab = nav.createDiv({ cls: `fs-nav-item ${index === 0 ? "active" : ""}` });
			setIcon(tab, icon);
		});
	}
}

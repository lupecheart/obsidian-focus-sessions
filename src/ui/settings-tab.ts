import { App, PluginSettingTab, Setting } from "obsidian";
import FocusSessionsPlugin from "../main";

export class FocusSessionSettingTab extends PluginSettingTab {
	plugin: FocusSessionsPlugin;

	constructor(app: App, plugin: FocusSessionsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Focus duration (minutes)")
			.setDesc("The length of a focus session.")
			.addSlider((slider) =>
				slider
					.setLimits(1, 120, 1)
					.setValue(this.plugin.settings.focusDuration)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.focusDuration = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Short break duration (minutes)")
			.setDesc("The length of a short break.")
			.addSlider((slider) =>
				slider
					.setLimits(1, 30, 1)
					.setValue(this.plugin.settings.shortBreakDuration)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.shortBreakDuration = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Long break duration (minutes)")
			.setDesc("The length of a long break.")
			.addSlider((slider) =>
				slider
					.setLimits(1, 60, 1)
					.setValue(this.plugin.settings.longBreakDuration)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.longBreakDuration = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}

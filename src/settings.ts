export interface FocusSessionSettings {
	focusDuration: number;
	shortBreakDuration: number;
	longBreakDuration: number;
	enableSound: boolean;
}

export const DEFAULT_SETTINGS: FocusSessionSettings = {
	focusDuration: 25,
	shortBreakDuration: 5,
	longBreakDuration: 15,
	enableSound: true,
};

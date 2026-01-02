export const formatDuration = (seconds: number): string => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatTimerDisplay = (seconds: number): string => {
	if (seconds >= 60) {
		return Math.ceil(seconds / 60).toString();
	}
	return formatDuration(seconds);
};

export const getRemainingTime = (startTime: number, durationMinutes: number): number => {
	const now = Date.now();
	const elapsedSec = Math.floor((now - startTime) / 1000);
	const totalSec = durationMinutes * 60;
	return Math.max(0, totalSec - elapsedSec);
};

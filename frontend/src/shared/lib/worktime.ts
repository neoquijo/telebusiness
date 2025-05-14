export const calculateWorkTime = (startTimestamp: number, endTimestamp: number): string => {
  const durationInMilliseconds = endTimestamp - startTimestamp;

  if (durationInMilliseconds < 0) {
    return "Invalid timestamps";
  }

  const totalSeconds = Math.floor(durationInMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
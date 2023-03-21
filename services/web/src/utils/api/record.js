const STORAGE_KEY = 'api-recording';

let recording = localStorage.getItem(STORAGE_KEY) === 'on';

export function toggleRecording(on) {
  recording = on;
  if (recording) {
    localStorage.setItem(STORAGE_KEY, 'on');
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isRecording() {
  return recording;
}

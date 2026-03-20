const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function analyzeDeepfake({
  audioBlob,
  fileName = 'deepfake-check.webm',
  duration = 0,
  transcript = '',
}) {
  if (!audioBlob) {
    throw new Error('Audio file is required for deepfake detection.');
  }

  const token = localStorage.getItem('vg_token');
  const formData = new FormData();
  formData.append('audio', audioBlob, fileName);
  formData.append('duration', String(duration));
  formData.append('transcript', transcript);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}/api/deepfake`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Deepfake analysis failed.');
  }

  return data;
}

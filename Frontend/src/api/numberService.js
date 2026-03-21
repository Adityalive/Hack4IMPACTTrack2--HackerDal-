const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function lookupCallerNumber(callerNumber) {
  const sanitized = String(callerNumber || '').replace(/\D/g, '').slice(0, 10);
  if (sanitized.length !== 10) {
    throw new Error('Caller number must be exactly 10 digits.');
  }

  const response = await fetch(`${BASE_URL}/api/numbers/${sanitized}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not check this number.');
  }

  return data;
}

export async function reportCallerNumber(callerNumber) {
  const sanitized = String(callerNumber || '').replace(/\D/g, '').slice(0, 10);
  if (sanitized.length !== 10) {
    throw new Error('Caller number must be exactly 10 digits.');
  }

  const response = await fetch(`${BASE_URL}/api/numbers/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callerNumber: sanitized }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not report this number.');
  }

  return data;
}

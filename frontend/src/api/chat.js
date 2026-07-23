import BASE_URL from './client';

export async function sendMessage(query) {
  const response = await fetch(`${BASE_URL}/api/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const data = await response.json();
  if (!data || typeof data.response !== 'string') {
    throw new Error('Invalid response from server');
  }

  return data;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL

export async function askAiAssistant(message) {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/ai/assistant`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: JSON.stringify({ message }),
    }
  )

  const contentType =
    response.headers.get('content-type') || ''

  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `QueueLess AI request failed (${response.status})`
    )
  }

  if (!data) {
    throw new Error(
      'QueueLess AI returned an empty response'
    )
  }

  return data
}
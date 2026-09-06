const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getQueues() {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(`${API_BASE_URL}/api/queues`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch queues')
  }

  return response.json()
}

export async function joinQueue(queueId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/queues/${queueId}/join`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login to join the queue')
    }

    if (response.status === 403) {
      throw new Error('You do not have permission to join this queue')
    }

    throw new Error('Unable to join queue')
  }

  return response.json()
}

export async function getTokenStatus(tokenId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/tokens/${tokenId}/status`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Unable to fetch token status')
  }

  return response.json()
}

export async function getQueueTokens(queueId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/queues/${queueId}/tokens`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch queue tokens')
  }

  return response.json()
}

export async function callNextToken(queueId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/queues/${queueId}/next`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Unable to call next token')
  }

  return response.json()
}

export async function serveToken(tokenId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/tokens/${tokenId}/serve`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Unable to serve token')
  }

  return response.json()
}

export async function cancelToken(tokenId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/tokens/${tokenId}/cancel`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Unable to cancel token')
  }

  return response.json()
}

export async function createQueue(serviceId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/queues`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        serviceId,
      }),
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to create a queue'
      )
    }

    throw new Error('Unable to create queue')
  }

  return response.json()
}

export async function getQueueById(queueId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/queues/${queueId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Unable to fetch queue')
  }

  return response.json()
}

export async function openQueue(queueId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/queues/${queueId}/open`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to open this queue'
      )
    }

    throw new Error('Unable to open queue')
  }

  return response.json()
}

export async function closeQueue(queueId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/queues/${queueId}/close`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to close this queue'
      )
    }

    throw new Error('Unable to close queue')
  }

  return response.json()
}

export async function leaveQueue() {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/customers/me/queue/leave`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 404) {
      throw new Error('You are not currently in a queue')
    }

    throw new Error('Unable to leave queue')
  }

  return response.json()
}


export async function getCustomerTokenHistory() {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/customers/me/tokens`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to view queue history'
      )
    }

    throw new Error('Unable to fetch queue history')
  }

  return response.json()
}


export async function deleteCustomerToken(tokenId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/customers/me/tokens/${tokenId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to delete this token'
      )
    }

    throw new Error('Unable to delete queue history')
  }
}

export async function deleteCustomerTokenHistory() {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/customers/me/tokens`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to delete queue history'
      )
    }

    throw new Error(
      'Unable to clear queue history'
    )
  }
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function getAuthHeaders() {
  const accessToken = sessionStorage.getItem('accessToken')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function getServiceCenters() {
  const response = await fetch(
    `${API_BASE_URL}/api/service-centers`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch service centers')
  }

  return response.json()
}

export async function createServiceCenter(data) {
  const response = await fetch(
    `${API_BASE_URL}/api/service-centers`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to create a service center'
      )
    }

    throw new Error('Failed to create service center')
  }

  return response.json()
}

export async function updateServiceCenter(id, data) {
  const response = await fetch(
    `${API_BASE_URL}/api/service-centers/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to update this service center'
      )
    }

    throw new Error('Failed to update service center')
  }

  return response.json()
}

export async function changeServiceCenterStatus(id, status) {
  const response = await fetch(
    `${API_BASE_URL}/api/service-centers/${id}/status`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status,
      }),
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login again')
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to change service center status'
      )
    }

    throw new Error(
      'Failed to change service center status'
    )
  }

  return response.json()
}
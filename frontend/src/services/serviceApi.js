const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function getAuthHeaders() {
  const accessToken = sessionStorage.getItem('accessToken')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function getServicesByCenter(centerId) {
  const response = await fetch(
    `${API_BASE_URL}/api/service-centers/${centerId}/services`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch services')
  }

  return response.json()
}

export async function createService(centerId, data) {
  const response = await fetch(
    `${API_BASE_URL}/api/service-centers/${centerId}/services`,
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
        'You do not have permission to create this service'
      )
    }

    throw new Error('Failed to create service')
  }

  return response.json()
}

export async function updateService(serviceId, data) {
  const response = await fetch(
    `${API_BASE_URL}/api/services/${serviceId}`,
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
        'You do not have permission to update this service'
      )
    }

    throw new Error('Failed to update service')
  }

  return response.json()
}

export async function changeServiceStatus(serviceId, status) {
  const response = await fetch(
    `${API_BASE_URL}/api/services/${serviceId}/status`,
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
        'You do not have permission to change service status'
      )
    }

    throw new Error('Failed to change service status')
  }

  return response.json()
}

export async function getServiceById(serviceId) {
  const accessToken = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/services/${serviceId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch service')
  }

  return response.json()
}
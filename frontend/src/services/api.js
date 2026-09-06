const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getServiceCenters() {
  const response = await fetch(
    `${API_BASE_URL}/api/service-centers`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch service centers')
  }

  return response.json()
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

export async function loginUser(email, password) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Invalid email or password')
  }

  return response.json()
}

export async function registerUser(
  firstName,
  lastName,
  email,
  password,
  phone
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        phone,
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Registration failed')
  }

  return response.json()
}
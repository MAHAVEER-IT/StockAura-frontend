const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

export function loginRequest(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getUsers(token) {
  return request('/auth/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getProducts(token) {
  return request('/products', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function createProduct(token, payload) {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('price', String(payload.price))
  formData.append('barcode', payload.barcode)
  formData.append('expiryDate', payload.expiryDate)
  formData.append('category', payload.category)
  if (payload.image instanceof File) {
    formData.append('image', payload.image)
  }

  return request('/products', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
}

export function updateProduct(token, id, payload) {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('price', String(payload.price))
  formData.append('barcode', payload.barcode)
  formData.append('expiryDate', payload.expiryDate)
  formData.append('category', payload.category)
  formData.append('imageUrl', payload.imageUrl)
  if (payload.image instanceof File) {
    formData.append('image', payload.image)
  }

  return request(`/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
}

export function deleteProduct(token, id) {
  return request(`/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getCategories(token) {
  return request('/categories', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function createCategory(token, payload) {
  return request('/categories', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export function updateCategory(token, id, payload) {
  return request(`/categories/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(token, id) {
  return request(`/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

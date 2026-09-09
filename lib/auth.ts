const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!

const TOKEN_KEY = 'token'
const USER_KEY = 'user'
let cachedUserRaw: string | null = null
let cachedUser: unknown = null

export async function login(identifier: string, password: string) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier,
      password,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error?.message || 'Login failed')
  }

  return data
}

export async function register(
  username: string,
  email: string,
  password: string
) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error?.message || 'Register failed')
  }

  return data
}

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event('auth_changed'))
}

export function removeToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw === cachedUserRaw) return cachedUser

    cachedUserRaw = raw
    cachedUser = raw ? JSON.parse(raw) : null
    return cachedUser
  } catch {
    return null
  }
}

export function getServerStoredUser() {
  return null
}

export function setStoredUser(user: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('auth_changed'))
}

export function logout() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth_changed'))
}

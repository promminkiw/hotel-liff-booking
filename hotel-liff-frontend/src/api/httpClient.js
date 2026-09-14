import { env } from '../config/env.js'

async function request(path, options = {}) {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = new Error(body.error ?? `Request failed with status ${res.status}`)
    error.status = res.status
    throw error
  }

  return res.json()
}

export const httpClient = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  patch: (path, body, options) => request(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),
}

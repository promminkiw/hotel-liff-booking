const required = ['VITE_API_BASE_URL', 'VITE_LIFF_ID']

for (const key of required) {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  liffId: import.meta.env.VITE_LIFF_ID,
}

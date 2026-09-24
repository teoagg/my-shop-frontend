export async function isEvaluationAdmin(request: Request): Promise<boolean> {
  const ids = (process.env.EVALUATION_ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean)
  const authorization = request.headers.get('authorization') || ''
  if (!ids.length || !/^Bearer \S+$/.test(authorization)) return false
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
      headers: { Authorization: authorization }, cache: 'no-store',
      signal: AbortSignal.timeout(8000), redirect: 'error',
    })
    if (!response.ok) return false
    const user = await response.json()
    return !user.blocked && ids.includes(String(user.id))
  } catch { return false }
}

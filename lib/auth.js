// Simple auth utilities
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'survey-admin-2024'
const JWT_SECRET = process.env.JWT_SECRET || 'survey-app-secret'

export function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD
}

export function generateToken(payload) {
  // Simple token generation - in production use proper JWT
  return Buffer.from(JSON.stringify({...payload, timestamp: Date.now()})).toString('base64')
}

export function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    return decoded.role === 'admin' ? decoded : null
  } catch {
    return null
  }
}

export function isAdminAuthenticated(token) {
  if (!token) return false
  return verifyToken(token) !== null
}
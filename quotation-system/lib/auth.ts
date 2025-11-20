import * as bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export type Session = {
  user: {
    id: string
    email: string
    name: string
  }
}

const SESSION_COOKIE_NAME = 'session'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: string): Promise<string> {
  // 簡單的 session token (Phase 1)
  // Phase 2 可以改用 JWT 或 NextAuth
  const token = Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })
  ).toString('base64')

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  return token
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())

    // 檢查是否過期
    if (payload.exp < Date.now()) {
      await destroySession()
      return null
    }

    // 從資料庫獲取用戶資訊
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      await destroySession()
      return null
    }

    return { user }
  } catch (error) {
    console.error('Session parse error:', error)
    await destroySession()
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

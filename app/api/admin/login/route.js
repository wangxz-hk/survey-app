import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, generateToken } from '../../../../lib/auth.js'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = generateToken({ role: 'admin', timestamp: Date.now() })

    return NextResponse.json({
      success: true,
      token,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
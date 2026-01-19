import { NextResponse } from 'next/server'
import { getSurveyAnalytics } from '../../../../../lib/db-operations.js'
import { isAdminAuthenticated } from '../../../../../lib/auth.js'

export async function GET(request, { params }) {
  try {
    const surveyId = params.id
    
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const analytics = await getSurveyAnalytics(surveyId)

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
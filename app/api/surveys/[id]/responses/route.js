import { NextResponse } from 'next/server'
import { getSurveyResponses } from '../../../../../lib/db-operations.js'
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

    const responses = await getSurveyResponses(surveyId)

    return NextResponse.json({
      success: true,
      data: responses
    })

  } catch (error) {
    console.error('Get responses error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
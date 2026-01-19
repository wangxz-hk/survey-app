const { NextResponse } = require('next/server');
const { createSurvey, getSurveys } = require('../../../lib/db-operations');
const { isAdminAuthenticated } = require('../../../lib/auth');

export async function GET(request) {
  try {
    // Get all surveys for admin
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const surveys = await getSurveys()

    return NextResponse.json({
      success: true,
      data: surveys
    })

  } catch (error) {
    console.error('Get surveys error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.questions || body.questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and questions are required' },
        { status: 400 }
      )
    }

    // Create survey
    const survey = await createSurvey(body)

    return NextResponse.json({
      success: true,
      data: survey,
      message: 'Survey created successfully'
    })

  } catch (error) {
    console.error('Create survey error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
const { NextResponse } = require('next/server');
const { getSurveyById, createResponse } = require('../../../../lib/db-operations');
const { sendSurveyNotification } = require('../../../../lib/email');

export async function GET(request, { params }) {
  try {
    const surveyId = params.id

    // Get survey with questions
    const survey = await getSurveyById(surveyId)

    if (!survey) {
      return NextResponse.json(
        { success: false, error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Check if survey is published
    if (survey.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Survey is not available' },
        { status: 403 }
      )
    }

    // Check response limit
    if (survey.responseCount >= survey.maxResponses) {
      return NextResponse.json(
        { success: false, error: 'Survey response limit reached' },
        { status: 403 }
      )
    }

    // Return survey data (without notification email)
    return NextResponse.json({
      success: true,
      data: {
        ...survey,
        notificationEmail: undefined // Don't expose notification email to public
      }
    })

  } catch (error) {
    console.error('Get survey error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const surveyId = params.id
    const body = await request.json()

    // Get survey details
    const survey = await getSurveyById(surveyId)

    if (!survey) {
      return NextResponse.json(
        { success: false, error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Check if survey is published
    if (survey.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Survey is not available' },
        { status: 403 }
      )
    }

    // Check response limit
    if (survey.responseCount >= survey.maxResponses) {
      return NextResponse.json(
        { success: false, error: 'Survey response limit reached' },
        { status: 403 }
      )
    }

    // Validate required answers
    const requiredQuestions = survey.questions?.filter(q => q.required) || []
    const answeredQuestionIds = body.answers?.map(a => a.questionId) || []
    
    for (const requiredQuestion of requiredQuestions) {
      if (!answeredQuestionIds.includes(requiredQuestion.id)) {
        return NextResponse.json(
          { success: false, error: `Question "${requiredQuestion.title}" is required` },
          { status: 400 }
        )
      }
    }

    // Create response with answers
    const responseData = {
      surveyId,
      completionTime: body.completionTime,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      answers: body.answers || []
    }

    const response = await createResponse(responseData)

    // Send notification email
    try {
      await sendSurveyNotification(survey, response, survey.responseCount + 1)
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the response if email fails
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Response submitted successfully'
    })

  } catch (error) {
    console.error('Submit response error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
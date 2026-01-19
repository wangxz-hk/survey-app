// Simple email service (mock for now)
export async function sendSurveyNotification(survey, response, responseCount) {
  if (!survey.emailNotifications || !survey.notificationEmail) {
    return
  }

  console.log(`📧 Email notification sent to ${survey.notificationEmail}:`)
  console.log(`Survey "${survey.title}" received a new response (#${responseCount})`)
  console.log(`Response ID: ${response.id}`)
  console.log(`Submitted at: ${response.submittedAt}`)
}
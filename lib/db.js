// Simple database mock for now - will be replaced with Prisma later
const surveys = []
const responses = []

export const db = {
  survey: {
    create: (data) => {
      const survey = { id: Date.now().toString(), ...data, createdAt: new Date() }
      surveys.push(survey)
      return survey
    },
    findMany: () => surveys,
    findUnique: (query) => surveys.find(s => s.id === query.where.id),
    update: (query, data) => {
      const index = surveys.findIndex(s => s.id === query.where.id)
      if (index !== -1) {
        surveys[index] = { ...surveys[index], ...data }
        return surveys[index]
      }
      return null
    }
  },
  response: {
    create: (data) => {
      const response = { id: Date.now().toString(), ...data, submittedAt: new Date() }
      responses.push(response)
      return response
    },
    count: (query) => responses.filter(r => r.surveyId === query.where.surveyId).length
  }
}
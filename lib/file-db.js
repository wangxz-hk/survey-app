// File-based database operations for immediate deployment
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const surveysPath = path.join(dataDir, 'surveys.json');
const responsesPath = path.join(dataDir, 'responses.json');

// Helper functions
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Survey operations
async function createSurvey(data) {
  const surveys = readData(surveysPath);
  const surveyId = generateId('survey');
  
  const newSurvey = {
    id: surveyId,
    title: data.title,
    description: data.description || '',
    welcomeMessage: data.welcomeMessage || 'Welcome to our survey!',
    thankYouMessage: data.thankYouMessage || 'Thank you for completing our survey!',
    maxResponses: data.maxResponses || 100,
    responseCount: 0,
    status: 'draft',
    emailNotifications: data.emailNotifications !== false,
    notificationEmail: data.notificationEmail || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: data.questions.map((q, index) => ({
      id: generateId('question'),
      surveyId: surveyId,
      type: q.type,
      title: q.title,
      description: q.description || '',
      options: q.options || null,
      required: q.required || false,
      orderIndex: q.orderIndex || index
    }))
  };
  
  surveys.push(newSurvey);
  writeData(surveysPath, surveys);
  
  return newSurvey;
}

async function getSurveys() {
  const surveys = readData(surveysPath);
  const responses = readData(responsesPath);
  
  return surveys.map(survey => ({
    ...survey,
    responseCount: responses.filter(r => r.surveyId === survey.id).length,
    _count: { responses: responses.filter(r => r.surveyId === survey.id).length }
  }));
}

async function getSurveyById(id) {
  const surveys = readData(surveysPath);
  const survey = surveys.find(s => s.id === id);
  
  if (!survey) return null;
  
  const responses = readData(responsesPath);
  const responseCount = responses.filter(r => r.surveyId === id).length;
  
  return {
    ...survey,
    responseCount,
    _count: { responses: responseCount }
  };
}

async function createResponse(data) {
  const responses = readData(responsesPath);
  const surveys = readData(surveysPath);
  
  const responseId = generateId('response');
  const newResponse = {
    id: responseId,
    surveyId: data.surveyId,
    submittedAt: new Date().toISOString(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    completionTime: data.completionTime,
    answers: data.answers.map((a, index) => ({
      id: generateId('answer'),
      responseId: responseId,
      questionId: a.questionId,
      answerText: a.answerText || null,
      answerChoice: a.answerChoice || null,
      answerRating: a.answerRating || null,
      answerMatrix: a.answerMatrix || null
    }))
  };
  
  responses.push(newResponse);
  writeData(responsesPath, responses);
  
  // Update survey response count
  const surveyIndex = surveys.findIndex(s => s.id === data.surveyId);
  if (surveyIndex !== -1) {
    surveys[surveyIndex].responseCount++;
    writeData(surveysPath, surveys);
  }
  
  return newResponse;
}

async function getSurveyAnalytics(surveyId) {
  const responses = readData(responsesPath);
  const surveys = readData(surveysPath);
  const survey = surveys.find(s => s.id === surveyId);
  
  if (!survey) return null;
  
  const surveyResponses = responses.filter(r => r.surveyId === surveyId);
  const totalResponses = surveyResponses.length;
  
  // Calculate average completion time
  const completionTimes = surveyResponses
    .map(r => r.completionTime)
    .filter(time => time > 0);
  const avgCompletionTime = completionTimes.length > 0 
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : 0;
  
  // Process question analytics
  const questionStats = survey.questions.map(question => {
    const questionAnswers = surveyResponses
      .flatMap(r => r.answers)
      .filter(a => a.questionId === question.id);
    
    const responseCount = questionAnswers.length;
    let answerDistribution = [];
    let averageRating = null;
    let textResponses = [];
    
    if (question.type === 'multiple_choice' && question.options) {
      const choiceCounts = new Array(question.options.length).fill(0);
      
      questionAnswers.forEach(answer => {
        if (answer.answerChoice !== null) {
          choiceCounts[answer.answerChoice]++;
        }
      });
      
      answerDistribution = question.options.map((option, index) => ({
        label: option.text,
        count: choiceCounts[index],
        percentage: responseCount > 0 ? Math.round((choiceCounts[index] / responseCount) * 100) : 0
      }));
    } else if (question.type === 'rating') {
      const ratings = questionAnswers.map(a => a.answerRating).filter(r => r !== null);
      if (ratings.length > 0) {
        averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      }
    } else if (question.type === 'text') {
      textResponses = questionAnswers.map(a => a.answerText).filter(t => t && t.trim() !== '');
    }
    
    return {
      questionId: question.id,
      questionTitle: question.title,
      questionType: question.type,
      responseCount,
      answerDistribution,
      averageRating,
      textResponses
    };
  });
  
  return {
    totalResponses,
    completionRate: 100,
    averageCompletionTime: avgCompletionTime,
    questionStats
  };
}

// Get survey responses
async function getSurveyResponses(surveyId) {
  const responses = readData(responsesPath);
  return responses.filter(response => response.surveyId === surveyId);
}

module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  createResponse,
  getSurveyAnalytics,
  getSurveyResponses
};
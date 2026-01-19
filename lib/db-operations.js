// File-based database operations for immediate deployment
const { createSurvey, getSurveys, getSurveyById, createResponse, getSurveyAnalytics, getSurveyResponses } = require('./file-db.js');

// Export all functions
module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  createResponse,
  getSurveyAnalytics,
  getSurveyResponses
};
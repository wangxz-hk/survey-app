// SQLite database operations
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
let db;

// Initialize database connection
function initDB() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

// Survey operations
async function createSurvey(data) {
  const db = initDB();
  
  return new Promise((resolve, reject) => {
    const surveyId = `survey_${Date.now()}`;
    
    db.run(`
      INSERT INTO surveys (
        id, title, description, welcomeMessage, thankYouMessage, 
        maxResponses, emailNotifications, notificationEmail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      surveyId,
      data.title,
      data.description || '',
      data.welcomeMessage || 'Welcome to our survey!',
      data.thankYouMessage || 'Thank you for completing our survey!',
      data.maxResponses || 100,
      data.emailNotifications !== false ? 1 : 0,
      data.notificationEmail || null
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      // Add questions
      const questions = data.questions || [];
      let completedQuestions = 0;
      
      if (questions.length === 0) {
        resolve({ id: surveyId, ...data });
        return;
      }
      
      questions.forEach((question, index) => {
        const questionId = `question_${Date.now()}_${index}`;
        
        db.run(`
          INSERT INTO questions (
            id, surveyId, type, title, description, options, required, orderIndex
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          questionId,
          surveyId,
          question.type,
          question.title,
          question.description || '',
          question.options ? JSON.stringify(question.options) : null,
          question.required ? 1 : 0,
          question.orderIndex || index
        ], function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          completedQuestions++;
          if (completedQuestions === questions.length) {
            resolve({
              id: surveyId,
              ...data,
              questions: questions.map((q, i) => ({
                ...q,
                id: `question_${Date.now()}_${i}`,
                surveyId
              }))
            });
          }
        });
      });
    });
  });
}

async function getSurveys() {
  const db = initDB();
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT s.*, COUNT(r.id) as responseCount
      FROM surveys s
      LEFT JOIN responses r ON s.id = r.surveyId
      GROUP BY s.id
      ORDER BY s.createdAt DESC
    `, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({
          ...row,
          responseCount: row.responseCount || 0,
          emailNotifications: Boolean(row.emailNotifications)
        })));
      }
    });
  });
}

async function getSurveyById(id) {
  const db = initDB();
  
  return new Promise((resolve, reject) => {
    // Get survey with questions
    db.get(`
      SELECT * FROM surveys WHERE id = ?
    `, [id], (err, survey) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!survey) {
        resolve(null);
        return;
      }
      
      // Get questions
      db.all(`
        SELECT * FROM questions WHERE surveyId = ? ORDER BY orderIndex ASC
      `, [id], (err, questions) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          ...survey,
          emailNotifications: Boolean(survey.emailNotifications),
          questions: questions.map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : null,
            required: Boolean(q.required)
          }))
        });
      });
    });
  });
}

async function createResponse(data) {
  const db = initDB();
  
  return new Promise((resolve, reject) => {
    const responseId = `response_${Date.now()}`;
    
    db.run(`
      INSERT INTO responses (id, surveyId, completionTime, ipAddress, userAgent)
      VALUES (?, ?, ?, ?, ?)
    `, [
      responseId,
      data.surveyId,
      data.completionTime,
      data.ipAddress,
      data.userAgent
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      // Add answers
      const answers = data.answers || [];
      let completedAnswers = 0;
      
      if (answers.length === 0) {
        resolve({ id: responseId, ...data });
        return;
      }
      
      answers.forEach((answer, index) => {
        const answerId = `answer_${Date.now()}_${index}`;
        
        db.run(`
          INSERT INTO answers (
            id, responseId, questionId, answerText, answerChoice, answerRating, answerMatrix
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          answerId,
          responseId,
          answer.questionId,
          answer.answerText || null,
          answer.answerChoice || null,
          answer.answerRating || null,
          answer.answerMatrix ? JSON.stringify(answer.answerMatrix) : null
        ], function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          completedAnswers++;
          if (completedAnswers === answers.length) {
            // Update survey response count
            db.run(`
              UPDATE surveys SET responseCount = responseCount + 1 WHERE id = ?
            `, [data.surveyId], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  id: responseId,
                  ...data,
                  answers: answers.map((a, i) => ({
                    ...a,
                    id: `answer_${Date.now()}_${i}`,
                    responseId
                  }))
                });
              }
            });
          }
        });
      });
    });
  });
}

async function getSurveyAnalytics(surveyId) {
  const db = initDB();
  
  return new Promise((resolve, reject) => {
    // Get total responses and average completion time
    db.get(`
      SELECT 
        COUNT(*) as totalResponses,
        AVG(completionTime) as avgCompletionTime
      FROM responses 
      WHERE surveyId = ?
    `, [surveyId], (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Get questions with analytics
      db.all(`
        SELECT 
          q.id, q.title, q.type, q.options,
          COUNT(a.id) as responseCount,
          AVG(a.answerRating) as avgRating
        FROM questions q
        LEFT JOIN answers a ON q.id = a.questionId
        WHERE q.surveyId = ?
        GROUP BY q.id
        ORDER BY q.orderIndex ASC
      `, [surveyId], (err, questions) => {
        if (err) {
          reject(err);
          return;
        }
        
        const questionStats = questions.map(q => {
          const options = q.options ? JSON.parse(q.options) : null;
          
          return {
            questionId: q.id,
            questionTitle: q.title,
            questionType: q.type,
            responseCount: q.responseCount || 0,
            answerDistribution: q.type === 'multiple_choice' && options ? 
              options.map((opt, index) => ({
                label: opt.text,
                count: 0, // Will be calculated per option
                percentage: 0
              })) : [],
            averageRating: q.avgRating || null,
            textResponses: q.type === 'text' ? [] : null
          };
        });
        
        resolve({
          totalResponses: stats.totalResponses || 0,
          completionRate: 100,
          averageCompletionTime: Math.round(stats.avgCompletionTime || 0),
          questionStats
        });
      });
    });
  });
}

module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  createResponse,
  getSurveyAnalytics
};
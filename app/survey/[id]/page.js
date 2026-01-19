'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

function QuestionComponent({ question, answer, onAnswerChange, index, total }) {
  const [selectedOption, setSelectedOption] = useState(answer?.answerChoice || null)
  const [textAnswer, setTextAnswer] = useState(answer?.answerText || '')
  const [rating, setRating] = useState(answer?.answerRating || 0)

  useEffect(() => {
    // Update parent when local state changes
    if (question.type === 'multiple_choice') {
      onAnswerChange(question.id, { answerChoice: selectedOption })
    } else if (question.type === 'text') {
      onAnswerChange(question.id, { answerText: textAnswer })
    } else if (question.type === 'rating') {
      onAnswerChange(question.id, { answerRating: rating })
    }
  }, [selectedOption, textAnswer, rating])

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option, optionIndex) => (
        <div key={option.id} className="survey-option">
          <input
            type="radio"
            id={`question-${question.id}-option-${option.id}`}
            name={`question-${question.id}`}
            value={optionIndex}
            checked={selectedOption === optionIndex}
            onChange={() => setSelectedOption(optionIndex)}
            className="mr-3"
          />
          <label 
            htmlFor={`question-${question.id}-option-${option.id}`}
            className="cursor-pointer flex-1"
          >
            {option.text}
          </label>
        </div>
      ))}
    </div>
  )

  const renderText = () => (
    <textarea
      value={textAnswer}
      onChange={(e) => setTextAnswer(e.target.value)}
      className="form-input w-full"
      rows={4}
      placeholder="Enter your answer..."
    />
  )

  const renderRating = () => (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={`w-12 h-12 rounded-full text-lg font-semibold transition-colors ${
              rating >= value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-blue-100'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>1 = Very Poor</span>
        <span>5 = Excellent</span>
      </div>
      {rating > 0 && (
        <div className="text-center text-sm text-gray-600">
          You selected: {rating} star{rating !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )

  const renderMatrix = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="text-left p-2"></th>
            {question.options?.map((option) => (
              <th key={option.id} className="text-center p-2 text-sm">{option.text}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.matrixRows?.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="p-2 font-medium">{row.text}</td>
              {question.options?.map((option, colIndex) => (
                <td key={option.id} className="p-2 text-center">
                  <input
                    type="radio"
                    name={`matrix-${question.id}-row-${rowIndex}`}
                    value={colIndex}
                    onChange={() => {
                      const matrixData = answer?.answerMatrix || {}
                      matrixData[row.text] = colIndex
                      onAnswerChange(question.id, { answerMatrix: matrixData })
                    }}
                    className="mx-auto"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="survey-question">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
          {question.description && (
            <p className="text-gray-600 mb-4">{question.description}</p>
          )}
        </div>
        <div className="ml-4">
          <span className="text-sm text-gray-500">{index + 1} / {total}</span>
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      </div>
      
      {question.type === 'multiple_choice' && renderMultipleChoice()}
      {question.type === 'text' && renderText()}
      {question.type === 'rating' && renderRating()}
      {question.type === 'matrix' && renderMatrix()}
    </div>
  )
}

export default function SurveyResponsePage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id
  
  const [survey, setSurvey] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`)
      const data = await response.json()
      
      if (data.success) {
        setSurvey(data.data)
        // Initialize answers
        const initialAnswers = {}
        data.data.questions?.forEach(question => {
          initialAnswers[question.id] = {
            questionId: question.id,
            answerText: '',
            answerChoice: null,
            answerRating: null,
            answerMatrix: {}
          }
        })
        setAnswers(initialAnswers)
      } else {
        alert(data.error || 'Survey not available')
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to fetch survey:', error)
      alert('Failed to load survey')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answerData) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...answerData
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required questions
    const unansweredRequired = survey.questions.filter(q => 
      q.required && (!answers[q.id] || 
        (q.type === 'text' && !answers[q.id].answerText?.trim()) ||
        (q.type === 'multiple_choice' && answers[q.id].answerChoice === null) ||
        (q.type === 'rating' && !answers[q.id].answerRating)
      )
    )
    
    if (unansweredRequired.length > 0) {
      alert(`Please answer the required question(s): ${unansweredRequired.map(q => q.title).join(', ')}`)
      return
    }
    
    setSubmitting(true)
    
    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000)
      
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: Object.values(answers),
          completionTime
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Thank you for completing the survey!')
        router.push(`/survey/${surveyId}/thank-you`)
      } else {
        alert(data.error || 'Failed to submit survey')
      }
    } catch (error) {
      console.error('Failed to submit survey:', error)
      alert('Failed to submit survey. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Survey not found or not available</p>
          <a href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="survey-container">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
            {survey.welcomeMessage && (
              <p className="text-lg text-gray-600">{survey.welcomeMessage}</p>
            )}
            <div className="mt-4 text-sm text-gray-500">
              <p>{survey.questions?.length || 0} questions • Estimated time: {survey.questions?.length * 2} minutes</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Object.values(answers).filter(a => {
                if (survey.questions.find(q => q.id === a.questionId)?.type === 'text') {
                  return a.answerText?.trim()
                }
                if (survey.questions.find(q => q.id === a.questionId)?.type === 'multiple_choice') {
                  return a.answerChoice !== null
                }
                if (survey.questions.find(q => q.id === a.questionId)?.type === 'rating') {
                  return a.answerRating
                }
                return false
              }).length} / {survey.questions?.length || 0}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(Object.values(answers).filter(a => {
                    const question = survey.questions?.find(q => q.id === a.questionId)
                    if (!question) return false
                    
                    if (question.type === 'text') return a.answerText?.trim()
                    if (question.type === 'multiple_choice') return a.answerChoice !== null
                    if (question.type === 'rating') return a.answerRating
                    return false
                  }).length / (survey.questions?.length || 1)) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Questions */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {survey.questions?.map((question, index) => (
              <QuestionComponent
                key={question.id}
                question={question}
                answer={answers[question.id]}
                onAnswerChange={handleAnswerChange}
                index={index}
                total={survey.questions.length}
              />
            ))}
            
            {/* Submit Button */}
            <div className="text-center mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Survey'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Your responses are anonymous and will be used for research purposes only.</p>
            <p className="mt-2">Survey responses are limited to {survey.maxResponses} total submissions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
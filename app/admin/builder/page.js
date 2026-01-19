'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Question component
function QuestionEditor({ question, onUpdate, onDelete, index }) {
  const [localQuestion, setLocalQuestion] = useState(question)

  const handleChange = (field, value) => {
    const updated = { ...localQuestion, [field]: value }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const addOption = () => {
    const newOptions = [...(localQuestion.options || []), { id: Date.now(), text: '', value: '' }]
    handleChange('options', newOptions)
  }

  const updateOption = (optionIndex, field, value) => {
    const newOptions = localQuestion.options.map((opt, i) => 
      i === optionIndex ? { ...opt, [field]: value } : opt
    )
    handleChange('options', newOptions)
  }

  const removeOption = (optionIndex) => {
    const newOptions = localQuestion.options.filter((_, i) => i !== optionIndex)
    handleChange('options', newOptions)
  }

  return (
    <div className="survey-question">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Question {index + 1}</h3>
        <button
          onClick={() => onDelete(question.id)}
          className="text-red-600 hover:text-red-800 px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Question Type</label>
          <select
            value={localQuestion.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="form-input"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="text">Text Answer</option>
            <option value="rating">Rating (1-5)</option>
            <option value="matrix">Matrix</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localQuestion.required}
              onChange={(e) => handleChange('required', e.target.checked)}
              className="mr-2"
            />
            Required
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Question Title</label>
        <input
          type="text"
          value={localQuestion.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="form-input"
          placeholder="Enter your question"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description (optional)</label>
        <textarea
          value={localQuestion.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="form-input"
          rows={2}
          placeholder="Add a description to help respondents understand the question"
        />
      </div>

      {(localQuestion.type === 'multiple_choice' || localQuestion.type === 'matrix') && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Options</label>
          {localQuestion.options?.map((option, optionIndex) => (
            <div key={option.id} className="flex items-center mb-2">
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(optionIndex, 'text', e.target.value)}
                className="form-input flex-1 mr-2"
                placeholder={`Option ${optionIndex + 1}`}
              />
              <button
                onClick={() => removeOption(optionIndex)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Option
          </button>
        </div>
      )}

      {localQuestion.type === 'rating' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rating Scale</label>
          <div className="text-sm text-gray-600">1 to 5 scale (1 = Poor, 5 = Excellent)</div>
        </div>
      )}
    </div>
  )
}

export default function SurveyBuilder() {
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    welcomeMessage: 'Welcome to our survey!',
    thankYouMessage: 'Thank you for completing our survey!',
    maxResponses: 100,
    emailNotifications: true,
    notificationEmail: '',
    questions: []
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin')
      return
    }
  }, [router])

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'multiple_choice',
      title: '',
      description: '',
      options: [
        { id: Date.now() + 1, text: 'Option 1', value: '1' },
        { id: Date.now() + 2, text: 'Option 2', value: '2' }
      ],
      required: false,
      orderIndex: survey.questions.length
    }
    
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (questionId, updatedQuestion) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? updatedQuestion : q
      )
    }))
  }

  const deleteQuestion = (questionId) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
  }

  const moveQuestion = (questionId, direction) => {
    const questions = [...survey.questions]
    const index = questions.findIndex(q => q.id === questionId)
    
    if (direction === 'up' && index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]]
    } else if (direction === 'down' && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]]
    }
    
    // Update orderIndex
    questions.forEach((q, i) => {
      q.orderIndex = i
    })
    
    setSurvey(prev => ({ ...prev, questions }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!survey.title.trim()) {
      setMessage('Please enter a survey title')
      return
    }
    
    if (survey.questions.length === 0) {
      setMessage('Please add at least one question')
      return
    }
    
    // Check for empty question titles
    const emptyQuestions = survey.questions.filter(q => !q.title.trim())
    if (emptyQuestions.length > 0) {
      setMessage('Please fill in all question titles')
      return
    }
    
    setLoading(true)
    
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(survey)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('Survey created successfully!')
        // Redirect to survey list after a short delay
        setTimeout(() => {
          router.push('/admin/surveys')
        }, 1500)
      } else {
        setMessage(data.error || 'Failed to create survey')
      }
    } catch (error) {
      setMessage('Failed to create survey. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Survey</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Survey Settings */}
            <div className="admin-panel">
              <h2 className="text-xl font-semibold mb-4">Survey Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Survey Title *</label>
                  <input
                    type="text"
                    value={survey.title}
                    onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                    placeholder="Enter survey title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max Responses</label>
                  <input
                    type="number"
                    value={survey.maxResponses}
                    onChange={(e) => setSurvey(prev => ({ ...prev, maxResponses: parseInt(e.target.value) || 100 }))}
                    className="form-input"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={survey.description}
                  onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  rows={3}
                  placeholder="Describe the purpose of your survey"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Welcome Message</label>
                  <textarea
                    value={survey.welcomeMessage}
                    onChange={(e) => setSurvey(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    className="form-input"
                    rows={2}
                    placeholder="Welcome message shown to respondents"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Thank You Message</label>
                  <textarea
                    value={survey.thankYouMessage}
                    onChange={(e) => setSurvey(prev => ({ ...prev, thankYouMessage: e.target.value }))}
                    className="form-input"
                    rows={2}
                    placeholder="Message shown after completion"
                  />
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <label className="flex items-center mr-6">
                  <input
                    type="checkbox"
                    checked={survey.emailNotifications}
                    onChange={(e) => setSurvey(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="mr-2"
                  />
                  Email notifications
                </label>
              </div>
              
              {survey.emailNotifications && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">Notification Email</label>
                  <input
                    type="email"
                    value={survey.notificationEmail}
                    onChange={(e) => setSurvey(prev => ({ ...prev, notificationEmail: e.target.value }))}
                    className="form-input"
                    placeholder="your-email@example.com"
                  />
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Questions</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Add Question
                </button>
              </div>

              {survey.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {survey.questions.map((question, index) => (
                    <div key={question.id} className="relative">
                      <QuestionEditor
                        question={question}
                        onUpdate={(updated) => updateQuestion(question.id, updated)}
                        onDelete={() => deleteQuestion(question.id)}
                        index={index}
                      />
                      
                      <div className="absolute top-2 right-2 flex space-x-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveQuestion(question.id, 'up')}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1"
                            title="Move up"
                          >
                              ↑
                          </button>
                        )}
                        {index < survey.questions.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveQuestion(question.id, 'down')}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1"
                            title="Move down"
                          >
                              ↓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="form-button"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Survey'
                )}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
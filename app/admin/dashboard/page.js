'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin')
      return
    }

    fetchSurveys(token)
  }, [router])

  const fetchSurveys = async (token) => {
    try {
      const response = await fetch('/api/surveys', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSurveys(data.data)
      } else {
        // Handle auth error
        localStorage.removeItem('adminToken')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin')
  }

  const handleCreateSurvey = () => {
    router.push('/admin/builder')
  }

  const handleViewAnalytics = (surveyId) => {
    router.push(`/admin/surveys/${surveyId}/analytics`)
  }

  const handleViewResponses = (surveyId) => {
    router.push(`/admin/surveys/${surveyId}/responses`)
  }

  const handlePublishSurvey = async (surveyId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/surveys/${surveyId}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh surveys
        fetchSurveys(token)
      }
    } catch (error) {
      console.error('Failed to publish survey:', error)
    }
  }

  const handleCloseSurvey = async (surveyId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/surveys/${surveyId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh surveys
        fetchSurveys(token)
      }
    } catch (error) {
      console.error('Failed to close survey:', error)
    }
  }

  const copySurveyLink = (surveyId) => {
    const surveyUrl = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(surveyUrl)
    alert('Survey link copied to clipboard!')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading surveys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Survey Dashboard</h1>
              <p className="text-gray-600">Manage your surveys and analyze responses</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateSurvey}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Survey
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Surveys</h3>
            <p className="text-3xl font-bold text-blue-600">{surveys.length}</p>
          </div>
          
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Published Surveys</h3>
            <p className="text-3xl font-bold text-green-600">{surveys.filter(s => s.status === 'published').length}</p>
          </div>
          
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
            <p className="text-3xl font-bold text-purple-600">{surveys.reduce((sum, s) => sum + (s._count?.responses || 0), 0)}</p>
          </div>
        </div>

        {/* Survey List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Surveys</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {surveys.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-lg mb-4">No surveys created yet</p>
                <button
                  onClick={handleCreateSurvey}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Survey
                </button>
              </div>
            ) : (
              surveys.map((survey) => (
                <div key={survey.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{survey.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                          {survey.status}
                        </span>
                      </div>
                        
                        {survey.description && (
                          <p className="text-gray-600 mb-3">{survey.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>📊 {survey._count?.responses || 0} / {survey.maxResponses} responses</span>
                          <span>📅 {new Date(survey.createdAt).toLocaleDateString()}</span>
                          <span>📧 {survey.emailNotifications ? 'Notifications ON' : 'Notifications OFF'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copySurveyLink(survey.id)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                        title="Copy survey link"
                      >
                        📋 Copy Link
                      </button>
                      
                      {survey.status === 'draft' && (
                        <button
                          onClick={() => handlePublishSurvey(survey.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Publish
                        </button>
                      )}
                      
                      {survey.status === 'published' && (
                        <button
                          onClick={() => handleCloseSurvey(survey.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Close
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleViewAnalytics(survey.id)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                      >
                          📊 Analytics
                        </button>
                      
                      <button
                        onClick={() => handleViewResponses(survey.id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                          📋 Responses
                        </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
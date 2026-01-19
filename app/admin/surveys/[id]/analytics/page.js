'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Simple chart component
function SimpleChart({ data, title, type = 'bar' }) {
  const maxValue = Math.max(...data.map(d => d.count))
  
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-32 text-sm truncate">{item.label}</div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-6 relative">
                <div 
                  className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs"
                  style={{ width: `${(item.count / maxValue) * 100}%` }}
                >
                  {item.count}
                </div>
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600">{item.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RatingChart({ average, total }) {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">Average Rating</h3>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">{average.toFixed(1)}</div>
        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl ${
                star <= Math.round(average) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
        <p className="text-gray-600">Based on {total} responses</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id
  
  const [survey, setSurvey] = useState(null)
  const [analytics, setAnalytics] = useState({
    totalResponses: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    questionStats: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [surveyId])

  const fetchAnalytics = async () => {
    try {
      // Fetch survey details
      const surveyResponse = await fetch(`/api/surveys/${surveyId}`)
      const surveyData = await surveyResponse.json()
      
      if (surveyData.success) {
        setSurvey(surveyData.data)
      }

      // Fetch analytics data (mock for now)
      setTimeout(() => {
        setAnalytics({
          totalResponses: 42,
          completionRate: 95,
          averageCompletionTime: 180,
          questionStats: [
            {
              questionTitle: 'How satisfied are you with our service?',
              questionType: 'rating',
              averageRating: 4.2,
              totalResponses: 42
            },
            {
              questionTitle: 'Which feature do you use most?',
              questionType: 'multiple_choice',
              answerDistribution: [
                { label: 'Dashboard', count: 18, percentage: 43 },
                { label: 'Reports', count: 12, percentage: 29 },
                { label: 'Settings', count: 8, percentage: 19 },
                { label: 'Help', count: 4, percentage: 9 }
              ]
            },
            {
              questionTitle: 'What improvements would you like to see?',
              questionType: 'text',
              textResponses: [
                'Better mobile experience',
                'More customization options',
                'Faster loading times',
                'Better documentation'
              ]
            }
          ]
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    // Mock PDF export
    alert('PDF export functionality will be implemented with jsPDF')
  }

  const handleExportCSV = () => {
    // Mock CSV export
    alert('CSV export functionality will be implemented')
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Survey not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Survey Analytics</h1>
              <p className="text-gray-600">{survey.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📊 Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                📄 Export PDF
              </button>
              <a
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalResponses}</p>
          </div>
          
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.completionRate}%</p>
          </div>
          
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg. Completion Time</h3>
            <p className="text-3xl font-bold text-purple-600">{formatTime(analytics.averageCompletionTime)}</p>
          </div>
          
          <div className="analytics-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Limit</h3>
            <p className="text-3xl font-bold text-gray-600">{survey.maxResponses}</p>
          </div>
        </div>

        {/* Question Analytics */}
        <div className="space-y-8">
          {analytics.questionStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{stat.questionTitle}</h3>
              <p className="text-sm text-gray-600 mb-4">Type: {stat.questionType} • {stat.totalResponses} responses</p>
              
              {stat.questionType === 'rating' && stat.averageRating && (
                <RatingChart average={stat.averageRating} total={stat.totalResponses} />
              )}
              
              {stat.questionType === 'multiple_choice' && stat.answerDistribution && (
                <SimpleChart 
                  data={stat.answerDistribution} 
                  title="Answer Distribution"
                />
              )}
              
              {stat.questionType === 'text' && stat.textResponses && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Sample Responses:</h4>
                  <div className="space-y-2">
                    {stat.textResponses.slice(0, 3).map((response, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">"{response}"</p>
                      </div>
                    ))}
                  </div>
                  {stat.textResponses.length > 3 && (
                    <p className="text-sm text-gray-600 mt-2">+{stat.textResponses.length - 3} more responses</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
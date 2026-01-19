// CSV Export Utility
export function exportToCSV(data, filename = 'survey-data.csv') {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Convert data to CSV format
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// PDF Export Preparation (requires jsPDF)
export function preparePDFData(survey, analytics) {
  return {
    title: survey.title,
    description: survey.description,
    totalResponses: analytics.totalResponses,
    completionRate: analytics.completionRate,
    averageCompletionTime: analytics.averageCompletionTime,
    questions: analytics.questionStats,
    generatedAt: new Date().toLocaleString()
  }
}

// Analytics data formatter
export function formatAnalyticsData(survey, responses, questionStats) {
  const csvData = []
  
  // Header row
  const headers = ['Response ID', 'Submitted At', 'Completion Time (s)']
  questionStats.forEach(stat => {
    headers.push(stat.questionTitle)
  })
  
  // Data rows
  responses.forEach(response => {
    const row = {
      'Response ID': response.id,
      'Submitted At': new Date(response.submittedAt).toLocaleString(),
      'Completion Time (s)': response.completionTime || 'N/A'
    }
    
    questionStats.forEach(stat => {
      const answer = response.answers?.find(a => a.questionId === stat.questionId)
      
      if (stat.questionType === 'multiple_choice') {
        const selectedOption = stat.answerDistribution?.find(d => d.count > 0)
        row[stat.questionTitle] = selectedOption?.label || 'No answer'
      } else if (stat.questionType === 'rating') {
        row[stat.questionTitle] = answer?.answerRating || 'No answer'
      } else if (stat.questionType === 'text') {
        row[stat.questionTitle] = answer?.answerText || 'No answer'
      } else {
        row[stat.questionTitle] = 'N/A'
      }
    })
    
    csvData.push(row)
  })
  
  return csvData
}

// Summary statistics formatter
export function formatSummaryData(survey, analytics) {
  return [
    { metric: 'Survey Title', value: survey.title },
    { metric: 'Total Responses', value: analytics.totalResponses },
    { metric: 'Completion Rate', value: `${analytics.completionRate}%` },
    { metric: 'Average Completion Time', value: `${analytics.averageCompletionTime} seconds` },
    { metric: 'Max Responses Allowed', value: survey.maxResponses },
    { metric: 'Survey Status', value: survey.status },
    { metric: 'Generated At', value: new Date().toLocaleString() }
  ]
}
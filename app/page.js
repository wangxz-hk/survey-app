export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">📊 Survey App</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create beautiful surveys, collect responses, and get instant analytics with charts and tables.
            Simple, powerful, and completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/admin" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🚀 Create Survey
            </a>
            <a 
              href="/demo" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              👀 View Demo
            </a>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Easy Creation</h3>
            <p className="text-gray-600">Build surveys with multiple question types in minutes</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Instant Analytics</h3>
            <p className="text-gray-600">Beautiful charts and tables with real-time updates</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-semibold mb-2">Email Notifications</h3>
            <p className="text-gray-600">Get notified when responses are submitted</p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">✨ Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ul className="space-y-3">
              <li className="flex items-center">✅ Multiple question types (multiple choice, text, rating, matrix)</li>
              <li className="flex items-center">✅ Response limits (up to 100 responses per survey)</li>
              <li className="flex items-center">✅ Real-time analytics with interactive charts</li>
              <li className="flex items-center">✅ Export to CSV and PDF formats</li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-center">✅ Mobile-responsive design</li>
              <li className="flex items-center">✅ Email notifications for new responses</li>
              <li className="flex items-center">✅ Private survey links (not discoverable)</li>
              <li className="flex items-center">✅ Simple admin interface</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
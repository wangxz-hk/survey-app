export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">🎉</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Your response has been recorded successfully. We appreciate your time and feedback!
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">✅ Your survey response has been submitted</p>
        </div>
        
        <div className="space-y-4"
        >
          <a
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
          
          <p className="text-sm text-gray-500"
          >
            You can close this window now.
          </p>
        </div>
      </div>
    </div>
  )
}
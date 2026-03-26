import AnalysisForm from "@/components/analysis/AnalysisForm";

export default function Home() {
  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-1">Business Trend Analysis Platform</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Analyze market trends and consumer sentiment through keywords to support your business decisions
        </p>
        
        <div className="tabs mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button className="py-2 px-4 border-b-2 border-blue-600 text-blue-600 font-medium">Data Input</button>
            <button className="py-2 px-4 text-gray-500 dark:text-gray-400 cursor-not-allowed" disabled>Analysis Results</button>
          </div>
        </div>
        
        <AnalysisForm />
      </div>
    </main>
  );
}

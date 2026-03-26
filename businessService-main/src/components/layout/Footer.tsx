export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
            © 2025 Business Consulting. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
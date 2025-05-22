
export default function Footer() {
  return (
    <footer className="text-center h-auto w-full pt-8 pb-6 border-t mt-5 border-unoform-gray-100">
      <div className="max-w-6xl mx-auto px-3">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-unoform-gray-medium text-sm">
            © 2024 Unoform. Danish design excellence since 1963.
          </div>
          <div className="flex space-x-6">
            <a
              href="https://unoform.dk"
              target="_blank"
              rel="noreferrer"
              className="text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 text-sm"
            >
              Unoform.dk
            </a>
            <a
              href="https://instagram.com/unoform"
              target="_blank"
              rel="noreferrer"
              className="text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 text-sm"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com/unoform"
              target="_blank"
              rel="noreferrer"
              className="text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 text-sm"
            >
              Facebook
            </a>
          </div>
        </div>
        <div className="mt-6 text-xs text-unoform-gray-medium">
          Powered by AI technology from Replicate
        </div>
      </div>
    </footer>
  );
}
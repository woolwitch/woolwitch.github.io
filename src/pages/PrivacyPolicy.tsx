import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate?: (page: 'shop' | 'cart' | 'checkout' | 'admin' | 'about' | 'contact' | 'privacy-policy' | 'terms-of-service') => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps = {}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {onNavigate && (
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center space-x-2 text-rose-600 hover:text-rose-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>
      )}
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> December 9, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We currently collect the following information:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li><strong>Email address:</strong> For user authentication and account creation</li>
            <li><strong>Google account information:</strong> When you sign in with Google (name, email, profile picture)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use your email address to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Create and maintain your user account</li>
            <li>Authenticate your login sessions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Data Storage</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your data is stored securely using Supabase, which provides enterprise-grade security and data protection.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Information Sharing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell, trade, or share your personal information with third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Order Information</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Complete this section based on your order processing:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>What shipping information do you collect?</li>
              <li>How do you process payments?</li>
              <li>Do you store payment information?</li>
              <li>What order details are saved?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Review and specify:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>What cookies does your site use?</li>
              <li>Do you use analytics (Google Analytics, etc.)?</li>
              <li>Any third-party tracking tools?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Marketing Communications</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Specify your email marketing practices:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>Do you send promotional emails?</li>
              <li>How can users opt-in/opt-out?</li>
              <li>What marketing tools do you use?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You can contact us to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Request deletion of your account and data</li>
            <li>Request a copy of your stored information</li>
            <li>Correct any inaccurate information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For privacy-related questions, please contact us:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              <strong>Woolwitch</strong><br />
              {onNavigate ? (
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-rose-600 hover:text-rose-700 font-medium underline"
                >
                  Contact Form
                </button>
              ) : (
                <span className="text-rose-600 font-medium">Contact Form</span>
              )}
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
              <p className="text-yellow-800 font-medium">TODO: Add your preferred contact method</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
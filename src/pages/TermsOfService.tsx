import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate?: (page: 'shop' | 'cart' | 'checkout' | 'admin' | 'about' | 'contact' | 'privacy-policy' | 'terms-of-service') => void;
}

export function TermsOfService({ onNavigate }: TermsOfServiceProps = {}) {
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
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Terms of Service</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last updated:</strong> December 9, 2024
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">What We Offer</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Woolwitch is a website that showcases handmade crochet items. You can create an account using your email address or Google account to browse our products.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Your Account</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You can create an account to access our website. You are responsible for keeping your login information secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Orders and Purchasing</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Complete based on your actual business process:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>How do customers place orders?</li>
              <li>What payment methods do you accept?</li>
              <li>What are your prices and how are they determined?</li>
              <li>Do you charge taxes?</li>
              <li>How do you handle order confirmation?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Specify your product details:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>What types of crochet items do you make?</li>
              <li>Do you offer custom orders?</li>
              <li>How long does it take to make items?</li>
              <li>What materials do you use?</li>
              <li>How do you handle product variations in handmade items?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Shipping and Delivery</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Define your shipping policies:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>Where do you ship?</li>
              <li>How much does shipping cost?</li>
              <li>How long does delivery take?</li>
              <li>Who is responsible if packages get lost?</li>
              <li>What shipping carriers do you use?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Returns and Refunds</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Establish your return policy:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>Do you accept returns?</li>
              <li>What is your return time limit?</li>
              <li>What condition must items be in?</li>
              <li>How do you handle custom/personalized items?</li>
              <li>Who pays for return shipping?</li>
              <li>How long do refunds take?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Prohibited Use</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Please don't use our website to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Do anything illegal</li>
            <li>Harm our website or other users</li>
            <li>Share false information</li>
            <li>Attempt to access accounts that don't belong to you</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Intellectual Property</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Specify your intellectual property:</p>
            <ul className="list-disc pl-6 mt-2 text-yellow-700">
              <li>Do you own the crochet patterns you use?</li>
              <li>Can customers share photos of purchased items?</li>
              <li>What about your website content and images?</li>
              <li>Are your designs original or based on existing patterns?</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-medium">TODO: Consult with legal counsel for appropriate liability limitations in your jurisdiction</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Changes to These Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update these terms occasionally. We'll post any changes on this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have questions about these terms, please contact us:
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
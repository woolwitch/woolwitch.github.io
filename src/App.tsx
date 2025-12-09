import { useState } from 'react';
import { Header } from './components/Header';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

function App() {
  const [currentPage, setCurrentPage] = useState<'shop' | 'cart' | 'checkout' | 'admin' | 'about' | 'contact' | 'privacy-policy' | 'terms-of-service'>('shop');

  const renderPage = () => {
    const handleCartNavigation = (page: 'shop' | 'cart' | 'checkout') => {
      setCurrentPage(page);
    };

    const handleCheckoutNavigation = (page: 'shop' | 'cart' | 'checkout') => {
      setCurrentPage(page);
    };

    switch (currentPage) {
      case 'shop':
        return <Shop />;
      case 'cart':
        return <Cart onNavigate={handleCartNavigation} />;
      case 'checkout':
        return <Checkout onNavigate={handleCheckoutNavigation} />;
      case 'admin':
        return <Admin />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'privacy-policy':
        return <PrivacyPolicy onNavigate={setCurrentPage} />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={setCurrentPage} />;
      default:
        return <Shop />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
      {currentPage === 'shop' && (
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <p className="text-lg mb-2">Made with love and care</p>
              <p className="text-gray-400">© 2024 Woolwitch. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button
                onClick={() => setCurrentPage('privacy-policy')}
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setCurrentPage('terms-of-service')}
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                About Us
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className="text-gray-400 hover:text-white transition-colors underline"
              >
                Contact
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;

import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="text-center text-white max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-bold mb-2 text-white">
          MealMind
        </h1>
        <p className="text-xl md:text-2xl mb-6 opacity-90 italic text-white">
          AI that thinks for your gut
        </p>
        <p className="text-lg md:text-xl mb-12 opacity-95 leading-relaxed text-white">
          Smart meal planning powered by AI. Let MealMind understand your preferences, 
          dietary needs, and lifestyle to create personalized meal plans that nourish your body and mind.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/onboarding?step=1"
            className="inline-block px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl border-2 border-white transition-all duration-300 hover:bg-transparent hover:text-white hover:-translate-y-1 hover:shadow-2xl"
          >
            Get Started - Create Account
          </Link>
          <Link
            to="/login"
            className="inline-block px-8 py-4 text-lg font-semibold text-white bg-transparent rounded-xl border-2 border-white transition-all duration-300 hover:bg-white hover:text-blue-600"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
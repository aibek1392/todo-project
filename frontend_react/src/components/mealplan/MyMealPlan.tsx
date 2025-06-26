import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MealPlanResponse, ShoppingItem } from '../../types/mealPlan';
import { mealPlanAPI } from '../../services/api';
import DayMealCard from './DayMealCard';
import ShoppingListSection from './ShoppingListSection';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './MealPlanDisplay.css';

const MyMealPlan: React.FC = () => {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const fetchMealPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await mealPlanAPI.getLatestMealPlanFormatted();
      setMealPlan(response);
    } catch (err: any) {
      console.error('Error fetching meal plan:', err);
      if (err.response?.status === 404) {
        setError('No saved meal plan found. Generate a new meal plan to get started.');
      } else {
        setError('Failed to load your meal plan. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGenerateNewMealPlan = () => {
    navigate('/meals');
  };

  // Loading state with the same spinner as MealPlanDisplay
  if (isLoading) {
    return (
      <div className="meal-plan-container">
        <LoadingSpinner message="Loading your saved meal plan..." />
      </div>
    );
  }

  // Error state with the same error component as MealPlanDisplay
  if (error) {
    return (
      <div className="meal-plan-container">
        <ErrorMessage 
          message={error}
          onRetry={fetchMealPlan}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  // No meal plan state
  if (!mealPlan) {
    return (
      <div className="meal-plan-container">
        <ErrorMessage 
          message="No meal plan data available."
          onRetry={handleGenerateNewMealPlan}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  // Group shopping list items by category (same as MealPlanDisplay)
  const groupedShoppingList = groupShoppingListByCategory(mealPlan.shopping_list);

  // Main render - using the exact same structure and components as MealPlanDisplay
  return (
    <div className="meal-plan-container">
      {/* Header - customized for saved meal plan */}
      <div className="meal-plan-header">
        <div className="header-content">
          <h1 className="meal-plan-title">My Saved Meal Plan</h1>
          <p className="meal-plan-subtitle">
            Your personalized 7-day meal plan with shopping list
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleBackToDashboard}
            aria-label="Go back to dashboard"
          >
            ← Back to Dashboard
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleGenerateNewMealPlan}
            aria-label="Generate new meal plan"
          >
            🔄 Generate New Plan
          </button>
        </div>
      </div>

      {/* Summary Stats - same as MealPlanDisplay */}
      <div className="meal-plan-summary">
        <div className="summary-card">
          <h3>📅 Planning Period</h3>
          <p>7 days • {mealPlan.meal_plan.length} daily menus</p>
        </div>
        <div className="summary-card">
          <h3>🛒 Shopping Items</h3>
          <p>{mealPlan.shopping_list.length} ingredients</p>
        </div>
        <div className="summary-card">
          <h3>💰 Estimated Cost</h3>
          <p>{mealPlan.total_estimated_cost || '$50-80'}</p>
        </div>
      </div>

      {/* Main Content - exact same structure as MealPlanDisplay */}
      <div className="meal-plan-content">
        {/* Meal Plan Section - using the same DayMealCard component */}
        <section className="meal-plan-section" aria-labelledby="meal-plan-heading">
          <h2 id="meal-plan-heading" className="section-title">
            📋 Meal Plan
          </h2>
          <div className="meal-plan-days">
            {mealPlan.meal_plan.map((dayMeals, index) => (
              <DayMealCard 
                key={dayMeals.day}
                dayMeals={dayMeals}
                dayNumber={index + 1}
              />
            ))}
          </div>
        </section>

        {/* Shopping List Section - using the same ShoppingListSection component */}
        <section className="shopping-list-section" aria-labelledby="shopping-list-heading">
          <h2 id="shopping-list-heading" className="section-title">
            🛒 Shopping List
          </h2>
          <ShoppingListSection 
            groupedItems={groupedShoppingList}
            totalCost={mealPlan.total_estimated_cost}
          />
        </section>
      </div>

      {/* Additional Information - same as MealPlanDisplay */}
      {(mealPlan.nutritional_summary || mealPlan.preparation_tips?.length > 0) && (
        <div className="meal-plan-extras">
          {/* Nutritional Summary */}
          {mealPlan.nutritional_summary && (
            <div className="nutritional-summary">
              <h3 className="extras-title">🥗 Nutritional Highlights</h3>
              <div className="nutrition-tags">
                {Object.entries(mealPlan.nutritional_summary).map(([key, value]) => (
                  <div key={key} className="nutrition-tag">
                    <span className="nutrition-key">{key}:</span>
                    <span className="nutrition-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparation Tips */}
          {mealPlan.preparation_tips?.length > 0 && (
            <div className="preparation-tips">
              <h3 className="extras-title">💡 Meal Prep Tips</h3>
              <ul className="tips-list">
                {mealPlan.preparation_tips.map((tip, index) => (
                  <li key={index} className="tip-item">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to group shopping items by category (same as MealPlanDisplay)
const groupShoppingListByCategory = (items: ShoppingItem[]): Record<string, ShoppingItem[]> => {
  return items.reduce((grouped, item) => {
    const category = item.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
    return grouped;
  }, {} as Record<string, ShoppingItem[]>);
};

export default MyMealPlan; 
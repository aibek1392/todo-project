import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MealPlanResponse, ShoppingItem } from '../../types/mealPlan';
import { mealPlanAPI } from '../../services/api';
import { RootState } from '../../store';
import { useToast } from '../../hooks/useToast';
import DayMealCard from './DayMealCard';
import ShoppingListSection from './ShoppingListSection';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './MealPlanDisplay.css';

interface MealPlanDisplayProps {
  onBack?: () => void;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const generateMealPlan = async (forceRefresh: boolean = false) => {
    try {
      // Check authentication first
      if (!token || !user) {
        setError('Please log in to view your meal plan.');
        setIsLoading(false);
        return;
      }

      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log('Generating meal plan with token:', token ? 'present' : 'missing');
      const response = await mealPlanAPI.generateMealPlan(forceRefresh);
      console.log('Meal plan response:', response);
      setMealPlan(response);
      
      // Reset save state when new meal plan is generated
      setIsSaved(false);
    } catch (err: any) {
      console.error('Meal plan generation error:', err);
      
      // Handle authentication errors specifically
      if (err.response?.status === 401 || err.response?.data?.detail === 'Not authenticated') {
        setError('Your session has expired. Please log in again to view your meal plan.');
      } else {
        setError(
          err.response?.data?.detail || 
          'Failed to generate meal plan. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    generateMealPlan(true);
  };

  const handleClearCache = async () => {
    try {
      await mealPlanAPI.clearCache();
      // Regenerate meal plan after clearing cache
      generateMealPlan(true);
    } catch (err: any) {
      setError('Failed to clear cache. Please try again.');
    }
  };

  const handleSaveMealPlan = async () => {
    if (!mealPlan || isSaved || isSaving) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Convert the meal plan to the format expected by the backend
      const storageData = {
        start_date: new Date().toISOString().split('T')[0], // Today's date
        mealPlan: mealPlan.meal_plan.map((dayMeals, index) => ({
          day: dayMeals.day,
          meals: [
            ...(dayMeals.breakfast ? [{
              meal_type: 'breakfast',
              title: dayMeals.breakfast.title,
              description: dayMeals.breakfast.description,
              calories: dayMeals.breakfast.calories || 0,
              cook_time: dayMeals.breakfast.cooking_time,
              tags: dayMeals.breakfast.dietary_tags,
              ingredients: dayMeals.breakfast.ingredients
            }] : []),
            ...(dayMeals.lunch ? [{
              meal_type: 'lunch',
              title: dayMeals.lunch.title,
              description: dayMeals.lunch.description,
              calories: dayMeals.lunch.calories || 0,
              cook_time: dayMeals.lunch.cooking_time,
              tags: dayMeals.lunch.dietary_tags,
              ingredients: dayMeals.lunch.ingredients
            }] : []),
            ...(dayMeals.dinner ? [{
              meal_type: 'dinner',
              title: dayMeals.dinner.title,
              description: dayMeals.dinner.description,
              calories: dayMeals.dinner.calories || 0,
              cook_time: dayMeals.dinner.cooking_time,
              tags: dayMeals.dinner.dietary_tags,
              ingredients: dayMeals.dinner.ingredients
            }] : []),
            ...(dayMeals.snacks ? dayMeals.snacks.map(snack => ({
              meal_type: 'snack',
              title: snack.title,
              description: snack.description,
              calories: snack.calories || 0,
              cook_time: snack.cooking_time,
              tags: snack.dietary_tags,
              ingredients: snack.ingredients
            })) : [])
          ]
        })),
        // Convert shopping list to the format expected by backend
        shoppingList: Object.entries(groupedShoppingList).reduce((acc, [category, items]) => {
          acc[category] = items.map(item => ({
            item_name: item.item,
            quantity: item.quantity,
            price_range: item.estimated_cost || ""
          }));
          return acc;
        }, {} as Record<string, any[]>)
      };
      
      console.log('Saving meal plan to database:', storageData);
      const result = await mealPlanAPI.storeMealPlan(storageData);
      console.log('Meal plan saved successfully:', result);
      
      // Mark as saved
      setIsSaved(true);
      
      // Show success toast
      showToast('Meal plan saved successfully! 🎉', 'success');
      
      // Optional: redirect to saved meal plan after a delay
      setTimeout(() => {
        navigate('/my-meal-plan');
      }, 2000);
      
    } catch (err: any) {
      console.error('Failed to save meal plan:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
      
      // Check if it's a duplicate error
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        setIsSaved(true);
        showToast('This meal plan is already saved!', 'info');
      } else {
        showToast(`Failed to save meal plan: ${errorMessage}`, 'error');
        setError(`Failed to save meal plan: ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    console.log('MealPlanDisplay mounted. Auth state:', { user: !!user, token: !!token });
    generateMealPlan();
  }, []);

  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="meal-plan-container">
        <LoadingSpinner message="Generating your personalized meal plan..." />
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('log in') || error.includes('session has expired');
    return (
      <div className="meal-plan-container">
        <ErrorMessage 
          message={error}
          onRetry={isAuthError ? handleLoginRedirect : () => generateMealPlan()}
          onBack={onBack}
        />
        {isAuthError && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              onClick={handleLoginRedirect}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="meal-plan-container">
        <ErrorMessage 
          message="No meal plan data available."
          onRetry={() => generateMealPlan()}
          onBack={onBack}
        />
      </div>
    );
  }

  const groupedShoppingList = groupShoppingListByCategory(mealPlan.shopping_list);

  return (
    <div className="meal-plan-container">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          background: '#f3f4f6', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.8rem'
        }}>
          <strong>Debug Info:</strong><br />
          User: {user ? `${user.full_name || user.email}` : 'Not logged in'}<br />
          Token: {token ? 'Present' : 'Missing'}<br />
          Meal Plan: {mealPlan ? 'Loaded' : 'Not loaded'}
        </div>
      )}

      {/* Header */}
      <div className="meal-plan-header">
        <div className="header-content">
          <h1 className="meal-plan-title">Your 7-Day Meal Plan</h1>
          <p className="meal-plan-subtitle">
            Personalized nutrition plan with shopping list
          </p>
        </div>
        
        <div className="header-actions">
          {onBack && (
            <button 
              className="btn btn-secondary"
              onClick={onBack}
              aria-label="Go back"
            >
              ← Back
            </button>
          )}
          <button 
            className={`btn btn-outline ${isRefreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Generate new meal plan"
          >
            {isRefreshing ? 'Generating...' : '🔄 Generate New'}
          </button>
          <button 
            className="btn btn-outline"
            onClick={handleClearCache}
            aria-label="Clear cache and generate fresh plan"
          >
            🗑️ Clear Cache
          </button>
          <button 
            className={`btn ${isSaved ? 'btn-success' : 'btn-primary'} ${isSaving ? 'loading' : ''}`}
            onClick={handleSaveMealPlan}
            disabled={isSaved || isSaving}
            aria-label={isSaved ? "Meal plan saved" : "Save meal plan to database"}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : isSaved ? (
              '✅ Plan Saved'
            ) : (
              '📥 Save My Meal Plan'
            )}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
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

      {/* Main Content */}
      <div className="meal-plan-content">
        {/* Meal Plan Section */}
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

        {/* Shopping List Section */}
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

      {/* Additional Information */}
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

// Helper function to group shopping items by category
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

export default MealPlanDisplay; 
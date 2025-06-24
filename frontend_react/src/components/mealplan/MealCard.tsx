import React, { useState } from 'react';
import { Meal } from '../../types/mealPlan';
import './MealCard.css';

interface MealCardProps {
  meal: Meal;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dayName: string;
  snackIndex?: number;
}

const MealCard: React.FC<MealCardProps> = ({ meal, mealType, dayName, snackIndex }) => {
  const [showIngredients, setShowIngredients] = useState(false);

  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '🌞';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const getMealLabel = () => {
    if (mealType === 'snack' && snackIndex) {
      return `Snack ${snackIndex}`;
    }
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const formatDietaryTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return [];
    
    return tags.map(tag => {
      // Add emoji icons for common dietary tags
      const tagEmojis: Record<string, string> = {
        'vegetarian': '🌱',
        'vegan': '🌿',
        'gluten-free': '🚫🌾',
        'dairy-free': '🚫🥛',
        'low-carb': '⬇️🍞',
        'high-protein': '💪',
        'keto': '🥑',
        'paleo': '🦴',
        'low-sodium': '🧂',
        'sugar-free': '🚫🍯',
        'nut-free': '🚫🥜',
        'healthy': '💚',
        'quick': '⚡',
        'easy': '😊'
      };
      
      const emoji = tagEmojis[tag.toLowerCase()] || '';
      return { tag, emoji };
    });
  };

  const toggleIngredients = () => {
    setShowIngredients(!showIngredients);
  };

  return (
    <div className={`meal-card meal-${mealType}`}>
      {/* Meal Header */}
      <div className="meal-header">
        <div className="meal-type">
          <span className="meal-icon">{getMealIcon()}</span>
          <span className="meal-label">{getMealLabel()}</span>
        </div>
        
        {meal.calories && (
          <div className="meal-calories">
            {meal.calories} cal
          </div>
        )}
      </div>

      {/* Meal Title */}
      <h4 className="meal-title">{meal.title}</h4>

      {/* Meal Description */}
      <p className="meal-description">{meal.description}</p>

      {/* Cooking Time */}
      {meal.cooking_time && (
        <div className="cooking-time">
          <span className="time-icon">⏱️</span>
          <span>{meal.cooking_time}</span>
        </div>
      )}

      {/* Dietary Tags */}
      {meal.dietary_tags && meal.dietary_tags.length > 0 && (
        <div className="dietary-tags">
          {formatDietaryTags(meal.dietary_tags).map(({ tag, emoji }, index) => (
            <span key={index} className="dietary-tag">
              {emoji && <span className="tag-emoji">{emoji}</span>}
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients Toggle */}
      <div className="ingredients-section">
        <button 
          className="ingredients-toggle"
          onClick={toggleIngredients}
          aria-expanded={showIngredients}
          aria-controls={`ingredients-${mealType}-${dayName}`}
        >
          <span>Ingredients ({meal.ingredients.length})</span>
          <span className={`toggle-icon ${showIngredients ? 'rotated' : ''}`}>
            ▼
          </span>
        </button>

        {showIngredients && (
          <div 
            id={`ingredients-${mealType}-${dayName}`}
            className="ingredients-list"
            role="region"
            aria-label={`Ingredients for ${meal.title}`}
          >
            <ul>
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCard; 
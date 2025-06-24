import React, { useState } from 'react';
import { DayMeals } from '../../types/mealPlan';
import MealCard from './MealCard';
import './DayMealCard.css';

interface DayMealCardProps {
  dayMeals: DayMeals;
  dayNumber: number;
}

const DayMealCard: React.FC<DayMealCardProps> = ({ dayMeals, dayNumber }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMealsCount = () => {
    let count = 0;
    if (dayMeals.breakfast) count++;
    if (dayMeals.lunch) count++;
    if (dayMeals.dinner) count++;
    if (dayMeals.snacks && dayMeals.snacks.length > 0) count += dayMeals.snacks.length;
    return count;
  };

  const getTotalCalories = () => {
    let total = 0;
    if (dayMeals.breakfast?.calories) total += dayMeals.breakfast.calories;
    if (dayMeals.lunch?.calories) total += dayMeals.lunch.calories;
    if (dayMeals.dinner?.calories) total += dayMeals.dinner.calories;
    if (dayMeals.snacks) {
      dayMeals.snacks.forEach(snack => {
        if (snack.calories) total += snack.calories;
      });
    }
    return total > 0 ? total : null;
  };

  return (
    <div className="day-meal-card">
      {/* Day Header */}
      <div 
        className={`day-header ${isExpanded ? 'expanded' : ''}`}
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={`day-${dayNumber}-content`}
      >
        <div className="day-info">
          <div className="day-number">Day {dayNumber}</div>
          <div className="day-details">
            <h3 className="day-name">{dayMeals.day}</h3>
            <p className="day-date">{formatDate(dayMeals.date)}</p>
          </div>
        </div>
        
        <div className="day-summary">
          <div className="meals-count">
            {getMealsCount()} {getMealsCount() === 1 ? 'meal' : 'meals'}
          </div>
          {getTotalCalories() && (
            <div className="total-calories">
              ~{getTotalCalories()} cal
            </div>
          )}
        </div>
        
        <div className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>
          ▼
        </div>
      </div>

      {/* Day Content */}
      {isExpanded && (
        <div 
          id={`day-${dayNumber}-content`}
          className="day-content"
          role="region"
          aria-labelledby={`day-${dayNumber}-header`}
        >
          <div className="meals-grid">
            {/* Breakfast */}
            {dayMeals.breakfast && (
              <MealCard 
                meal={dayMeals.breakfast}
                mealType="breakfast"
                dayName={dayMeals.day}
              />
            )}

            {/* Lunch */}
            {dayMeals.lunch && (
              <MealCard 
                meal={dayMeals.lunch}
                mealType="lunch"
                dayName={dayMeals.day}
              />
            )}

            {/* Dinner */}
            {dayMeals.dinner && (
              <MealCard 
                meal={dayMeals.dinner}
                mealType="dinner"
                dayName={dayMeals.day}
              />
            )}

            {/* Snacks */}
            {dayMeals.snacks && dayMeals.snacks.map((snack, index) => (
              <MealCard 
                key={`snack-${index}`}
                meal={snack}
                mealType="snack"
                dayName={dayMeals.day}
                snackIndex={index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayMealCard; 
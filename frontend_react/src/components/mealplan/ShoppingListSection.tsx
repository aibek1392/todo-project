import React, { useState } from 'react';
import { ShoppingItem } from '../../types/mealPlan';
import './ShoppingListSection.css';

interface ShoppingListSectionProps {
  groupedItems: Record<string, ShoppingItem[]>;
  totalCost?: string;
}

const ShoppingListSection: React.FC<ShoppingListSectionProps> = ({ 
  groupedItems, 
  totalCost 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(groupedItems))
  );
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Produce': '🥬',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Poultry': '🐔',
      'Fish': '🐟',
      'Pantry': '🥫',
      'Grains': '🌾',
      'Frozen': '🧊',
      'Beverages': '🥤',
      'Snacks': '🍿',
      'Spices': '🧂',
      'Condiments': '🥄',
      'Baking': '🧁',
      'Other': '🛒'
    };
    return icons[category] || '📦';
  };

  const getTotalItemsInCategory = (items: ShoppingItem[]) => {
    return items.length;
  };

  const getCheckedItemsInCategory = (items: ShoppingItem[]) => {
    return items.filter(item => 
      checkedItems.has(`${item.category}-${item.item}`)
    ).length;
  };

  const getTotalItemsCount = () => {
    return Object.values(groupedItems).flat().length;
  };

  const getCheckedItemsCount = () => {
    return checkedItems.size;
  };

  const clearAllChecked = () => {
    setCheckedItems(new Set());
  };

  const toggleAllCategories = () => {
    if (expandedCategories.size === Object.keys(groupedItems).length) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(Object.keys(groupedItems)));
    }
  };

  return (
    <div className="shopping-list-section">
      {/* Shopping List Header */}
      <div className="shopping-list-header">
        <div className="list-stats">
          <div className="total-items">
            {getCheckedItemsCount()} / {getTotalItemsCount()} items
          </div>
          {totalCost && (
            <div className="total-cost">
              Total: {totalCost}
            </div>
          )}
        </div>
        
        <div className="list-actions">
          <button 
            className="btn btn-sm btn-outline"
            onClick={clearAllChecked}
            disabled={checkedItems.size === 0}
          >
            Clear Checked
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={toggleAllCategories}
          >
            {expandedCategories.size === Object.keys(groupedItems).length 
              ? 'Collapse All' 
              : 'Expand All'
            }
          </button>
        </div>
      </div>

      {/* Shopping Categories */}
      <div className="shopping-categories">
        {Object.entries(groupedItems)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, items]) => {
            const isExpanded = expandedCategories.has(category);
            const checkedCount = getCheckedItemsInCategory(items);
            const totalCount = getTotalItemsInCategory(items);
            
            return (
              <div key={category} className="shopping-category">
                {/* Category Header */}
                <div 
                  className={`category-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(category)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCategory(category);
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={`category-${category}-items`}
                >
                  <div className="category-info">
                    <span className="category-icon">{getCategoryIcon(category)}</span>
                    <h3 className="category-name">{category}</h3>
                    <span className="category-count">
                      {checkedCount > 0 && (
                        <span className="checked-count">{checkedCount}/</span>
                      )}
                      {totalCount}
                    </span>
                  </div>
                  
                  <div className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>
                    ▼
                  </div>
                </div>

                {/* Category Items */}
                {isExpanded && (
                  <div 
                    id={`category-${category}-items`}
                    className="category-items"
                    role="region"
                    aria-label={`${category} items`}
                  >
                    {items.map((item, index) => {
                      const itemId = `${category}-${item.item}`;
                      const isChecked = checkedItems.has(itemId);
                      
                      return (
                        <div 
                          key={`${category}-${index}`}
                          className={`shopping-item ${isChecked ? 'checked' : ''}`}
                        >
                          <label className="item-checkbox">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(itemId)}
                              aria-label={`${item.quantity} ${item.item}`}
                            />
                            <span className="checkmark"></span>
                          </label>
                          
                          <div className="item-details">
                            <div className="item-name">
                              {item.item}
                            </div>
                            <div className="item-quantity">
                              {item.quantity}
                            </div>
                            {item.estimated_cost && (
                              <div className="item-cost">
                                {item.estimated_cost}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Shopping List Footer */}
      {getCheckedItemsCount() > 0 && (
        <div className="shopping-list-footer">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${(getCheckedItemsCount() / getTotalItemsCount()) * 100}%` 
              }}
            ></div>
          </div>
          <p className="progress-text">
            {getCheckedItemsCount()} of {getTotalItemsCount()} items collected
          </p>
        </div>
      )}
    </div>
  );
};

export default ShoppingListSection; 
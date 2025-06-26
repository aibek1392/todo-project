import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTodos, createTodo, updateTodo, deleteTodo, clearError, clearTodos } from '../../store/todoSlice';
import { logout } from '../../store/authSlice';
import { mealPlanAPI } from '../../services/api';
import { Todo } from '../../types/todo';
import DarkModeToggle from '../common/DarkModeToggle';



const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { todos, isLoading, error } = useAppSelector((state) => state.todos);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMealPlan, setHasMealPlan] = useState(false);
  const [mealPlanLoading, setMealPlanLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchTodos());
    checkForMealPlan();
  }, [dispatch]);

  const checkForMealPlan = async () => {
    try {
      setMealPlanLoading(true);
      const latestMealPlan = await mealPlanAPI.getLatestMealPlanFormatted();
      setHasMealPlan(!!latestMealPlan);
    } catch (error: any) {
      console.error('Error checking for meal plan:', error);
      // Only set hasMealPlan to false if it's actually not found (404)
      // For other errors, we don't want to hide the button
      if (error.response?.status === 404) {
        setHasMealPlan(false);
      } else {
        // For other errors, assume there might be a meal plan but we couldn't check
        setHasMealPlan(false);
      }
    } finally {
      setMealPlanLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      await dispatch(createTodo({
        title: newTodoTitle.trim(),
        completed: false,
      }));
      setNewTodoTitle('');
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    if (todo.id) {
      await dispatch(updateTodo({
        id: todo.id,
        updates: { completed: !todo.completed }
      }));
    }
  };

  const handleDeleteTodo = async (id: number) => {
    await dispatch(deleteTodo(id));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearTodos());
  };

  const handleViewMealPlan = () => {
    navigate('/my-meal-plan');
  };

  if (isLoading && todos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12 text-gray-600 dark:text-gray-300 text-lg">
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 p-4 lg:p-8 relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.full_name || user?.email}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to stay productive? Manage your todos below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {!mealPlanLoading && hasMealPlan && (
              <button
                onClick={handleViewMealPlan}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                🍽️ View My Meal Plan
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 lg:p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
              {typeof error === 'string' ? error : 'An error occurred'}
              <button 
                onClick={() => dispatch(clearError())}
                className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div 
            className={`flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 ${isExpanded ? 'mb-4' : 'mb-8'}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="text-lg font-semibold">Add a new todo</h3>
            <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
              {isExpanded ? '−' : '+'}
            </span>
          </div>
          
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48 mb-8' : 'max-h-0 mb-0'}`}>
            <form onSubmit={handleAddTodo} className="flex gap-4">
              <input
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="Add a new todo..."
                required
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              >
                Add Todo
              </button>
            </form>
          </div>

          {todos.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <h3 className="text-2xl font-semibold mb-2">No todos yet!</h3>
              <p className="text-lg">Add your first todo to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo) => (
                <div 
                  key={todo.id}
                  className={`flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 hover:shadow-md ${
                    todo.completed 
                      ? 'bg-gray-50 dark:bg-gray-700/50' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span 
                    className={`flex-1 text-base ${
                      todo.completed 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button 
                    onClick={() => todo.id && handleDeleteTodo(todo.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTodos, createTodo, updateTodo, deleteTodo, clearError, clearTodos } from '../../store/todoSlice';
import { logout } from '../../store/authSlice';
import { Todo } from '../../types/todo';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Welcome = styled.div`
  h1 {
    font-size: 2rem;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #6b7280;
    margin: 0;
  }
`;

const LogoutButton = styled.button`
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #b91c1c;
  }
`;

const TodoContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const AddTodoForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CollapseHeader = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: ${props => props.isExpanded ? '1rem' : '2rem'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  span {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
    transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const FormContainer = styled.div<{ isExpanded: boolean }>`
  max-height: ${props => props.isExpanded ? '200px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, margin 0.3s ease;
  margin-bottom: ${props => props.isExpanded ? '2rem' : '0'};
`;

const TodoInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TodoItem = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
  background: ${props => props.completed ? '#f9fafb' : 'white'};

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
`;

const TodoText = styled.span<{ completed: boolean }>`
  flex: 1;
  font-size: 1rem;
  color: ${props => props.completed ? '#6b7280' : '#1f2937'};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
`;

const DeleteButton = styled.button`
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #b91c1c;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
`;

const TodoList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { todos, isLoading, error } = useAppSelector((state) => state.todos);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

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

  if (isLoading && todos.length === 0) {
    return (
      <Container>
        <Content>
          <LoadingState>Loading your todos...</LoadingState>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Header>
          <Welcome>
            <h1>Welcome back, {user?.full_name}!</h1>
            <p>Manage your todos and stay productive</p>
          </Welcome>
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </Header>

        <TodoContainer>
          {error && (
            <ErrorMessage>
              {typeof error === 'string' ? error : 'An error occurred'}
              <button 
                onClick={() => dispatch(clearError())}
                style={{ 
                  marginLeft: '1rem', 
                  background: 'none', 
                  border: 'none', 
                  color: '#dc2626', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Dismiss
              </button>
            </ErrorMessage>
          )}

          <CollapseHeader isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
            <h3>Add a new todo</h3>
            <span>
              {isExpanded ? '−' : '+'}
            </span>
          </CollapseHeader>
          
          <FormContainer isExpanded={isExpanded}>
            <AddTodoForm onSubmit={handleAddTodo}>
              <TodoInput
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="Add a new todo..."
                required
              />
              <AddButton type="submit">
                Add Todo
              </AddButton>
            </AddTodoForm>
          </FormContainer>

          {todos.length === 0 ? (
            null
          ) : (
            <div>
              {todos.map((todo) => (
                <TodoItem key={todo.id} completed={todo.completed}>
                  <Checkbox
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo)}
                  />
                  <TodoText completed={todo.completed}>
                    {todo.title}
                  </TodoText>
                  <DeleteButton onClick={() => handleDeleteTodo(todo.id!)}>
                    Delete
                  </DeleteButton>
                </TodoItem>
              ))}
            </div>
          )}
        </TodoContainer>
      </Content>
    </Container>
  );
};

export default TodoList; 
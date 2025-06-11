import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Content = styled.div`
  text-align: center;
  color: white;
  max-width: 700px;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Tagline = styled.p`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  font-style: italic;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  margin-bottom: 3rem;
  opacity: 0.95;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(Link)<{ variant?: 'primary' | 'secondary' }>`
  display: inline-block;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'secondary' ? `
    background: transparent;
    color: white;
    border: 2px solid white;
    
    &:hover {
      background: white;
      color: #667eea;
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid white;
    
    &:hover {
      background: transparent;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
  `}
`;

const LandingPage: React.FC = () => {
  return (
    <Container>
      <Content>
        <Title>MealMind</Title>
        <Tagline>AI that thinks for your gut</Tagline>
        <Subtitle>
          Smart meal planning powered by AI. Let MealMind understand your preferences, 
          dietary needs, and lifestyle to create personalized meal plans that nourish your body and mind.
        </Subtitle>
        <ButtonGroup>
          <Button to="/signup" variant="primary">
            Start Your Journey
          </Button>
          <Button to="/login" variant="secondary">
            Sign In
          </Button>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

export default LandingPage; 
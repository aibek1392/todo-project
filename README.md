# MealMind - AI That Thinks for Your Gut

A modern, full-stack meal planning application built with **React + TypeScript + Redux** frontend and **FastAPI + Python** backend, featuring user authentication and AI-powered meal suggestions.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern React 19** with TypeScript for type safety
- **Redux Toolkit** for state management
- **React Router** for navigation and protected routes
- **Styled Components** for beautiful, responsive design
- **Axios** for API communication
- User authentication (login/signup)
- Protected routes
- Real-time meal planning and management
- Responsive design with modern UI

### Backend (FastAPI + Python)
- **FastAPI** for high-performance API
- **JWT Authentication** with secure token handling
- **bcrypt** for password hashing
- **Supabase** integration with fallback to in-memory storage
- **CORS** enabled for frontend communication
- User management endpoints
- CRUD operations for meal plans
- User-specific meal isolation

## 🛠️ Tech Stack

### Frontend
- React 19 with TypeScript
- Redux Toolkit for state management
- React Router DOM for routing
- Styled Components for styling
- Axios for HTTP requests

### Backend
- FastAPI (Python)
- JWT for authentication
- bcrypt for password hashing
- Pydantic for data validation
- Supabase for database (optional)
- uvicorn as ASGI server

## 📁 Project Structure

```
fullstack-app/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main FastAPI application
│   ├── database.py         # Database configuration
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment
├── frontend_react/         # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── common/    # Common components
│   │   │   └── todos/     # Todo components
│   │   ├── store/         # Redux store and slices
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.tsx        # Main app component
│   ├── package.json       # Node.js dependencies
│   └── public/            # Static assets
└── README.md              # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or later)
- Python (v3.8 or later)
- pip

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Optional: Set up Supabase (for persistent storage):**
   Create a `.env` file in the backend directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   JWT_SECRET_KEY=your_secret_key_here
   ```

5. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend_react
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   Frontend will be available at: `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Todos
- `GET /api/todos` - Get user's todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo

## 🎨 UI Features

### Landing Page
- Beautiful gradient background with MealMind branding
- Clear call-to-action for meal planning journey
- Responsive design

### Authentication
- Modern login/signup forms
- Form validation
- Error handling
- Loading states

### Meal Planning
- Intuitive meal planning interface
- Add, edit, delete meal ideas
- Mark meals as completed/prepared
- User-specific meal plans
- Real-time updates

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Token-based authorization
- Secure HTTP headers

## 🌟 Key Features Explained

### Redux State Management
The application uses Redux Toolkit for efficient state management:
- **Auth Slice**: Manages user authentication state
- **Meal Slice**: Handles meal planning CRUD operations
- **Typed hooks**: Type-safe Redux hooks for TypeScript

### Protected Routes
Routes are protected using a `ProtectedRoute` component that:
- Checks for valid authentication token
- Redirects unauthenticated users to login
- Handles loading states during authentication checks

### Responsive Design
The UI is built with styled-components and features:
- Mobile-first design approach
- Flexible layouts
- Modern color schemes and animations
- Accessible form controls

## 🚀 Deployment

### Backend Deployment
1. Set up your production environment variables
2. Use a production WSGI server like Gunicorn
3. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or Render
3. Ensure environment variables point to your production API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔧 Development Tips

- Backend API documentation is available at `http://localhost:8000/docs`
- Use Redux DevTools for debugging state management
- Check browser console for any frontend errors
- Use the virtual environment for Python dependencies
- Hot reloading is enabled for both frontend and backend

## 📞 Support

If you encounter any issues:
1. Check that both servers are running
2. Verify all dependencies are installed
3. Check for CORS issues if API calls fail
4. Ensure environment variables are properly set

**MealMind - Let AI think for your gut!** 🧠🍽️ 
# Crypto Exchange Frontend

A modern, full-stack cryptocurrency exchange platform built with React, Express, and Supabase.

## 🚀 Features

- **Real-time Trading**: Live price feeds and order book updates
- **User Authentication**: Secure login with Supabase Auth
- **Portfolio Management**: Track your crypto holdings
- **Order Management**: Place and manage buy/sell orders
- **Responsive Design**: Works on desktop and mobile
- **Security**: Rate limiting, CORS, and security headers

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: WebSocket connections
- **Deployment**: Vercel, Railway, Render ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CryptoExchangeFrontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your Supabase credentials:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=development
PORT=5002

# Session Configuration
SESSION_SECRET=your-session-secret-key-here
```

### 4. Database Setup

Run database migrations:

```bash
npm run db:push
```

Seed the database with initial data:

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5002`

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Option 2: Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Option 3: Render

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm run start`
5. Configure environment variables

## 📁 Project Structure

```
CryptoExchangeFrontend/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities and config
│   └── index.html
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schema
│   └── schema.ts          # Database schema
├── migrations/            # Database migrations
├── scripts/               # Utility scripts
└── dist/                  # Build output
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run seed` - Seed database with data
- `npm run check` - TypeScript type checking

## 🔒 Security Features

- Rate limiting on API endpoints
- CORS configuration
- Security headers (Helmet)
- Input validation
- Session management
- HTTPS enforcement in production

## 📱 Mobile Support

- Responsive design
- Touch-optimized interface
- PWA ready (Progressive Web App)
- Mobile-first approach

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run type checking
npm run check
```

## 📊 Monitoring

The app includes:
- Request logging
- Error tracking
- Performance monitoring
- Database connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

## 🔄 Updates

Stay updated with the latest changes:
- Follow the repository
- Check the releases page
- Read the changelog

---

**Note**: This is a demo/template project. For production use, ensure proper security measures, compliance, and legal requirements are met. 
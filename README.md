# ChatFlow Frontend - Next.js

**Modern team collaboration frontend built with Next.js, TypeScript, and GraphQL for the ChatFlow SaaS platform.**

## 🚀 Features

### **🔐 Authentication System**
- Professional login/register forms with validation
- JWT token management with refresh tokens
- Admin bootstrap for initial setup
- Protected routes and authentication guards

### **💬 Real-Time Chat**
- Direct messaging between team members
- User-to-user chat interface
- Real-time message delivery
- Team member discovery

### **🔔 Smart Notifications**
- Notification center with filtering
- Read/unread status management
- Real-time notification updates
- Interactive notification actions

### **👤 User Management**
- User profiles with settings tabs
- Account information display
- Profile customization options
- Security settings

### **📊 Dashboard Analytics**
- Modern dashboard with live stats
- Real-time connection status
- Activity overview and metrics
- Responsive design across devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **GraphQL**: Apollo Client with subscriptions
- **Real-time**: GraphQL subscriptions over WebSocket
- **Authentication**: JWT with secure token storage
- **State Management**: React Context + Apollo Cache

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- ChatFlow Backend running on port 3001

### Installation

```bash
# Clone the repository
git clone https://github.com/saadamir1/chatflow-frontend.git
cd chatflow-frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Login Credentials
```
Email: admin@gmail.com
Password: 123456
```

## 📱 Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── chat/         # Chat interface
│   │   ├── notifications/ # Notification center
│   │   └── profile/      # User profile
│   ├── admin-bootstrap/  # Admin setup page
│   ├── register/         # Registration page
│   └── layout.tsx        # Root layout with providers
├── components/            # Reusable components
│   ├── auth/             # Authentication forms
│   ├── chat/             # Chat components
│   ├── dashboard/        # Dashboard components
│   ├── notifications/    # Notification components
│   ├── profile/          # Profile components
│   └── common/           # Shared components
├── contexts/             # React contexts
│   └── AuthContext.tsx  # Authentication state
├── graphql/              # GraphQL operations
│   └── operations.ts     # Queries, mutations, subscriptions
└── lib/                  # Utility libraries
    └── apollo-client.js  # Apollo GraphQL client
```

## 🔗 API Integration

### GraphQL Endpoints
- **HTTP**: `http://localhost:3001/graphql`
- **WebSocket**: `ws://localhost:3001/graphql`

### Key Operations
- Authentication (login, register, bootstrap admin)
- User management and profiles
- Real-time messaging
- Notification management
- Workspace creation

## 🎨 UI/UX Features

- **Modern Design**: Clean ChatFlow branding with gradients
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live connection status monitoring
- **Interactive Elements**: Hover effects and smooth transitions
- **Professional Interface**: Business-ready design system

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Tailwind CSS for consistent styling
- Component-based architecture

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Environment Variables for Production
```env
NEXT_PUBLIC_GRAPHQL_URL=https://your-backend.com/graphql
NEXT_PUBLIC_WS_URL=wss://your-backend.com/graphql
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎯 Built for the ChatFlow SaaS Platform - Professional team collaboration made simple!**

**⭐ Star this repo if it helps you build better team collaboration tools!**
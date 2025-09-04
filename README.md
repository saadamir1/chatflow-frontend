# ChatFlow Frontend - Next.js

**Modern team collaboration frontend built with Next.js, TypeScript, and GraphQL for the ChatFlow SaaS platform.**

## 🚀 Features

### **🔐 Authentication System**
- Professional login/register forms with validation
- JWT token management with refresh tokens
- Email verification and password reset
- Protected routes and authentication guards

### **💬 Real-Time Chat**
- Direct messaging between team members
- Real-time message delivery with WebSocket
- Chat room creation and management
- Live typing indicators and presence

### **🔔 Smart Notifications**
- Real-time notification system
- Push notifications for messages and updates
- Notification center with read/unread status
- Live notification badges

### **👤 User Management**
- User profiles with avatar support
- Role-based access control
- Team member invitations
- Profile customization

### **📊 Dashboard Analytics**
- Real-time connection status
- Activity overview and statistics
- Recent messages and notifications
- User engagement metrics

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

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:3001/graphql
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── chat/         # Chat interface
│   │   ├── notifications/ # Notification center
│   │   └── profile/      # User profile
│   ├── register/         # Registration page
│   └── layout.tsx        # Root layout with providers
├── components/            # Reusable components
│   ├── auth/             # Authentication forms
│   ├── chat/             # Chat components
│   ├── dashboard/        # Dashboard components
│   ├── notifications/    # Notification components
│   └── profile/          # Profile components
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
- Authentication (login, register, refresh)
- Real-time messaging and notifications
- User management and profiles
- Chat room creation and management

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional ChatFlow branding
- **Real-time Updates**: Live notifications and message delivery
- **Loading States**: Proper loading indicators and error handling
- **Accessibility**: WCAG compliant with keyboard navigation

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

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t chatflow-frontend .

# Run container
docker run -p 3000:3000 chatflow-frontend
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
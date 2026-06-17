<img width="362" height="115" alt="image" src="https://github.com/user-attachments/assets/f2f2d75c-f8f2-4de5-ae0a-c5deaa121bc4" /># Aemori - AI that grows with you

A modern, AI-powered companion application that provides personalized emotional support and meaningful conversations through character personas from beloved fiction. Built with TanStack Start, React, and powered by Groq API.

## 🌟 Features

- **🎭 Character-Based Companions** - Chat with AI companions modeled after literary characters like Aaron Warner and Cardan Greenbriar
- **💬 Personalized Conversations** - Get custom support tailored to each character's unique personality and communication style
- **🤖 AI-Powered** - Real-time responses powered by Groq API for fast, intelligent interactions
- **🔐 User Accounts** - Secure login and account management to keep your conversations private
- **🌓 Light/Dark Mode** - Switch between themes anytime, your preference is automatically saved
- **⏰ Reminders** - Set personalized reminders and notifications for self-care
- **📱 Mobile Friendly** - Works great on phones, tablets, and computers

## 🛠️ Tech Stack

- **Frontend Framework**: TanStack + React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (via shadcn/ui)
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form
- **AI Integration**: Groq API
- **Deployment**: Cloudflare
- **Package Manager**: npm

## 📦 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── ambient.tsx      # Ambient effects component
│   └── theme-toggle.tsx # Theme switcher
├── hooks/               # Custom React hooks
│   └── use-mobile.tsx   # Mobile detection hook
├── lib/                 # Utility functions and integrations
│   ├── auth.ts          # Authentication logic
│   ├── charPersona.ts   # Character persona management
│   ├── groq.ts          # Groq API integration
│   ├── reminders.ts     # Reminder functionality
│   ├── store.ts         # State management
│   ├── theme.tsx        # Theme configuration
│   └── utils.ts         # Utility functions
├── routes/              # TanStack Router page routes
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # Home page
│   ├── login.tsx        # Login page
│   ├── setup.tsx        # Initial setup
│   ├── hub.tsx          # Main hub
│   ├── space.tsx        # Companion space
│   └── create.tsx       # Creation/customization
├── router.tsx           # Router configuration
├── styles.css           # Global styles
└── routeTree.gen.ts     # Generated route tree
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (includes npm)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aemori
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_API_URL=your_api_endpoint
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Build for development:
```bash
npm run build:dev
```

Preview the production build:
```bash
npm run preview
```

## 🧹 Code Quality

**Linting**:
```bash
npm run lint
```

**Formatting**:
```bash
npm run format
```

## 🎭 Character Personas

The application includes a collection of literary character personas, each with:
- **Unique personality traits** derived from their source material
- **Distinct communication styles** tailored to their character
- **Personalized support approaches** based on their nature
- **Signature phrases** that capture their essence

Each character is carefully crafted to provide authentic and meaningful emotional support.

## 🔐 Authentication

The application includes a secure authentication system for:
- User account creation and login
- Session management
- Secure credential storage
- Account personalization

## ⏰ Reminders

Set and manage reminders for:
- Daily affirmations
- Check-in notifications
- Goal tracking
- Important events

## 🎨 Theming

Switch between dark and light themes:
- Persistent theme preferences
- Smooth transitions
- Accessible color schemes
- Customizable via Tailwind CSS

## 🌐 Deployment

This project is configured for deployment on Cloudflare:

```bash
npm run build
wrangler deploy
```

See `wrangler.jsonc` for deployment configuration.

## 📝 Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `wrangler.jsonc` - Cloudflare deployment settings
- `components.json` - UI component configuration
- `eslint.config.js` - Linting rules
- `charpersona.json` - Character persona definitions
- `bunfig.toml` - Bun configuration

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is private. All rights reserved.

## 💡 Tips

- Use mobile detection hook for responsive layouts: `useIsMobile()` from `src/hooks/use-mobile.tsx`
- Access character personas via `src/lib/charPersona.ts`
- Theme changes are handled by the toggle component and persisted
- Use TanStack Router for navigation and route handling

## 🐛 Troubleshooting

**Port already in use**:
```bash
# Change the port in vite.config.ts or use:
npm run dev -- --port 3000
```

**Build errors**:
```bash
# Clear dependencies and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Theme not persisting**:
Check browser local storage is enabled and clear browser cache if needed.

**Dependencies not installing**:
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

To contact me : cmadaki2004@gmail.com
<img width="1902" height="845" alt="image" src="https://github.com/user-attachments/assets/019f13d6-5644-4997-acf7-e108f0b23dcb" />
<img width="1127" height="857" alt="image" src="https://github.com/user-attachments/assets/a83e14bc-3aed-44aa-83fa-2337f25b89a8" />
<img width="1573" height="916" alt="image" src="https://github.com/user-attachments/assets/31105ac1-c04d-4f16-9931-3877503b73fa" />



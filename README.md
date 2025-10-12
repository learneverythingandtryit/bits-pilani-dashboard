# 🎓 BITS Pilani Student Dashboard

A modern, minimal, and AI-powered student dashboard interface for BITS Pilani, built with React, TypeScript, and Tailwind CSS v4.

![BITS Pilani Dashboard](https://img.shields.io/badge/BITS-Pilani-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📚 Core Features
- **Dashboard Overview** - Greeting card, statistics, and course overview
- **Course Management** - 24 subjects across 6 semesters with semester-based filtering
- **Notes System** - Create, edit, and organize notes with localStorage persistence
- **Calendar** - Event management with notifications and reminders
- **AI Assistant** - Intelligent help and guidance system
- **E-learn Portal** - Direct integration with OpenAthens E-library

### 🎨 Design Features
- **Professional UI** - Clean, minimal design with BITS Pilani branding (#191f5e)
- **Light/Dark Mode** - Complete theme support with CSS custom properties
- **Responsive Design** - Optimized for desktop, tablet, and mobile (including iPhone SE)
- **Smooth Animations** - Professional hover effects and transitions
- **Collapsible Sidebar** - Space-efficient navigation

### 🔐 User Features
- **Login System** - Secure authentication with localStorage persistence
- **Profile Management** - Edit user profile with avatar support
- **Recent Activity** - Track recently accessed courses and notes
- **Announcements** - Stay updated with university announcements
- **Schedule Popup** - Quick view of upcoming classes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/bits-pilani-dashboard.git
   cd bits-pilani-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Login with any username and password (demo mode)

## 📦 Build for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` folder.

## 🌐 Deploy Online (Free)

### Option 1: Netlify (Easiest - Drag & Drop)

1. Build your project: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder onto the page
4. Done! Your site is live 🎉

### Option 2: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Deploy"

Your site will be live at `https://your-project.vercel.app`

### Option 3: GitHub Pages

1. Install gh-pages: `npm install -D gh-pages`
2. Add to package.json scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```
3. Run: `npm run deploy`

Your site will be at `https://YOUR-USERNAME.github.io/bits-pilani-dashboard`

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool (super fast!) |
| **Tailwind CSS v4** | Styling framework |
| **Radix UI** | Accessible component primitives |
| **Lucide React** | Beautiful icons |
| **Recharts** | Charts and graphs |
| **date-fns** | Date utilities |
| **Sonner** | Toast notifications |

## 📁 Project Structure

```
bits-pilani-dashboard/
├── App.tsx                   # Main application component
├── components/               # React components
│   ├── ui/                  # Reusable UI components (shadcn)
│   ├── widgets/             # Dashboard widgets
│   ├── LoginPage.tsx        # Authentication
│   ├── Header.tsx           # Top navigation
│   ├── Sidebar.tsx          # Side navigation
│   ├── CoursesPage.tsx      # Course management
│   ├── NotesPage.tsx        # Notes system
│   ├── CalendarPage.tsx     # Calendar & events
│   └── ...                  # Other components
├── data/                     # Static data
│   ├── coursesData.ts       # 24 courses across 6 semesters
│   ├── eventsData.ts        # Calendar events
│   └── sampleData.ts        # Sample notes & announcements
├── styles/
│   └── globals.css          # Global styles & themes
├── utils/                    # Helper functions
└── supabase/                # Backend functions (optional)
```

## 🎨 Customization

### Change Colors

Edit `/styles/globals.css`:

```css
:root {
  --university-primary: #191f5e;  /* Change to your university color */
  --university-secondary: #2d3748;
  /* ... */
}
```

### Add More Courses

Edit `/data/coursesData.ts`:

```typescript
{
  id: 25,
  title: "New Course Name",
  code: "CS F401",
  instructor: "Dr. Name",
  credits: 3,
  semester: 5,
  status: "ongoing",
  progress: 0,
  // ...
}
```

### Modify Login

Edit `/components/LoginPage.tsx` to customize the login experience.

## 📱 Mobile Optimization

The dashboard is fully responsive with special optimizations for:
- iPhone SE (320px - 374px)
- Small mobile devices (375px - 640px)
- Tablets (641px - 1024px)
- Desktop (1025px+)

Touch-friendly buttons and inputs ensure a great mobile experience.

## 🌙 Theme System

The app supports light and dark modes using CSS custom properties:
- Toggle available in header
- Preference saved to localStorage
- Smooth transitions between themes
- All components theme-aware

## 💾 Data Persistence

User data is stored in localStorage:
- Login state
- User profile
- Theme preference
- Created notes
- Recent activity

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 📝 Default Login Credentials

The app currently runs in **demo mode**:
- Use **any** username and password to login
- Default profile: "HARI HARA SUDHAN" (2021WA15025)
- Edit profile from header avatar

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use

```bash
# Use different port
npm run dev -- --port 3001
```

### TypeScript Errors

Check that all dependencies are installed:
```bash
npm list typescript
npm install -D typescript@^5.2.2
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **BITS Pilani** for inspiration
- **Shadcn UI** for beautiful components
- **Radix UI** for accessible primitives
- **Tailwind CSS** for styling system

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Check existing issues for solutions

## 🎯 Roadmap

- [ ] Backend integration with Supabase
- [ ] Real authentication system
- [ ] Assignment submission
- [ ] Grade tracking
- [ ] Student forum
- [ ] Mobile app (React Native)

## ⚡ Performance

- Lazy loading for heavy components
- Optimized bundle size
- Code splitting
- Image optimization
- Fast initial load time

---

**Built with ❤️ for BITS Pilani students**

*Star ⭐ this repository if you find it useful!*

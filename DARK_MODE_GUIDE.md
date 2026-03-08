# Dark Mode Implementation Guide

## 📋 Overview

The Alburhan Classroom LMS now features a **full dark mode toggle** that allows users to switch between light and dark themes seamlessly. The theme preference persists across browser sessions using localStorage.

## ✨ Features

- **Theme Toggle Button** in the top navigation bar with Moon (🌙) and Sun (☀️) icons
- **Smooth transitions** between themes (0.3s ease)
- **Persistent preference** using localStorage
- **System-wide theming** using CSS variables
- **Automatic theme detection** on page load
- **Responsive design** with optimized colors for both themes

## 🎨 Color Schemes

### Light Theme (Default)
- **Background**: #F5F7F6
- **Card Background**: #FFFFFF
- **Primary**: #0F3D3E
- **Secondary**: #D4AF37
- **Text**: #333333
- **Navbar/Sidebar**: #0F3D3E

### Dark Theme
- **Background**: #121212
- **Card Background**: #1E1E1E
- **Primary**: #0B2E2F
- **Secondary**: #D4AF37
- **Text**: #EAEAEA
- **Navbar/Sidebar**: #0B2E2F

## 🛠️ Implementation Details

### 1. Theme Context (`src/context/ThemeContext.js`)
Provides global theme state management using React Context API:

```javascript
import { useTheme } from './context/ThemeContext';

// In your component
const { theme, toggleTheme, isDark } = useTheme();
```

**Available properties:**
- `theme`: Current theme ('light' or 'dark')
- `toggleTheme()`: Function to switch themes
- `isDark`: Boolean indicating if dark mode is active

### 2. CSS Variables (`src/styles/theme.css`)
All theme colors are defined as CSS variables:

```css
/* Access theme colors in your CSS */
.my-component {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
```

**Available CSS Variables:**
- Layout: `--bg-color`, `--bg-secondary`, `--card-bg`
- Text: `--text-color`, `--text-secondary`, `--text-muted`
- Colors: `--primary-color`, `--secondary-color`
- Interactive: `--input-bg`, `--button-bg`, `--button-hover`
- Tables: `--table-header-bg`, `--table-row-hover`
- UI: `--border-color`, `--shadow-md`, `--modal-bg`

### 3. Theme Application
The theme is applied to the `<body>` element:

```html
<!-- Light mode -->
<body class="light-theme">

<!-- Dark mode -->
<body class="dark-theme">
```

### 4. Toggle Button (Navbar)
Located in `src/components/Navbar.js`:

```javascript
<button 
  onClick={toggleTheme} 
  className="navbar-theme-toggle"
  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
  aria-label="Toggle theme"
>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

## 📂 Modified Files

### Created:
1. `src/context/ThemeContext.js` - Theme state management
2. `src/styles/theme.css` - CSS variables and theme definitions
3. `src/styles/navbar.css` - Navbar styles with theme support
4. `src/styles/sidebar.css` - Sidebar styles with theme support

### Modified:
1. `src/App.js` - Wrapped with ThemeProvider
2. `src/components/Navbar.js` - Added toggle button, uses CSS classes
3. `src/components/Sidebar.js` - Converted to CSS classes
4. `src/styles/dashboard.css` - Updated to use CSS variables
5. `src/index.js` - Imports theme.css

## 🚀 Usage

### For Users:
1. Click the **Moon icon (🌙)** in the top navigation bar to switch to dark mode
2. Click the **Sun icon (☀️)** to switch back to light mode
3. Your preference is saved automatically

### For Developers:

#### Using the Theme Context in Components:
```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      {isDark && <p>Dark mode is active!</p>}
    </div>
  );
}
```

#### Styling with CSS Variables:
```css
.my-card {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.my-button {
  background-color: var(--button-bg);
  color: var(--button-text);
}

.my-button:hover {
  background-color: var(--button-hover);
}
```

#### Adding New CSS Variables:
Edit `src/styles/theme.css`:

```css
.light-theme {
  --my-custom-color: #FF5733;
}

.dark-theme {
  --my-custom-color: #8B4513;
}
```

## 🎯 Components with Theme Support

All major components now support dark mode:
- ✅ Dashboard layouts (Admin, Teacher, Student)
- ✅ Navbar
- ✅ Sidebar
- ✅ Tables и data grids
- ✅ Forms and inputs
- ✅ Buttons (all variants)
- ✅ Cards (stat cards, class cards)
- ✅ Modals
- ✅ Assignment pages
- ✅ Login/authentication pages
- ✅ Profile pages
- ✅ Message/chat interfaces

## 🔧 Customization

### Changing Dark Mode Colors:
Edit `src/styles/theme.css` in the `.dark-theme` section:

```css
.dark-theme {
  --bg-color: #000000;  /* Darker background */
  --card-bg: #1A1A1A;   /* Darker cards */
  /* ... other variables */
}
```

### Adding Smooth Transitions:
All theme-related properties automatically transition smoothly (defined in theme.css):

```css
body, .card, button, input {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease;
}
```

### Disabling Dark Mode:
To disable dark mode completely:

1. Remove the toggle button from `Navbar.js`
2. Remove `<ThemeProvider>` wrapper from `App.js`
3. Set a default theme class on `<body>`:
   ```javascript
   // In index.js
   document.body.classList.add('light-theme');
   ```

## 📱 Responsive Design

The dark mode is fully responsive and works seamlessly on:
- **Desktop** (> 768px)
- **Tablet** (768px - 480px)
- **Mobile** (< 480px)

On mobile devices, the theme toggle button remains accessible in the navbar.

## 🧪 Testing

### Manual Testing:
1. Open application: http://localhost:3000
2. Login with any user (admin/teacher/student)
3. Click theme toggle in navbar
4. Verify colors change across all pages
5. Refresh browser - theme should persist
6. Test on different pages (dashboard, assignments, classes, etc.)

### Browser Compatibility:
Tested on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Theme doesn't persist after refresh:
- Check browser's localStorage is enabled
- Verify no errors in console related to localStorage
- Check Network tab for failed requests

### Colors not changing:
- Ensure `theme.css` is imported in `App.js`
- Check browser DevTools > Elements > `<body>` has correct class
- Verify CSS variables are defined in `theme.css`
- Clear browser cache and reload

### Toggle button not appearing:
- Ensure `ThemeProvider` wraps the app in `App.js`
- Check `Navbar.js` imports `useTheme` correctly
- Verify `navbar.css` is imported

### Styling issues:
- Some third-party components may need explicit theme styling
- Check if inline styles override CSS variables
- Use `!important` sparingly for stubborn elements

## 📝 Notes

- **Performance**: Theme switching is instant with no page reload
- **Accessibility**: Theme toggle has proper ARIA labels and title attributes
- **Storage**: Theme preference stored in `localStorage.theme`
- **Default**: Light mode is the default theme for new users
- **Icons**: Uses emoji icons (🌙/☀️) - can be replaced with custom SVGs or icon libraries

## 🔮 Future Enhancements

Potential improvements for future versions:
- [ ] Auto-detect system theme preference (prefers-color-scheme)
- [ ] More theme options (blue theme, green theme, etc.)
- [ ] Per-page theme customization
- [ ] Theme preview in settings
- [ ] Scheduled theme switching (auto dark mode at night)
- [ ] Custom theme editor for admins

## 📚 Resources

- [React Context API Documentation](https://react.dev/reference/react/useContext)
- [CSS Custom Properties (Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Maintainer**: Alburhan Classroom Development Team

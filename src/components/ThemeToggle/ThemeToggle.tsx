import { useTheme } from '../../store/useTheme';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const theme = useTheme(s => s.theme);
  const toggleTheme = useTheme(s => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      className="btn theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light' : 'Switch to dark'}
    >
      {isDark ? '☾' : '☀'}
    </button>
  );
}

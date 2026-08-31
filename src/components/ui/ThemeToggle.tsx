import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle() {
  const { theme, setTheme, toggleTheme, isDark } = useThemeStore();

  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setTheme('LIGHT')}
        className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
          theme === 'LIGHT'
            ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-xs'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
        }`}
        title="Modo Claro"
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('DARK')}
        className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
          theme === 'DARK'
            ? 'bg-white dark:bg-zinc-800 text-violet-400 shadow-xs'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
        }`}
        title="Modo Oscuro"
      >
        <Moon className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('SYSTEM')}
        className={`p-1.5 rounded-lg text-xs font-medium transition-all hidden sm:block ${
          theme === 'SYSTEM'
            ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
        }`}
        title="Automático (Sistema)"
      >
        <Laptop className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SimpleThemeToggle() {
  const { toggleTheme, isDark } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 backdrop-blur-md shadow-xs transition-all text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer select-none"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-violet-600" />
      )}
      <span className="text-xs font-medium hidden md:inline">
        {isDark ? 'Claro' : 'Oscuro'}
      </span>
    </button>
  );
}

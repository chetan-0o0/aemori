import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="glass relative grid h-10 w-10 place-items-center rounded-full transition-all duration-300 hover:glow-primary"
    >
      <span
        className="absolute transition-all duration-500"
        style={{
          opacity: theme === "dark" ? 1 : 0,
          transform: `rotate(${theme === "dark" ? 0 : 90}deg) scale(${theme === "dark" ? 1 : 0.5})`,
        }}
      >
        {/* moon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
        </svg>
      </span>
      <span
        className="absolute transition-all duration-500"
        style={{
          opacity: theme === "light" ? 1 : 0,
          transform: `rotate(${theme === "light" ? 0 : -90}deg) scale(${theme === "light" ? 1 : 0.5})`,
        }}
      >
        {/* sun */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      </span>
    </button>
  );
}

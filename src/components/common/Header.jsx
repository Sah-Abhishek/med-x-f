import { useAuth } from '../../hooks/useAuth';
import { ROLE_NAMES } from '../../utils/constants';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-[var(--color-text)] tracking-tight">
          Medical Examination System
        </h1>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
          RBAC
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">
              {user.fullName}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
              {ROLE_NAMES[user.role]}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-sky-600 flex items-center justify-center text-white text-[11px] font-bold tracking-tight">
              {getInitials(user.fullName)}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-red-50 rounded-[var(--radius-sm)] transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

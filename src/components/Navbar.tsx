import React, { useState } from 'react';
import {
  Bot,
  Compass,
  Grid,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Palette,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { useGurukul } from '../context/GurukulContext';
import { AccentPalette, AppSection, ThemeMode } from '../types/gurukul';
import { USER_ROLE_LABELS } from '../data/seedCatalog';

interface NavbarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const THEME_OPTIONS: { id: ThemeMode; label: string; swatch: string }[] = [
  { id: 'light', label: 'Pure Ivory Light', swatch: '#ffffff' },
  { id: 'parchment', label: 'Gurukul Parchment', swatch: '#faf7f0' },
  { id: 'dark', label: 'Midnight Slate', swatch: '#0b1120' },
];

const ACCENT_OPTIONS: { id: AccentPalette; label: string; primary: string; secondary: string }[] = [
  { id: 'navy-saffron', label: 'Navy & Saffron', primary: '#0f274a', secondary: '#d95d14' },
  { id: 'indigo-gold', label: 'Indigo & Gold', primary: '#272b6b', secondary: '#b45309' },
  { id: 'teal-ochre', label: 'Peacock Teal & Ochre', primary: '#0f4c5c', secondary: '#c2410c' },
  { id: 'forest-sandalwood', label: 'Forest & Sandalwood', primary: '#1b4332', secondary: '#9a5b13' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const {
    firebaseUser,
    profile,
    isAdmin,
    signInWithGoogle,
    logout,
    themeMode,
    setThemeMode,
    accentPalette,
    setAccentPalette,
  } = useGurukul();

  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

  const navLinks: { id: AppSection; label: string }[] = [
    { id: 'home', label: 'Explore' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'ai-guru', label: 'AI Guru' },
    { id: 'hubs', label: '10 Hubs' },
    { id: 'portals', label: 'Portals' },
  ];

  const handleNav = (section: AppSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setDesktopMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop Top Bar: Strictly 3 zones separated by gap-8 */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNav('home')}
            className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
          >
            Bharat Gurukul 360
          </button>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav aria-label="Primary navigation" className="flex items-center gap-7">
            {navLinks.map((link) => {
              const active = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNav(link.id)}
                  className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[var(--accent-secondary)] text-[var(--text-primary)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hairline)]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action (Sign In or Account Menu dropdown) */}
          <div className="relative shrink-0">
            {firebaseUser ? (
              <button
                type="button"
                onClick={() => setDesktopMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="max-w-[140px] truncate">
                  {profile?.displayName || firebaseUser.displayName || 'Account'}
                </span>
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDesktopMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Join / Menu</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {/* Desktop Dropdown Menu List (Admin & Hidden Theme/Colour Switcher) */}
            {desktopMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-elevated)] shadow-lg p-2 z-50">
                {firebaseUser ? (
                  <div className="px-3 py-2.5 border-b border-[var(--border-hairline)] mb-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {profile?.displayName || firebaseUser.displayName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {profile ? USER_ROLE_LABELS[profile.role].label : 'Learner'} · {profile?.points ?? 0} pts
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopMenuOpen(false);
                      signInWithGoogle();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] mb-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleNav('admin')}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--accent-secondary)]" />
                    <span>{isAdmin ? 'Admin Control Panel' : 'Admin & CMS Panel'}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>

                {/* Collapsible Theme & Colour Menu Item */}
                <div className="mt-1 pt-1 border-t border-[var(--border-hairline)]">
                  <button
                    type="button"
                    onClick={() => setThemeDrawerOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span>Theme & Colour Palette</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
                        themeDrawerOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {themeDrawerOpen && (
                    <div className="px-3 py-2.5 space-y-3 bg-[var(--bg-surface)] rounded-lg mt-1">
                      <div>
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5">
                          Surface Theme
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {THEME_OPTIONS.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setThemeMode(t.id)}
                              className={`px-2 py-1.5 text-xs font-medium rounded-md border text-center cursor-pointer ${
                                themeMode === t.id
                                  ? 'border-[var(--accent-secondary)] text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                                  : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                              }`}
                            >
                              {t.id === 'light' ? 'Light' : t.id === 'parchment' ? 'Parchment' : 'Dark'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5">
                          Accent Colour
                        </p>
                        <div className="space-y-1">
                          {ACCENT_OPTIONS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setAccentPalette(c.id)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md border cursor-pointer ${
                                accentPalette === c.id
                                  ? 'border-[var(--accent-secondary)] bg-[var(--bg-elevated)] font-semibold text-[var(--text-primary)]'
                                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-sm inline-block border border-black/10"
                                  style={{ backgroundColor: c.primary }}
                                />
                                <span
                                  className="w-3 h-3 rounded-sm inline-block border border-black/10"
                                  style={{ backgroundColor: c.secondary }}
                                />
                                <span>{c.label}</span>
                              </span>
                              {accentPalette === c.id && <Check className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {firebaseUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 text-sm text-red-600 dark:text-red-400 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Compact Header (non-sticky so mobile sticky height stays strictly <= 15%) */}
      <div className="md:hidden border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 h-12 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap"
        >
          Bharat Gurukul 360
        </button>
        {firebaseUser ? (
          <span className="text-xs font-medium text-[var(--text-secondary)] truncate max-w-[140px]">
            {profile?.displayName || 'Learner'}
          </span>
        ) : (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent-primary)] text-white whitespace-nowrap"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed, h-14 = 56px, well below 15% mobile viewport cap) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 border-t border-[var(--border-hairline)] bg-[var(--bg-elevated)]/95 backdrop-blur-md grid grid-cols-5"
      >
        <button
          type="button"
          onClick={() => handleNav('home')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
            activeSection === 'home'
              ? 'text-[var(--accent-secondary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleNav('catalog')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
            activeSection === 'catalog'
              ? 'text-[var(--accent-secondary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Catalog</span>
        </button>

        <button
          type="button"
          onClick={() => handleNav('ai-guru')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
            activeSection === 'ai-guru'
              ? 'text-[var(--accent-secondary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Guru</span>
        </button>

        <button
          type="button"
          onClick={() => handleNav('hubs')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
            activeSection === 'hubs'
              ? 'text-[var(--accent-secondary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>10 Hubs</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
            mobileMenuOpen || activeSection === 'portals' || activeSection === 'admin'
              ? 'text-[var(--accent-secondary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Menu List Sheet (with Theme & Colour hidden inside collapsible menu list) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
          <div className="bg-[var(--bg-elevated)] border-t border-[var(--border-hairline)] rounded-t-2xl max-h-[85vh] overflow-y-auto p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <span className="font-display text-lg font-semibold text-[var(--text-primary)]">
                Gurukul Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu List Items */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleNav('portals')}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>9 Role-Based Dashboards</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => handleNav('admin')}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent-secondary)]" />
                  <span>Admin Control Panel</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>

              {/* Hidden Theme & Colour Accordion inside Menu List */}
              <div className="border-t border-[var(--border-hairline)] pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => setThemeDrawerOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                >
                  <span className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span>Themes & Colours</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
                      themeDrawerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {themeDrawerOpen && (
                  <div className="mx-2 mb-2 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-4">
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                        Display Theme
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {THEME_OPTIONS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setThemeMode(t.id)}
                            className={`px-2.5 py-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1.5 ${
                              themeMode === t.id
                                ? 'border-[var(--accent-secondary)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                                : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-slate-300"
                              style={{ backgroundColor: t.swatch }}
                            />
                            <span>
                              {t.id === 'light' ? 'Light' : t.id === 'parchment' ? 'Parchment' : 'Dark'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                        Colour Palette
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {ACCENT_OPTIONS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setAccentPalette(c.id)}
                            className={`px-2.5 py-2 rounded-lg text-xs border flex items-center gap-2 ${
                              accentPalette === c.id
                                ? 'border-[var(--accent-secondary)] bg-[var(--bg-elevated)] font-semibold text-[var(--text-primary)]'
                                : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
                            }`}
                          >
                            <span className="flex shrink-0">
                              <span
                                className="w-3 h-3 rounded-l-sm inline-block"
                                style={{ backgroundColor: c.primary }}
                              />
                              <span
                                className="w-3 h-3 rounded-r-sm inline-block"
                                style={{ backgroundColor: c.secondary }}
                              />
                            </span>
                            <span className="truncate">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)]">
              {firebaseUser ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {profile?.displayName || firebaseUser.displayName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {firebaseUser.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg border border-[var(--border-hairline)]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signInWithGoogle();
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

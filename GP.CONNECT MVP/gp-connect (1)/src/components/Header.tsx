import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Plane, User, Globe, ShieldAlert, LogOut, ArrowRight, Layers, Menu, X } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activePage }) => {
  const { currentUser, switchRole, logoutUser, activeLanguage, setLanguage } = useAppState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as any);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8E8E8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex items-center gap-2 cursor-pointer group animate-fade-in"
          id="nav-logo"
        >
          <div className="w-8 h-8 bg-[#E5231B] rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-105">
            <div className="w-4 h-4 bg-white transform rotate-45"></div>
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-[#0A0A0A] uppercase">
            GP <span className="text-[#E5231B]">Connect</span>
          </span>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#0A0A0A]">
          <button 
            onClick={() => onNavigate('landing')} 
            className={`transition-colors hover:text-[#E5231B] ${activePage === 'landing' ? 'text-[#E5231B]' : 'text-gray-600'}`}
          >
            Accueil
          </button>
          {currentUser && (
            <>
              {currentUser.role === 'CLIENT' && (
                <button 
                  onClick={() => onNavigate('client-dashboard')}
                  className={`transition-colors hover:text-[#E5231B] ${activePage === 'client-dashboard' ? 'text-[#E5231B] font-semibold' : 'text-gray-600'}`}
                >
                  Tableau de bord Client
                </button>
              )}
              {currentUser.role === 'GP' && (
                <button 
                  onClick={() => onNavigate('gp-dashboard')}
                  className={`transition-colors hover:text-[#E5231B] ${activePage === 'gp-dashboard' ? 'text-[#E5231B] font-semibold' : 'text-gray-600'}`}
                >
                  Espace Grand Passager
                </button>
              )}
              {currentUser.role === 'ADMIN' && (
                <button 
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`transition-colors hover:text-[#E5231B] flex items-center gap-1 ${activePage === 'admin-dashboard' ? 'text-[#E5231B] font-semibold' : 'text-gray-600'}`}
                >
                  <ShieldAlert className="h-4 w-4 text-[#E5231B]" />
                  Administration
                </button>
              )}
            </>
          )}
        </nav>

        {/* AUTH BUTTONS / PROFILE ACTIONS */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div 
                className="hidden lg:flex flex-col items-end cursor-pointer"
                onClick={() => {
                  if (currentUser.role === 'CLIENT') onNavigate('client-dashboard');
                  else if (currentUser.role === 'GP') onNavigate('gp-dashboard');
                  else onNavigate('admin-dashboard');
                }}
              >
                <span className="text-xs font-semibold text-[#0A0A0A]">
                  {currentUser.prenom} {currentUser.nom}
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono mt-0.5">
                  {currentUser.role}
                </span>
              </div>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.nom} 
                onClick={() => {
                  if (currentUser.role === 'CLIENT') onNavigate('client-dashboard');
                  else if (currentUser.role === 'GP') onNavigate('gp-dashboard');
                  else onNavigate('admin-dashboard');
                }}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100 cursor-pointer hover:opacity-95"
              />
              <button 
                onClick={() => {
                  logoutUser();
                  onNavigate('landing');
                }}
                className="p-2 text-gray-400 hover:text-[#E5231B] transition-colors rounded-lg hover:bg-gray-50"
                title="Se déconnecter"
                id="btn-logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigate('login')} 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#E5231B] transition-colors"
                id="btn-login-header"
              >
                Connexion
              </button>
              <button 
                onClick={() => onNavigate('signup')} 
                className="px-4 py-2 text-sm font-bold text-white bg-[#E5231B] hover:bg-[#C91A14] transition-all rounded-[10px] flex items-center gap-1 shadow-xs"
                id="btn-signup-header"
              >
                Inscription <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-[#E5231B] transition-colors rounded-lg hover:bg-gray-50 ml-1 shrink-0 cursor-pointer"
          aria-label="Toggle Menu"
          id="btn-mobile-menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E8E8] bg-white px-4 py-3 space-y-2 animate-fade-in">
          <button 
            onClick={() => {
              onNavigate('landing');
              setIsMobileMenuOpen(false);
            }} 
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activePage === 'landing' ? 'bg-red-50 text-[#E5231B]' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Accueil
          </button>
          
          {currentUser && (
            <>
              {currentUser.role === 'CLIENT' && (
                <button 
                  onClick={() => {
                    onNavigate('client-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activePage === 'client-dashboard' ? 'bg-red-50 text-[#E5231B]' : 'text-gray-700 hover:bg-gray-550'}`}
                >
                  Tableau de bord Client
                </button>
              )}
              {currentUser.role === 'GP' && (
                <button 
                  onClick={() => {
                    onNavigate('gp-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${activePage === 'gp-dashboard' ? 'bg-red-50 text-[#E5231B]' : 'text-gray-75 hover:bg-gray-50'}`}
                >
                  Espace Grand Passager
                </button>
              )}
              {currentUser.role === 'ADMIN' && (
                <button 
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${activePage === 'admin-dashboard' ? 'bg-red-50 text-[#E5231B]' : 'text-gray-750 hover:bg-gray-50'}`}
                >
                  <ShieldAlert className="h-4 w-4 text-[#E5231B]" />
                  <span>Administration</span>
                </button>
              )}
            </>
          )}

          {currentUser && (
            <div className="border-t border-gray-100 pt-3 mt-2 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <img src={currentUser.avatar} alt={currentUser.nom} className="h-8 w-8 rounded-full object-cover" />
                <span className="text-xs font-semibold text-gray-700">{currentUser.prenom} {currentUser.nom}</span>
              </div>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono uppercase">{currentUser.role}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

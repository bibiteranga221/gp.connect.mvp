import React, { useState } from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { ClientDashboard } from './components/ClientDashboard';
import { GPDashboard } from './components/GPDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function MainAppContent() {
  const { currentUser, activeLanguage } = useAppState();
  const [currentPage, setCurrentPage] = useState<string>('landing');

  // Search parameters to propagate from Landing page to search GP page
  const [searchDepart, setSearchDepart] = useState('');
  const [searchArrivee, setSearchArrivee] = useState('');
  const [searchType, setSearchType] = useState('');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleSearchGPFromLanding = (depart: string, arrivee: string, type: string) => {
    setSearchDepart(depart);
    setSearchArrivee(arrivee);
    setSearchType(type);
    
    // Auto translate role if they aren't logged in, log in Amadou as demo client or guide to auth
    if (!currentUser) {
      setCurrentPage('login');
    } else {
      setCurrentPage('client-dashboard');
    }
  };

  // Safe view helper
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            onNavigate={handleNavigate} 
            onSearchGP={handleSearchGPFromLanding} 
          />
        );

      case 'login':
        return (
          <AuthPage 
            initialMode="login" 
            onNavigate={handleNavigate} 
          />
        );

      case 'signup':
        return (
          <AuthPage 
            initialMode="signup" 
            onNavigate={handleNavigate} 
          />
        );

      case 'client-dashboard':
        return (
          <ClientDashboard 
            initialSearchDepart={searchDepart}
            initialSearchArrivee={searchArrivee}
            initialSearchType={searchType}
          />
        );

      case 'gp-dashboard':
        return <GPDashboard />;

      case 'admin-dashboard':
        return <AdminDashboard />;

      default:
        return (
          <LandingPage 
            onNavigate={handleNavigate} 
            onSearchGP={handleSearchGPFromLanding} 
          />
        );
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between selection:bg-[#E5231B] selection:text-white">
      <div>
        <Header activePage={currentPage} onNavigate={handleNavigate} />
        <main>{renderCurrentView()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <MainAppContent />
    </StateProvider>
  );
}

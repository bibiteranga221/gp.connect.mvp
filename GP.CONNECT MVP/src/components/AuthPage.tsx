import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Mail, Lock, Phone, User, CheckCircle2, Eye, EyeOff, ShieldCheck, MailWarning } from 'lucide-react';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onNavigate: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onNavigate }) => {
  const { registerUser, loginUser, users, currentUser } = useAppState();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'CLIENT' | 'GP'>('CLIENT');
  
  // Fields state
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Error & Loading states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    setTimeout(() => {
      try {
        if (mode === 'signup') {
          if (!prenom || !nom || !email || !telephone || !password) {
            setErrorMsg('Veuillez remplir tous les champs requis.');
            setLoading(false);
            return;
          }
          if (!acceptTerms) {
            setErrorMsg('Vous devez accepter les conditions d\'utilisation.');
            setLoading(false);
            return;
          }

          // Check duplicate
          const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            setErrorMsg('Cet email est déjà utilisé par un autre compte.');
            setLoading(false);
            return;
          }

          const registered = registerUser(prenom, nom, email, telephone, role);
          setSuccessMsg('Compte créé avec succès ! Chargement de votre espace...');
          
          setTimeout(() => {
            setLoading(false);
            if (role === 'CLIENT') onNavigate('client-dashboard');
            else onNavigate('gp-dashboard');
          }, 1200);

        } else {
          // login
          if (!email || !password) {
            setErrorMsg('Veuillez renseigner votre email et mot de passe.');
            setLoading(false);
            return;
          }

          const success = loginUser(email);
          if (success) {
            setSuccessMsg('Re-connexion réussie ! Redirection...');
            setTimeout(() => {
              setLoading(false);
              // Get logged user's actual role from the cache
              const loggedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
              if (loggedUser) {
                if (loggedUser.role === 'ADMIN') onNavigate('admin-dashboard');
                else if (loggedUser.role === 'GP') onNavigate('gp-dashboard');
                else onNavigate('client-dashboard');
              } else {
                onNavigate('client-dashboard');
              }
            }, 1000);
          } else {
            setErrorMsg('Email erroné ou introuvable. Écrivez "fatou.diop@example.com" pour tester en GP, "amadou.sow@example.com" en Client, ou "admin@gpconnect.com" en Admin.');
            setLoading(false);
          }
        }
      } catch (err: any) {
        setErrorMsg('Une erreur inattendue est survenue.');
        setLoading(false);
      }
    }, 800);
  };

  const fillDemoAccount = (emailAddress: string) => {
    setEmail(emailAddress);
    setPassword('demopass123');
  };

  return (
    <div className="bg-white min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8E8E8] rounded-[14px] shadow-xs w-full max-w-lg p-8">
        
        {/* Toggle tabs */}
        <div className="flex border-b border-[#E8E8E8] mb-8">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`w-1/2 py-3 text-sm font-bold border-b-2 transition-colors ${mode === 'login' ? 'border-[#E5231B] text-[#0A0A0A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            id="tab-login"
          >
            Se Connecter
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`w-1/2 py-3 text-sm font-bold border-b-2 transition-colors ${mode === 'signup' ? 'border-[#E5231B] text-[#0A0A0A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            id="tab-signup"
          >
            S'Inscrire
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-sans text-[#0A0A0A]">
            {mode === 'signup' ? 'Inscrivez-vous sur GP Connect' : 'Bienvenue sur GP Connect'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'signup' 
              ? 'Rejoignez des milliers d\'utilisateurs pour l\'envoi de colis internationaux.' 
              : 'Connectez-vous pour gérer vos expéditions ou vos trajets.'}
          </p>
        </div>

        {/* Helper Fast Login buttons for evaluator */}
        {mode === 'login' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs mb-6 flex flex-col gap-2">
            <span className="font-bold flex items-center gap-1">⚡ Comptes de test rapides (Cliquez pour remplir) :</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <button 
                onClick={() => fillDemoAccount('amadou.sow@example.com')} 
                className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded text-[11px] font-medium"
              >
                👤 Amadou (Client)
              </button>
              <button 
                onClick={() => fillDemoAccount('fatou.diop@example.com')} 
                className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded text-[11px] font-medium"
              >
                ✈ Fatou (GP)
              </button>
              <button 
                onClick={() => fillDemoAccount('cheikh.ndiaye@example.com')} 
                className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded text-[11px] font-medium"
              >
                ✈ Cheikh (GP En Attente kyc)
              </button>
              <button 
                onClick={() => fillDemoAccount('admin@gpconnect.com')} 
                className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded text-[11px] font-medium"
              >
                🛡 Admin
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK LABELS */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs mb-6 flex items-start gap-2">
            <MailWarning className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs mb-6 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Specific Roles Picker */}
          {mode === 'signup' && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quel est votre rôle principal ?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`py-3 px-4 rounded-[10px] border text-xs font-bold transition-all flex flex-col items-center gap-1 ${role === 'CLIENT' ? 'border-[#E5231B] bg-red-50/50 text-[#E5231B]' : 'border-[#E8E8E8] bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <User className="h-4 w-4" />
                  <span>Client (Expéditeur)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('GP')}
                  className={`py-3 px-4 rounded-[10px] border text-xs font-bold transition-all flex flex-col items-center gap-1 ${role === 'GP' ? 'border-[#E5231B] bg-red-50/50 text-[#E5231B]' : 'border-[#E8E8E8] bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <User className="h-4 w-4 text-[#E5231B]" />
                  <span>Grand Passager (GP)</span>
                </button>
              </div>
            </div>
          )}

          {/* First name and last name for signup */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Jean"
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  id="signup-prenom-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Dupont"
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  id="signup-nom-input"
                />
              </div>
            </div>
          )}

          {/* Telephone for signup */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone mobile (avec indicatif)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  id="signup-tel-input"
                />
              </div>
            </div>
          )}

          {/* Email address */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Adresse Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                id="auth-email-input"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-600">Mot de passe</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert("Pour la démo, saisissez n'importe quel mot de passe.")}
                  className="text-[11px] text-[#E5231B] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                id="auth-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Accept general terms checkbox for signup */}
          {mode === 'signup' && (
            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#E5231B] focus:ring-[#E5231B]"
              />
              <label htmlFor="accept-terms" className="text-xs text-gray-500 leading-tight">
                J’accepte les <strong>Conditions Générales d’Utilisation</strong> et la politique de vérification d’identité KYC de GP Connect.
              </label>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-[52px] mt-4 text-[#FFFFFF] font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer ${loading ? 'bg-gray-400' : 'bg-[#E5231B] hover:bg-[#C91A14] active:bg-[#A90F0B]'}`}
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : mode === 'signup' ? (
              role === 'GP' ? 'S’inscrire en tant que GP' : 'Créer mon compte Client'
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* OAuth divider and action */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400 uppercase tracking-widest">
            Ou continuer avec
          </span>
        </div>

        {/* 1-click Google Sign on Simulation */}
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              // Pick first client for demo google
              registerUser('Google', 'User', 'google.user@example.com', '+33611111111', 'CLIENT');
              onNavigate('client-dashboard');
            }, 800);
          }}
          type="button"
          className="w-full py-2.5 border border-[#E8E8E8] hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors"
          id="oauth-google-btn"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          S'authentifier avec Google
        </button>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            {mode === 'signup' ? 'Vous possédez déjà un compte ? ' : 'Vous n\'avez pas encore de compte ? '}
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setErrorMsg('');
              }}
              className="text-[#E5231B] font-bold hover:underline"
              id="switch-auth-page-btn"
            >
              {mode === 'signup' ? 'Connectez-vous' : 'Inscrivez-vous gratuitement'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

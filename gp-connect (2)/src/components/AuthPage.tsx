import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Mail, Lock, Phone, User, CheckCircle2, Eye, EyeOff, ShieldCheck, MailWarning, Package, Plane, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onNavigate: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onNavigate }) => {
  const { registerUser, loginUser, users } = useAppState();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'CLIENT' | 'GP' | null>(null);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  
  // Fields state
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Error & Loading states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-specific validation states
  const [emailError, setEmailError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [blankFields, setBlankFields] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setEmailError('');
    setPasswordMatchError('');
    const blanks: Record<string, boolean> = {};

    if (mode === 'signup') {
      let hasError = false;

      // Checking for blanks
      if (!prenom) { blanks.prenom = true; hasError = true; }
      if (!nom) { blanks.nom = true; hasError = true; }
      if (!email) { blanks.email = true; hasError = true; }
      if (!telephone) { blanks.telephone = true; hasError = true; }
      if (!password) { blanks.password = true; hasError = true; }
      if (!confirmPassword) { blanks.confirmPassword = true; hasError = true; }
      
      setBlankFields(blanks);

      if (hasError) {
        setErrorMsg('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      // Check passwords match
      if (password !== confirmPassword) {
        setPasswordMatchError('Les mots de passe ne correspondent pas.');
        return;
      }

      // Check accepting terms
      if (!acceptTerms) {
        setErrorMsg('Vous devez accepter les conditions d\'utilisation pour vous inscrire.');
        return;
      }

      // Check duplicate email
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setEmailError('Cet email est déjà utilisé par un autre compte.');
        setErrorMsg('L\'adresse email est déjà rattachée à un compte.');
        return;
      }

      if (!role) {
        setErrorMsg('Veuillez sélectionner un rôle.');
        return;
      }

      setLoading(true);

      setTimeout(() => {
        try {
          const registered = registerUser(prenom, nom, email, telephone, role);
          setSuccessMsg('Compte créé avec succès ! Bienvenue sur GP Connect, redirection...');
          
          setTimeout(() => {
            setLoading(false);
            if (role === 'CLIENT') onNavigate('client-dashboard');
            else onNavigate('gp-dashboard');
          }, 1500);
        } catch (err) {
          setErrorMsg('Une erreur est survenue lors de l\'enregistrement.');
          setLoading(false);
        }
      }, 800);

    } else {
      // login
      if (!email) blanks.email = true;
      if (!password) blanks.password = true;
      setBlankFields(blanks);

      if (!email || !password) {
        setErrorMsg('Veuillez renseigner votre email et mot de passe.');
        return;
      }

      setLoading(true);

      setTimeout(() => {
        try {
          const success = loginUser(email);
          if (success) {
            setSuccessMsg('Re-connexion réussie ! Redirection...');
            setTimeout(() => {
              setLoading(false);
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
        } catch (err: any) {
          setErrorMsg('Une erreur est survenue lors de la connexion.');
          setLoading(false);
        }
      }, 800);
    }
  };



  return (
    <div className="bg-white min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8E8E8] rounded-[14px] shadow-xs w-full max-w-lg p-8">
        
        {/* Toggle tabs (only if NOT on step 2 of signup to preserve clean flow) */}
        {!(mode === 'signup' && signupStep === 2) && (
          <div className="flex border-b border-[#E8E8E8] mb-8">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setEmailError('');
                setPasswordMatchError('');
                setBlankFields({});
              }}
              className={`w-1/2 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${mode === 'login' ? 'border-[#E5231B] text-[#0A0A0A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              id="tab-login"
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setSignupStep(1);
                setErrorMsg('');
                setEmailError('');
                setPasswordMatchError('');
                setBlankFields({});
              }}
              className={`w-1/2 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${mode === 'signup' ? 'border-[#E5231B] text-[#0A0A0A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              id="tab-signup"
            >
              S'Inscrire
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          {mode === 'login' ? (
            <>
              {/* Centered logo */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-[#E5231B] rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white transform rotate-45"></div>
                </div>
                <span className="font-sans font-bold text-2xl tracking-tight text-[#0A0A0A] uppercase">
                  GP <span className="text-[#E5231B]">Connect</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold font-sans text-[#0A0A0A]">
                Bon retour parmi nous
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Connectez-vous pour gérer vos expéditions ou vos trajets.
              </p>
            </>
          ) : (
            <>
              {mode === 'signup' && signupStep === 1 ? (
                <h2 className="text-2xl font-bold font-sans text-[#0A0A0A]">
                  Vous êtes ?
                </h2>
              ) : (
                <h2 className="text-2xl font-bold font-sans text-[#0A0A0A]">
                  {mode === 'signup' 
                    ? (role === 'GP' ? 'Création de compte GP' : 'Création de compte Client') 
                    : 'Bienvenue sur GP Connect'}
                </h2>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'signup' 
                  ? (signupStep === 1 
                      ? 'Étape 1 : Choisissez votre profil d\'utilisation.' 
                      : `Étape 2 : Renseignez vos informations de compte ${role === 'GP' ? 'Grand Passager (GP)' : 'Client (Expéditeur)'}.`)
                  : 'Connectez-vous pour gérer vos expéditions ou vos trajets.'}
              </p>
            </>
          )}
        </div>



        {/* FEEDBACK LABELS */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs mb-6 flex items-start gap-2">
            <MailWarning className="h-4 w-4 shrink-0 mt-0.5 text-[#E5231B]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs mb-6 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: CHOOSE ROLE for SIGNUP */}
        {mode === 'signup' && signupStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card CLIENT */}
              <button
                type="button"
                onClick={() => {
                  setRole('CLIENT');
                  setErrorMsg('');
                }}
                className={`py-6 px-4 rounded-[14px] border text-left transition-all flex flex-col gap-3 group relative cursor-pointer ${
                  role === 'CLIENT' 
                    ? 'border-[2px] border-[#E5231B] bg-[#FFF5F5] ring-2 ring-red-100' 
                    : 'border-[#E8E8E8] bg-white text-gray-500 hover:bg-gray-50'
                }`}
                style={{ minHeight: '160px' }}
              >
                <div className={`p-2.5 rounded-full w-fit transition-colors ${
                  role === 'CLIENT' ? 'bg-[#E5231B] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0A0A0A] mb-1">
                    CLIENT
                  </h4>
                  <p className="font-semibold text-xs text-gray-800 mb-1">
                    J'envoie des colis
                  </p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Trouvez un GP et envoyez vos colis en toute confiance
                  </p>
                </div>
              </button>

              {/* Card GP */}
              <button
                type="button"
                onClick={() => {
                  setRole('GP');
                  setErrorMsg('');
                }}
                className={`py-6 px-4 rounded-[14px] border text-left transition-all flex flex-col gap-3 group relative cursor-pointer ${
                  role === 'GP' 
                    ? 'border-[2px] border-[#E5231B] bg-[#FFF5F5] ring-2 ring-red-100' 
                    : 'border-[#E8E8E8] bg-white text-gray-500 hover:bg-gray-50'
                }`}
                style={{ minHeight: '160px' }}
              >
                <div className={`p-2.5 rounded-full w-fit transition-colors ${
                  role === 'GP' ? 'bg-[#E5231B] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0A0A0A] mb-1">
                    GP
                  </h4>
                  <p className="font-semibold text-xs text-gray-800 mb-1">
                    Je transporte des colis
                  </p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Publiez vos trajets et gagnez de l'argent
                  </p>
                </div>
              </button>

            </div>

            {/* STEP 1 "Continuer" Button */}
            <button
              type="button"
              onClick={() => setSignupStep(2)}
              disabled={!role}
              className={`w-full h-[52px] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role 
                  ? 'bg-[#E5231B] hover:bg-[#C91A14] active:bg-[#A90F0B]' 
                  : 'bg-gray-250 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2 or LOGIN: FORM ELEMENT */}
        {((mode === 'signup' && signupStep === 2) || mode === 'login') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Back button for step 2 of signup */}
            {mode === 'signup' && signupStep === 2 && (
              <button
                type="button"
                onClick={() => {
                  setSignupStep(1);
                  setErrorMsg('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 pb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Retour au choix du rôle ({role})</span>
              </button>
            )}

            {/* First name and last name for signup */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => {
                      setPrenom(e.target.value);
                      if (e.target.value) setBlankFields(prev => ({ ...prev, prenom: false }));
                    }}
                    placeholder="Jean"
                    className={`w-full bg-white border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A] ${
                      blankFields.prenom ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                    }`}
                    id="signup-prenom-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      if (e.target.value) setBlankFields(prev => ({ ...prev, nom: false }));
                    }}
                    placeholder="Dupont"
                    className={`w-full bg-white border rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A] ${
                      blankFields.nom ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                    }`}
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
                    value={telephone}
                    onChange={(e) => {
                      setTelephone(e.target.value);
                      if (e.target.value) setBlankFields(prev => ({ ...prev, telephone: false }));
                    }}
                    placeholder="+221 77 123 45 67"
                    className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A] ${
                      blankFields.telephone ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                    }`}
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                    if (e.target.value) setBlankFields(prev => ({ ...prev, email: false }));
                  }}
                  placeholder="nom@exemple.com"
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-[#0A0A0A] text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    blankFields.email || emailError ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                  }`}
                  id="auth-email-input"
                />
              </div>
              {emailError && (
                <p className="text-[11px] text-[#E5231B] font-semibold mt-1 flex items-center gap-1">
                  ⚠ {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-600">Mot de passe</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert("Pour la démo, saisissez n'importe quel mot de passe.")}
                    className="text-[11px] text-[#E5231B] hover:underline cursor-pointer"
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value) setBlankFields(prev => ({ ...prev, password: false }));
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A] ${
                    blankFields.password ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                  }`}
                  id="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirmer mot de passe</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordMatchError('');
                      if (e.target.value) setBlankFields(prev => ({ ...prev, confirmPassword: false }));
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-white border rounded-[10px] pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A] ${
                      blankFields.confirmPassword || passwordMatchError ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                    }`}
                    id="signup-confirmpassword-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordMatchError && (
                  <p className="text-[11px] text-[#E5231B] font-semibold mt-1 flex items-center gap-1">
                    ⚠ {passwordMatchError}
                  </p>
                )}
              </div>
            )}

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
                  J'accepte les <strong>conditions d'utilisation</strong> de la plateforme GP Connect.
                </label>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[52px] mt-4 text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E5231B] hover:bg-[#C91A14] active:bg-[#A90F0B]'
              }`}
              id="auth-submit-btn"
            >
              {loading ? (
                <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : mode === 'signup' ? (
                'Créer mon compte'
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        )}

        {/* OAuth divider and action */}
        {!(mode === 'signup' && signupStep === 1) && (
          <>
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-400 uppercase tracking-widest">
                Ou continuer avec
              </span>
            </div>

            {/* Google Sign in */}
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  registerUser('Google', 'User', 'google.user@example.com', '+33611111111', role || 'CLIENT');
                  onNavigate('client-dashboard');
                }, 800);
              }}
              type="button"
              className="w-full py-2.5 border border-[#E8E8E8] hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
          </>
        )}

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            {mode === 'signup' ? 'Déjà un compte ? ' : 'Vous n\'avez pas encore de compte ? '}
            <button
              type="button"
              onClick={() => {
                const target = mode === 'signup' ? 'login' : 'signup';
                setMode(target);
                if (target === 'signup') setSignupStep(1);
                setErrorMsg('');
                setEmailError('');
                setPasswordMatchError('');
                setBlankFields({});
              }}
              className="text-[#E5231B] font-bold hover:underline cursor-pointer"
              id="switch-auth-page-btn"
            >
              {mode === 'signup' ? 'Se connecter' : 'Inscrivez-vous gratuitement'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Plane, ArrowRight, ArrowLeft, Mail, Lock, Phone, User, CheckCircle2, MailWarning } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Lazy initialize supabase using environment variables to avoid crash
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function InscriptionPage() {
  const router = useRouter();

  const [role, setRole] = useState<'CLIENT' | 'GP' | null>(null);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  // Form Fields state
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [blankFields, setBlankFields] = useState<Record<string, boolean>>({});
  const [successToast, setSuccessToast] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');
    setPasswordMatchError('');
    const blanks: Record<string, boolean> = {};

    // 1. Validator blanks
    if (!prenom) blanks.prenom = true;
    if (!nom) blanks.nom = true;
    if (!email) blanks.email = true;
    if (!telephone) blanks.telephone = true;
    if (!password) blanks.password = true;
    if (!confirmPassword) blanks.confirmPassword = true;

    setBlankFields(blanks);

    if (Object.keys(blanks).length > 0) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // 2. Validate passwords match
    if (password !== confirmPassword) {
      setPasswordMatchError('Les mots de passe ne correspondent pas.');
      return;
    }

    // 3. Terms confirm
    if (!acceptTerms) {
      setErrorMsg('Vous devez accepter les conditions d’utilisation.');
      return;
    }

    if (!supabase) {
      // Offline Simulation or fallback if Supabase credentials are missing
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessToast(true);
        setTimeout(() => {
          if (role === 'GP') {
            router.push('/dashboard/gp');
          } else {
            router.push('/dashboard/client');
          }
        }, 1500);
      }, 1000);
      return;
    }

    setLoading(true);

    try {
      // Step A: SignUp with supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: prenom,
            last_name: nom,
            phone_number: telephone,
          }
        }
      });

      if (error) {
        setLoading(false);
        const errLower = error.message.toLowerCase();
        if (errLower.includes('already registered') || errLower.includes('user already exists')) {
          setEmailError('Email déjà rattaché à un compte.');
          setErrorMsg('Cette adresse email est déjà rattachée à un compte existant.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data?.user) {
        // Step B: Insert dans la table users
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            role: role,
            nom: `${prenom} ${nom}`,
            email: email,
            telephone: telephone,
            created_at: new Date().toISOString(),
          });

        if (dbError) {
          setLoading(false);
          setErrorMsg(`Erreur base de données: ${dbError.message}`);
          return;
        }

        setSuccessToast(true);

        setTimeout(() => {
          setLoading(false);
          if (role === 'CLIENT') {
            router.push('/dashboard/client');
          } else {
            router.push('/dashboard/gp');
          }
        }, 1500);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Une erreur est survenue lors de l’inscription.');
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center p-4 font-sans text-[#0A0A0A]">
      <div className="w-full max-w-md p-8 bg-white border border-[#E8E8E8] rounded-[14px] shadow-sm flex flex-col">
        
        {/* Header Title depending on steps */}
        <div className="text-center mb-6">
          {signupStep === 1 ? (
            <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
              Vous êtes ?
            </h1>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
              Création de compte {role === 'GP' ? 'Grand Passager' : 'Client'}
            </h1>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {signupStep === 1 
              ? 'Étape 1 : Choisissez votre profil d\'utilisation.' 
              : 'Étape 2 : Renseignez vos informations de compte.'}
          </p>
        </div>

        {/* Global errors panel */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#E5231B] p-3 rounded-[10px] text-xs mb-4 flex items-start gap-2">
            <MailWarning className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success toast after registration */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-[10px] text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-bold">Compte créé avec succès ! Redirection en cours...</span>
          </div>
        )}

        {/* STEP 1 - ROLE SWITCHER SELECTOR */}
        {signupStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              
              {/* Card CLIENT */}
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`py-5 px-4 rounded-[14px] border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  role === 'CLIENT' 
                    ? 'border-[2px] border-[#E5231B] bg-[#FFF5F5] ring-1 ring-red-100' 
                    : 'border-[#E8E8E8] bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full shrink-0 ${
                  role === 'CLIENT' ? 'bg-[#E5231B] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0A0A0A] mb-0.5">J'envoie des colis</h3>
                  <p className="text-xs text-gray-600 font-semibold mb-1">CLIENT (Expéditeur)</p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Trouvez un GP et envoyez vos colis en toute confiance
                  </p>
                </div>
              </button>

              {/* Card GP */}
              <button
                type="button"
                onClick={() => setRole('GP')}
                className={`py-5 px-4 rounded-[14px] border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  role === 'GP' 
                    ? 'border-[2px] border-[#E5231B] bg-[#FFF5F5] ring-1 ring-red-100' 
                    : 'border-[#E8E8E8] bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full shrink-0 ${
                  role === 'GP' ? 'bg-[#E5231B] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0A0A0A] mb-0.5">Je transporte des colis</h3>
                  <p className="text-xs text-gray-600 font-semibold mb-1">GP (Grand Passager)</p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Publiez vos trajets et gagnez de l'argent
                  </p>
                </div>
              </button>

            </div>

            {/* Step 1 Continuer action button */}
            <button
              type="button"
              onClick={() => setSignupStep(2)}
              disabled={!role}
              className={`w-full h-[52px] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role 
                  ? 'bg-[#E5231B] hover:bg-[#C91A14] active:bg-[#A90F0B]' 
                  : 'bg-gray-250 text-gray-400 cursor-not-allowed border border-gray-250'
              }`}
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2 - COMPILATION OF FIELDS */}
        {signupStep === 2 && (
          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Return Step 1 button */}
            <button
              type="button"
              onClick={() => setSignupStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-850 pb-2 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Retour</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Prénom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => {
                    setPrenom(e.target.value);
                    if (e.target.value) setBlankFields(prev => ({ ...prev, prenom: false }));
                  }}
                  placeholder="Jean"
                  className={`w-full bg-white border rounded-[10px] px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    blankFields.prenom ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => {
                    setNom(e.target.value);
                    if (e.target.value) setBlankFields(prev => ({ ...prev, nom: false }));
                  }}
                  placeholder="Dupont"
                  className={`w-full bg-white border rounded-[10px] px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    blankFields.nom ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone mobile (avec indicatif)</label>
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
                  placeholder="+33 6 12 34 56 78"
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    blankFields.telephone ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse Email</label>
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
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    blankFields.email || emailError ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                  ⚠ {emailError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mot de passe</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value) setBlankFields(prev => ({ ...prev, password: false }));
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                      blankFields.password ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmer mot de passe</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordMatchError('');
                      if (e.target.value) setBlankFields(prev => ({ ...prev, confirmPassword: false }));
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                      blankFields.confirmPassword || passwordMatchError ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                    }`}
                  />
                </div>
              </div>
            </div>
            {passwordMatchError && (
              <p className="text-[11px] text-[#E5231B] font-semibold mt-0.5">
                ⚠ {passwordMatchError}
              </p>
            )}

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#E5231B] focus:ring-[#E5231B]"
              />
              <label htmlFor="accept-terms" className="text-xs text-gray-500 leading-tight">
                J'accepte les conditions d'utilisation de la plateforme.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[52px] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E5231B] hover:bg-[#C91A14] active:bg-[#A90F0B]'
              }`}
            >
              {loading ? (
                <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>
        )}

        {/* Foot link to login */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 font-sans">
            Déjà un compte ?{' '}
            <a href="/auth/connexion" className="text-[#E5231B] font-bold hover:underline">
              Se connecter
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

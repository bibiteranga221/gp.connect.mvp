'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, MailWarning, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Lazy initialize supabase using environment variables to avoid crash
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function ConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error & Toast state
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [blankFields, setBlankFields] = useState<Record<string, boolean>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');
    setPasswordError('');
    const blanks: Record<string, boolean> = {};

    if (!email) blanks.email = true;
    if (!password) blanks.password = true;
    setBlankFields(blanks);

    if (!email || !password) {
      setErrorMsg('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    if (!supabase) {
      // Offline Simulation or fallback if Supabase credentials are missing
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessToast(true);
        setTimeout(() => {
          // Simulation demo redirections
          if (email.includes('gp')) {
            router.push('/dashboard/gp');
          } else if (email.includes('admin')) {
            router.push('/admin');
          } else {
            router.push('/dashboard/client');
          }
        }, 1500);
      }, 1000);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        const code = error.message.toLowerCase();
        if (code.includes('invalid login') || code.includes('invalid credentials')) {
          setEmailError('Identifiants incorrects');
          setPasswordError('Mot de passe incorrect');
          setErrorMsg('Email ou mot de passe incorrect.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data?.user) {
        // Retrieve the role from the users table rattaché to this uuid
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !userProfile) {
          // Fallback if no profile is found
          setLoading(false);
          setErrorMsg('Votre profil n’a pas pu être chargé depuis la base de données.');
          return;
        }

        setSuccessToast(true);

        setTimeout(() => {
          setLoading(false);
          const role = userProfile.role?.toUpperCase();
          if (role === 'CLIENT') {
            router.push('/dashboard/client');
          } else if (role === 'GP') {
            router.push('/dashboard/gp');
          } else if (role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push('/dashboard/client'); // default
          }
        }, 1500);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center p-4 font-sans text-[#0A0A0A]">
      <div className="w-full max-w-md p-8 bg-white border border-[#E8E8E8] rounded-[14px] shadow-sm flex flex-col">
        
        {/* LOGO */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#E5231B] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white transform rotate-45"></div>
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-[#0A0A0A] uppercase">
              GP <span className="text-[#E5231B]">Connect</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A] text-center">
            Bon retour parmi nous
          </h1>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Connectez-vous pour continuer vers votre espace de gestion.
          </p>
        </div>

        {/* Global Errors Panel */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#E5231B] p-3 rounded-[10px] text-xs mb-4 flex items-start gap-2">
            <MailWarning className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="bg-[#FFF5F5] border border-red-200 text-[#E5231B] p-3 rounded-[10px] text-xs mb-4 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#E5231B]" />
            <span className="font-bold">Connexion réussie ! Redirection en cours...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email input field */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Adresse Email
            </label>
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
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                ⚠ {emailError}
              </p>
            )}
          </div>

          {/* Password input field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-600">
                Mot de passe
              </label>
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Veuillez réinitialiser votre mot de passe via Supabase Auth.");
                }}
                className="text-[11px] text-[#E5231B] hover:underline"
              >
                Mot de passe oublié ?
              </a>
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
                  setPasswordError('');
                  if (e.target.value) setBlankFields(prev => ({ ...prev, password: false }));
                }}
                placeholder="••••••••"
                className={`w-full bg-white border rounded-[10px] pl-9 pr-10 py-2 text-[#0A0A0A] text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                  blankFields.password || passwordError ? 'border-red-500 ring-1 ring-red-200' : 'border-[#E8E8E8]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                ⚠ {passwordError}
              </p>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-[52px] mt-2 text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E5231B] hover:bg-[#C91A14] active:bg-[#A90F0B]'
            }`}
          >
            {loading ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Bottom Link for Navigation */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Pas encore de compte ?{' '}
            <a href="/auth/inscription" className="text-[#E5231B] font-bold hover:underline">
              S'inscrire
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

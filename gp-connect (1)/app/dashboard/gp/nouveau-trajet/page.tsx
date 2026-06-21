'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Loader2, Plane, Calendar, Scale, DollarSign, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const COLIS_TYPES = [
  { id: 'documents', label: 'Documents' },
  { id: 'vetements', label: 'Vêtements' },
  { id: 'electronique', label: 'Électronique' },
  { id: 'medicaments', label: 'Médicaments' },
  { id: 'alimentation', label: 'Alimentation' },
  { id: 'autre', label: 'Autre' },
];

export default function NouveauTrajetPage() {
  const router = useRouter();

  // Authentication & authorization states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');

  // Form Fields
  const [villeDepart, setVilleDepart] = useState('');
  const [villeArrivee, setVilleArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [poidsDisponible, setPoidsDisponible] = useState('');
  const [prixParKg, setPrixParKg] = useState('');
  const [colisAcceptes, setColisAcceptes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Validation / Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      // Mock / fallback preview experience when Supabase is offline/not configured
      setTimeout(() => {
        setUserId('demo-gp-user-id');
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/connexion');
        return;
      }

      // Check role in DB to verify GP auth
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        router.push('/auth/connexion');
        return;
      }

      const role = userProfile.role?.toUpperCase();
      if (role === 'CLIENT') {
        router.push('/dashboard/client');
        return;
      }

      setUserId(user.id);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setColisAcceptes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    // Clear inline error for types if any
    if (errors.colis) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.colis;
        return copy;
      });
    }
  };

  const validateForm = (): boolean => {
    const inlineErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!villeDepart.trim()) {
      inlineErrors.villeDepart = 'Veuillez renseigner la ville de départ.';
    }
    if (!villeArrivee.trim()) {
      inlineErrors.villeArrivee = "Veuillez renseigner la ville d'arrivée.";
    }

    if (!dateDepart) {
      inlineErrors.dateDepart = 'Veuillez choisir une date de départ.';
    } else {
      const selectedDate = new Date(dateDepart);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        inlineErrors.dateDepart = 'La date de départ doit être dans le futur.';
      }
    }

    const poidsNum = parseFloat(poidsDisponible);
    if (!poidsDisponible) {
      inlineErrors.poidsDisponible = 'Veuillez indiquer le poids disponible.';
    } else if (isNaN(poidsNum) || poidsNum <= 0) {
      inlineErrors.poidsDisponible = 'Le poids disponible doit être un nombre positif supérieur à 0.';
    }

    const prixNum = parseFloat(prixParKg);
    if (!prixParKg) {
      inlineErrors.prixParKg = 'Veuillez fixer le prix par kg.';
    } else if (isNaN(prixNum) || prixNum <= 0) {
      inlineErrors.prixParKg = 'Le prix par kg doit être un montant positif supérieur à 0.';
    }

    if (colisAcceptes.length === 0) {
      inlineErrors.colis = 'Sélectionnez au moins un type de colis accepté.';
    }

    setErrors(inlineErrors);
    return Object.keys(inlineErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      setGeneralError('Veuillez corriger les erreurs signalées dans le formulaire.');
      return;
    }

    setSubmitting(true);

    const trajetPayload = {
      gp_id: userId,
      ville_depart: villeDepart.trim(),
      ville_arrivee: villeArrivee.trim(),
      date_depart: dateDepart,
      poids_disponible: parseFloat(poidsDisponible),
      prix_par_kg: parseFloat(prixParKg),
      types_colis_acceptes: colisAcceptes,
      notes: notes.trim() || null,
      statut: 'ACTIF',
      created_at: new Date().toISOString(),
    };

    if (!supabase) {
      // Offline fallback success simulation
      setTimeout(() => {
        setSubmitting(false);
        setSuccessToast(true);
        setTimeout(() => {
          router.push('/dashboard/gp');
        }, 1500);
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase
        .from('trajets')
        .insert(trajetPayload);

      if (error) {
        setSubmitting(false);
        setGeneralError(`Erreur lors de la publication : ${error.message}`);
      } else {
        setSuccessToast(true);
        setTimeout(() => {
          setSubmitting(false);
          router.push('/dashboard/gp');
        }, 1500);
      }
    } catch (err: any) {
      setSubmitting(false);
      setGeneralError(err.message || "Une erreur inattendue s'est produite lors de la publication.");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-[#E5231B] animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Validation de l’accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#0A0A0A] pb-16 pt-8 flex items-center justify-center px-4">
      <div className="w-full max-w-xl p-8 bg-white border border-[#E8E8E8] rounded-[14px] shadow-sm flex flex-col">
        
        {/* RETOUR ACTION LINK */}
        <button
          onClick={() => router.push('/dashboard/gp')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 pb-4 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au dashboard</span>
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="h-5 w-5 text-[#E5231B]" />
            <h1 className="text-2xl font-black text-[#0A0A0A] tracking-tight">
              Publier un trajet
            </h1>
          </div>
          <p className="text-xs text-gray-500 leading-normal">
            Enregistrez votre prochain vol et proposez votre capacité de bagages disponible aux expéditeurs de confiance.
          </p>
        </div>

        {/* Global/Validation Error notification panel */}
        {generalError && (
          <div className="bg-red-50 border border-red-200 text-[#E5231B] p-3 rounded-[10px] text-xs mb-5 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#E5231B]" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Success toast overlay */}
        {successToast && (
          <div className="bg-[#FFF5F5] border border-red-200 text-[#E5231B] p-4 rounded-[10px] text-xs mb-5 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#E5231B]" />
            <div>
              <span className="font-bold block text-[#0A0A0A]">Trajet publié avec succès !</span>
              <span className="text-gray-500">Redirection vers votre tableau de bord en cours...</span>
            </div>
          </div>
        )}

        {/* PUBLICATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Ville de départ et ville d'arrivée side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Ville départ */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Ville de départ <span className="text-[#E5231B]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={villeDepart}
                  onChange={(e) => {
                    setVilleDepart(e.target.value);
                    if (e.target.value) setErrors(prev => ({ ...prev, villeDepart: '' }));
                  }}
                  placeholder="ex. Paris, Dakar, Istanbul"
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    errors.villeDepart ? 'border-red-500 ring-1 ring-red-150' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
              {errors.villeDepart && (
                <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                  ⚠ {errors.villeDepart}
                </p>
              )}
            </div>

            {/* Ville d'arrivée */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Ville d'arrivée <span className="text-[#E5231B]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={villeArrivee}
                  onChange={(e) => {
                    setVilleArrivee(e.target.value);
                    if (e.target.value) setErrors(prev => ({ ...prev, villeArrivee: '' }));
                  }}
                  placeholder="ex. Dakar, Abidjan, Bamako"
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    errors.villeArrivee ? 'border-red-500 ring-1 ring-red-150' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
              {errors.villeArrivee && (
                <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                  ⚠ {errors.villeArrivee}
                </p>
              )}
            </div>

          </div>

          {/* Date de départ */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Date de départ <span className="text-[#E5231B]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="date"
                value={dateDepart}
                onChange={(e) => {
                  setDateDepart(e.target.value);
                  if (e.target.value) setErrors(prev => ({ ...prev, dateDepart: '' }));
                }}
                className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                  errors.dateDepart ? 'border-red-500 ring-1 ring-red-150' : 'border-[#E8E8E8]'
                }`}
              />
            </div>
            {errors.dateDepart && (
              <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                ⚠ {errors.dateDepart}
              </p>
            )}
          </div>

          {/* Poids dispo et Prix par kg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Poids disponible */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Poids disponible (kg) <span className="text-[#E5231B]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Scale className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  step="any"
                  value={poidsDisponible}
                  onChange={(e) => {
                    setPoidsDisponible(e.target.value);
                    if (e.target.value) setErrors(prev => ({ ...prev, poidsDisponible: '' }));
                  }}
                  placeholder="ex. 23"
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    errors.poidsDisponible ? 'border-red-500 ring-1 ring-red-150' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
              {errors.poidsDisponible && (
                <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                  ⚠ {errors.poidsDisponible}
                </p>
              )}
            </div>

            {/* Prix par kg */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Prix par kg (FCFA) <span className="text-[#E5231B]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <DollarSign className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  step="any"
                  value={prixParKg}
                  onChange={(e) => {
                    setPrixParKg(e.target.value);
                    if (e.target.value) setErrors(prev => ({ ...prev, prixParKg: '' }));
                  }}
                  placeholder="ex. 4000"
                  className={`w-full bg-white border rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                    errors.prixParKg ? 'border-red-500 ring-1 ring-red-150' : 'border-[#E8E8E8]'
                  }`}
                />
              </div>
              {errors.prixParKg && (
                <p className="text-[11px] text-[#E5231B] font-semibold mt-1">
                  ⚠ {errors.prixParKg}
                </p>
              )}
            </div>

          </div>

          {/* Types de colis acceptés (checkboxes) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Types de colis acceptés <span className="text-[#E5231B]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLIS_TYPES.map((type) => {
                const isChecked = colisAcceptes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleCheckboxChange(type.id)}
                    className={`py-2 px-3 border rounded-[10px] text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                      isChecked 
                        ? 'border-[#E5231B] bg-[#FFF5F5] text-[#E5231B]' 
                        : 'border-[#E8E8E8] bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by outer button click
                      className="h-3.5 w-3.5 accent-[#E5231B] pointer-events-none ml-1.5"
                    />
                  </button>
                );
              })}
            </div>
            {errors.colis && (
              <p className="text-[11px] text-[#E5231B] font-semibold mt-1.5">
                ⚠ {errors.colis}
              </p>
            )}
          </div>

          {/* Notes pour les clients (textarea optionnel) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Notes complémentaires pour les clients (optionnel)
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 text-gray-400">
                <FileText className="h-4 w-4" />
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Renseignez toute information importante (ex. Date limite de dépôt, consignes particulières pour les objets de valeur, etc.)"
                rows={3}
                className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full h-[52px] mt-2 text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E5231B] hover:bg-[#C91A14] active:bg-[#A90F0B]'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Publication en cours...</span>
              </>
            ) : (
              <span>Publier le trajet</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  MapPin, 
  Calendar, 
  Scale, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Info, 
  FileText,
  ShieldCheck,
  Send,
  Star
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface TrajetDetails {
  id: string;
  gpId: string;
  gpNom: string;
  isVerified: boolean;
  villeDepart: string;
  paysDepart: string;
  villeArrivee: string;
  paysArrivee: string;
  dateDepart: string;
  poidsDisponible: number;
  prixParKg: number;
  typesColisAcceptes: string[];
  notes?: string;
  noteMoyenne?: number;
  livraisonsEffectuees?: number;
}

export default function GPProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const trajetId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [trajet, setTrajet] = useState<TrajetDetails | null>(null);
  
  // User Authentication state
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  // Booking Form Fields
  const [descriptionColis, setDescriptionColis] = useState('');
  const [poidsColis, setPoidsColis] = useState('');
  const [messageGP, setMessageGP] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    checkUserLoggedIn();
    fetchTrajetDetails();
  }, [trajetId]);

  const checkUserLoggedIn = async () => {
    if (!supabase) {
      setCurrentClientId('demo-client-id');
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentClientId(user.id);
      }
    } catch (e) {
      // Ignore
    }
  };

  const fetchTrajetDetails = async () => {
    setLoading(true);

    if (!supabase) {
      // Offline fallback
      setTimeout(() => {
        const fallbackDataList: TrajetDetails[] = [
          {
            id: 't-1',
            gpId: 'gp-101',
            gpNom: 'Abdoulaye Diop',
            isVerified: true,
            villeDepart: 'Dakar',
            paysDepart: 'Sénégal',
            villeArrivee: 'Paris',
            paysArrivee: 'France',
            dateDepart: '2026-06-28',
            poidsDisponible: 23,
            prixParKg: 4500,
            typesColisAcceptes: ['documents', 'vetements', 'electronique', 'medicaments'],
            notes: 'Départ de l’aéroport Blaise Diagne, bagages sécurisés. Possibilité de livrer à domicile sur Paris Nord.',
            noteMoyenne: 4.9,
            livraisonsEffectuees: 24,
          },
          {
            id: 't-2',
            gpId: 'gp-102',
            gpNom: 'Awa Ndiaye',
            isVerified: true,
            villeDepart: 'Istanbul',
            paysDepart: 'Turquie',
            villeArrivee: 'Dakar',
            paysArrivee: 'Sénégal',
            dateDepart: '2026-07-05',
            poidsDisponible: 15,
            prixParKg: 5500,
            typesColisAcceptes: ['vetements', 'alimentation', 'autre'],
            notes: 'Escale rapide de 2h, je répons rapidement aux appels. Bagages filmés à l’aéroport.',
            noteMoyenne: 4.7,
            livraisonsEffectuees: 12,
          }
        ];

        const match = fallbackDataList.find(t => t.id === trajetId) || fallbackDataList[0];
        setTrajet(match);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      // Find the specific trajet records
      const { data: routeData, error } = await supabase
        .from('trajets')
        .select(`
          *,
          users!trajets_gp_id_fkey (id, nom)
        `)
        .eq('id', trajetId)
        .single();

      if (error || !routeData) {
        throw new Error("Impossible de récupérer les détails du vol.");
      }

      // Check KYC verification status
      let isVerified = false;
      const { data: kycData } = await supabase
        .from('kyc')
        .select('statut')
        .eq('user_id', routeData.gp_id)
        .single();

      if (kycData?.statut === 'VÉRIFIÉ' || kycData?.statut === 'VERIFIE') {
        isVerified = true;
      }

      setTrajet({
        id: routeData.id,
        gpId: routeData.gp_id,
        gpNom: routeData.users?.nom || 'Grand Passager de confiance',
        isVerified: isVerified,
        villeDepart: routeData.ville_depart || routeData.villeDepart || 'N/A',
        paysDepart: routeData.pays_depart || routeData.paysDepart || '',
        villeArrivee: routeData.ville_arrivee || routeData.villeArrivee || 'N/A',
        paysArrivee: routeData.pays_arrivee || routeData.paysArrivee || '',
        dateDepart: routeData.date_depart || '',
        poidsDisponible: routeData.poids_disponible || routeData.poidsDisponible || 0,
        prixParKg: routeData.prix_par_kg || routeData.prixParKg || 0,
        typesColisAcceptes: routeData.types_colis_acceptes || routeData.typesColisAcceptes || [],
        notes: routeData.notes || '',
        noteMoyenne: 4.8, // Fallback/Standard high ratings for verified journeys
        livraisonsEffectuees: 16,
      });

      setLoading(false);
    } catch (err: any) {
      setGeneralError(err.message || 'Détails de trajet introuvables');
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    if (!currentClientId) {
      router.push('/auth/connexion');
      return;
    }

    const inlineErrors: Record<string, string> = {};

    if (!descriptionColis.trim()) {
      inlineErrors.description = 'La description du colis est obligatoire.';
    }

    const inputWeight = parseFloat(poidsColis);
    if (!poidsColis) {
      inlineErrors.poids = 'Le poids estimé est obligatoire.';
    } else if (isNaN(inputWeight) || inputWeight <= 0) {
      inlineErrors.poids = 'Le poids doit être un nombre supérieur à 0.';
    } else if (trajet && inputWeight > trajet.poidsDisponible) {
      inlineErrors.poids = `Le poids dépasse les kilos disponibles (${trajet.poidsDisponible} kg).`;
    }

    if (Object.keys(inlineErrors).length > 0) {
      setErrors(inlineErrors);
      setGeneralError('Veuillez corriger les erreurs ci-dessous.');
      return;
    }

    setSubmittingRequest(true);

    const requestPayload = {
      client_id: currentClientId,
      gp_id: trajet?.gpId,
      trajet_id: trajet?.id,
      description: descriptionColis.trim(),
      poids: inputWeight,
      message: messageGP.trim() || null,
      statut: 'EN_ATTENTE',
      created_at: new Date().toISOString()
    };

    if (!supabase) {
      // Mock offline success message
      setTimeout(() => {
        setSubmittingRequest(false);
        setFormSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/client');
        }, 1500);
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase
        .from('expeditions')
        .insert(requestPayload);

      if (error) {
        setGeneralError(`Erreur lors de l'envoi de la demande : ${error.message}`);
      } else {
        setFormSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/client');
        }, 1500);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Une erreur s’est produite lors de l’envoi.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const weightVal = parseFloat(poidsColis);
  const totalCost = trajet && !isNaN(weightVal) && weightVal > 0 ? weightVal * trajet.prixParKg : 0;

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-[#E5231B] animate-spin" />
          <p className="text-xs text-gray-500 font-medium font-sans">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#0A0A0A] pb-24 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* LINK RETOUR */}
        <button
          onClick={() => router.push('/gps')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0A0A0A] mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à la liste</span>
        </button>

        {generalError && !trajet && (
          <div className="bg-red-50 border border-red-200 text-[#E5231B] p-4 rounded-[14px] text-xs flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-[#E5231B]" />
            <span>{generalError}</span>
          </div>
        )}

        {trajet && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* COLUMN 1: GP PROFILE & FLIGHT INFO (LEFT/CENTER - col-span-2) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profil GP Details */}
              <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-sm">
                
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar (initiales) */}
                  <div className="w-14 h-14 bg-red-50 border border-red-200 text-[#E5231B] rounded-full flex items-center justify-center font-bold text-base tracking-tight uppercase shrink-0">
                    {trajet.gpNom.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-[#0A0A0A]">{trajet.gpNom}</h2>
                      {trajet.isVerified && (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>VÉRIFIÉ</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Stars and Delivery counter */}
                    <div className="flex items-center gap-3 mt-1 text-gray-500 font-medium">
                      <div className="flex items-center text-amber-500 gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span className="text-xs font-bold text-gray-700">{trajet.noteMoyenne || 4.8} / 5</span>
                      </div>
                      <span className="text-xs">•</span>
                      <span className="text-xs font-bold text-gray-600">{trajet.livraisonsEffectuees || 16} livraisons</span>
                    </div>
                  </div>
                </div>

                {/* Trajet details with flight icon */}
                <div className="border-t border-b border-gray-100 py-5 my-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Départ</p>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#0A0A0A] mt-0.5">{trajet.villeDepart}</h3>
                      <p className="text-[11px] text-gray-400 font-medium uppercase">{trajet.paysDepart}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#E5231B] border border-red-100 shrink-0">
                      <ArrowLeft className="h-4 w-4 transform rotate-180" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Arrivée</p>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#0A0A0A] mt-0.5">{trajet.villeArrivee}</h3>
                      <p className="text-[11px] text-gray-400 font-medium uppercase">{trajet.paysArrivee}</p>
                    </div>
                  </div>

                  {/* Flight Date & Capacity Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50 text-xs text-gray-600">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Date de vol</span>
                      <span className="font-extrabold text-[#0A0A0A] flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4 text-[#E5231B]" />
                        {new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Kilos Disponibles</span>
                      <span className="font-extrabold text-[#E5231B] flex items-center gap-1 mt-1">
                        <Scale className="h-4 w-4 text-[#E5231B]" />
                        {trajet.poidsDisponible} kg restants
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categories and Badges allowed */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700">Types de colis acceptés :</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {trajet.typesColisAcceptes.length === 0 ? (
                      <span className="text-xs text-gray-500 italic">Tous types acceptés</span>
                    ) : (
                      trajet.typesColisAcceptes.map((tag) => (
                        <span 
                          key={tag} 
                          className="px-2.5 py-0.5 text-xs font-bold bg-[#FFF5F5] text-[#E5231B] rounded-full border border-red-50 capitalize"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* GP custom instructions note card if present */}
              {trajet.notes && (
                <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-sm">
                  <h3 className="text-xs font-black text-[#0A0A0A] mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-[#E5231B]" />
                    <span>Instructions du Grand Passager</span>
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {trajet.notes}
                  </p>
                </div>
              )}

            </div>

            {/* COLUMN 2: BOOKING ENQUIRY FORM / LOGIN REDIRECTS (RIGHT - col-span-1) */}
            <div className="md:col-span-1">
              
              {formSuccess ? (
                /* TOAST/SUCCESS OVERLAY SCREEN */
                <div className="bg-white border border-emerald-250 text-center rounded-[14px] p-6 shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-gray-950">Demande envoyée !</h3>
                    <p className="text-xs text-gray-500 leading-normal">
                      Votre demande de colis a été soumise au Grand Passager de confiance. Vous allez être redirigé vers votre espace client.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100/80 space-y-1.5">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tarif calculé</p>
                    <p className="text-base font-black text-emerald-700">{totalCost.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
              ) : (
                /* INQUIRY BOOKING SUBMISSION FORM CONTAINER */
                <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-sm space-y-4 sticky top-24">
                  
                  <div className="space-y-1 text-center pb-2 border-b border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tarif transport</p>
                    <div className="flex items-baseline justify-center gap-0.5 text-[#E5231B]">
                      <span className="text-xl font-black">{trajet.prixParKg.toLocaleString('fr-FR')}</span>
                      <span className="text-xs font-semibold">FCFA / kg</span>
                    </div>
                  </div>

                  {generalError && (
                    <div className="bg-red-50 border border-red-200 text-[#E5231B] p-2.5 rounded-[10px] text-xs leading-normal flex items-start gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-[#E5231B]" />
                      <span>{generalError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest text-center">
                      Envoyer une demande
                    </h3>

                    {/* Check if user logged in, otherwise show authentication buttons */}
                    {!currentClientId ? (
                      <div className="space-y-3 pt-2 text-center">
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          Vous devez posséder un compte expéditeur pour envoyer une proposition de transport à ce voyageur.
                        </p>
                        <button
                          onClick={() => router.push('/auth/connexion')}
                          className="w-full h-11 bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-xs rounded-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span>Connectez-vous pour envoyer une demande</span>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCreateRequest} className="space-y-3.5">
                        
                        {/* Description colis */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Description du colis <span className="text-[#E5231B]">*</span>
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Qu’y a-t-il dans le colis ? (ex. Ordinateur 14 pouces, vêtements de bébé, documents administratifs sous pochette...)"
                            value={descriptionColis}
                            onChange={(e) => {
                              setDescriptionColis(e.target.value);
                              if (e.target.value) setErrors(prev => ({ ...prev, description: '' }));
                            }}
                            className={`w-full bg-white border rounded-[8px] px-3 py-2 text-xs text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                              errors.description ? 'border-red-500' : 'border-[#E8E8E8]'
                            }`}
                          />
                          {errors.description && (
                            <p className="text-[10px] text-[#E5231B] font-semibold mt-0.5">⚠ {errors.description}</p>
                          )}
                        </div>

                        {/* Poids estimatif */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Poids estimé (en kg) <span className="text-[#E5231B]">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400">
                              <Scale className="h-3.5 w-3.5" />
                            </span>
                            <input
                              type="number"
                              step="any"
                              required
                              placeholder="ex. 4"
                              value={poidsColis}
                              onChange={(e) => {
                                setPoidsColis(e.target.value);
                                if (e.target.value) setErrors(prev => ({ ...prev, poids: '' }));
                              }}
                              className={`w-full bg-white border rounded-[8px] pl-8 pr-3 py-1.5 text-xs text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] ${
                                errors.poids ? 'border-red-500' : 'border-[#E8E8E8]'
                              }`}
                            />
                          </div>
                          {errors.poids && (
                            <p className="text-[10px] text-[#E5231B] font-semibold mt-0.5">⚠ {errors.poids}</p>
                          )}
                        </div>

                        {/* Custom message to GP */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                            Message au Grand Passager (optionnel)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Précisez des détails ou posez une question..."
                            value={messageGP}
                            onChange={(e) => setMessageGP(e.target.value)}
                            className="w-full bg-white border border-[#E8E8E8] rounded-[8px] px-3 py-2 text-xs text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                          />
                        </div>

                        {/* Price Counter Sum summary */}
                        {!isNaN(totalCost) && totalCost > 0 && (
                          <div className="bg-[#FFF5F5]/60 p-2.5 rounded-[8px] border border-red-50 text-center">
                            <p className="text-[9px] text-[#E5231B] font-bold uppercase tracking-wider">Tarif total estimé</p>
                            <p className="text-[#0A0A0A] text-base font-black mt-0.5">
                              {totalCost.toLocaleString('fr-FR')} <span className="text-[10px] font-semibold">FCFA</span>
                            </p>
                          </div>
                        )}

                        {/* Submission request Button selector */}
                        <button
                          type="submit"
                          disabled={submittingRequest}
                          className="w-full h-11 bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-xs rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-400"
                        >
                          {submittingRequest ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              <span>Envoyer la demande</span>
                            </>
                          )}
                        </button>

                      </form>
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Scale, 
  DollarSign, 
  Check, 
  X, 
  PlusCircle, 
  LogOut, 
  Loader2, 
  TrendingUp, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface Trajet {
  id: string;
  villeDepart: string;
  paysDepart: string;
  villeArrivee: string;
  paysArrivee: string;
  dateDepart: string;
  poidsDisponible: number;
  prixParKg: number;
  statut: 'OUVERT' | 'PLEIN' | 'TERMINE';
}

interface Demande {
  id: string;
  clientNom: string;
  clientPrenom: string;
  description: string;
  poids: number;
  prixTotal: number;
  date: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'ANNULE';
}

export default function GPDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [kycStatus, setKycStatus] = useState<'EN_ATTENTE' | 'VÉRIFIÉ' | 'REJETÉ'>('EN_ATTENTE');
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  
  // Toasts
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const checkUser = async () => {
    if (!supabase) {
      // Mock / fallback preview experience when Supabase is offline/not configured
      setTimeout(() => {
        setUserName('Fatou');
        setKycStatus('VÉRIFIÉ');
        setTrajets([
          { 
            id: 't1', 
            villeDepart: 'Paris', 
            paysDepart: 'France', 
            villeArrivee: 'Dakar', 
            paysArrivee: 'Sénégal', 
            dateDepart: '28/06/2026', 
            poidsDisponible: 23, 
            prixParKg: 4500, 
            statut: 'OUVERT' 
          },
          { 
            id: 't2', 
            villeDepart: 'Brussels', 
            paysDepart: 'Belgique', 
            villeArrivee: 'Abidjan', 
            paysArrivee: 'Côte d\'Ivoire', 
            dateDepart: '05/07/2026', 
            poidsDisponible: 12, 
            prixParKg: 5000, 
            statut: 'OUVERT' 
          }
        ]);
        setDemandes([
          { 
            id: 'd1', 
            clientNom: 'Ndiaye', 
            clientPrenom: 'Cheikh', 
            description: 'Documents administratifs urgents + téléphone', 
            poids: 2, 
            prixTotal: 9000, 
            date: '21/06/2026', 
            statut: 'EN_ATTENTE' 
          },
          { 
            id: 'd2', 
            clientNom: 'Sow', 
            clientPrenom: 'Amadou', 
            description: 'Ordinateur portable sous carton de protection', 
            poids: 4, 
            prixTotal: 18000, 
            date: '20/06/2026', 
            statut: 'EN_ATTENTE' 
          }
        ]);
        setLoading(false);
      }, 800);
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
        .select('role, nom, kyc_status, prenom')
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

      // First name
      const fullName = userProfile.nom || '';
      const firstName = userProfile.prenom || fullName.split(' ')[0] || 'Utilisateur';
      setUserName(firstName);

      // KYC status retrieval from users or kyc table
      let kycStat: any = userProfile.kyc_status || 'EN_ATTENTE';
      
      const { data: kycData } = await supabase
        .from('kyc')
        .select('statut')
        .eq('userId', user.id)
        .single();
        
      if (kycData?.statut) {
        kycStat = kycData.statut;
      }

      if (kycStat === 'VÉRIFIÉ' || kycStat === 'VERIFIE') {
        setKycStatus('VÉRIFIÉ');
      } else if (kycStat === 'REJETÉ' || kycStat === 'REJETE') {
        setKycStatus('REJETÉ');
      } else {
        setKycStatus('EN_ATTENTE');
      }

      // Fetch Trajets
      const { data: trajetsData } = await supabase
        .from('trajets')
        .select('*')
        .eq('gp_id', user.id)
        .order('created_at', { ascending: false });

      if (trajetsData) {
        setTrajets(trajetsData.map((t: any) => ({
          id: t.id,
          villeDepart: t.ville_depart || t.villeDepart || 'N/A',
          paysDepart: t.pays_depart || t.paysDepart || 'N/A',
          villeArrivee: t.ville_arrivee || t.villeArrivee || 'N/A',
          paysArrivee: t.pays_arrivee || t.paysArrivee || 'N/A',
          dateDepart: t.date_depart ? new Date(t.date_depart).toLocaleDateString('fr-FR') : 'N/A',
          poidsDisponible: t.poids_disponible || t.poidsDisponible || 0,
          prixParKg: t.prix_par_kg || t.prixParKg || 0,
          statut: t.statut || 'OUVERT',
        })));
      }

      // Fetch Demandes (Pending expeditions for this GP)
      const { data: expData } = await supabase
        .from('expeditions')
        .select('*')
        .eq('gp_id', user.id)
        .eq('statut', 'EN_ATTENTE')
        .order('created_at', { ascending: false });

      if (expData) {
        setDemandes(expData.map((e: any) => ({
          id: e.id,
          clientNom: e.client_nom || e.clientNom || 'Sow',
          clientPrenom: e.client_prenom || e.clientPrenom || 'Amadou',
          description: e.description || 'Colis',
          poids: e.poids || 0,
          prixTotal: e.prix_total || e.prixTotal || e.tarif || 0,
          date: e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
          statut: 'EN_ATTENTE',
        })));
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/auth/connexion');
  };

  const handleAcceptDemande = async (id: string) => {
    setActionLoading(id);
    if (!supabase) {
      // Offline fallback animation
      setTimeout(() => {
        setDemandes(prev => prev.filter(d => d.id !== id));
        setActionLoading(null);
        showToast('Demande acceptée avec succès !');
      }, 700);
      return;
    }

    try {
      const { error } = await supabase
        .from('expeditions')
        .update({ statut: 'ACCEPTE' })
        .eq('id', id);

      if (error) {
        showToast(`Erreur : ${error.message}`, 'error');
      } else {
        setDemandes(prev => prev.filter(d => d.id !== id));
        showToast('La demande a été acceptée avec succès.');
      }
    } catch (err: any) {
      showToast(err.message || "Impossible d'accepter la demande", 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefuseDemande = async (id: string) => {
    setActionLoading(id);
    if (!supabase) {
      // Offline fallback animation
      setTimeout(() => {
        setDemandes(prev => prev.filter(d => d.id !== id));
        setActionLoading(null);
        showToast('Demande refusée / annulée', 'error');
      }, 700);
      return;
    }

    try {
      const { error } = await supabase
        .from('expeditions')
        .update({ statut: 'ANNULE' })
        .eq('id', id);

      if (error) {
        showToast(`Erreur : ${error.message}`, 'error');
      } else {
        setDemandes(prev => prev.filter(d => d.id !== id));
        showToast('La demande a été refusée.');
      }
    } catch (err: any) {
      showToast(err.message || "Impossible de refuser la demande", 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Stats computation
  const activeTrajetsCount = trajets.filter(t => t.statut === 'OUVERT').length;
  const pendingDemandesCount = demandes.length;
  const kilosDisponibles = trajets.reduce((acc, t) => t.statut === 'OUVERT' ? acc + t.poidsDisponible : acc, 0);
  
  // Revenus simulation or sum from accepted requests
  const totalRevenus = 225000; // default indicator, or we can customize

  return (
    <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#0A0A0A] pb-16">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="border-b border-[#E8E8E8] sticky top-0 bg-white z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E5231B] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white transform rotate-45"></div>
            </div>
            <span className="font-sans font-bold text-lg tracking-tight uppercase">
              GP <span className="text-[#E5231B]">Connect</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-right">
              <div className="hidden sm:block">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Espace Voyageur (GP)</p>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className="text-sm font-bold text-[#0A0A0A]">Bonjour {userName}</span>
                  {kycStatus === 'VÉRIFIÉ' ? (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                      Vérifié
                    </span>
                  ) : kycStatus === 'REJETÉ' ? (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-red-50 text-[#E5231B] border border-red-100 flex items-center gap-0.5">
                      Rejeté
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-0.5">
                      KYC En attente
                    </span>
                  )}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-red-100 border border-red-200 text-[#E5231B] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                {userName.charAt(0)}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-[#E5231B] transition-colors hover:bg-red-50 rounded-lg cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Toast Toast alerts */}
        {toastMsg && (
          <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-[14px] shadow-lg border text-sm flex items-center gap-2 transition-all animate-bounce ${
            toastMsg.type === 'error' 
              ? 'bg-red-50 text-[#E5231B] border-red-205' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-205'
          }`}>
            {toastMsg.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            <span className="font-semibold">{toastMsg.text}</span>
          </div>
        )}

        {/* Welcome message with mobile KYC indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-[#0A0A0A] leading-tight tracking-tight">
              Tableau de Bord Grand Passager (GP)
            </h2>
            <p className="text-xs text-gray-500">
              Gérez vos kilos disponibles, publiez vos trajets et acceptez des expéditions de confiance.
            </p>
          </div>
          
          {/* Mobile KYC Badge view block */}
          <div className="sm:hidden flex items-center gap-2 bg-gray-50 p-2.5 rounded-[10px] border border-[#E8E8E8]">
            <span className="text-[11px] font-semibold text-gray-500">Statut KYC :</span>
            {kycStatus === 'VÉRIFIÉ' ? (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-100 text-emerald-800">
                VÉRIFIÉ
              </span>
            ) : kycStatus === 'REJETÉ' ? (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-red-100 text-[#E5231B]">
                REJETÉ
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-100 text-amber-800 animate-pulse">
                EN ATTENTE
              </span>
            )}
          </div>
        </div>

        {/* 3. FOUR CORE STATS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Active Trajets */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Trajets</span>
              <Plane className="h-4 w-4 text-[#E5231B]" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0A0A0A]">{activeTrajetsCount}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">actifs publiés</p>
            </div>
          </div>

          {/* Card 2: Received requests count */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Demandes</span>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0A0A0A]">{pendingDemandesCount}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">en attente d'approbation</p>
            </div>
          </div>

          {/* Card 3: Monthly revenus indicators */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Revenus</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-[#0A0A0A] truncate">{totalRevenus.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">estimation globale</p>
            </div>
          </div>

          {/* Card 4: Kilos disponibles capacity scale */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-4 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Kilos dispo.</span>
              <Scale className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0A0A0A]">{kilosDisponibles} kg</p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">sur vos vols ouverts</p>
            </div>
          </div>

        </div>

        {/* 4. MAIN ACTION EVENT BUTTON */}
        <button
          onClick={() => router.push('/dashboard/gp/nouveau-trajet')}
          className="w-full h-[52px] bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Publier un nouveau trajet</span>
        </button>

        {/* GRID OF Demandes ET Trajets side-by-side on large screens, stacked on small */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          
          {/* 5. REQUEST RECEPTION BOARD */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-[#0A0A0A] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#E5231B]" />
                <span>Demandes reçues</span>
              </h3>
              <span className="bg-red-50 text-[#E5231B] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {demandes.length} nouvelle{demandes.length > 1 ? 's' : ''}
              </span>
            </div>

            {demandes.length === 0 ? (
              /* EMPTY STATE */
              <div className="text-center py-10 border border-dashed border-[#E8E8E8] rounded-[14px]">
                <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-bold">
                  Aucune demande en attente pour le moment — vos offres de vols attireront bientôt des clients !
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandes.map((demande) => (
                  <div 
                    key={demande.id} 
                    className="p-4 rounded-[12px] border border-[#E8E8E8] bg-[#FFF5F5]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A0A0A]">{demande.clientPrenom} {demande.clientNom}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Reçue le {demande.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium bg-white p-2 rounded-lg border border-gray-100">{demande.description}</p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                          <Scale className="h-3.5 w-3.5 text-gray-400" /> Poids : {demande.poids} kg
                        </span>
                        <span className="text-[11px] font-bold text-[#E5231B]">
                          Tarif : {demande.prixTotal.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {actionLoading === demande.id ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-5 w-5 text-[#E5231B] animate-spin" />
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAcceptDemande(demande.id)}
                            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="h-4 w-4" />
                            <span>Accepter</span>
                          </button>
                          
                          <button
                            onClick={() => handleRefuseDemande(demande.id)}
                            className="h-10 px-4 bg-[#FFFFFF] hover:bg-red-50 border border-red-200 text-[#E5231B] rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                            <span>Refuser</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. CURRENT FLIGHT TRAJECTORIES */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-xs">
            <h3 className="text-base font-black text-[#0A0A0A] mb-4 flex items-center gap-2">
              <Plane className="h-4 w-4 text-[#E5231B]" />
              <span>Vos trajets actifs</span>
            </h3>

            {trajets.length === 0 ? (
              /* EMPTY STATE */
              <div className="text-center py-10 border border-dashed border-[#E8E8E8] rounded-[14px]">
                <Plane className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-bold">
                  Aucun trajet actif publié pour le moment.
                </p>
                <button
                  onClick={() => router.push('/dashboard/gp/nouveau-trajet')}
                  className="mt-3 text-xs bg-black hover:bg-[#1A1A1A] text-white font-bold px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer"
                >
                  Publier un vol
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E8E8]">
                {trajets.map((trajet) => (
                  <div key={trajet.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-gray-50 border border-[#E8E8E8] rounded-[10px] text-[#E5231B] shrink-0 mt-0.5">
                        <Plane className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#0A0A0A]">{trajet.villeDepart} ({trajet.paysDepart})</h4>
                          <span className="text-gray-400 text-xs">→</span>
                          <h4 className="font-bold text-sm text-[#0A0A0A]">{trajet.villeArrivee} ({trajet.paysArrivee})</h4>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 font-medium flex items-center gap-3">
                          <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {trajet.dateDepart}</span>
                          • 
                          <span>{trajet.prixParKg.toLocaleString('fr-FR')} FCFA/kg</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#0A0A0A]">{trajet.poidsDisponible} kg restants</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">Capacité disponible</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                        Vol ouvert
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}

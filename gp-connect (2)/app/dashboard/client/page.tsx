'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Package, PlusCircle, LogOut, Loader2, ArrowRight, TrendingUp, CheckCircle, Wallet } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

import { useAuth } from '@/src/hooks/useAuth';

interface Expedition {
  id: string;
  destination: string;
  date: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'EN_TRANSIT' | 'LIVRE' | 'ANNULE';
  prix: number;
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth('CLIENT', '/auth/connexion');
  
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!authUser) {
      router.push('/auth/connexion');
      return;
    }

    checkUser();
  }, [authUser, authLoading]);

  const checkUser = async () => {
    if (!supabase) {
      // Mock / fallback preview experience when Supabase is offline/not configured
      setUserName(authUser?.prenom || authUser?.nom?.split(' ')[0] || 'Amadou');
      setExpeditions([
        { id: '1', destination: 'Abidjan, Côte d\'Ivoire', date: '21/06/2026', statut: 'EN_TRANSIT', prix: 45000 },
        { id: '2', destination: 'Dakar, Sénégal', date: '18/06/2026', statut: 'LIVRE', prix: 25000 },
        { id: '3', destination: 'Bamako, Mali', date: '15/06/2026', statut: 'EN_ATTENTE', prix: 30000 }
      ]);
      setLoading(false);
      return;
    }

    try {
      setUserName(authUser?.prenom || authUser?.nom?.split(' ')[0] || 'Utilisateur');

      // Fetch Client's shipments
      const { data: expeditionsData, error: expError } = await supabase
        .from('expeditions')
        .select('*')
        .eq('client_id', authUser?.id)
        .order('created_at', { ascending: false });

      if (!expError && expeditionsData) {
        setExpeditions(expeditionsData.map((e: any) => ({
          id: e.id,
          destination: e.destination || e.destination_ville || 'Destination',
          date: e.date_envoi ? new Date(e.date_envoi).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
          statut: e.statut || 'EN_ATTENTE',
          prix: e.tarif || e.prix || 0,
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

  // Stats computation
  const activeExpeditions = expeditions.filter(e => e.statut !== 'LIVRE' && e.statut !== 'ANNULE').length;
  const deliveredExpeditions = expeditions.filter(e => e.statut === 'LIVRE').length;
  const totalSpent = expeditions.reduce((acc, curr) => acc + curr.prix, 0);

  const getStatusBadge = (status: Expedition['statut']) => {
    switch (status) {
      case 'EN_ATTENTE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">En attente</span>;
      case 'ACCEPTE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-850">Accepté</span>;
      case 'EN_TRANSIT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-850">En transit</span>;
      case 'LIVRE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Livré</span>;
      case 'ANNULE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-[#E5231B]">Annulé</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Inconnu</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-[#E5231B] animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Compte Client</p>
                <p className="text-sm font-bold text-[#0A0A0A]">Bonjour {userName}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-red-100 border border-red-200 text-[#E5231B] flex items-center justify-center font-bold text-sm uppercase">
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

      {/* 2. MAIN CONTAINER CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-[#0A0A0A] leading-tight tracking-tight">
            Espace Expéditeur (Client)
          </h2>
          <p className="text-xs text-gray-500">
            Suivez l'envoi de vos colis et gérez vos expéditions en toute sécurité.
          </p>
        </div>

        {/* 3. CORE STATISTICS HIGHLIGHT CARD BOARD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Active shipments */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#FFF5F5] text-[#E5231B] shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">En cours</p>
              <p className="text-2xl font-extrabold text-[#0A0A0A] mt-0.5">{activeExpeditions}</p>
            </div>
          </div>

          {/* Card 2: Delivered shipments */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Livrées</p>
              <p className="text-2xl font-extrabold text-[#0A0A0A] mt-0.5">{deliveredExpeditions}</p>
            </div>
          </div>

          {/* Card 3: Total spent in FCFA */}
          <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total dépensé</p>
              <p className="text-xl font-extrabold text-[#0A0A0A] mt-0.5">{totalSpent.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>

        </div>

        {/* 4. MAIN ACTION BUTTON */}
        <button
          onClick={() => router.push('/dashboard/client/nouvelle-expedition')}
          className="w-full h-[52px] bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Nouvelle expédition</span>
        </button>

        {/* 5. SHIPMENT TRAJECTORIES LOG */}
        <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-xs">
          <h3 className="text-base font-black text-[#0A0A0A] mb-4">
            Expéditions récentes
          </h3>

          {expeditions.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-12 border border-dashed border-[#E8E8E8] rounded-[14px]">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-bold mb-1">
                Aucune expédition pour l'instant — envoyez votre premier colis
              </p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                Trouvez un voyageur vérifié pour expédier vos documents ou produits par avion de manière rapide et économique.
              </p>
              <button 
                onClick={() => router.push('/dashboard/client/nouvelle-expedition')}
                className="px-4 py-2 bg-[#0A0A0A] hover:bg-black text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer"
              >
                Commencer maintenant
              </button>
            </div>
          ) : (
            /* SHIPMENTS LIST */
            <div className="divide-y divide-[#E8E8E8]">
              {expeditions.map((exp) => (
                <div key={exp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gray-50 border border-[#E8E8E8] rounded-[10px] text-gray-500 mt-0.5 shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0A0A0A]">{exp.destination}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Expédié le {exp.date} • {exp.prix.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    {getStatusBadge(exp.statut)}
                    <button
                      onClick={() => router.push(`/dashboard/client/expedition/${exp.id}`)}
                      className="p-1 px-2.5 hover:bg-gray-50 border border-transparent hover:border-[#E8E8E8] text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-[8px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Détails</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}

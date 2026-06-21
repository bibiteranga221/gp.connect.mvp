'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  Scale, 
  Coins, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  User, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface GPTrajet {
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
}

export default function FindGPPage() {
  const router = useRouter();

  // Loading and search triggers
  const [loading, setLoading] = useState(true);
  const [allTrajets, setAllTrajets] = useState<GPTrajet[]>([]);
  const [filteredTrajets, setFilteredTrajets] = useState<GPTrajet[]>([]);

  // Filter Input States
  const [villeDepartInput, setVilleDepartInput] = useState('');
  const [villeArriveeInput, setVilleArriveeInput] = useState('');
  const [dateDepartInput, setDateDepartInput] = useState('');
  const [typeColisInput, setTypeColisInput] = useState('Tous');

  useEffect(() => {
    fetchTrajets();
  }, []);

  const fetchTrajets = async () => {
    setLoading(true);

    if (!supabase) {
      // Mock Data when Supabase is offline / demo mode
      setTimeout(() => {
        const mockGPData: GPTrajet[] = [
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
            notes: 'Départ de l’aéroport Blaise Diagne, bagages sécurisés.',
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
            notes: 'Escale rapide de 2h, je réponds rapidement aux appels.',
          },
          {
            id: 't-3',
            gpId: 'gp-103',
            gpNom: 'Jean-Baptiste Mendy',
            isVerified: false,
            villeDepart: 'Libreville',
            paysDepart: 'Gabon',
            villeArrivee: 'Dakar',
            paysArrivee: 'Sénégal',
            dateDepart: '2026-06-25',
            poidsDisponible: 8,
            prixParKg: 3500,
            typesColisAcceptes: ['documents', 'medicaments'],
            notes: 'Lettres recommandées et enveloppes uniquement.',
          },
          {
            id: 't-4',
            gpId: 'gp-104',
            gpNom: 'Mariama Sow',
            isVerified: true,
            villeDepart: 'Paris',
            paysDepart: 'France',
            villeArrivee: 'Abidjan',
            paysArrivee: 'Côte d\'Ivoire',
            dateDepart: '2026-07-12',
            poidsDisponible: 30,
            prixParKg: 4000,
            typesColisAcceptes: ['documents', 'vetements', 'electronique', 'medicaments', 'alimentation', 'autre'],
            notes: 'Valise entière disponible. Possibilité de sceller devant vous.'
          }
        ];

        setAllTrajets(mockGPData);
        setFilteredTrajets(mockGPData);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      // Fetch available routes on flight database table
      const todayString = new Date().toISOString().split('T')[0];

      const { data: rawTrajets, error } = await supabase
        .from('trajets')
        .select(`
          *,
          users!trajets_gp_id_fkey (id, nom, role)
        `)
        .eq('statut', 'ACTIF')
        .gte('date_depart', todayString)
        .order('date_depart', { ascending: true });

      if (error) {
        throw error;
      }

      if (rawTrajets) {
        // Build custom combined data mapping profiles
        const mapped: GPTrajet[] = await Promise.all(
          rawTrajets.map(async (t: any) => {
            const gpUser = t.users || {};
            
            // Fetch KYC verify badge indicator
            let isVerified = false;
            const { data: kycData } = await supabase
              .from('kyc')
              .select('statut')
              .eq('user_id', gpUser.id || t.gp_id)
              .single();

            if (kycData?.statut === 'VÉRIFIÉ' || kycData?.statut === 'VERIFIE') {
              isVerified = true;
            }

            return {
              id: t.id,
              gpId: t.gp_id,
              gpNom: gpUser.nom || 'Grand Passager',
              isVerified: isVerified,
              villeDepart: t.ville_depart || t.villeDepart || 'N/A',
              paysDepart: t.pays_depart || t.paysDepart || '',
              villeArrivee: t.ville_arrivee || t.villeArrivee || 'N/A',
              paysArrivee: t.pays_arrivee || t.paysArrivee || '',
              dateDepart: t.date_depart || '',
              poidsDisponible: t.poids_disponible || t.poidsDisponible || 0,
              prixParKg: t.prix_par_kg || t.prixParKg || 0,
              typesColisAcceptes: t.types_colis_acceptes || t.typesColisAcceptes || [],
              notes: t.notes || '',
            };
          })
        );

        setAllTrajets(mapped);
        setFilteredTrajets(mapped);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let result = [...allTrajets];

    // Filter by Ville de départ
    if (villeDepartInput.trim()) {
      const searchVal = villeDepartInput.toLowerCase().trim();
      result = result.filter(
        t => t.villeDepart.toLowerCase().includes(searchVal) || t.paysDepart.toLowerCase().includes(searchVal)
      );
    }

    // Filter by Ville d'arrivée
    if (villeArriveeInput.trim()) {
      const searchVal = villeArriveeInput.toLowerCase().trim();
      result = result.filter(
        t => t.villeArrivee.toLowerCase().includes(searchVal) || t.paysArrivee.toLowerCase().includes(searchVal)
      );
    }

    // Filter by Date de départ
    if (dateDepartInput) {
      result = result.filter(t => t.dateDepart === dateDepartInput);
    }

    // Filter by Type de colis
    if (typeColisInput !== 'Tous') {
      const selectedType = typeColisInput.toLowerCase();
      result = result.filter(t => 
        t.typesColisAcceptes.map(x => x.toLowerCase()).includes(selectedType)
      );
    }

    setFilteredTrajets(result);
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#0A0A0A] pb-20">
      
      {/* HEADER BAR */}
      <header className="border-b border-[#E8E8E8] bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.back()}
              className="p-1 px-2.5 bg-gray-55 hover:bg-gray-100 border border-[#E8E8E8] text-xs font-bold text-gray-600 rounded-[8px] mr-2 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Retour</span>
            </button>
            <div className="w-8 h-8 bg-[#E5231B] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white transform rotate-45"></div>
            </div>
            <span className="font-sans font-black text-lg tracking-tight uppercase">
              GP <span className="text-[#E5231B]">Connect</span>
            </span>
          </div>

          <button
            onClick={() => router.push('/dashboard/client')}
            className="text-xs font-bold text-[#E5231B] hover:underline"
          >
            Espace Client
          </button>
        </div>
      </header>

      {/* CORE WRAPPER */}
      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Hero title */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-black text-[#0A0A0A] leading-tight tracking-tight">
            Trouver un Grand Passager (GP)
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Recherchez des voyageurs de confiance effectuant bientôt un trajet vers votre destination. Confiez vos colis (documents, cadeaux, marchandises) pour une livraison rapide.
          </p>
        </div>

        {/* 1. FILTERS AREA CARD */}
        <form 
          onSubmit={handleSearch} 
          className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-xs space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Ville départ */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-600">Ville de départ</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="ex. Paris, Dakar, Istanbul"
                  value={villeDepartInput}
                  onChange={(e) => setVilleDepartInput(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-3 py-2 text-xs text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                />
              </div>
            </div>

            {/* Ville d'arrivée */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-600">Ville d'arrivée</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="ex. Dakar, Abidjan, Bamako"
                  value={villeArriveeInput}
                  onChange={(e) => setVilleArriveeInput(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-3 py-2 text-xs text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                />
              </div>
            </div>

            {/* Date de départ */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-600">Date de départ</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  value={dateDepartInput}
                  onChange={(e) => setDateDepartInput(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-3 py-2 text-xs text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                />
              </div>
            </div>

            {/* Type de colis accepts */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-600">Type de colis</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Package className="h-4 w-4" />
                </span>
                <select
                  value={typeColisInput}
                  onChange={(e) => setTypeColisInput(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] pl-9 pr-3 py-2 text-xs text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#E5231B] appearance-none cursor-pointer"
                >
                  <option value="Tous">Tous les colis</option>
                  <option value="Documents">Documents</option>
                  <option value="Vetements">Vêtements</option>
                  <option value="Electronique">Électronique</option>
                  <option value="Medicaments">Médicaments</option>
                  <option value="Alimentation">Alimentation</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>
            </div>

          </div>

          {/* Search Trigger Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto h-[44px] px-8 bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-xs rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Rechercher</span>
            </button>
          </div>
        </form>

        {/* RESULTS HEADS & METADATAS COUNTER */}
        <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            {filteredTrajets.length} grand{filteredTrajets.length > 1 ? 's' : ''} passager{filteredTrajets.length > 1 ? 's' : ''} disponible{filteredTrajets.length > 1 ? 's' : ''}
          </h2>
        </div>

        {/* 2. SKELETON LOADER VIEWS STATE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div 
                key={n} 
                className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-205" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-gray-150 rounded w-1/3" />
                    <div className="h-3 bg-gray-150 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-150 rounded w-1/2" />
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                  <div className="h-10 bg-gray-250 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 3. SHOW TRAJETS LIST CARDS */
          <>
            {filteredTrajets.length === 0 ? (
              /* EMPTY SEARCH RESULTS STATE */
              <div className="text-center py-16 border border-dashed border-[#E8E8E8] rounded-[14px] bg-white">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0A0A0A] mb-1">
                  Aucun GP disponible pour cette destination
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4 leading-relaxed">
                  Il n'y a pas encore d'offres de trajet correspondant exactement à vos filtres. Essayez de chercher avec une autre date ou d'autres villes.
                </p>
                <button
                  onClick={() => {
                    setVilleDepartInput('');
                    setVilleArriveeInput('');
                    setDateDepartInput('');
                    setTypeColisInput('Tous');
                    setFilteredTrajets(allTrajets);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:border-gray-550 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-[10px] transition-all cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              /* CARDS GRID LAYOUT */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTrajets.map((gpTrajet) => {
                  const initials = gpTrajet.gpNom
                    .split(' ')
                    .map(n => n.charAt(0))
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                  return (
                    <div 
                      key={gpTrajet.id}
                      className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      
                      {/* Top profile identifiers */}
                      <div className="flex items-start justify-between gap-2.5 mb-4">
                        <div className="flex items-center gap-3">
                          
                          {/* Avatar GP */}
                          <div className="w-12 h-12 bg-red-100 border border-red-200 text-[#E5231B] rounded-full flex items-center justify-center font-bold text-sm tracking-tight shrink-0 uppercase">
                            {initials || <User className="h-5 w-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-sm text-[#0A0A0A]">{gpTrajet.gpNom}</h3>
                              {gpTrajet.isVerified && (
                                <span className="px-2 py-0.5 text-[9px] font-bold rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                  <span>VÉRIFIÉ</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Grand Passager Vérifié</p>
                          </div>
                        </div>
                      </div>

                      {/* Flight route information and date */}
                      <div className="space-y-3 mb-6 bg-gray-50/50 p-3 rounded-[10px] border border-gray-100">
                        
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-[#E5231B] shrink-0" />
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A]">
                            <span>{gpTrajet.villeDepart}</span>
                            <span className="text-gray-400 font-medium">→</span>
                            <span>{gpTrajet.villeArrivee}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 font-medium pt-1 border-t border-gray-100/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>Départ : {new Date(gpTrajet.dateDepart).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Scale className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>Kilos dispos : <strong>{gpTrajet.poidsDisponible} kg</strong></span>
                          </div>
                        </div>

                      </div>

                      {/* Display pricing, categories accepts & bottom details route buttons */}
                      <div className="border-t border-[#E8E8E8] pt-4 flex items-center justify-between gap-3 mt-auto">
                        
                        {/* Prix par kg in FCFA */}
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tarif transport</p>
                          <div className="flex items-baseline gap-0.5 text-[#0A0A0A] mt-0.5">
                            <span className="text-lg font-black">{gpTrajet.prixParKg.toLocaleString('fr-FR')}</span>
                            <span className="text-xs font-bold text-gray-500">FCFA/kg</span>
                          </div>
                        </div>

                        {/* View details profile action button */}
                        <button
                          onClick={() => router.push(`/gps/${gpTrajet.id}`)}
                          className="h-[38px] px-4 bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-xs rounded-[10px] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Voir le profil</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

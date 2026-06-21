import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { User, Trajet, Expedition, Message, ExpeditionStatut } from '../types';
import { Search, PlusCircle, Calendar, ShieldCheck, Mail, ArrowRight, Package, RefreshCw, MessageSquare, Star, Sliders, Check, FileText, Upload, AlertCircle } from 'lucide-react';

interface ClientDashboardProps {
  initialSearchDepart?: string;
  initialSearchArrivee?: string;
  initialSearchType?: string;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  initialSearchDepart = '',
  initialSearchArrivee = '',
  initialSearchType = ''
}) => {
  const {
    currentUser,
    trajets,
    expeditions,
    messages,
    avis,
    createExpedition,
    sendChatMessage,
    postAvis
  } = useAppState();

  // Search filter states
  const [deptCity, setDeptCity] = useState(initialSearchDepart);
  const [destCity, setDestCity] = useState(initialSearchArrivee);
  const [colisType, setColisType] = useState(initialSearchType);
  const [targetDate, setTargetDate] = useState('');

  // Selected elements for detail view or modal
  const [selectedGP, setSelectedGP] = useState<Trajet | null>(null);
  const [activeExpedition, setActiveExpedition] = useState<Expedition | null>(null);

  // New Shipment Booking Form
  const [parcelDesc, setParcelDesc] = useState('');
  const [parcelWeight, setParcelWeight] = useState(1);
  const [parcelPhotos, setParcelPhotos] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Chat message textbox
  const [chatInput, setChatInput] = useState('');

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // View state inside Client portal
  const [subView, setSubView] = useState<'dashboard' | 'search' | 'details-exp'>('dashboard');

  // Load initial search if parameters supplied
  useEffect(() => {
    if (initialSearchDepart || initialSearchArrivee || initialSearchType) {
      setSubView('search');
    }
  }, [initialSearchDepart, initialSearchArrivee, initialSearchType]);

  // Synchronize state when activeExpedition is open so chat refreshes
  const clientExpeditions = expeditions.filter(exp => exp.clientId === currentUser?.id);
  const currentExpDetails = activeExpedition 
    ? expeditions.find(e => e.id === activeExpedition.id) || activeExpedition 
    : (clientExpeditions[0] || null);

  const activeExpeditionMessages = messages.filter(m => m.expeditionId === (currentExpDetails?.id));

  // Filtered GP list
  const filteredGPs = trajets.filter(trajet => {
    const matchDept = deptCity ? (trajet.villeDepart.toLowerCase().includes(deptCity.toLowerCase()) || trajet.paysDepart.toLowerCase().includes(deptCity.toLowerCase())) : true;
    const matchDest = destCity ? (trajet.villeArrivee.toLowerCase().includes(destCity.toLowerCase()) || trajet.paysArrivee.toLowerCase().includes(destCity.toLowerCase())) : true;
    const matchDate = targetDate ? (trajet.dateDepart === targetDate) : true;
    const matchType = colisType ? (trajet.typesAcceptes.includes(colisType)) : true;
    return matchDept && matchDest && matchDate && matchType && trajet.statut === 'OUVERT';
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!selectedGP) return;
    if (!parcelDesc) {
      setBookingError('Veuillez décrire votre colis.');
      return;
    }
    if (parcelWeight <= 0) {
      setBookingError('Le poids doit être supérieur à 0 kg.');
      return;
    }
    if (parcelWeight > selectedGP.poidsDisponible) {
      setBookingError(`Le GP n'a que ${selectedGP.poidsDisponible} kg disponibles sur ce trajet.`);
      return;
    }

    createExpedition({
      trajetId: selectedGP.id,
      description: parcelDesc,
      poids: parcelWeight,
      photos: parcelPhotos.length > 0 ? parcelPhotos : ['colis_simulation.jpg']
    });

    setBookingSuccess(true);
    setParcelDesc('');
    setParcelWeight(1);
    setParcelPhotos([]);

    setTimeout(() => {
      setSelectedGP(null);
      setBookingSuccess(false);
      setSubView('dashboard');
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentExpDetails) return;
    sendChatMessage(currentExpDetails.id, chatInput);
    setChatInput('');
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExpDetails) return;
    postAvis(currentExpDetails.id, reviewRating, reviewText);
    setReviewSuccess(true);
    setReviewText('');
    setTimeout(() => setReviewSuccess(false), 2000);
  };

  const getStatusColor = (statut: ExpeditionStatut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ACCÈPTE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RECUPERE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EN_TRANSIT': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'LIVRÉ': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ANNULÉ': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateCost = () => {
    if (!selectedGP) return 0;
    return parcelWeight * selectedGP.prixParKg;
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      
      {/* Dynamic Header Info for dashboard */}
      <div className="bg-white border-b border-[#E8E8E8] py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-sans text-[#0A0A0A]">Espace Client</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {currentUser?.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSubView('dashboard');
                setSelectedGP(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-[10px] transition-colors cursor-pointer ${subView === 'dashboard' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50'}`}
            >
              Mes Expéditions ({clientExpeditions.length})
            </button>
            <button
              onClick={() => setSubView('search')}
              className={`px-4 py-2 text-xs font-bold rounded-[10px] transition-colors flex items-center gap-1 cursor-pointer ${subView === 'search' ? 'bg-[#E5231B] text-white' : 'bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50'}`}
              id="client-nav-search-btn"
            >
              <Search className="h-3.5 w-3.5" />
              Trouver un GP
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ==================== SUBVIEW A: CLIENT DASHBOARD ==================== */}
        {subView === 'dashboard' && (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Shipment List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-xs">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-[#0A0A0A]">
                    Expéditions actives & Historique ({clientExpeditions.length})
                  </h3>
                  <button 
                    onClick={() => setSubView('search')}
                    className="px-3 py-1.5 bg-[#E5231B] text-white hover:bg-[#C91A14] transition-colors rounded-[10px] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    id="btn-customer-new-shipment"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Nouvelle expédition
                  </button>
                </div>

                {clientExpeditions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#E8E8E8] rounded-[14px]">
                    <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 font-bold mb-1">Aucune expédition pour l'instant</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                      Trouvez un Grand Passager disponible pour expédier votre premier paquet !
                    </p>
                    <button 
                      onClick={() => setSubView('search')}
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold rounded-[10px] transition-colors cursor-pointer"
                    >
                      Parcourir les GPs disponibles
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientExpeditions.map((exp) => (
                      <div 
                        key={exp.id} 
                        onClick={() => {
                          setActiveExpedition(exp);
                          setSubView('details-exp');
                        }}
                        className={`border rounded-lg p-4 hover:border-gray-400 transition-all cursor-pointer ${currentExpDetails?.id === exp.id ? 'border-[#E5231B] ring-1 ring-[#E5231B]/20 bg-red-50/5' : 'border-[#E8E8E8]'}`}
                        id={`client-exp-card-${exp.id}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              Réf : {exp.id}
                            </span>
                            <h4 className="font-bold text-sm text-[#0A0A0A] mt-1.5">
                              {exp.description.slice(0, 60)}...
                            </h4>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 border rounded-full text-center ${getStatusColor(exp.statut)}`}>
                            {exp.statut}
                          </span>
                        </div>

                        {/* Itinerary */}
                        <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3 text-xs mb-3">
                          <div>
                            <span className="text-gray-400 block text-[10px]">Départ</span>
                            <span className="font-bold">{exp.villeDepart}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] text-right">Arrivée</span>
                            <span className="font-bold block text-right">{exp.villeArrivee}</span>
                          </div>
                        </div>

                        {/* GP Info & Pricing */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">
                            GP : <strong>{exp.gpPrenom} {exp.gpNom}</strong>
                          </span>
                          <span className="font-bold font-mono text-[#E5231B]">
                            {exp.prixTotal} {exp.devise === 'EUR' ? '€' : 'FCFA'} <span className="text-[10px] text-gray-400 font-normal">({exp.poids} kg)</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Mini Details panel */}
            <div className="lg:col-span-4 space-y-6">
              {currentExpDetails ? (
                <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                  <h4 className="font-bold text-xs font-mono uppercase text-gray-400 tracking-wider mb-4 border-b pb-2">
                    Visualiser en détail
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Sélectionnez/cliquez sur une expédition dans la liste pour voir sa messagerie directe et sa timeline de suivi.
                  </p>
                  <button
                    onClick={() => setSubView('details-exp')}
                    className="w-full py-2 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white text-xs font-bold rounded flex items-center justify-center gap-1.5"
                    id="btn-customer-consult-details"
                  >
                    <span>Ouvrir l'espace suivi & chat</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 text-center text-gray-400 text-xs">
                  <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  Rien de sélectionné.
                </div>
              )}
            </div>

          </div>
        )}


        {/* ==================== SUBVIEW B: SEARCH GP TRAJETS ==================== */}
        {subView === 'search' && (
          <div>
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 mb-8 shadow-xs">
              <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2 text-sm">
                <Sliders className="h-4 w-4 text-[#E5231B]" />
                Filtres de recherche avancés
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Vile/Pays Départ</label>
                  <input
                    type="text"
                    value={deptCity}
                    onChange={(e) => setDeptCity(e.target.value)}
                    placeholder="Ex: Paris, France"
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ville/Pays Arrivée</label>
                  <input
                    type="text"
                    value={destCity}
                    onChange={(e) => setDestCity(e.target.value)}
                    placeholder="Ex: Dakar, Sénégal"
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-mono">Date de Départ</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Type de colis</label>
                  <select
                    value={colisType}
                    onChange={(e) => setColisType(e.target.value)}
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  >
                    <option value="">Tous les types</option>
                    <option value="documents">📑 Documents de valeur</option>
                    <option value="vêtements">👕 Habillage & Modes</option>
                    <option value="électronique">💻 Ordinateurs / Smartphones</option>
                    <option value="médicaments">💊 Médicaments autorisés (ordonnance)</option>
                    <option value="autre">📦 Autre</option>
                  </select>
                </div>
              </div>

              {/* Reset filter */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setDeptCity('');
                    setDestCity('');
                    setTargetDate('');
                    setColisType('');
                  }}
                  className="text-xs text-[#E5231B] hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Réinitialiser les filtres
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-[#0A0A0A] mb-4">
              Grands Passagers (GP) disponibles ({filteredGPs.length})
            </h3>

            {filteredGPs.length === 0 ? (
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-8 text-center text-gray-500">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-sm mb-1">Aucun trajet trouvé</p>
                <p className="text-xs text-gray-400">Essayez de modifier ou d'élargir vos termes de recherche.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGPs.map((trajet) => (
                  <div key={trajet.id} className="bg-white border border-[#E8E8E8] rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img src={trajet.gpAvatar} alt={trajet.gpNom} className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-100" />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-xs text-[#0A0A0A]">{trajet.gpPrenom} {trajet.gpNom}</span>
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">Vérifié (ID)</span>
                            </div>
                            <div className="flex items-center text-[10px] text-yellow-500 font-bold">
                              ★ {trajet.gpNote} <span className="text-gray-400 font-normal ml-0.5">({trajet.gpAvisCount} avis)</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-[#0A0A0A] rounded font-mono">
                          {trajet.prixParKg} {trajet.devise === 'EUR' ? '€' : 'FCFA'} /kg
                        </span>
                      </div>

                      {/* Route specs */}
                      <div className="border-t border-b border-gray-100 py-3 mb-3">
                        <div className="flex items-center justify-between font-bold text-xs text-[#0A0A0A]">
                          <div className="flex flex-col">
                            <span>{trajet.villeDepart}</span>
                            <span className="text-[9px] text-gray-400 font-normal">{trajet.paysDepart}</span>
                          </div>
                          <span className="text-gray-300 font-mono">➡</span>
                          <div className="flex flex-col items-end">
                            <span>{trajet.villeArrivee}</span>
                            <span className="text-[9px] text-gray-400 font-normal">{trajet.paysArrivee}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[11px] text-gray-500 mt-2.5">
                          <span>Vol prévu le : <strong className="text-gray-900">{new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                          <span className="text-[#E5231B] font-semibold">{trajet.poidsDisponible} kg dispo</span>
                        </div>
                      </div>

                      {/* Accepts tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {trajet.typesAcceptes.map((t, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 rounded uppercase">
                            {t}
                          </span>
                        ))}
                      </div>

                      {trajet.notes && (
                        <p className="text-[11px] text-gray-500 line-clamp-2 italic bg-gray-50/50 p-2 rounded mb-4">
                          "{trajet.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedGP(trajet)}
                      className="w-full py-2 bg-[#E1251E] hover:bg-black hover:text-white text-white font-medium text-xs rounded transition-all text-center"
                      id={`btn-contact-gp-${trajet.id}`}
                    >
                      Choisir & Envoyer demande
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ==================== SUBVIEW C: EXPEDITION DETAILS & MESSAGING & TRACKING ==================== */}
        {subView === 'details-exp' && currentExpDetails && (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left box: Tracking timeline Vertical */}
            <div className="lg:col-span-4 bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
              <div className="flex justify-between items-center mb-6 pb-2 border-b">
                <span className="text-xs font-mono text-gray-400">Réf : {currentExpDetails.id}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${getStatusColor(currentExpDetails.statut)}`}>
                  {currentExpDetails.statut}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#0A0A0A] mb-4">Ligne de suivi de votre colis</h3>
              
              {/* Vertical timeline */}
              <div className="relative border-l border-gray-200 ml-3 space-y-6 py-2">
                {currentExpDetails.trackingStages.map((stage, idx) => (
                  <div key={idx} className="relative pl-6">
                    {/* Circle icon marker */}
                    <span className={`absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 ${stage.done ? 'bg-emerald-500 border-white ring-2 ring-emerald-200' : (stage.active ? 'bg-[#E5231B] border-white ring-2 ring-red-200 animate-pulse' : 'bg-gray-200 border-white')}`}>
                    </span>
                    <div>
                      <h4 className={`text-xs font-bold ${stage.done ? 'text-emerald-700' : (stage.active ? 'text-[#E5231B]' : 'text-gray-500')}`}>
                        {stage.label}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{stage.desc}</p>
                      {stage.date && (
                        <span className="inline-block text-[9px] text-[#0A0A0A] bg-gray-50 border border-gray-100 px-1 py-0.2 rounded font-mono mt-1">
                          📅 {stage.date}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Leave review section if shipment DELIVERED */}
              {currentExpDetails.statut === 'LIVRÉ' && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wider mb-2">
                    Laisser un avis à {currentExpDetails.gpPrenom}
                  </h4>
                  {reviewSuccess ? (
                    <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded text-xs">
                      ✔ Merci ! Votre note de {reviewRating}/5 et votre commentaire ont été publiés.
                    </div>
                  ) : (
                    <form onSubmit={submitReview} className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Note par Étoiles</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="bg-white border text-xs px-2 py-1 rounded"
                        >
                          <option value="5">★★★★★ (5/5)</option>
                          <option value="4">★★★★☆ (4/5)</option>
                          <option value="3">★★★☆☆ (3/5)</option>
                          <option value="2">★★☆☆☆ (2/5)</option>
                          <option value="1">★☆☆☆☆ (1/5)</option>
                        </select>
                      </div>
                      <div>
                        <textarea
                          required
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Fatou a été très ponctuelle. Service génial !"
                          rows={2}
                          className="w-full bg-white border text-xs p-2 rounded focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                        ></textarea>
                      </div>
                      <button type="submit" className="px-3 py-1.5 bg-[#E5231B] text-white hover:bg-black text-[11px] font-bold rounded">
                        Soumettre mon avis
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Action: Cancel request */}
              {currentExpDetails.statut === 'EN_ATTENTE' && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      if (confirm("Voulez-vous vraiment annuler cette expédition ?")) {
                        // simulate canceling
                        alert("Expédition mise à jour en ANNULÉ");
                        window.location.reload();
                      }
                    }}
                    className="w-full py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-semibold"
                  >
                    Annuler ma demande
                  </button>
                </div>
              )}
            </div>

            {/* Right box: Parcels specs & Messages Direct box */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Parcel specs block */}
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0A0A0A]">
                      Expédition : {currentExpDetails.villeDepart} → {currentExpDetails.villeArrivee}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Transporteur associé : <strong>{currentExpDetails.gpPrenom} {currentExpDetails.gpNom}</strong> (ID Voyageur)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-[#E5231B] block">
                      {currentExpDetails.prixTotal} {currentExpDetails.devise === 'EUR' ? '€' : 'FCFA'}
                    </span>
                    <span className="text-[10px] text-gray-400">Total payé (poids {currentExpDetails.poids} kg)</span>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-700 flex flex-col sm:flex-row justify-between gap-3 font-mono border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[9px]">DESCRIPTION DU CONTENU</span>
                    <span className="font-bold font-sans">{currentExpDetails.description}</span>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-gray-400 block text-[9px]">PHOTOS JOINTES</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      📷 {currentExpDetails.photos.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messagerie section */}
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs flex flex-col justify-between h-[450px]">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 border-b pb-2 mb-4 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-[#E5231B]" />
                    Chat de confiance avec {currentExpDetails.gpPrenom}
                  </h3>
                  
                  {/* Messages Thread list */}
                  <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1 flex flex-col">
                    {activeExpeditionMessages.length === 0 ? (
                      <div className="text-center text-gray-400 text-xs py-10 italic">
                        Aucun message. Envoyez une salutation !
                      </div>
                    ) : (
                      activeExpeditionMessages.map((msg) => {
                        const isSenderMe = msg.senderId === currentUser?.id;
                        const isSystem = msg.senderId === 'SYSTEM';

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="text-center py-1.5 px-3 bg-gray-50 text-gray-500 rounded text-[10px] w-fit mx-auto font-mono my-1 border border-gray-100">
                              {msg.contenu}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[75%] rounded-lg p-3 text-xs ${isSenderMe ? 'bg-[#1A1A1A] text-white self-end' : 'bg-gray-100 text-[#0A0A0A] self-start'}`}
                          >
                            <span className="text-[9px] opacity-60 font-mono mb-1">
                              {isSenderMe ? 'Vous' : `${currentExpDetails.gpPrenom}`}
                            </span>
                            <p className="leading-relaxed whitespace-pre-line">{msg.contenu}</p>
                            <span className="text-[8px] opacity-40 text-right mt-1 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Sender bar text */}
                <form onSubmit={handleSendMessage} className="border-t pt-4 mt-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Tapez votre message ici (ex: Horaires du rendez-vous, précisions...)"
                      className="flex-1 bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                      id="client-chat-input"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#E1251E] hover:bg-black text-white text-xs font-bold rounded-lg transition-colors"
                      id="client-send-msg-btn"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        )}

      </div>




      {/* ==================== MODAL: BOOKING GP TRANSACTION ==================== */}
      {selectedGP && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 border border-[#E8E8E8] relative">
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">
              Soumettre une demande d'expédition
            </h3>
            <p className="text-xs text-gray-500 mb-6 font-mono">
              Destinataire : GP {selectedGP.gpPrenom} {selectedGP.gpNom} | {selectedGP.villeDepart} → {selectedGP.villeArrivee}
            </p>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs mb-4">
                ⚠ {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs mb-4">
                ✔ Votre demande a été transmise avec succès au GP ! Paiement simulé. Redirection...
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Product specifications description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description précise du colis</label>
                <textarea
                  required
                  value={parcelDesc}
                  onChange={(e) => setParcelDesc(e.target.value)}
                  placeholder="Ex: 1 livre, 2 paires de lunettes de soleil scellées dans leur boite d'origine, documents juridiques."
                  rows={3}
                  className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                  id="modal-parcel-desc"
                ></textarea>
              </div>

              {/* Weight estimator slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-gray-600">Poids Estimé (en Kg)</label>
                  <span className="text-xs font-bold text-[#E5231B] bg-red-50 px-2 py-0.5 rounded font-mono">
                    {parcelWeight} Kg
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max={selectedGP.poidsDisponible}
                  step="0.5"
                  value={parcelWeight}
                  onChange={(e) => setParcelWeight(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-gray-400 flex justify-between">
                  <span>Min: 0.5 Kg</span>
                  <span>Max disponible GP: {selectedGP.poidsDisponible} Kg</span>
                </span>
              </div>

              {/* Photo Uploaders (Simulation) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Photos témoins du colis (Facultatif)</label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <span className="text-[11px] text-gray-500 block">Faites glisser ou importez des clichés réels</span>
                  <span className="text-[9px] text-gray-400 block mt-0.5">Pour rassurer le GP (il inspectera physiquement le colis)</span>
                </div>
                
                {/* Seed simulated attachment */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setParcelPhotos(['colis_photo_1.jpg', 'colis_photo_2.jpg']);
                      alert("Photos témoins fictives attachées !");
                    }}
                    className="text-[10px] font-mono text-[#E5231B] hover:underline"
                    id="btn-simulate-photos"
                  >
                    📎 Attacher 2 photos fictives (Simulation requis)
                  </button>
                  {parcelPhotos.length > 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold font-mono">✔ Photos jointes : {parcelPhotos.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Summary and Payout simulation calculator */}
              <div className="bg-[#F5F5F5] rounded-lg p-4 flex justify-between items-center border">
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block tracking-wider">Tarification GP Connect</span>
                  <p className="text-xs text-gray-500">
                    Calcul : {parcelWeight} kg x {selectedGP.prixParKg} {selectedGP.devise === 'EUR' ? '€' : 'FCFA'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-black text-[#E5231B] block">
                    {calculateCost()} {selectedGP.devise === 'EUR' ? '€' : 'FCFA'}
                  </span>
                  <span className="text-[9px] text-gray-400 block">SÉCURISÉ STRIPE / WAVE</span>
                </div>
              </div>

              {/* Terms and actions */}
              <p className="text-[10px] text-gray-400 leading-tight">
                * Note de confiance : Le GP inspectera l'envoi pour des raisons strictes de sécurité aérienne. Les fonds ne lui seront reversés qu'après confirmation physique de la livraison au destinataire final.
              </p>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedGP(null)}
                  className="px-4 py-2 border rounded text-xs text-gray-500 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E5231B] hover:bg-black text-white text-xs font-bold rounded"
                  id="btn-customer-submit-booking"
                >
                  Confirmer et Payer le dépôt
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

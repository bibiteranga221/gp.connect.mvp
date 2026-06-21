import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Trajet, Expedition, Message, ExpeditionStatut } from '../types';
import { PlusCircle, Calendar, ShieldCheck, Mail, ArrowRight, Package, RefreshCw, MessageSquare, Award, Clock, DollarSign, Send, User, CheckCircle, FileText, Check, X, CreditCard, ChevronRight } from 'lucide-react';

export const GPDashboard: React.FC = () => {
  const {
    currentUser,
    trajets,
    expeditions,
    messages,
    paiements,
    submitKYC,
    publishTrajet,
    updateExpeditionStatus,
    requestPayout,
    sendChatMessage
  } = useAppState();

  // Subview tracker inside GP space
  const [gpSubView, setGpSubView] = useState<'listings' | 'publish' | 'requests' | 'kyc' | 'finances'>('listings');

  // Publish Flight forms
  const [deptCity, setDeptCity] = useState('');
  const [deptCountry, setDeptCountry] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [deptDate, setDeptDate] = useState('');
  const [availWeight, setAvailWeight] = useState(23);
  const [pricePerKg, setPricePerKg] = useState(8);
  const [devise, setDevise] = useState<'EUR' | 'XOF'>('EUR');
  const [acceptedTypes, setAcceptedTypes] = useState<string[]>(['documents', 'vêtements']);
  const [flightNotes, setFlightNotes] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Progressive KYC wizard steps (1: identity docs, 2: payout coordinates, 3: completed/pending)
  const [kycStep, setKycStep] = useState(1);
  const [kycIdRecto, setKycIdRecto] = useState('');
  const [kycIdVerso, setKycIdVerso] = useState('');
  const [kycSelfie, setKycSelfie] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [mobileMoneyType, setMobileMoneyType] = useState('Wave');
  const [mobileMoneyNum, setMobileMoneyNum] = useState('');
  const [kycSuccess, setKycSuccess] = useState(false);

  // Chat window link
  const [activeExpForChat, setActiveExpForChat] = useState<Expedition | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Extract variables
  const myTrajets = trajets.filter(t => t.gpId === currentUser?.id);
  const myExpeditions = expeditions.filter(e => e.gpId === currentUser?.id);
  const myPaiements = paiements.filter(p => p.gpId === currentUser?.id);

  // Filter pending / active requests
  const pendingRequests = myExpeditions.filter(e => e.statut === 'EN_ATTENTE');
  const activeDeliveries = myExpeditions.filter(e => e.statut !== 'EN_ATTENTE' && e.statut !== 'LIVRÉ' && e.statut !== 'ANNULÉ');
  const finishedDeliveries = myExpeditions.filter(e => e.statut === 'LIVRÉ');

  // Calculated metrics
  const totalEarned = myExpeditions
    .filter(e => e.statut === 'LIVRÉ')
    .reduce((sum, item) => sum + item.prixTotal, 0);

  const pendingPayoutAmount = myPaiements
    .filter(p => p.statut === 'EN_ATTENTE')
    .reduce((sum, item) => sum + item.montant, 0);

  const handleFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCity || !destCity || !deptDate) {
      alert("Veuillez remplir les informations obligatoires.");
      return;
    }

    publishTrajet({
      villeDepart: deptCity,
      paysDepart: deptCountry || 'France',
      villeArrivee: destCity,
      paysArrivee: destCountry || 'Sénégal',
      dateDepart: deptDate,
      poidsDisponible: availWeight,
      prixParKg: pricePerKg,
      devise,
      typesAcceptes: acceptedTypes,
      notes: flightNotes
    });

    setPublishSuccess(true);
    // Clear forms
    setDeptCity('');
    setDeptCountry('');
    setDestCity('');
    setDestCountry('');
    setDeptDate('');
    
    setTimeout(() => {
      setPublishSuccess(false);
      setGpSubView('listings');
    }, 1200);
  };

  const toggleAcceptType = (type: string) => {
    if (acceptedTypes.includes(type)) {
      setAcceptedTypes(acceptedTypes.filter(t => t !== type));
    } else {
      setAcceptedTypes([...acceptedTypes, type]);
    }
  };

  const handleKycProgress = () => {
    if (kycStep === 1) {
      // simulate uploading validation checks
      setKycStep(2);
    } else if (kycStep === 2) {
      submitKYC(currentUser?.id || '', {
        pieceIdentiteRecto: kycIdRecto || 'piece_recto.jpg',
        pieceIdentiteVerso: kycIdVerso || 'piece_verso.jpg',
        selfie: kycSelfie || 'selfie_gp.jpg',
        banqueNom: bankName,
        banqueIban: bankIban,
        mobileMoneyType,
        mobileMoneyNumero: mobileMoneyNum
      });
      setKycStep(3);
    }
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeExpForChat) return;
    sendChatMessage(activeExpForChat.id, chatInput);
    setChatInput('');
  };

  const handleActionOnExp = (expId: string, action: 'CONFIRM_ACCEPT' | 'REFUSE' | 'MARK_RECUP' | 'MARK_TRANSIT' | 'MARK_DELIV') => {
    const dateStr = new Date().toLocaleDateString();
    if (action === 'CONFIRM_ACCEPT') {
      updateExpeditionStatus(expId, 'ACCÈPTE');
      alert("Demande de colis acceptée !");
    } else if (action === 'REFUSE') {
      updateExpeditionStatus(expId, 'ANNULÉ');
      alert("Demande de colis rejetée.");
    } else if (action === 'MARK_RECUP') {
      updateExpeditionStatus(expId, 'RECUPERE');
      alert("Colis marqué comme récupéré !");
    } else if (action === 'MARK_TRANSIT') {
      updateExpeditionStatus(expId, 'EN_TRANSIT');
      alert("Colis marqué en transit (Voyage initié) !");
    } else if (action === 'MARK_DELIV') {
      updateExpeditionStatus(expId, 'LIVRÉ');
      alert("Félicitations ! Colis livré avec succès.");
    }
  };

  const activeExpForChatDetails = activeExpForChat 
    ? expeditions.find(e => e.id === activeExpForChat.id) || activeExpForChat 
    : null;

  const chatMessages = activeExpForChatDetails 
    ? messages.filter(m => m.expeditionId === activeExpForChatDetails.id) 
    : [];

  return (
    <div className="bg-white min-h-screen pb-16">
      
      {/* Banner reminder if KYC missing */}
      {currentUser?.kycStatus === 'AUCUN' && (
        <div className="bg-amber-500 text-white text-xs px-4 py-3 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 animate-pulse text-white" />
            <span>
              <strong>Attention :</strong> Votre identité (KYC) n'est pas encore vérifiée. Vous devez soumettre vos documents avant d'être visible par les clients.
            </span>
          </div>
          <button 
            onClick={() => setGpSubView('kyc')} 
            className="bg-white text-gray-900 border border-transparent rounded-[10px] px-2.5 py-1 text-[11px] font-bold cursor-pointer"
          >
            Vérifier mon identité →
          </button>
        </div>
      )}

      {/* Main header block */}
      <div className="bg-white border-b border-[#E8E8E8] py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0A0A0A]">Espace Grand Passager (GP)</h1>
              {currentUser?.kycStatus === 'VÉRIFIÉ' ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-[10px] border border-emerald-200">
                  ✔ GP Vérifié
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-[10px] border border-amber-200">
                  {currentUser?.kycStatus === 'EN_ATTENTE' ? '⏳ KYC En Cours' : '❌ Non vérifié'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Tableau de bord logistique voyageur</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGpSubView('listings')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[10px] cursor-pointer ${gpSubView === 'listings' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50'}`}
            >
              Mes Trajets ({myTrajets.length})
            </button>
            <button
              onClick={() => setGpSubView('requests')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[10px] cursor-pointer relative ${gpSubView === 'requests' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50'}`}
              id="gp-nav-requests-btn"
            >
              Demandes reçues
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E5231B] text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setGpSubView('publish')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[10px] cursor-pointer flex items-center gap-1 ${gpSubView === 'publish' ? 'bg-[#E5231B] text-white' : 'bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50'}`}
              id="gp-nav-publish-btn"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Publier un vol
            </button>
            <button
              onClick={() => setGpSubView('finances')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[10px] cursor-pointer ${gpSubView === 'finances' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50'}`}
            >
              Finances / Gains
            </button>
            <button
              onClick={() => setGpSubView('kyc')}
              className={`px-3 py-1.5 text-xs font-bold rounded-[10px] cursor-pointer ${gpSubView === 'kyc' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-gray-700 border border-[#E8E8E8] hover:bg-gray-50'}`}
            >
              Passeport / KYC
            </button>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ==================== SCREEN 1: LISTINGS (MY TRAJETS & ACTIVE COURIER TASKS) ==================== */}
        {gpSubView === 'listings' && (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left lists: Trips registered */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Financial mini dashboard stats inside Listings preview */}
              <div className="grid grid-cols-3 gap-4 bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block tracking-wider uppercase">Revenus ce mois</span>
                  <span className="text-xl font-bold font-mono text-[#000000]">
                    {totalEarned > 0 ? `${totalEarned} € / FCFA` : '0'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block tracking-wider uppercase">Colis Actifs</span>
                  <span className="text-xl font-bold font-mono text-indigo-700">{activeDeliveries.length} paquets</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block tracking-wider uppercase">Avis clients</span>
                  <span className="text-xl font-bold text-yellow-500 font-sans">★ 4.9 <span className="text-xs text-gray-400">(24)</span></span>
                </div>
              </div>

              {/* Trajets published lists */}
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
                <h3 className="text-sm font-bold text-[#0A0A0A] mb-4">Mes vols / trajets publiés</h3>
                
                {myTrajets.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-xs">
                    <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    Aucun vol enregistré pour l'instant. Publiez des trajets pour proposer vos espaces valises !
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTrajets.map(tr => (
                      <div key={tr.id} className="border border-[#E8E8E8] rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono text-gray-400">Réf : {tr.id}</span>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold font-mono">
                            {tr.statut}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 my-2 text-xs border-t border-b border-gray-100 py-3">
                          <div>
                            <span className="text-gray-400 uppercase text-[9px]">Départ</span>
                            <p className="font-bold text-sm text-[#0a0a0a]">{tr.villeDepart} ({tr.paysDepart})</p>
                            <span className="text-gray-500 text-[10px]">Date : {tr.dateDepart}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 uppercase text-[9px]">Arrivée (Destination)</span>
                            <p className="font-bold text-sm text-[#0a0a0a]">{tr.villeArrivee} ({tr.paysArrivee})</p>
                            <span className="text-gray-500 text-[10px]">Tarif : {tr.prixParKg} {tr.devise}/kg</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs mt-3">
                          <span className="text-gray-500">
                            Capacité restante : <strong className="text-[#E5231B]">{tr.poidsDisponible} kg dispo</strong>
                          </span>
                          <div className="flex gap-2 text-[10px]">
                            {tr.typesAcceptes.map((tag, i) => (
                              <span key={i} className="bg-gray-100 px-1.5 py-0.2 rounded font-mono text-gray-500 uppercase">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right columns: Active package deliveries list (Timeline transitions) */}
            <div className="lg:col-span-4 bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
              <h3 className="font-bold text-sm text-[#0A0A0A] mb-4">Gestion des Colis Liés</h3>
              <p className="text-xs text-gray-500 mb-6">
                Pour chaque colis accepté, mettez à jour la timeline de livraison pour informer l'expéditeur.
              </p>

              {activeDeliveries.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs italic">
                  Aucun actif transit colis en cours d'acheminement.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map(exp => (
                    <div key={exp.id} className="border border-gray-100 bg-gray-50/50 rounded-lg p-3 text-xs flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-gray-900 block">{exp.description.slice(0, 30)}...</span>
                          <span className="text-[10px] text-gray-400 font-mono">CLIENT : {exp.clientPrenom} {exp.clientNom}</span>
                        </div>
                        <span className="bg-[#1A1A1A] text-white font-bold px-1.5 py-0.5 rounded font-mono text-[9px]">{exp.poids} kg</span>
                      </div>

                      {/* Timeline flow controls */}
                      <div className="border-t pt-2.5 mt-1 flex flex-wrap gap-1">
                        {exp.statut === 'ACCÈPTE' && (
                          <button
                            onClick={() => handleActionOnExp(exp.id, 'MARK_RECUP')}
                            className="bg-[#E5231B] hover:bg-black text-white px-2 py-1 text-[9px] font-bold rounded"
                            id={`btn-gp-recup-${exp.id}`}
                          >
                            📥 Marquer comme Récupéré
                          </button>
                        )}
                        {exp.statut === 'RECUPERE' && (
                          <button
                            onClick={() => handleActionOnExp(exp.id, 'MARK_TRANSIT')}
                            className="bg-indigo-600 hover:bg-black text-white px-2 py-1 text-[9px] font-bold rounded"
                            id={`btn-gp-transit-${exp.id}`}
                          >
                            ✈ Marquer En Transit (Départ vol)
                          </button>
                        )}
                        {exp.statut === 'EN_TRANSIT' && (
                          <button
                            onClick={() => handleActionOnExp(exp.id, 'MARK_DELIV')}
                            className="bg-emerald-600 hover:bg-black text-white px-2 py-1 text-[9px] font-bold rounded"
                            id={`btn-gp-deliv-${exp.id}`}
                          >
                            📦 Confirmer Livraison (Remis en main)
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveExpForChat(exp);
                            setGpSubView('requests');
                          }}
                          className="border border-[#E8E8E8] text-gray-600 px-2 py-1 text-[9px] font-semibold bg-white rounded flex items-center gap-0.5"
                        >
                          <MessageSquare className="h-2.5 w-2.5" /> Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}


        {/* ==================== SCREEN 2: VOL PUBLICATION FORM ==================== */}
        {gpSubView === 'publish' && (
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 max-w-2xl mx-auto shadow-md">
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-3">Enregistrer un nouveau vol (Trajet)</h3>
            <p className="text-xs text-gray-500 mb-6">Proposez légalement vos kilo-valises au tarif de votre choix.</p>

            {publishSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs mb-6">
                ✔ Vol programmé et indexé avec succès sur GP Connect !
              </div>
            )}

            <form onSubmit={handleFlightSubmit} className="space-y-4 text-xs">
              
              {/* Departure inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ville de Départ *</label>
                  <input
                    type="text"
                    required
                    value={deptCity}
                    onChange={(e) => setDeptCity(e.target.value)}
                    placeholder="Paris"
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pays de Départ</label>
                  <input
                    type="text"
                    value={deptCountry}
                    onChange={(e) => setDeptCountry(e.target.value)}
                    placeholder="France"
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                  />
                </div>
              </div>

              {/* Destination inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ville d'Arrivée (Destination) *</label>
                  <input
                    type="text"
                    required
                    value={destCity}
                    onChange={(e) => setDestCity(e.target.value)}
                    placeholder="Dakar"
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pays d'Arrivée</label>
                  <input
                    type="text"
                    value={destCountry}
                    onChange={(e) => setDestCountry(e.target.value)}
                    placeholder="Sénégal"
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                  />
                </div>
              </div>

              {/* Flight dates */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date exacte du voyage *</label>
                <input
                  type="date"
                  required
                  value={deptDate}
                  onChange={(e) => setDeptDate(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                />
              </div>

              {/* Pricing & Weight constraints */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kilos disponibles (Kg) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={availWeight}
                    onChange={(e) => setAvailWeight(Number(e.target.value))}
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prix par Kg *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Devise du deal</label>
                  <select
                    value={devise}
                    onChange={(e) => setDevise(e.target.value as any)}
                    className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                  >
                    <option value="EUR">Euros (€)</option>
                    <option value="XOF">FCFA (XOF)</option>
                  </select>
                </div>
              </div>

              {/* Accepts select types */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Types correspondants acceptés</label>
                <div className="flex flex-wrap gap-2">
                  {['documents', 'vêtements', 'électronique', 'médicaments', 'autre'].map(type => {
                    const active = acceptedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleAcceptType(type)}
                        className={`px-3 py-1 bg-white font-semibold rounded border transition-colors ${active ? 'border-[#E5231B] text-[#E5231B] bg-red-50/10' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flight comments notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes aux expéditeurs (aéroport, rdv...)</label>
                <textarea
                  value={flightNotes}
                  onChange={(e) => setFlightNotes(e.target.value)}
                  placeholder="Ex: Bagage Air France. Remise possible à Marseille ou Gare Saint-Charles. Pas d'aérosols."
                  rows={3}
                  className="w-full bg-white border border-[#E8E8E8] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#E5231B]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setGpSubView('listings')}
                  className="px-4 py-2 border rounded text-xs text-gray-500 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E5231B] hover:bg-black text-white text-xs font-bold rounded"
                  id="btn-gp-confirm-publish"
                >
                  Publier ce vol
                </button>
              </div>

            </form>
          </div>
        )}


        {/* ==================== SCREEN 3: DEMANDES RECUES & CHAT MESSAGING CONSOLE ==================== */}
        {gpSubView === 'requests' && (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left box: Requests pending review */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <h3 className="font-bold text-sm text-[#0A0A0A] mb-4">Demandes de transport de colis</h3>
                
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs italic">
                    Aucune nouvelle demande en attente pour l'instant.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(exp => (
                      <div 
                        key={exp.id} 
                        onClick={() => setActiveExpForChat(exp)}
                        className={`border rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-all ${activeExpForChatDetails?.id === exp.id ? 'border-[#E5231B] ring-1 ring-red-100 bg-red-50/5' : 'border-[#E8E8E8]'}`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[10px] font-mono text-gray-400">Réf : {exp.id}</span>
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                            EN ATTENTE
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-[13px] text-gray-900 leading-snug">{exp.description}</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 border-t border-b border-gray-100 py-2.5 my-2.5">
                          <div>
                            <span>De: <strong>{exp.villeDepart}</strong></span><br/>
                            <span>À: <strong>{exp.villeArrivee}</strong></span>
                          </div>
                          <div className="text-right">
                            <span>Client: <strong>{exp.clientPrenom} {exp.clientNom}</strong></span><br/>
                            <span>Poids: <strong className="text-gray-950 font-mono">{exp.poids} kg</strong></span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <span className="font-bold font-mono text-[#E5231B] text-xs">
                            Gains attendus : {exp.prixTotal} {exp.devise === 'EUR' ? '€' : 'FCFA'}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionOnExp(exp.id, 'CONFIRM_ACCEPT');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded"
                              id={`btn-gp-approve-exp-${exp.id}`}
                            >
                              Accepter
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionOnExp(exp.id, 'REFUSE');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] rounded"
                              id={`btn-gp-reject-exp-${exp.id}`}
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right box: Chats and details */}
            <div className="lg:col-span-7 space-y-6">
              {activeExpForChatDetails ? (
                <div>
                  <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 mb-4 shadow-xs">
                    <span className="text-[10px] uppercase font-mono text-gray-400">Dossier Colis Actif</span>
                    <h3 className="font-bold text-sm text-gray-900 mt-0.5">{activeExpForChatDetails.description}</h3>
                    <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-4">
                      <span>👤 Client : <strong>{activeExpForChatDetails.clientPrenom} {activeExpForChatDetails.clientNom}</strong></span>
                      <span>⚖ Poids : <strong>{activeExpForChatDetails.poids} kg</strong></span>
                      <span>💰 Gains : <strong className="text-[#E5231B]">{activeExpForChatDetails.prixTotal} {activeExpForChatDetails.devise === 'EUR' ? '€' : 'FCFA'}</strong></span>
                    </div>
                  </div>

                  {/* Messaging panel */}
                  <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs flex flex-col justify-between h-[400px]">
                    <div>
                      <h4 className="font-bold text-xs font-mono uppercase text-gray-400 tracking-wider border-b pb-2 mb-4">
                        Discussion colis directe
                      </h4>
                      
                      <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1 flex flex-col">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-gray-400 text-xs py-8 italic">
                            Aucun message échangé. Écrivez au client !
                          </div>
                        ) : (
                          chatMessages.map(msg => {
                            const isMe = msg.senderId === currentUser?.id;
                            const isSystem = msg.senderId === 'SYSTEM';

                            if (isSystem) {
                              return (
                                <div key={msg.id} className="text-center py-1 bg-gray-50 border border-gray-100 text-[9px] text-gray-400 rounded max-w-sm mx-auto font-mono my-1">
                                  {msg.contenu}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[75%] rounded-lg p-2.5 text-xs ${isMe ? 'bg-[#1A1A1A] text-white self-end' : 'bg-gray-100 text-gray-900 self-start'}`}
                              >
                                <span className="text-[8px] opacity-40 font-mono mb-0.5">
                                  {isMe ? 'Vous (GP)' : `${activeExpForChatDetails.clientPrenom}`}
                                </span>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.contenu}</p>
                                <span className="text-[7px] opacity-30 text-right mt-1 font-mono">
                                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleChatSend} className="border-t pt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={`Message à ${activeExpForChatDetails.clientPrenom}...`}
                          className="flex-1 bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                        />
                        <button type="submit" className="px-4 py-2 bg-[#E1251E] text-white text-xs font-bold rounded-lg hover:bg-black transition-all">
                          Envoyer
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#E8E8E8] rounded-xl p-8 text-center text-gray-400 text-xs">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  Sélectionnez une demande dans la liste de gauche pour ouvrir la discussion et valider le colis.
                </div>
              )}
            </div>

          </div>
        )}


        {/* ==================== SCREEN 4: KYC VERIFICATION PROGRESSIVE IN_PROGRESS ==================== */}
        {gpSubView === 'kyc' && (
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-8 max-w-xl mx-auto shadow-md">
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">Processus d'Identité Vérifié (KYC)</h3>
            <p className="text-xs text-gray-500 mb-6">Conformément aux directives de sécurité du transport aérien, nous vérifions le passeport de tous les GPs.</p>

            {/* Current status display */}
            <div className="bg-gray-50 rounded-lg p-4 text-xs mb-6 border border-gray-200">
              <span className="text-gray-400 uppercase tracking-widest text-[9px] block">Statut Actuel de votre dossier</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-bold text-sm text-[#0a0a0a]">
                  {currentUser?.kycStatus === 'AUCUN' && '❌ Pièces d\'identité non fournies'}
                  {currentUser?.kycStatus === 'EN_ATTENTE' && '⏳ Documents en cours de validation par l\'administrateur'}
                  {currentUser?.kycStatus === 'VÉRIFIÉ' && '✔ Félicitations ! Votre profil est validé par l\'équipe administrative.'}
                  {currentUser?.kycStatus === 'REJETÉ' && '❌ Dossier rejeté. Veuillez soumettre à nouveau des scans lisibles.'}
                </span>
                <span className="bg-[#1A1A1A] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  {currentUser?.kycStatus}
                </span>
              </div>
            </div>

            {/* KYC Wizard Step 1 */}
            {kycStep === 1 && (
              <div className="space-y-4">
                <div className="text-xs font-bold bg-[#E5231B]/5 border-l-4 border-[#E5231B] text-gray-700 p-3 mb-2 rounded-r">
                  Étape 1 sur 3 — Import de la pièce d'identité européenne/africaine
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Scan Passeport ou CNI (Recto) *</label>
                  <div className="border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50">
                    <span className="text-xs text-gray-500">Cliquez pour importer la face avant</span>
                    <input 
                      type="file" 
                      onChange={() => setKycIdRecto('passeport_face.png')} 
                      className="hidden" 
                      id="input-kyc-r"
                    />
                    <button 
                      type="button" 
                      onClick={() => setKycIdRecto('passeport_recto.png')} 
                      className="text-[10px] text-[#E5231B] hover:underline font-mono block mt-1"
                    >
                      📎 Attacher un document test ("passeport_recto.png")
                    </button>
                  </div>
                  {kycIdRecto && <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1">✔ Attaché : {kycIdRecto}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Scan de la pièce d'identité (Verso) *</label>
                  <div className="border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50">
                    <span className="text-xs text-gray-500">Cliquez pour importer la face arrière</span>
                    <button 
                      type="button" 
                      onClick={() => setKycIdVerso('passeport_verso.png')} 
                      className="text-[10px] text-[#E5231B] hover:underline font-mono block mt-1"
                    >
                      📎 Attacher un document test ("passeport_verso.png")
                    </button>
                  </div>
                  {kycIdVerso && <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1">✔ Attaché : {kycIdVerso}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Selfie neutre tenant votre pièce d'identité visible *</label>
                  <div className="border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50">
                    <span className="text-xs text-gray-500">Face caméra de bonne luminosité</span>
                    <button 
                      type="button" 
                      onClick={() => setKycSelfie('selfie_physique_verify.jpg')} 
                      className="text-[10px] text-[#E5231B] hover:underline font-mono block mt-1"
                    >
                      📎 Attacher un selfie test ("selfie.jpg")
                    </button>
                  </div>
                  {kycSelfie && <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1">✔ Attaché : {kycSelfie}</p>}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleKycProgress}
                    className="px-6 py-2 bg-[#E5231B] hover:bg-black text-white text-xs font-bold rounded flex items-center gap-1"
                    id="btn-kyc-step1-next"
                  >
                    <span>Continuer vers coordonnées paiement</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* KYC Wizard Step 2 */}
            {kycStep === 2 && (
              <div className="space-y-4">
                <div className="text-xs font-bold bg-[#E5231B]/5 border-l-4 border-[#E5231B] text-gray-700 p-3 mb-2 rounded-r">
                  Étape 2 sur 3 — Renseignez vos coordonnées de retrait
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Option A: Bank account */}
                  <div className="border p-4 rounded-lg bg-white">
                    <h4 className="font-bold text-xs mb-2 flex items-center gap-1">🏦 Virement Bancaire (Europe, Intl)</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-gray-400">Nom de la Banque</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Société Générale"
                          className="w-full border p-1 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400">IBAN du compte</label>
                        <input
                          type="text"
                          value={bankIban}
                          onChange={(e) => setBankIban(e.target.value)}
                          placeholder="FR76 3000..."
                          className="w-full border p-1 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Option B: Mobile Money (Sénégal, CI) */}
                  <div className="border p-4 rounded-lg bg-white">
                    <h4 className="font-bold text-xs mb-2 flex items-center gap-1">🟠 Mobile Money (Sénégal, Côte d'Ivoire)</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-gray-400">Réseau partenaire</label>
                        <select
                          value={mobileMoneyType}
                          onChange={(e) => setMobileMoneyType(e.target.value)}
                          className="w-full border p-1 rounded bg-white"
                        >
                          <option value="Wave">Wave Business Sénégal</option>
                          <option value="Orange Money">Orange Money Sénégal</option>
                          <option value="MTN Money">MTN Money Côte d'Ivoire</option>
                          <option value="Moov">Moov Money Côte d'Ivoire</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono">Numero Téléphone</label>
                        <input
                          type="tel"
                          value={mobileMoneyNum}
                          onChange={(e) => setMobileMoneyNum(e.target.value)}
                          placeholder="+221 77 123 45 67"
                          className="w-full border p-1 rounded"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setKycStep(1)}
                    className="px-4 py-2 border rounded text-xs text-gray-500 hover:bg-gray-50"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleKycProgress}
                    className="px-6 py-2 bg-[#E5231B] hover:bg-black text-white text-xs font-bold rounded flex items-center gap-1"
                    id="btn-kyc-submit-final"
                  >
                    <span>Soumettre mon dossier au contrôle</span>
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* KYC Wizard Step 3 */}
            {kycStep === 3 && (
              <div className="text-center py-6">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  ✔
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Dossier de vérification transmis avec succès !</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  Nos équipes examinent vos documents. Le statut passe à <strong>"EN_ATTENTE"</strong>. Vous recevrez une validation sous 24h ouvrées.
                </p>
                <div className="p-3 bg-amber-50 text-amber-900 text-[10px] border border-amber-200 rounded max-w-sm mx-auto mb-6">
                  💡 <strong>Astuce Démo :</strong> Vous pouvez basculer d'un clic en <strong>"Administrateur"</strong> via la bannière noire tout en haut de l'écran pour valider instantanément votre propre KYC et voir le statut "VÉRIFIÉ" !
                </div>
                <button
                  onClick={() => {
                    setGpSubView('listings');
                    setKycStep(1); // reset step for next time
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-black"
                >
                  Retourner vers mon tableau de bord
                </button>
              </div>
            )}

          </div>
        )}


        {/* ==================== SCREEN 5: FINANCES & MONTHLY REVENUE WITHDRAWALS ==================== */}
        {gpSubView === 'finances' && (
          <div className="space-y-6">
            
            {/* General metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-mono mb-1">
                  <Award className="h-4 w-4 text-[#E5231B]" /> Revenus Totaux Cumulés
                </div>
                <p className="text-2xl font-sans font-bold text-gray-900">
                  {totalEarned > 0 ? `${totalEarned} € / FCFA` : '12 000 FCFA'}
                </p>
                <span className="text-[10px] text-gray-400 block mt-1">Simulé d'après l'historique de vos colis livrés</span>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-mono mb-1">
                  <Clock className="h-4 w-4 text-[#E5231B]" /> En cours de versement
                </div>
                <p className="text-2xl font-sans font-bold text-amber-600">
                  {pendingPayoutAmount > 0 ? `${pendingPayoutAmount} € / FCFA` : '0'}
                </p>
                <span className="text-[10px] text-gray-400 block mt-1">Colis nouvellement arrivés non retirés</span>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-mono mb-1">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> Mode Retrait Enregistré
                </div>
                <p className="text-sm font-bold text-gray-900 mt-1.5">
                  {currentUser?.kycStatus === 'VÉRIFIÉ' ? 'Wave Mobile Money (+221)' : 'Par IBAN de Compte Courant'}
                </p>
                <span className="text-[10px] text-gray-400 block mt-1">Vérifié via le protocole KYC de GP Connect</span>
              </div>

            </div>

            {/* Financial Ledger Table */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
              <h3 className="font-bold text-sm text-[#0A0A0A] mb-4">Tableau des Payouts Transférés</h3>
              
              {myPaiements.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs italic">
                  Aucun historique de paiement pour l'instant. Complétez et livrez les colis de vos trajets pour débloquer les gains.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b text-gray-400 font-mono text-[10px] uppercase">
                        <th className="py-3">ID Colis</th>
                        <th className="py-3">Montant</th>
                        <th className="py-3">Système de Retrait</th>
                        <th className="py-3">État Transfert</th>
                        <th className="py-3 text-right">Action GP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myPaiements.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="py-3 font-mono">{p.expeditionId}</td>
                          <td className="py-3 font-bold text-black">{p.montant} {p.devise === 'EUR' ? '€' : 'FCFA'}</td>
                          <td className="py-3 text-gray-500 font-medium">{p.methode}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${p.statut === 'VERSÉ' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {p.statut}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {p.statut === 'EN_ATTENTE' ? (
                              <button
                                onClick={() => {
                                  requestPayout(p.id);
                                  alert("Retrait d'argent demandé ! Les fonds ont été virés sur votre Mobile Money / Wave.");
                                }}
                                className="px-2.5 py-1 bg-emerald-600 font-bold hover:bg-black text-white text-[10px] rounded transition-colors"
                              >
                                Déclencher le versement direct
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold text-[10px]">💰 VERSÉ SUR VOTRE WALLET</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

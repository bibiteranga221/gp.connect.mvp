import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Search, Ship, UserCheck, Shield, Award, Landmark, CornerDownRight, Quote, PlusCircle, CheckCircle, ArrowRight, Plane } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSearchGP: (depart: string, arrivee: string, type: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSearchGP }) => {
  const { activeLanguage, trajets, currentUser, switchRole } = useAppState();

  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [colisType, setColisType] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchGP(depart, arrivee, colisType);
  };

  const isFR = activeLanguage === 'FR';

  // Stats or Trust values
  const stats = [
    { value: '1 200+', label: isFR ? 'GPs vérifiés par passeport' : 'Verified global GPs' },
    { value: '98%', label: isFR ? 'Livraisons réussies à temps' : 'On-time delivery rate' },
    { value: '47+', label: isFR ? 'Pays desservis' : 'Countries covered' }
  ];

  // Testimonials
  const testimonials = [
    {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      name: 'Aminata Diallo',
      role: isFR ? 'Cliente (Dakar)' : 'Client (Dakar)',
      text: isFR 
        ? 'J\'ai envoyé des documents juridiques urgents de Paris à Dakar. Trouvé un GP de confiance en quelques heures, livrés en 24h chrono. Exceptionnel !'
        : 'I sent urgent legal contraction papers from Paris to Dakar. Found a trusted GP in hours, delivered in 24h flat. Exceptional service!',
      stars: 5,
    },
    {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
      name: 'Yannick Noah',
      role: isFR ? 'Client (Lyon)' : 'Client (Lyon)',
      text: isFR
        ? 'Pratique pour envoyer des boubous traditionnels et épices à mon frère à Lyon. Moins cher et plus fiable que les majors de transport.'
        : 'Very practical for sending traditional garments & food spices to my brother in Lyon. Cheaper and more secure than traditional freight carriers.',
      stars: 5,
    },
    {
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
      name: 'Fatou Diop',
      role: isFR ? 'Grand Passager (Paris)' : 'Grand Passager (Paris)',
      text: isFR
        ? 'GP Connect amortit mes billets d\'avion Paris-Dakar-Paris. J\'aide mes compatriotes tout en rentabilisant mes valises vides !'
        : 'GP Connect offsets my airplane tickets between Paris & Dakar. Doing good deed for compatriots while monetizing unused baggage allowance!',
      stars: 5,
    }
  ];

  // How it works steps
  const clientSteps = [
    { num: '01', title: isFR ? 'Recherchez un GP' : 'Search for a GP', desc: isFR ? 'Saisissez vos villes de départ et d\'arrivée ainsi que le type de colis.' : 'Input departure, destination and your package type.' },
    { num: '02', title: isFR ? 'Soumettez votre colis' : 'Consult & Reserve', desc: isFR ? 'Proposez votre colis, déterminez le poids et payez en toute sécurité.' : 'Offer your parcel, detail the weight, and execute secure deposit.' },
    { num: '03', title: isFR ? 'Suivez à la trace' : 'Track your Shipment', desc: isFR ? 'Renseignez-vous en temps réel grâce au chat et à la timeline de transport.' : 'Stay informed throughout the transit with live chat & stages logging.' }
  ];

  const gpSteps = [
    { num: '01', title: isFR ? 'Publiez votre trajet' : 'Publish your Flight', desc: isFR ? 'Renseignez votre billet d\'avion, kg libres et prix par kilo.' : 'Indicate your flight itinerary, free baggage space and price per kg.' },
    { num: '02', title: isFR ? 'Validez les colis' : 'Approve & Earn', desc: isFR ? 'Contrôlez les demandes des clients, inspectez la description et acceptez.' : 'Filter client demands, review descriptions and approve the package.' },
    { num: '03', title: isFR ? 'Livrez & Recevez' : 'Deliver & Collect', desc: isFR ? 'Remettez le colis en main propre et recevez vos gains par Mobile Money.' : 'Hand over the package to the recipient and withdraw earnings instantly.' }
  ];

  return (
    <div className="bg-white min-h-screen text-[#0A0A0A]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-16 border-b border-[#E8E8E8]" id="section-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Styled Dark Hero Card (Geometric Balance) */}
            <div className="lg:col-span-7 bg-[#0A0A0A] rounded-[18px] p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col justify-between shadow-xs">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#E5231B] rounded-full opacity-10 filter blur-xl transform translate-x-12 -translate-y-12"></div>
              
              <div className="relative z-10 flex flex-col gap-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-bold bg-white/10 text-[#E5231B] font-mono w-fit border border-white/10">
                  ⚡ {isFR ? 'Plateforme de confiance' : 'Trusted global network'}
                </span>
                
                <h1 className="font-sans font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight">
                  {isFR ? (
                    <>
                      Envoyez vos colis <br />
                      par avion <span className="text-[#E5231B]">facilement</span>
                    </>
                  ) : (
                    <>
                      Send your parcels <br />
                      by air <span className="text-[#E5231B]">easily</span>
                    </>
                  )}
                </h1>
                
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                  {isFR 
                    ? 'Trouvez un Grand Passager (GP) de confiance pour vos expéditions internationales. Rapide, sécurisé, tracé.' 
                    : 'Connect with verified frequent travelers (Grand Passager) to carry your parcels abroad securely, quickly and at a fraction of standard prices.'}
                </p>
              </div>

              {/* Action Buttons & Quick Stats inside Hero */}
              <div className="relative z-10 flex flex-col gap-6 mt-8 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById('search-form-widget');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold rounded-[14px] text-xs sm:text-sm transition-all shadow-sm active:scale-98 cursor-pointer"
                    id="btn-cta-find"
                  >
                    {isFR ? 'Trouver un Grand Passager' : 'Find a GP Carrier'}
                  </button>
                  <button
                    onClick={() => {
                      if (currentUser) {
                        switchRole('GP');
                        onNavigate('gp-dashboard');
                      } else {
                        onNavigate('signup');
                      }
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-[14px] text-xs sm:text-sm transition-colors border border-white/20 active:scale-98 cursor-pointer"
                    id="btn-cta-register-trip"
                  >
                    {isFR ? 'Je suis GP — Inscrire mon trajet' : 'I am flying — Post my itinerary'}
                  </button>
                </div>

                {/* Hero Stats */}
                <div className="grid grid-cols-3 gap-4 text-left">
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-white">1 200+</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{isFR ? 'GPs vérifiés' : 'Verified GPs'}</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-white">98%</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{isFR ? 'Livraisons' : 'Successful'}</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-[#E5231B]">47</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{isFR ? 'Pays' : 'Countries'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Search Widget Box */}
            <div className="lg:col-span-5 flex flex-col justify-center" id="search-form-widget">
              <div className="bg-white border border-[#E8E8E8] rounded-[18px] p-6 shadow-xs flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-[#E5231B]" />
                    {isFR ? 'Rechercher un trajet' : 'Search Active Itineraries'}
                  </h3>
                  
                  <form onSubmit={handleSearchSubmit} className="space-y-4">
                    {/* Depart */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        {isFR ? 'DÉPART' : 'DEPARTURE'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="Paris (CDG)..."
                        value={depart}
                        onChange={(e) => setDepart(e.target.value)}
                        className="w-full bg-white border border-[#E8E8E8] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                        id="input-depart-search"
                      />
                    </div>

                    {/* Arrivee */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        {isFR ? 'DESTINATION' : 'DESTINATION'}
                      </label>
                      <input 
                        type="text" 
                        placeholder="Dakar (DSS)..."
                        value={arrivee}
                        onChange={(e) => setArrivee(e.target.value)}
                        className="w-full bg-white border border-[#E8E8E8] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                        id="input-dest-search"
                      />
                    </div>

                    {/* Parcel Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        {isFR ? 'Type de Colis' : 'Type of Parcel'}
                      </label>
                      <select
                        value={colisType}
                        onChange={(e) => setColisType(e.target.value)}
                        className="w-full bg-white border border-[#E8E8E8] rounded-[10px] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E5231B] text-[#0A0A0A]"
                        id="select-type-colis-search"
                      >
                        <option value="">{isFR ? 'Tous types acceptés' : 'All types'}</option>
                        <option value="documents">{isFR ? '📰 Documents prioritaires' : '📰 Priority documents'}</option>
                        <option value="vêtements">{isFR ? '👕 Vêtements / Effets' : '👕 Clothing & Fashion'}</option>
                        <option value="électronique">{isFR ? '💻 Appareils électroniques' : '💻 Electronics'}</option>
                        <option value="médicaments">{isFR ? '💊 Médicaments autorisés' : '💊 Prescribed Medicine'}</option>
                        <option value="autre">{isFR ? '📦 Autre' : '📦 Miscellaneous'}</option>
                      </select>
                    </div>

                    {/* Submit Button - 52px height */}
                    <button
                      type="submit"
                      className="w-full h-[52px] bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-sm rounded-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      id="btn-search-find-gp"
                    >
                      <Search className="h-4 w-4" />
                      {isFR ? 'Trouver un Grand Passager (GP)' : 'Request GP Match'}
                    </button>
                  </form>
                </div>

                <p className="text-[11px] text-gray-400 mt-4 text-center font-mono">
                  {isFR ? '14 trajets disponibles cette semaine ✈' : '14 flights registered scheduled for this week ✈'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (CONFIANCE) */}
      <section className="py-12 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center p-4">
                <span className="text-4xl font-bold font-sans text-[#0A0A0A] mb-1">
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-gray-500 font-mono tracking-wide uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Secure Trust Badges */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-wrap justify-center items-center gap-8 text-xs text-gray-500 font-mono">
            <span className="flex items-center gap-1.5 grayscale opacity-75">
              <UserCheck className="h-4 w-4 text-[#E5231B]" /> KYC DOUBLE CONTRÔLE
            </span>
            <span className="flex items-center gap-1.5 grayscale opacity-75">
              <Shield className="h-4 w-4 text-[#E5231B]" /> STRIPE & WAVE SÉCURISÉ
            </span>
            <span className="flex items-center gap-1.5 grayscale opacity-75">
              <Award className="h-4 w-4 text-[#E5231B]" /> ASSURANCE LIVRAISON
            </span>
          </div>
        </div>
      </section>

      {/* 3. COMMENT CA MARCHE */}
      <section className="py-20 border-b border-[#E8E8E8]" id="section-how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] font-sans">
              {isFR ? 'Fonctionnement de GP Connect' : 'How the GP Connect Ecosystem Works'}
            </h2>
            <div className="h-1 bg-[#E5231B] w-12 mx-auto mt-3"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Left box: Sender (Client) */}
            <div className="bg-white border border-[#E8E8E8] p-8 rounded-xl flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 text-[#E5231B] p-2 rounded-lg font-mono font-bold text-xs">
                  CLIENT
                </div>
                <h3 className="text-xl font-bold">{isFR ? 'Je veux expédier un colis' : 'I want to send a parcel'}</h3>
              </div>
              
              <div className="space-y-6 mt-4">
                {clientSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-mono font-bold text-lg text-gray-300">{step.num}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#0A0A0A] mb-1">{step.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  if (currentUser) {
                    switchRole('CLIENT');
                    onNavigate('client-dashboard');
                  } else {
                    onNavigate('signup');
                  }
                }}
                className="mt-4 py-2.5 px-4 bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] font-medium text-xs rounded transition-colors flex items-center justify-center gap-2 self-start"
              >
                {isFR ? 'Créer une expédition' : 'Publish My Colis'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right box: Traveller (GP) */}
            <div className="bg-white border border-[#E8E8E8] p-8 rounded-xl flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-dark text-white bg-black px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                  GP CARRIER
                </div>
                <h3 className="text-xl font-bold">{isFR ? 'Je suis Grand Passager (Voyageur)' : 'I am traveling by Plane'}</h3>
              </div>

              <div className="space-y-6 mt-4">
                {gpSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-mono font-bold text-lg text-gray-300">{step.num}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#0A0A0A] mb-1">{step.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (currentUser) {
                    switchRole('GP');
                    onNavigate('gp-dashboard');
                  } else {
                    onNavigate('signup');
                  }
                }}
                className="mt-4 py-2.5 px-4 bg-[#E5231B] text-white hover:bg-[#C91A14] font-medium text-xs rounded transition-colors flex items-center justify-center gap-2 self-start"
              >
                {isFR ? 'Enregistrer mon vol' : 'Publish My Travel'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ACTIVE TRAJETS LIST MINI PREVIEW */}
      <section className="py-20 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-baseline mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] font-sans">
                {isFR ? 'Prochains départs actifs' : 'Next Active Flight Departures'}
              </h2>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {isFR ? 'Réservation directe auprès des GPs vérifiés' : 'Direct secure deals with verified courier GPs'}
              </p>
            </div>
            <button
              onClick={() => {
                if (currentUser) {
                  switchRole('CLIENT');
                  onNavigate('client-dashboard');
                } else {
                  onNavigate('login');
                }
              }}
              className="text-xs font-semibold text-[#E5231B] hover:underline flex items-center gap-1"
            >
              {isFR ? 'Voir tous les trajets →' : 'Browse flights →'}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trajets.slice(0, 3).map((trajet) => (
              <div key={trajet.id} className="bg-white border border-[#E8E8E8] rounded-xl p-5 hover:border-[#E5231B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                      <img src={trajet.gpAvatar} alt={trajet.gpNom} className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-[#0A0A0A]">{trajet.gpPrenom} {trajet.gpNom}</span>
                          <span className="text-[10px] bg-[#E5231B]/10 text-[#E5231B] px-1.5 py-0.2 rounded font-bold uppercase">Vérifié</span>
                        </div>
                        <div className="flex items-center text-[10px] text-yellow-500 font-bold">
                          ★ {trajet.gpNote} <span className="text-gray-400 font-normal ml-0.5">({trajet.gpAvisCount} avis)</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-[#F5F5F5] text-[#0A0A0A] rounded font-mono border border-[#E8E8E8]">
                      {trajet.prixParKg} {trajet.devise === 'EUR' ? '€' : 'FCFA'} /kg
                    </span>
                  </div>

                  {/* Route */}
                  <div className="border-t border-b border-gray-100 py-3 mb-3">
                    <div className="flex items-center justify-between font-bold text-sm text-[#0A0A0A]">
                      <div className="flex flex-col">
                        <span>{trajet.villeDepart}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{trajet.paysDepart}</span>
                      </div>
                      <span className="text-gray-300 font-mono">✈</span>
                      <div className="flex flex-col items-end">
                        <span>{trajet.villeArrivee}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{trajet.paysArrivee}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-[11px] text-gray-500 mt-2.5">
                      <span>Départ : <strong>{new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</strong></span>
                      <span className="text-[#E5231B] font-semibold">{trajet.poidsDisponible} kg dispo</span>
                    </div>
                  </div>

                  {/* Accepts */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {trajet.typesAcceptes.map((t, i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-gray-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (currentUser) {
                      switchRole('CLIENT');
                      onNavigate('client-dashboard');
                    } else {
                      onNavigate('login');
                    }
                  }}
                  className="w-full py-2 bg-[#1A1A1A] hover:bg-black text-white font-medium text-xs rounded transition-colors text-center"
                >
                  {isFR ? 'Contacter ce GP' : 'Contact GP'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 bg-white border-b border-[#E8E8E8]" id="section-testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] font-sans">
              {isFR ? 'Ils recommandent GP Connect' : 'Trusted by Thousands Worldwide'}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {isFR ? 'Découvrez les retours de notre communauté de confiance' : 'Authentic feedback from daily users'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, index) => (
              <div key={index} className="bg-white border border-[#E8E8E8] rounded-[14px] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex text-yellow-500 mb-3" id={`testimonial-stars-${index}`}>
                    {Array.from({ length: test.stars }).map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed mb-6" id={`testimonial-comment-${index}`}>
                    "{test.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <img src={test.avatar} alt={test.name} className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-100" />
                  <div>
                    <h4 className="font-bold text-xs text-[#0A0A0A]">{test.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATIC SECURE PAYMENTS DETAILS PLATFORM SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xs uppercase font-mono tracking-widest text-gray-400 mb-6">
            {isFR ? 'Méthodes de paiement acceptées' : 'Secure Payout Systems integrated'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-10 grayscale opacity-60">
            <div className="flex items-center gap-1 font-bold text-sm tracking-tighter">
              <span className="text-blue-600">★</span> stripe
            </div>
            <div className="font-sans font-bold text-sm text-[#FF5F00] flex items-center gap-1">
              <span>🟠</span> wave
            </div>
            <div className="font-serif font-black text-sm text-amber-500 italic">
              Orange Money
            </div>
            <div className="font-sans font-semibold text-xs tracking-wider text-green-700">
              💵 CASH DIRECT
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-12 border-t border-[#0A0A0A]" id="site-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-8 h-8 bg-[#E5231B] rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white transform rotate-45"></div>
                </div>
                <span className="font-bold text-lg uppercase tracking-tight text-white">GP <span className="text-[#E5231B]">Connect</span></span>
              </div>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                {isFR 
                  ? 'La plateforme internationale intelligente de confiance pour synchroniser les bagages de voyageurs avec les enveloppes et paquets de l\'Europe vers l’Afrique.'
                  : 'Smart collaborative logistics platform matching travel luggage capacity to international shipment document parcel needs.'}
              </p>
            </div>
            
            {/* Links A */}
            <div>
              <h4 className="font-mono text-xs uppercase text-gray-400 mb-3 tracking-wider">{isFR ? 'Plateforme' : 'Company'}</h4>
              <ul className="text-xs text-gray-400 space-y-2">
                <li><button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">À propos</button></li>
                <li><button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Comment ça marche</button></li>
                <li><button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Tarifs conseillés</button></li>
                <li><button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Nous recrutons</button></li>
              </ul>
            </div>

            {/* Links B */}
            <div>
              <h4 className="font-mono text-xs uppercase text-gray-400 mb-3 tracking-wider">{isFR ? 'Assistance' : 'Contact'}</h4>
              <ul className="text-xs text-gray-400 space-y-2">
                <li><a href="https://wa.me/221771234567" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1 text-green-400">WhatsApp Aide ↗</a></li>
                <li><a href="https://instagram.com/gp_connect" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                <li><button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Conditions Générales (CGU)</button></li>
                <li><button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Mentions Légales</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-center text-[11px] text-gray-500 font-mono">
            <span>© 2026 GP Connect Inc. {isFR ? 'Tous droits réservés.' : 'All rights reserved.'}</span>
            <span>Made in Senegal & France</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

import { User, Trajet, Expedition, Message, Avis, Paiement } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-client-1',
    role: 'CLIENT',
    nom: 'Sow',
    prenom: 'Amadou',
    email: 'amadou.sow@example.com',
    telephone: '+221 77 123 45 67',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    kycStatus: 'AUCUN',
    createdAt: '2026-04-10T11:00:00Z'
  },
  {
    id: 'user-gp-1',
    role: 'GP',
    nom: 'Diop',
    prenom: 'Fatou',
    email: 'fatou.diop@example.com',
    telephone: '+33 6 12 34 56 78',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    kycStatus: 'VÉRIFIÉ',
    createdAt: '2026-03-15T09:30:00Z'
  },
  {
    id: 'user-gp-2',
    role: 'GP',
    nom: 'Ndiaye',
    prenom: 'Cheikh',
    email: 'cheikh.ndiaye@example.com',
    telephone: '+221 70 987 65 43',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    kycStatus: 'EN_ATTENTE',
    createdAt: '2026-05-20T14:15:00Z'
  },
  {
    id: 'user-admin',
    role: 'ADMIN',
    nom: 'Diallo',
    prenom: 'Moussa',
    email: 'admin@gpconnect.com',
    telephone: '+221 33 822 00 00',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    kycStatus: 'AUCUN',
    createdAt: '2026-01-01T08:00:00Z'
  }
];

export const INITIAL_TRAJETS: Trajet[] = [
  {
    id: 'trajet-1',
    gpId: 'user-gp-1',
    gpNom: 'Diop',
    gpPrenom: 'Fatou',
    gpAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    gpNote: 4.9,
    gpAvisCount: 24,
    villeDepart: 'Paris',
    paysDepart: 'France',
    villeArrivee: 'Dakar',
    paysArrivee: 'Sénégal',
    dateDepart: '2026-06-25',
    poidsDisponible: 23,
    prixParKg: 8, // 8 EUR
    devise: 'EUR',
    typesAcceptes: ['documents', 'vêtements', 'électronique', 'médicaments'],
    notes: 'Départ de Roissy CDG. Je peux récupérer vos colis en région parisienne (proche RER A). Remise en main propre rapide sur Dakar Plateau ou Almadies.',
    statut: 'OUVERT',
    createdAt: '2026-06-10T12:00:00Z'
  },
  {
    id: 'trajet-2',
    gpId: 'user-gp-2',
    gpNom: 'Ndiaye',
    gpPrenom: 'Cheikh',
    gpAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    gpNote: 4.5,
    gpAvisCount: 6,
    villeDepart: 'Dakar',
    paysDepart: 'Sénégal',
    villeArrivee: 'Lyon',
    paysArrivee: 'France',
    dateDepart: '2026-06-30',
    poidsDisponible: 15,
    prixParKg: 5000, // 5000 FCFA
    devise: 'XOF',
    typesAcceptes: ['documents', 'vêtements', 'autre'],
    notes: 'Je priorise les documents et enveloppes légères. Passage par Dakar Blaise Diagne et arrivée à Lyon Saint-Exupéry.',
    statut: 'OUVERT',
    createdAt: '2026-06-12T10:30:00Z'
  },
  {
    id: 'trajet-3',
    gpId: 'user-gp-1',
    gpNom: 'Diop',
    gpPrenom: 'Fatou',
    gpAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    gpNote: 4.9,
    gpAvisCount: 24,
    villeDepart: 'Dakar',
    paysDepart: 'Sénégal',
    villeArrivee: 'Paris',
    paysArrivee: 'France',
    dateDepart: '2026-07-15',
    poidsDisponible: 46,
    prixParKg: 4500, // 4500 FCFA
    devise: 'XOF',
    typesAcceptes: ['documents', 'vêtements', 'autre', 'médicaments'],
    notes: 'Vol retour Air France, droit à 2 valises de 23kg. Pas de produits interdits ou liquides non scellés.',
    statut: 'OUVERT',
    createdAt: '2026-06-13T08:00:00Z'
  },
  {
    id: 'trajet-4',
    gpId: 'user-gp-2',
    gpNom: 'Ndiaye',
    gpPrenom: 'Cheikh',
    gpAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    gpNote: 4.5,
    gpAvisCount: 6,
    villeDepart: 'Abidjan',
    paysDepart: 'Côte d\'Ivoire',
    villeArrivee: 'Paris',
    paysArrivee: 'France',
    dateDepart: '2026-07-02',
    poidsDisponible: 30,
    prixParKg: 10,
    devise: 'EUR',
    typesAcceptes: ['documents', 'vêtements', 'électronique'],
    notes: 'Voyage d\'affaires. Bagages sécurisés.',
    statut: 'OUVERT',
    createdAt: '2026-06-14T11:00:00Z'
  }
];

export const INITIAL_EXPEDITIONS: Expedition[] = [
  {
    id: 'exp-1',
    clientId: 'user-client-1',
    clientNom: 'Sow',
    clientPrenom: 'Amadou',
    gpId: 'user-gp-1',
    gpNom: 'Diop',
    gpPrenom: 'Fatou',
    trajetId: 'trajet-1',
    villeDepart: 'Paris',
    villeArrivee: 'Dakar',
    description: 'Documents administratifs urgents (Contrats commerciaux signés de 3 pages sous enveloppe cartonnée).',
    poids: 0.5,
    photos: ['facture_edf.png'],
    statut: 'EN_TRANSIT',
    prixTotal: 8, // 0.5 * 8 = 4 EUR, but minimum charge or rounded depends
    devise: 'EUR',
    createdAt: '2026-06-11T14:00:00Z',
    trackingStages: [
      { label: 'Demande envoyée', desc: 'Demande de transport soumise par le client', statut: 'EN_ATTENTE', active: false, done: true, date: '11 Juin 2026 14:00' },
      { label: 'GP accepté', desc: 'Le Grand Passager a accepté la prise en charge', statut: 'ACCÈPTE', active: false, done: true, date: '11 Juin 2026 16:30' },
      { label: 'Colis récupéré', desc: 'Le colis a été remis au GP', statut: 'RECUPERE', active: false, done: true, date: '13 Juin 2026 19:15' },
      { label: 'En transit', desc: 'Le GP est en voyage avec le colis', statut: 'EN_TRANSIT', active: true, done: false, date: '14 Juin 2026 21:00' },
      { label: 'Livré', desc: 'Colis remis en mains propres au destinataire', statut: 'LIVRÉ', active: false, done: false }
    ]
  },
  {
    id: 'exp-2',
    clientId: 'user-client-1',
    clientNom: 'Sow',
    clientPrenom: 'Amadou',
    gpId: 'user-gp-2',
    gpNom: 'Ndiaye',
    gpPrenom: 'Cheikh',
    trajetId: 'trajet-2',
    villeDepart: 'Dakar',
    villeArrivee: 'Lyon',
    description: 'Vêtements traditionnels (2 boubous pliés soigneusement pour un mariage).',
    poids: 3,
    photos: ['photo_boubous.jpg'],
    statut: 'EN_ATTENTE',
    prixTotal: 15000, // 3 * 5000 = 15000 XOF
    devise: 'XOF',
    createdAt: '2026-06-14T10:00:00Z',
    trackingStages: [
      { label: 'Demande envoyée', desc: 'Demande de transport soumise par le client', statut: 'EN_ATTENTE', active: true, done: true, date: '14 Juin 2026 10:00' },
      { label: 'GP accepté', desc: 'Le Grand Passager a accepté la prise en charge', statut: 'ACCÈPTE', active: false, done: false },
      { label: 'Colis récupéré', desc: 'Le colis a été remis au GP', statut: 'RECUPERE', active: false, done: false },
      { label: 'En transit', desc: 'Le GP est en voyage', statut: 'EN_TRANSIT', active: false, done: false },
      { label: 'Livré', desc: 'Colis remis en mains propres', statut: 'LIVRÉ', active: false, done: false }
    ]
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    expeditionId: 'exp-1',
    senderId: 'user-client-1',
    contenu: 'Bonjour Fatou, j’aimerais savoir si vous êtes disponible pour prendre une enveloppe urgente ?',
    createdAt: '2026-06-11T14:02:00Z'
  },
  {
    id: 'msg-2',
    expeditionId: 'exp-1',
    senderId: 'user-gp-1',
    contenu: 'Bonjour Amadou, oui tout à fait. S’agit-il de documents simples papier ? Aucun liquide ou matière dangereuse ?',
    createdAt: '2026-06-11T16:28:00Z'
  },
  {
    id: 'msg-3',
    expeditionId: 'exp-1',
    senderId: 'user-client-1',
    contenu: 'C’est ça, juste un contrat juridique de 3 pages. Très léger.',
    createdAt: '2026-06-11T16:29:00Z'
  },
  {
    id: 'msg-4',
    expeditionId: 'exp-1',
    senderId: 'user-gp-1',
    contenu: 'Parfait ! J’accepte votre demande. On se retrouve le 13 juin pour la remise du colis au métro Nation.',
    createdAt: '2026-06-11T16:30:00Z'
  }
];

export const INITIAL_AVIS: Avis[] = [
  {
    id: 'avis-1',
    expeditionId: 'exp-old-1',
    auteurId: 'user-client-1',
    auteurNom: 'Amadou Sow',
    note: 5,
    commentaire: 'Fatou est extrêmement réactive et ponctuelle ! Mon colis de médicaments est arrivé à bon port à Dakar en moins de 24h. Je recommande à 100%.',
    createdAt: '2026-05-18T18:00:00Z'
  },
  {
    id: 'avis-2',
    expeditionId: 'exp-old-2',
    auteurId: 'client-anonymous',
    auteurNom: 'Marie Gomis',
    note: 5,
    commentaire: 'Excellente transaction. Fatou m’a envoyé une photo en arrivant, très rassurante et professionnelle !',
    createdAt: '2026-05-25T12:00:00Z'
  }
];

export const INITIAL_PAIEMENTS: Paiement[] = [
  {
    id: 'p-1',
    expeditionId: 'exp-1',
    gpId: 'user-gp-1',
    montant: 8,
    devise: 'EUR',
    statut: 'EN_ATTENTE',
    methode: 'Stripe (CB)',
    createdAt: '2026-06-11T16:30:00Z'
  }
];

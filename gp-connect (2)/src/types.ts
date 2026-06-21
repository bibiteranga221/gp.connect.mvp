export type UserRole = 'CLIENT' | 'GP' | 'ADMIN';

export type KYCStatus = 'AUCUN' | 'EN_ATTENTE' | 'VÉRIFIÉ' | 'REJETÉ';

export interface User {
  id: string;
  role: UserRole;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  avatar: string;
  kycStatus: KYCStatus;
  createdAt: string;
}

export interface KYC {
  userId: string;
  pieceIdentiteRecto: string; // URL/Base64 placeholder
  pieceIdentiteVerso: string; // URL/Base64 placeholder
  selfie: string;             // URL/Base64 placeholder
  statut: KYCStatus;
  banqueNom: string;
  banqueIban: string;
  mobileMoneyType: string;    // Orange Money, Wave, etc.
  mobileMoneyNumero: string;
  updatedAt: string;
}

export type TrajetStatut = 'OUVERT' | 'PLEIN' | 'TERMINE';

export interface Trajet {
  id: string;
  gpId: string;
  gpNom: string;
  gpPrenom: string;
  gpAvatar: string;
  gpNote: number;
  gpAvisCount: number;
  villeDepart: string;
  paysDepart: string;
  villeArrivee: string;
  paysArrivee: string;
  dateDepart: string;
  poidsDisponible: number; // in kg
  prixParKg: number;       // in EUR or FCFA
  devise: 'EUR' | 'XOF';
  typesAcceptes: string[]; // documents, vêtements, électronique, médicaments, autre
  notes?: string;
  statut: TrajetStatut;
  createdAt: string;
}

export type ExpeditionStatut = 'EN_ATTENTE' | 'ACCÈPTE' | 'RECUPERE' | 'EN_TRANSIT' | 'LIVRÉ' | 'ANNULÉ';

export interface TrackingStage {
  label: string;
  desc: string;
  statut: ExpeditionStatut;
  active: boolean;
  done: boolean;
  date?: string;
}

export interface Expedition {
  id: string;
  clientId: string;
  clientNom: string;
  clientPrenom: string;
  gpId: string;
  gpNom: string;
  gpPrenom: string;
  trajetId: string;
  villeDepart: string;
  villeArrivee: string;
  description: string;
  poids: number; // in kg
  photos: string[]; // list of file names/placeholders
  statut: ExpeditionStatut;
  prixTotal: number;
  devise: 'EUR' | 'XOF';
  createdAt: string;
  trackingStages: TrackingStage[];
}

export interface Message {
  id: string;
  expeditionId: string;
  senderId: string;
  contenu: string;
  createdAt: string;
}

export interface Avis {
  id: string;
  expeditionId: string;
  auteurId: string;
  auteurNom: string;
  note: number; // 1 to 5
  commentaire: string;
  createdAt: string;
}

export type PaiementStatut = 'EN_ATTENTE' | 'VERSÉ';

export interface Paiement {
  id: string;
  expeditionId: string;
  gpId: string;
  montant: number;
  devise: 'EUR' | 'XOF';
  statut: PaiementStatut;
  methode: string; // Stripe, Wave, Orange Money, etc.
  createdAt: string;
}

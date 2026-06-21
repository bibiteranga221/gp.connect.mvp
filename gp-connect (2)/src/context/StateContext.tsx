import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, KYC, Trajet, Expedition, Message, Avis, Paiement, UserRole, KYCStatus, ExpeditionStatut, TrackingStage, PaiementStatut } from '../types';
import { INITIAL_USERS, INITIAL_TRAJETS, INITIAL_EXPEDITIONS, INITIAL_MESSAGES, INITIAL_AVIS, INITIAL_PAIEMENTS } from '../data';

interface StateContextProp {
  currentUser: User | null;
  users: User[];
  trajets: Trajet[];
  expeditions: Expedition[];
  messages: Message[];
  avis: Avis[];
  paiements: Paiement[];
  activeLanguage: 'FR' | 'EN';
  loading: boolean;
  
  // Actions
  setLanguage: (lang: 'FR' | 'EN') => void;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  registerUser: (prenom: string, nom: string, email: string, telephone: string, role: UserRole) => User;
  
  // GP Actions
  submitKYC: (userId: string, data: {
    pieceIdentiteRecto: string;
    pieceIdentiteVerso: string;
    selfie: string;
    banqueNom: string;
    banqueIban: string;
    mobileMoneyType: string;
    mobileMoneyNumero: string;
  }) => void;
  publishTrajet: (data: Omit<Trajet, 'id' | 'gpId' | 'gpNom' | 'gpPrenom' | 'gpAvatar' | 'gpNote' | 'gpAvisCount' | 'statut' | 'createdAt'>) => void;
  updateExpeditionStatus: (expeditionId: string, status: ExpeditionStatut) => void;
  requestPayout: (paiementId: string) => void;

  // Client Actions
  createExpedition: (data: {
    trajetId: string;
    description: string;
    poids: number;
    photos: string[];
  }) => void;
  postAvis: (expeditionId: string, note: number, commentaire: string) => void;
  sendChatMessage: (expeditionId: string, contenu: string) => void;

  // Admin Actions
  validateGPKYC: (userId: string, status: 'VÉRIFIÉ' | 'REJETÉ') => void;
  toggleUserStatus: (userId: string) => void;
  resolveDispute: (expeditionId: string) => void;
  deleteTrajet: (trajetId: string) => void;
}

const StateContext = createContext<StateContextProp | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserInner] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<'FR' | 'EN'>('FR');
  const [loading, setLoading] = useState<boolean>(true);

  // Load from local storage or set initial seed data
  useEffect(() => {
    try {
      const cachedUsers = localStorage.getItem('gpc_users');
      const cachedTrajets = localStorage.getItem('gpc_trajets');
      const cachedExpeditions = localStorage.getItem('gpc_expeditions');
      const cachedMessages = localStorage.getItem('gpc_messages');
      const cachedAvis = localStorage.getItem('gpc_avis');
      const cachedPaiements = localStorage.getItem('gpc_paiements');
      const cachedUser = localStorage.getItem('gpc_current_user');
      const cachedLang = localStorage.getItem('gpc_lang');

      if (cachedUsers) setUsers(JSON.parse(cachedUsers));
      else {
        setUsers(INITIAL_USERS);
        localStorage.setItem('gpc_users', JSON.stringify(INITIAL_USERS));
      }

      if (cachedTrajets) setTrajets(JSON.parse(cachedTrajets));
      else {
        setTrajets(INITIAL_TRAJETS);
        localStorage.setItem('gpc_trajets', JSON.stringify(INITIAL_TRAJETS));
      }

      if (cachedExpeditions) setExpeditions(JSON.parse(cachedExpeditions));
      else {
        setExpeditions(INITIAL_EXPEDITIONS);
        localStorage.setItem('gpc_expeditions', JSON.stringify(INITIAL_EXPEDITIONS));
      }

      if (cachedMessages) setMessages(JSON.parse(cachedMessages));
      else {
        setMessages(INITIAL_MESSAGES);
        localStorage.setItem('gpc_messages', JSON.stringify(INITIAL_MESSAGES));
      }

      if (cachedAvis) setAvis(JSON.parse(cachedAvis));
      else {
        setAvis(INITIAL_AVIS);
        localStorage.setItem('gpc_avis', JSON.stringify(INITIAL_AVIS));
      }

      if (cachedPaiements) setPaiements(JSON.parse(cachedPaiements));
      else {
        setPaiements(INITIAL_PAIEMENTS);
        localStorage.setItem('gpc_paiements', JSON.stringify(INITIAL_PAIEMENTS));
      }

      if (cachedUser) {
        setCurrentUserInner(JSON.parse(cachedUser));
      } else {
        // Default guest/logout state
        setCurrentUserInner(null);
      }

      if (cachedLang) {
        setActiveLanguage(cachedLang as 'FR' | 'EN');
      }
    } catch (e) {
      console.error('Failed to parse storage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const setLanguage = (lang: 'FR' | 'EN') => {
    setActiveLanguage(lang);
    localStorage.setItem('gpc_lang', lang);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserInner(user);
    if (user) {
      saveToStorage('gpc_current_user', user);
    } else {
      localStorage.removeItem('gpc_current_user');
    }
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);

    // Update in users storage as well
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, role } : u);
    setUsers(updatedUsers);
    saveToStorage('gpc_users', updatedUsers);
  };

  const loginUser = (email: string): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const registerUser = (prenom: string, nom: string, email: string, telephone: string, role: UserRole): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      role,
      nom,
      prenom,
      email,
      telephone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      kycStatus: role === 'GP' ? 'AUCUN' : 'AUCUN',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToStorage('gpc_users', updatedUsers);
    setCurrentUser(newUser);
    return newUser;
  };

  // GP Submit KYC
  const submitKYC = (userId: string, data: {
    pieceIdentiteRecto: string;
    pieceIdentiteVerso: string;
    selfie: string;
    banqueNom: string;
    banqueIban: string;
    mobileMoneyType: string;
    mobileMoneyNumero: string;
  }) => {
    const revisedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, kycStatus: 'EN_ATTENTE' as KYCStatus };
      }
      return u;
    });

    setUsers(revisedUsers);
    saveToStorage('gpc_users', revisedUsers);

    if (currentUser?.id === userId) {
      const updatedCurrent = { ...currentUser, kycStatus: 'EN_ATTENTE' as KYCStatus };
      setCurrentUser(updatedCurrent);
    }

    // Save KYC credentials
    const kycDetail: KYC = {
      userId,
      pieceIdentiteRecto: data.pieceIdentiteRecto || 'piece_r.jpg',
      pieceIdentiteVerso: data.pieceIdentiteVerso || 'piece_v.jpg',
      selfie: data.selfie || 'selfie.jpg',
      statut: 'EN_ATTENTE',
      banqueNom: data.banqueNom,
      banqueIban: data.banqueIban,
      mobileMoneyType: data.mobileMoneyType,
      mobileMoneyNumero: data.mobileMoneyNumero,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`gpc_kyc_${userId}`, JSON.stringify(kycDetail));
  };

  // Publish active travel trajet
  const publishTrajet = (data: Omit<Trajet, 'id' | 'gpId' | 'gpNom' | 'gpPrenom' | 'gpAvatar' | 'gpNote' | 'gpAvisCount' | 'statut' | 'createdAt'>) => {
    if (!currentUser) return;
    const newTrajet: Trajet = {
      ...data,
      id: `trajet-${Date.now()}`,
      gpId: currentUser.id,
      gpNom: currentUser.nom,
      gpPrenom: currentUser.prenom,
      gpAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      gpNote: 5.0,
      gpAvisCount: 0,
      statut: 'OUVERT',
      createdAt: new Date().toISOString()
    };

    const revised = [newTrajet, ...trajets];
    setTrajets(revised);
    saveToStorage('gpc_trajets', revised);
  };

  // Update parcel tracking steps
  const updateExpeditionStatus = (expeditionId: string, status: ExpeditionStatut) => {
    const dateFormatted = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const revised = expeditions.map(exp => {
      if (exp.id === expeditionId) {
        const currentStages = [...exp.trackingStages];
        
        // Define statuses ordering
        const statusMap: Record<ExpeditionStatut, number> = {
          'EN_ATTENTE': 0,
          'ACCÈPTE': 1,
          'RECUPERE': 2,
          'EN_TRANSIT': 3,
          'LIVRÉ': 4,
          'ANNULÉ': -1
        };

        const targetRank = statusMap[status];

        // Recalculate stages
        const updatedStages = currentStages.map((stage) => {
          const stageRank = statusMap[stage.statut];
          if (status === 'ANNULÉ') {
            return {
              ...stage,
              active: stage.statut === 'ANNULÉ',
              done: false,
              date: stage.statut === 'ANNULÉ' ? dateFormatted : stage.date
            };
          }

          const isDone = stageRank !== -1 && stageRank <= targetRank;
          const isActive = stageRank === targetRank;

          return {
            ...stage,
            done: isDone,
            active: isActive,
            date: isActive ? dateFormatted : (isDone ? (stage.date || dateFormatted) : undefined)
          };
        });

        // Add compensation if canceled
        const finalStages = status === 'ANNULÉ' 
          ? [...updatedStages.filter(s => s.statut !== 'ANNULÉ'), { label: 'Annulé', desc: 'L\'expédition a été annulée', statut: 'ANNULÉ' as ExpeditionStatut, active: true, done: true, date: dateFormatted }]
          : updatedStages;

        // Create notification message from System
        setTimeout(() => {
          const systemMsg: Message = {
            id: `msg-system-${Date.now()}`,
            expeditionId,
            senderId: 'SYSTEM',
            contenu: `💡 [Système] Le statut de l'expédition est passé à : **${status}** (${dateFormatted}).`,
            createdAt: new Date().toISOString()
          };
          const messagesCache = localStorage.getItem('gpc_messages');
          let currentMsgs: Message[] = messagesCache ? JSON.parse(messagesCache) : [];
          currentMsgs.push(systemMsg);
          localStorage.setItem('gpc_messages', JSON.stringify(currentMsgs));
          setMessages(currentMsgs);
        }, 100);

        // Manage Payment validation
        if (status === 'LIVRÉ') {
          // If delivered, the payment goes to Payout status or is activated
          const paymentIndex = paiements.findIndex(p => p.expeditionId === expeditionId);
          if (paymentIndex === -1) {
            const newPay: Paiement = {
              id: `p-${Date.now()}`,
              expeditionId,
              gpId: exp.gpId,
              montant: exp.prixTotal,
              devise: exp.devise,
              statut: 'EN_ATTENTE',
              methode: exp.devise === 'XOF' ? 'Wave / Mobile Money' : 'Stripe (Virement)',
              createdAt: new Date().toISOString()
            };
            const updatedPay = [newPay, ...paiements];
            setPaiements(updatedPay);
            saveToStorage('gpc_paiements', updatedPay);
          }
        }

        return {
          ...exp,
          statut: status,
          trackingStages: finalStages
        };
      }
      return exp;
    });

    setExpeditions(revised);
    saveToStorage('gpc_expeditions', revised);
  };

  const requestPayout = (paiementId: string) => {
    const revised = paiements.map(p => {
      if (p.id === paiementId) {
        return { ...p, statut: 'VERSÉ' as PaiementStatut };
      }
      return p;
    });
    setPaiements(revised);
    saveToStorage('gpc_paiements', revised);
  };

  // Client creates simulated Shipment demand
  const createExpedition = (data: {
    trajetId: string;
    description: string;
    poids: number;
    photos: string[];
  }) => {
    if (!currentUser) return;
    const targetTrajet = trajets.find(t => t.id === data.trajetId);
    if (!targetTrajet) return;

    const totalPrice = data.poids * targetTrajet.prixParKg;

    const newExpedition: Expedition = {
      id: `exp-${Date.now()}`,
      clientId: currentUser.id,
      clientNom: currentUser.nom,
      clientPrenom: currentUser.prenom,
      gpId: targetTrajet.gpId,
      gpNom: targetTrajet.gpNom,
      gpPrenom: targetTrajet.gpPrenom,
      trajetId: targetTrajet.id,
      villeDepart: targetTrajet.villeDepart,
      villeArrivee: targetTrajet.villeArrivee,
      description: data.description,
      poids: data.poids,
      photos: data.photos,
      statut: 'EN_ATTENTE',
      prixTotal: totalPrice,
      devise: targetTrajet.devise,
      createdAt: new Date().toISOString(),
      trackingStages: [
        { label: 'Demande envoyée', desc: 'Demande de transport soumise par le client', statut: 'EN_ATTENTE', active: true, done: true, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
        { label: 'GP accepté', desc: 'Le Grand Passager a accepté la prise en charge', statut: 'ACCÈPTE', active: false, done: false },
        { label: 'Colis récupéré', desc: 'Le colis a été remis au GP', statut: 'RECUPERE', active: false, done: false },
        { label: 'En transit', desc: 'Le GP est en voyage', statut: 'EN_TRANSIT', active: false, done: false },
        { label: 'Livré', desc: 'Colis remis en mains propres', statut: 'LIVRÉ', active: false, done: false }
      ]
    };

    const updated = [newExpedition, ...expeditions];
    setExpeditions(updated);
    saveToStorage('gpc_expeditions', updated);

    // Initial automatically created Hello message for chat
    const helloMsg: Message = {
      id: `msg-hello-${Date.now()}`,
      expeditionId: newExpedition.id,
      senderId: currentUser.id,
      contenu: `Bonjour ! Je viens de créer une demande de colis pour votre trajet ${newExpedition.villeDepart} → ${newExpedition.villeArrivee}. Voici le colis : ${newExpedition.description} (poids approx : ${newExpedition.poids} kg). Est-ce bon pour vous ?`,
      createdAt: new Date().toISOString()
    };

    const updatedMsgs = [...messages, helloMsg];
    setMessages(updatedMsgs);
    saveToStorage('gpc_messages', updatedMsgs);
  };

  const postAvis = (expeditionId: string, note: number, commentaire: string) => {
    if (!currentUser) return;
    const exp = expeditions.find(e => e.id === expeditionId);
    if (!exp) return;

    const newAvis: Avis = {
      id: `avis-${Date.now()}`,
      expeditionId,
      auteurId: currentUser.id,
      auteurNom: `${currentUser.prenom} ${currentUser.nom}`,
      note,
      commentaire,
      createdAt: new Date().toISOString()
    };

    const updated = [newAvis, ...avis];
    setAvis(updated);
    saveToStorage('gpc_avis', updated);
  };

  const sendChatMessage = (expeditionId: string, contenu: string) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      expeditionId,
      senderId: currentUser.id,
      contenu,
      createdAt: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveToStorage('gpc_messages', updated);
  };

  // ADMIN ACTIONS
  const validateGPKYC = (userId: string, status: 'VÉRIFIÉ' | 'REJETÉ') => {
    const revisedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, kycStatus: status as KYCStatus };
      }
      return u;
    });

    setUsers(revisedUsers);
    saveToStorage('gpc_users', revisedUsers);

    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, kycStatus: status as KYCStatus });
    }

    // Update the saved doc
    const cachedKYC = localStorage.getItem(`gpc_kyc_${userId}`);
    if (cachedKYC) {
      const parsed: KYC = JSON.parse(cachedKYC);
      parsed.statut = status as KYCStatus;
      parsed.updatedAt = new Date().toISOString();
      localStorage.setItem(`gpc_kyc_${userId}`, JSON.stringify(parsed));
    }
  };

  const toggleUserStatus = (userId: string) => {
    // Suspend or activate user
    const updated = users.filter(u => u.id !== userId); // simplicity delete
    setUsers(updated);
    saveToStorage('gpc_users', updated);
  };

  const resolveDispute = (expeditionId: string) => {
    const revised = expeditions.map(exp => {
      if (exp.id === expeditionId) {
        return { ...exp, statut: 'ANNULÉ' as ExpeditionStatut };
      }
      return exp;
    });
    setExpeditions(revised);
    saveToStorage('gpc_expeditions', revised);
  };

  const deleteTrajet = (trajetId: string) => {
    const revised = trajets.filter(t => t.id !== trajetId);
    setTrajets(revised);
    saveToStorage('gpc_trajets', revised);
  };

  return (
    <StateContext.Provider value={{
      currentUser,
      users,
      trajets,
      expeditions,
      messages,
      avis,
      paiements,
      activeLanguage,
      loading,
      setLanguage,
      setCurrentUser,
      switchRole,
      loginUser,
      logoutUser,
      registerUser,
      submitKYC,
      publishTrajet,
      updateExpeditionStatus,
      requestPayout,
      createExpedition,
      postAvis,
      sendChatMessage,
      validateGPKYC,
      toggleUserStatus,
      resolveDispute,
      deleteTrajet
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { User, Trajet, Expedition, Paiement } from '../types';
import { Users, Truck, AlertTriangle, ShieldCheck, DollarSign, Search, Check, X, ShieldAlert, Trash2, Eye, Award } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    trajets,
    expeditions,
    paiements,
    validateGPKYC,
    toggleUserStatus,
    resolveDispute,
    deleteTrajet
  } = useAppState();

  // Selected tab indicator
  const [adminTab, setAdminTab] = useState<'overview' | 'kyc-approvals' | 'users' | 'flights' | 'disputes'>('overview');

  // Search filter inside search lists
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Extract totals
  const totalUsers = users.length;
  const totalGPs = users.filter(u => u.role === 'GP').length;
  const totalClients = users.filter(u => u.role === 'CLIENT').length;
  const activeExpeditionsCount = expeditions.filter(e => e.statut !== 'LIVRÉ' && e.statut !== 'ANNULÉ').length;

  // Monthly revenue calculation (GP fees or overall volume)
  const totalVolumeAmount = expeditions.reduce((sum, item) => sum + item.prixTotal, 0);

  // Filters for lists
  const pendingKYCUsers = users.filter(u => u.kycStatus === 'EN_ATTENTE');
  const disputesList = expeditions.filter(e => e.statut === 'EN_TRANSIT' || e.statut === 'EN_ATTENTE'); // simulation

  const filteredUsers = users.filter(u => {
    const term = searchUserQuery.toLowerCase();
    return u.prenom.toLowerCase().includes(term) || u.nom.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.telephone.includes(term);
  });

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-16 text-[#0A0A0A]">
      
      {/* Admin header */}
      <div className="bg-white border-b border-[#E8E8E8] py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-[#E5231B]" />
              <h1 className="text-2xl font-bold font-sans">Panneau d'Administration</h1>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Console globale de modération de GP Connect</p>
          </div>

          <div className="flex flex-wrap gap-1 border border-gray-200 bg-gray-100 p-1 rounded-lg">
            {(['overview', 'kyc-approvals', 'users', 'flights', 'disputes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded capitalize transition-all ${adminTab === tab ? 'bg-white text-[#0A0A0A] shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                id={`admin-tab-btn-${tab}`}
              >
                {tab === 'kyc-approvals' ? '⏳ Validation KYC' : (tab === 'flights' ? '✈ Trajets' : (tab === 'disputes' ? '⚖ Litiges' : (tab === 'users' ? '👤 Utilisateurs' : '🏠 Vue d\'ensemble')))}
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ==================== TAB 1: OVERVIEW METRICS ==================== */}
        {adminTab === 'overview' && (
          <div className="space-y-8">
            {/* Bento statistics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">GPs Vérifiés / Membres</span>
                <p className="text-3xl font-sans font-extrabold mt-1 text-[#0A0A0A]">{totalGPs} / {totalUsers}</p>
                <span className="text-xs text-emerald-600 block mt-1">✔ {pendingKYCUsers.length} en attente de vérification</span>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">Expéditions Actives</span>
                <p className="text-3xl font-sans font-extrabold mt-1 text-indigo-700">{activeExpeditionsCount}</p>
                <span className="text-xs text-gray-500 block mt-1">Sur un total de {expeditions.length} colis</span>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">Volume d'affaires (CA)</span>
                <p className="text-3xl font-sans font-extrabold mt-1 text-emerald-700 font-mono">{totalVolumeAmount} € / FCFA</p>
                <span className="text-xs text-gray-400 block mt-1">Commission théorique transac : 10%</span>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">Vols programmés</span>
                <p className="text-3xl font-sans font-extrabold mt-1 text-[#0A0A0A]">{trajets.length}</p>
                <span className="text-xs text-gray-500 block mt-1">Lignes d'aviation ouvertes</span>
              </div>

            </div>

            {/* Quick Actions Alerts */}
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* KYC quick checklist summary */}
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <div className="flex justify-between items-baseline mb-4 border-b pb-2">
                  <h3 className="font-bold text-sm">Validations KYC de Passeports en attente ({pendingKYCUsers.length})</h3>
                  <button onClick={() => setAdminTab('kyc-approvals')} className="text-xs text-[#E5231B] hover:underline font-bold">Gérer →</button>
                </div>

                {pendingKYCUsers.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 italic text-center">Aucun document en attente. Tout est à jour !</p>
                ) : (
                  <div className="space-y-3">
                    {pendingKYCUsers.map(u => (
                      <div key={u.id} className="flex justify-between items-center text-xs p-3 bg-gray-50 border rounded-lg">
                        <div>
                          <p className="font-bold text-gray-900">{u.prenom} {u.nom}</p>
                          <span className="text-[10px] text-gray-500 font-mono">{u.email}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              validateGPKYC(u.id, 'VÉRIFIÉ');
                              alert(`KYC de ${u.prenom} ${u.nom} validé !`);
                            }}
                            className="bg-emerald-600 text-white p-1.5 rounded hover:bg-emerald-700"
                            title="Approuver"
                            id={`quick-approve-${u.id}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              validateGPKYC(u.id, 'REJETÉ');
                              alert(`KYC de ${u.prenom} ${u.nom} REJETÉ !`);
                            }}
                            className="bg-red-50 text-red-700 p-1.5 rounded hover:bg-red-100"
                            title="Rejeter"
                            id={`quick-reject-${u.id}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Disputes dashboard */}
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
                <div className="flex justify-between items-baseline mb-4 border-b pb-2">
                  <h3 className="font-bold text-sm">Suivi des colis / Litiges potentiels</h3>
                  <button onClick={() => setAdminTab('disputes')} className="text-xs text-[#E5231B] hover:underline font-bold">Vérifier →</button>
                </div>
                
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Les litiges englobent les dossiers signalés par les clients ou les douanes de vol nécessitant une assistance immédiate ou une annulation de commission financière.
                </p>

                <div className="space-y-3">
                  {expeditions.slice(0, 2).map((exp, i) => (
                    <div key={i} className="text-xs p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-mono bg-indigo-50 text-indigo-800 px-1 rounded uppercase">{exp.statut}</span>
                        <p className="font-bold mt-1 max-w-xs truncate">{exp.description}</p>
                        <span className="text-[10px] text-gray-500">GP : {exp.gpPrenom} | Client : {exp.clientPrenom}</span>
                      </div>
                      <span className="font-mono font-bold text-gray-900">{exp.prixTotal} {exp.devise === 'EUR' ? '€' : 'FCFA'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}


        {/* ==================== TAB 2: DETAILED KYC CHECKLIST ==================== */}
        {adminTab === 'kyc-approvals' && (
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-sm text-[#0A0A0A] mb-4">
              Contrôle strict des pièces d’identité soumises ({pendingKYCUsers.length})
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              D'après les lois africaines et de l'espace Schengen sur le transport d'objets marchands aéronautiques, l'admin doit s'assurer de la concordance des CNI et des passeports.
            </p>

            {pendingKYCUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs italic bg-gray-50 rounded-lg">
                Aucun document de passeport en cours d'attente de validation.
              </div>
            ) : (
              <div className="space-y-6">
                {pendingKYCUsers.map((user) => {
                  // Retrieve local mock document scans from localStorage
                  const kycDataRaw = localStorage.getItem(`gpc_kyc_${user.id}`);
                  const kyc = kycDataRaw ? JSON.parse(kycDataRaw) : {
                    pieceIdentiteRecto: 'cni_paris_recto.png',
                    pieceIdentiteVerso: 'cni_paris_verso.png',
                    selfie: 'selfie_verify_gp.jpg',
                    banqueNom: 'Orange Mobile Sénégal',
                    banqueIban: '+221 77 151 22 10',
                    mobileMoneyType: 'Wave',
                    mobileMoneyNumero: '+221 70 987 65 43'
                  };

                  return (
                    <div key={user.id} className="border border-[#E8E8E8] rounded-lg p-5 bg-gray-50/50">
                      
                      {/* Name Header and buttons */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-3 mb-4">
                        <div>
                          <h4 className="font-bold text-sm text-[#0A0A0A]">{user.prenom} {user.nom}</h4>
                          <span className="text-[10px] text-gray-400 block font-mono">Email: {user.email} | Tel: {user.telephone}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              validateGPKYC(user.id, 'VÉRIFIÉ');
                              alert(`KYC de ${user.prenom} approuvé !`);
                            }}
                            className="bg-emerald-600 text-white font-bold px-4 py-1.5 rounded text-xs hover:bg-emerald-700 transition"
                            id={`btn-admin-approve-${user.id}`}
                          >
                            Approuver ID & Versement
                          </button>
                          <button
                            onClick={() => {
                              validateGPKYC(user.id, 'REJETÉ');
                              alert(`KYC de ${user.prenom} REJETÉ !`);
                            }}
                            className="bg-red-50 text-red-700 font-bold px-4 py-1.5 rounded text-xs hover:bg-red-100 transition"
                            id={`btn-admin-reject-${user.id}`}
                          >
                            Rejeter le dossier
                          </button>
                        </div>
                      </div>

                      {/* Display attachment thumbnails simulation */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
                        <div className="border bg-white rounded p-3">
                          <span className="font-semibold block text-gray-500 mb-1 font-mono uppercase text-[9px]">Face d'Identité [Recto]</span>
                          <p className="font-mono bg-gray-100 p-1.5 rounded border mb-2 text-center text-gray-700 font-bold">
                            📄 {kyc.pieceIdentiteRecto}
                          </p>
                          <div className="h-28 bg-[#F5F5F5] rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            [Aperçu Scan CNI Recto]
                          </div>
                        </div>

                        <div className="border bg-white rounded p-3">
                          <span className="font-semibold block text-gray-500 mb-1 font-mono uppercase text-[9px]">Face d'Identité [Verso]</span>
                          <p className="font-mono bg-gray-100 p-1.5 rounded border mb-2 text-center text-gray-700 font-bold">
                            📄 {kyc.pieceIdentiteVerso}
                          </p>
                          <div className="h-28 bg-[#F5F5F5] rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            [Aperçu Scan CNI Verso]
                          </div>
                        </div>

                        <div className="border bg-white rounded p-3">
                          <span className="font-semibold block text-gray-500 mb-1 font-mono uppercase text-[9px]">Cliché Selfie Vérification d'angle</span>
                          <p className="font-mono bg-gray-100 p-1.5 rounded border mb-2 text-center text-gray-700 font-bold">
                            👤 {kyc.selfie}
                          </p>
                          <div className="h-28 bg-[#F5F5F5] rounded flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            [Aperçu Selfie Utilisateur]
                          </div>
                        </div>
                      </div>

                      {/* Banking specs details */}
                      <div className="bg-white border rounded-lg p-4 text-xs text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="font-bold text-gray-900 block mb-1">Coordonnées bancaires internationales :</span>
                          <p className="font-mono text-[11px]">Banque d'extraction : <strong>{kyc.banqueNom || 'Non renseignée'}</strong></p>
                          <p className="font-mono text-[11px]">N° IBAN : <strong>{kyc.banqueIban || 'Non renseignée'}</strong></p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block mb-1">Porte-monnaie Électronique Mobile :</span>
                          <p className="font-mono text-[11px]">Réseau direct : <strong>{kyc.mobileMoneyType || 'Non renseigné'}</strong></p>
                          <p className="font-mono text-[11px]">N° Mobile Money : <strong>{kyc.mobileMoneyNumero || 'Non renseigné'}</strong></p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* ==================== TAB 3: MEMBERS DIRECTORY ==================== */}
        {adminTab === 'users' && (
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h3 className="font-bold text-sm text-[#0A0A0A]">Base de données des Utilisateurs ({filteredUsers.length})</h3>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher nom, email ou indicatif..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="bg-white border border-[#E8E8E8] text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b font-mono text-[10px] uppercase text-gray-400">
                    <th className="py-2.5">Utilisateur</th>
                    <th className="py-2.5">Rôle</th>
                    <th className="py-2.5">Adresse de messagerie</th>
                    <th className="py-2.5">N° Téléphone</th>
                    <th className="py-2.5">Vérification KYC</th>
                    <th className="py-2.5 text-right">Modération</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-3 font-semibold text-black">{user.prenom} {user.nom}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] ${user.role === 'ADMIN' ? 'bg-[#E5231B] text-white' : (user.role === 'GP' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800')}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 font-mono">{user.email}</td>
                      <td className="py-3 text-gray-500 font-mono">{user.telephone}</td>
                      <td className="py-3 font-bold">
                        <span className={`text-[10px] ${user.kycStatus === 'VÉRIFIÉ' ? 'text-emerald-600' : (user.kycStatus === 'EN_ATTENTE' ? 'text-amber-600 animate-pulse' : 'text-gray-400')}`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`Voulez-vous suspendre l'utilisateur ${user.prenom} de la plateforme ?`)) {
                                toggleUserStatus(user.id);
                                alert("Statut appliqué. L'accès utilisateur est révoqué.");
                              }
                            }}
                            className="text-red-600 hover:text-red-900 font-bold text-[10px]"
                            id={`btn-suspend-user-${user.id}`}
                          >
                            Suspendre l'accès
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ==================== TAB 4: FLIGHTS MANAGEMENT ==================== */}
        {adminTab === 'flights' && (
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-sm text-[#0A0A0A] mb-4">Répertoire Général des Trajets d'Avion ({trajets.length})</h3>
            <p className="text-xs text-gray-500 mb-6">Contrôlez les voyages programmés et supprimez les fiches obsolètes ou frauduleuses.</p>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b font-mono text-[10px] uppercase text-gray-400">
                    <th className="py-2.5">Grand Passager (ID)</th>
                    <th className="py-2.5">Itinéraire d'envol</th>
                    <th className="py-2.5">Date du vol</th>
                    <th className="py-2.5">Avis GP</th>
                    <th className="py-2.5">Prix / Kg</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trajets.map((tr) => (
                    <tr key={tr.id} className="hover:bg-gray-50">
                      <td className="py-3 font-semibold text-black">{tr.gpPrenom} {tr.gpNom}</td>
                      <td className="py-3 font-bold text-[#E5231B]">{tr.villeDepart} ✈ {tr.villeArrivee}</td>
                      <td className="py-3 font-mono text-gray-500">{tr.dateDepart}</td>
                      <td className="py-3 text-yellow-500">★ {tr.gpNote}</td>
                      <td className="py-3 font-bold font-mono text-black">{tr.prixParKg} {tr.devise}/kg</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm("Voulez-vous supprimer ce trajet de la liste publique ?")) {
                              deleteTrajet(tr.id);
                              alert("Ligne de vol supprimée !");
                            }
                          }}
                          className="text-red-600 hover:text-red-900 font-bold text-[10px]"
                          id={`btn-admin-delete-trip-${tr.id}`}
                        >
                          Déréférencer le vol
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ==================== TAB 5: DISPUTES & RESOLUTION CENTER ==================== */}
        {adminTab === 'disputes' && (
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-sm text-[#0A0A0A] mb-4">Centre de conciliation et Litiges actifs ({disputesList.length})</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">L'administrateur intervient en cas de blocage d'un colis ou de non-présentation d'un GP.</p>

            <div className="space-y-4">
              {disputesList.map((exp) => (
                <div key={exp.id} className="border border-red-200 bg-red-50/5 p-4 rounded-lg text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-gray-400 bg-slate-100 px-1 py-0.2 rounded uppercase">Réf : {exp.id}</span>
                      <h4 className="font-bold text-sm text-[#0A0A0A] mt-1">{exp.description}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded font-bold text-red-900 border border-red-300">
                      Conflit arbitral possible
                    </span>
                  </div>

                  <p className="text-gray-500 mb-3 font-mono">
                    Départ : <strong>{exp.villeDepart}</strong> → Arrivée : <strong>{exp.villeArrivee}</strong> | Montant bloqué sous séquestre GP Connect : <strong>{exp.prixTotal} {exp.devise === 'EUR' ? '€' : 'FCFA'}</strong>
                  </p>

                  <div className="bg-white p-3 border rounded-lg mb-3">
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">Informations de contact :</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-600">
                      <li>Client : <strong>{exp.clientPrenom} {exp.clientNom}</strong> ({exp.clientId})</li>
                      <li>GP Associé : <strong>{exp.gpPrenom} {exp.gpNom}</strong> ({exp.gpId})</li>
                    </ul>
                  </div>

                  {/* Resolution CTA */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        resolveDispute(exp.id);
                        alert("Le litige a été résolu en faveur du Client (Remboursement exécuté).");
                      }}
                      className="px-3 py-1.5 bg-[#E1251E] text-white font-bold hover:bg-black rounded"
                      id={`btn-resolve-refund-${exp.id}`}
                    >
                      Arbitrer : Forcer le remboursement au Client
                    </button>
                    <button
                      onClick={() => {
                        alert("Libération de la commission d'envoi. Sommes transférées au GP.");
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 border border-gray-300 text-[#0A0A0A] font-bold hover:bg-zinc-100 rounded bg-white"
                    >
                      Arbitrer : Débloquer les gains en faveur du GP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

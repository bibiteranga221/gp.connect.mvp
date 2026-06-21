'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, 
  Loader2, 
  UserCheck, 
  Upload, 
  CheckCircle, 
  FileText, 
  Camera, 
  AlertTriangle, 
  X,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function KYCVerificationPage() {
  const router = useRouter();

  // Authentication & Authorization states
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  
  // Step indicator state (1, 2, or 3)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Files state (either File objects for actual upload, or base64 preview strings)
  const [rectoFile, setRectoFile] = useState<File | null>(null);
  const [versoFile, setVersoFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  // File Preview urls
  const [rectoPreview, setRectoPreview] = useState<string>('');
  const [versoPreview, setVersoPreview] = useState<string>('');
  const [selfiePreview, setSelfiePreview] = useState<string>('');

  // Drag and drop highlights
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  // Input refs for clicking files file selector
  const rectoInputRef = useRef<HTMLInputElement>(null);
  const versoInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      // Offline Simulation or fallback if Supabase is missing
      setTimeout(() => {
        setUserId('demo-gp-user-id');
        setLoading(false);
      }, 500);
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
        .select('role')
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

      setUserId(user.id);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  // Helper handler for drag and drop
  const handleDrag = (e: React.DragEvent, id: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: active }));
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file, id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processSelectedFile(file, id);
    }
  };

  const processSelectedFile = (file: File, id: string) => {
    // Only accept images
    if (!file.type.startsWith('image/')) {
      setGeneralError('Veuillez sélectionner un fichier image valide (JPG, PNG).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (id === 'recto') {
      setRectoFile(file);
      setRectoPreview(previewUrl);
    } else if (id === 'verso') {
      setVersoFile(file);
      setVersoPreview(previewUrl);
    } else if (id === 'selfie') {
      setSelfieFile(file);
      setSelfiePreview(previewUrl);
    }

    setGeneralError('');
  };

  const removeFile = (id: string) => {
    if (id === 'recto') {
      setRectoFile(null);
      setRectoPreview('');
    } else if (id === 'verso') {
      setVersoFile(null);
      setVersoPreview('');
    } else if (id === 'selfie') {
      setSelfieFile(null);
      setSelfiePreview('');
    }
  };

  const handleNextStep = () => {
    setGeneralError('');
    if (step === 1) {
      if (!rectoFile || !versoFile) {
        setGeneralError('Veuillez charger à la fois le recto et le verso de votre pièce d’identité.');
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setGeneralError('');
    if (step === 2) {
      setStep(1);
    }
  };

  const uploadToStorage = async (file: File, fileName: string): Promise<string> => {
    if (!supabase) return 'https://example.com/mock-file-url';
    
    const fileExt = file.name.split('.').pop();
    const path = `${userId}/${fileName}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(`Erreur d'upload de fichiers: ${error.message}`);
    }

    // Get public URLs
    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleSubmitKYC = async () => {
    setGeneralError('');
    if (!selfieFile) {
      setGeneralError('Veuillez fournir un selfie avec votre pièce d’identité pour continuer.');
      return;
    }

    setSaving(true);

    try {
      let rectoUrl = 'https://example.com/mock-id-recto.jpg';
      let versoUrl = 'https://example.com/mock-id-verso.jpg';
      let selfieUrl = 'https://example.com/mock-selfie.jpg';

      if (supabase) {
        // 1. Upload Recto File
        rectoUrl = await uploadToStorage(rectoFile!, 'piece_recto');

        // 2. Upload Verso File
        versoUrl = await uploadToStorage(versoFile!, 'piece_verso');

        // 3. Upload Selfie File
        selfieUrl = await uploadToStorage(selfieFile!, 'selfie');

        // Check if kyc already exists for user
        const { data: existingKyc } = await supabase
          .from('kyc')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingKyc) {
          // Update
          const { error: updateError } = await supabase
            .from('kyc')
            .update({
              piece_recto: rectoUrl,
              piece_verso: versoUrl,
              selfie: selfieUrl,
              statut: 'EN_ATTENTE',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (updateError) throw updateError;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('kyc')
            .insert({
              user_id: userId,
              piece_recto: rectoUrl,
              piece_verso: versoUrl,
              selfie: selfieUrl,
              statut: 'EN_ATTENTE',
              created_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }

        // Also update users table kyc_status as temporary state handler
        await supabase
          .from('users')
          .update({ kyc_status: 'EN_ATTENTE' })
          .eq('id', userId);
      } else {
        // Mock offline persistence simulation delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setStep(3);
    } catch (err: any) {
      setGeneralError(err.message || 'Une erreur s’est produite lors de la transmission de vos documents.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-[#E5231B] animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Validation d’accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#0A0A0A] pb-16 pt-8 flex items-center justify-center px-4">
      <div className="w-full max-w-xl p-8 bg-white border border-[#E8E8E8] rounded-[14px] shadow-sm flex flex-col">
        
        {/* RETOUR ACTION LINK (Hidden on success stage 3) */}
        {step < 3 && (
          <button
            onClick={() => router.push('/dashboard/gp')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-850 pb-5 transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Abandonner et retourner au dashboard</span>
          </button>
        )}

        {/* PROGRESS BAR BAR SECTION */}
        {step < 3 && (
          <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold text-[#E5231B] uppercase tracking-wider">
                Étape {step} sur 2
              </span>
              <span className="text-xs font-semibold text-gray-400">
                {step === 1 ? 'Chargement des pièces' : 'Photo de contrôle'}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#E5231B] h-full transition-all duration-300"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>
        )}

        {/* Global/Validation Errors indicator */}
        {generalError && (
          <div className="bg-red-50 border border-red-200 text-[#E5231B] p-3.5 rounded-[12px] text-xs mb-6 flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-[#E5231B]" />
            <span>{generalError}</span>
          </div>
        )}

        {/* STEP 1: IDENTITY CARD UPLOAD FRONT AND BACK */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#E5231B]" />
                <h1 className="text-xl font-bold text-[#0A0A0A] tracking-tight">
                  Vérification d'identité
                </h1>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                Nous avons besoin de vérifier votre identité pour activer votre compte GP et vous permettre d'accepter des expéditions de bagages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* RECTO ELEMENT */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600">
                  Pièce d'identité (Recto) <span className="text-[#E5231B]">*</span>
                </label>
                
                {rectoPreview ? (
                  /* IMAGE PREVIEW SCREEN */
                  <div className="relative border border-[#E8E8E8] rounded-[10px] overflow-hidden aspect-video bg-gray-55 flex items-center justify-center">
                    <img 
                      src={rectoPreview} 
                      alt="Recto du document" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile('recto')}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>Recto sélectionné</span>
                    </div>
                  </div>
                ) : (
                  /* IMAGE UPLOAD SELECTOR DRAG & DROP DESIGN */
                  <div
                    onDragOver={(e) => handleDrag(e, 'recto', true)}
                    onDragLeave={(e) => handleDrag(e, 'recto', false)}
                    onDrop={(e) => handleDrop(e, 'recto')}
                    onClick={() => rectoInputRef.current?.click()}
                    className={`border border-dashed rounded-[12px] p-5 text-center flex flex-col items-center justify-center bg-white cursor-pointer transition-all hover:bg-gray-50/60 aspect-video ${
                      dragActive.recto ? 'border-[#E5231B] bg-[#FFF5F5]/30' : 'border-[#E8E8E8]'
                    }`}
                  >
                    <input 
                      ref={rectoInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'recto')} 
                      className="hidden" 
                    />
                    <div className="p-2.5 rounded-full bg-gray-50 text-gray-400 mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-[#0A0A0A]">Cliquez ou glissez l'image</p>
                    <p className="text-[10px] text-gray-505 mt-1">Recto (Passeport ou CNI)</p>
                  </div>
                )}
              </div>

              {/* VERSO ELEMENT */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600">
                  Pièce d'identité (Verso) <span className="text-[#E5231B]">*</span>
                </label>
                
                {versoPreview ? (
                  /* IMAGE PREVIEW SCREEN */
                  <div className="relative border border-[#E8E8E8] rounded-[10px] overflow-hidden aspect-video bg-gray-55 flex items-center justify-center">
                    <img 
                      src={versoPreview} 
                      alt="Verso du document" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile('verso')}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>Verso sélectionné</span>
                    </div>
                  </div>
                ) : (
                  /* IMAGE UPLOAD SELECTOR DRAG & DROP DESIGN */
                  <div
                    onDragOver={(e) => handleDrag(e, 'verso', true)}
                    onDragLeave={(e) => handleDrag(e, 'verso', false)}
                    onDrop={(e) => handleDrop(e, 'verso')}
                    onClick={() => versoInputRef.current?.click()}
                    className={`border border-dashed rounded-[12px] p-5 text-center flex flex-col items-center justify-center bg-white cursor-pointer transition-all hover:bg-gray-50/60 aspect-video ${
                      dragActive.verso ? 'border-[#E5231B] bg-[#FFF5F5]/30' : 'border-[#E8E8E8]'
                    }`}
                  >
                    <input 
                      ref={versoInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'verso')} 
                      className="hidden" 
                    />
                    <div className="p-2.5 rounded-full bg-gray-50 text-gray-400 mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-[#0A0A0A]">Cliquez ou glissez l'image</p>
                    <p className="text-[10px] text-gray-550 mt-1">Verso (Facultatif pour Passeport)</p>
                  </div>
                )}
              </div>

            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-[52px] bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
            >
              <span>Continuer</span>
            </button>
          </div>
        )}

        {/* STEP 2: SELFIE UPLOAD STAGE */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#E5231B]" />
                <h1 className="text-xl font-bold text-[#0A0A0A] tracking-tight">
                  Selfie avec votre pièce
                </h1>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                Tenez votre pièce d'identité à côté de votre visage de manière claire afin que nous puissions valider qu'il s'agit bien de vous.
              </p>
            </div>

            {/* Selfie Upload container */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600">
                Votre Selfie de verification <span className="text-[#E5231B]">*</span>
              </label>

              {selfiePreview ? (
                /* PREVIEW OF SELFIE IMAGE */
                <div className="relative border border-[#E8E8E8] rounded-[10px] overflow-hidden max-w-sm mx-auto aspect-square bg-gray-55 flex items-center justify-center">
                  <img 
                    src={selfiePreview} 
                    alt="Selfie de contrôle" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('selfie')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-[#E5231B] text-white text-[10px] px-2.5 py-1 rounded-[6px] font-bold flex items-center gap-1 shadow-xs">
                    <Camera className="h-3 w-3" />
                    <span>Photo prête</span>
                  </div>
                </div>
              ) : (
                /* DRAG AND DROP SELFIE TRIGGER BOARD */
                <div
                  onDragOver={(e) => handleDrag(e, 'selfie', true)}
                  onDragLeave={(e) => handleDrag(e, 'selfie', false)}
                  onDrop={(e) => handleDrop(e, 'selfie')}
                  onClick={() => selfieInputRef.current?.click()}
                  className={`border border-dashed rounded-[12px] p-8 text-center flex flex-col items-center justify-center bg-white cursor-pointer transition-all hover:bg-gray-50/60 max-w-sm mx-auto aspect-square ${
                    dragActive.selfie ? 'border-[#E5231B] bg-[#FFF5F5]/30' : 'border-[#E8E8E8]'
                  }`}
                >
                  <input 
                    ref={selfieInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'selfie')} 
                    className="hidden" 
                  />
                  <div className="p-4 rounded-full bg-red-50 text-[#E5231B] mb-3">
                    <Camera className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-[#0A0A0A]">Sélectionnez ou glissez votre selfie</p>
                  <p className="text-[11px] text-gray-500 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
                    Assurez-vous que votre pièce et votre visage soient complètement lisibles et bien éclairés.
                  </p>
                </div>
              )}
            </div>

            {/* Step navigation actions buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={saving}
                className="w-full sm:w-1/3 h-[52px] bg-white border border-[#E8E8E8] hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-1 px-4 cursor-pointer"
              >
                <span>Retour</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitKYC}
                disabled={saving}
                className="w-full sm:w-2/3 h-[52px] bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Télétransmission en cours...</span>
                  </>
                ) : (
                  <span>Soumettre mon dossier</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION STAGE */}
        {step === 3 && (
          <div className="text-center py-6 flex flex-col items-center">
            
            {/* Elegant large check checkmarks icon */}
            <div className="w-16 h-16 bg-[#FFF5F5] rounded-full flex items-center justify-center border border-red-100 text-[#E5231B] mb-6">
              <CheckCircle className="h-9 w-9 text-[#E5231B]" />
            </div>

            <h1 className="text-2xl font-black text-[#0A0A0A] leading-tight tracking-tight mb-2">
              Demande envoyée !
            </h1>
            
            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed mb-8">
              Votre dossier de vérification d’identité a été transmis avec succès à nos équipes. Il est en cours de traitement. <strong>Vous recevrez un retour sous 24h.</strong>
            </p>

            <button
              onClick={() => router.push('/dashboard/gp')}
              className="w-full h-[52px] bg-[#E5231B] hover:bg-[#C91A14] text-white font-bold text-sm rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Retour au dashboard</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

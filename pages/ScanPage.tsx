import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, Scan as ScanIcon, CameraOff, Loader2, RefreshCw, AlertTriangle, Zap, X, Eye, CheckCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat, NotFoundException } from '@zxing/library';
import { Epi } from '../types';

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const processingRef = useRef(false);

  const [cameraState, setCameraState] = useState<'idle' | 'loading' | 'active' | 'error' | 'scanned_error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Nouvel état pour stocker les données de l'EPI trouvé pour la pop-up
  const [scannedEpiData, setScannedEpiData] = useState<Epi | null>(null);

  // Initialize Reader once
  useEffect(() => {
    const hints = new Map();
    const formats = [
      BarcodeFormat.QR_CODE, 
      BarcodeFormat.DATA_MATRIX, 
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13, 
      BarcodeFormat.EAN_8, 
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93, 
      BarcodeFormat.UPC_A, 
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF, 
      BarcodeFormat.CODABAR
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    // OPTIMISATION: On retire TRY_HARDER pour augmenter les FPS
    // hints.set(DecodeHintType.TRY_HARDER, true); 

    // Fréquence très élevée : 50ms
    codeReaderRef.current = new BrowserMultiFormatReader(hints, 50);

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    if (!codeReaderRef.current || !videoRef.current) return;

    // Reset complet avant démarrage
    codeReaderRef.current.reset();
    
    setCameraState('loading');
    setErrorMessage(null);
    setScannedCode(null);
    setScannedEpiData(null); // Reset EPI data
    processingRef.current = false;

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      };

      await codeReaderRef.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, error) => {
          if (result && !processingRef.current) {
            handleScan(result.getText());
          }
          if (error && !(error instanceof NotFoundException)) {
            console.warn("Scan warning:", error);
          }
        }
      );
      
      setCameraState('active');

    } catch (err: any) {
      console.error("Camera start error:", err);
      setCameraState('error');
      setErrorMessage("Impossible d'accéder à la caméra.");
    }
  }, [facingMode]);

  // Start on mount or when facingMode changes
  useEffect(() => {
    startCamera();
    return () => {};
  }, [startCamera]);

  const handleScan = async (code: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    // Arrêt immédiat de la caméra pour figer l'UX
    if (codeReaderRef.current) {
        codeReaderRef.current.reset();
    }
    
    toast.loading("Recherche...", { id: 'scan-proc' });

    try {
      // On récupère TOUTES les infos de l'EPI (*), pas juste l'affectation
      const { data, error } = await supabase
        .from('epis')
        .select('*')
        .eq('code_barre', code)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        setScannedCode(code);
        setErrorMessage("Équipement inconnu en base.");
        setCameraState('scanned_error');
        toast.error("Code inconnu", { id: 'scan-proc' });
      } else {
        // SUCCÈS : On stocke les données et on affiche la pop-up (via le render conditionnel)
        setScannedEpiData(data as Epi);
        toast.success("EPI trouvé !", { id: 'scan-proc' });
        // Note: On ne redirige plus automatiquement, on laisse l'utilisateur choisir dans la modale
      }

    } catch (err: any) {
      setScannedCode(code);
      setErrorMessage(err.message || "Erreur réseau.");
      setCameraState('scanned_error');
      toast.error("Erreur", { id: 'scan-proc' });
    }
  };

  const handleRetry = () => {
    startCamera();
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const closePopupAndRescan = () => {
      setScannedEpiData(null);
      handleRetry();
  };

  const goToEpiDetail = () => {
      if (scannedEpiData) {
          navigate(`/epis/${scannedEpiData.id}`);
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center text-white relative overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6 shadow-sm z-20 sticky top-0 rounded-b-[2.5rem] w-full flex items-center">
        <button onClick={() => navigate(-1)} className="text-white hover:text-red-200 transition-colors absolute left-6">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white text-center flex-1">Scan EPI</h1>
        <button onClick={toggleCamera} className="absolute right-6 text-white hover:text-red-200">
           <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative bg-black">
        
        {/* Video Element */}
        <video 
            ref={videoRef} 
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${cameraState === 'active' ? 'opacity-100' : 'opacity-40'}`} 
            muted 
            playsInline
        />

        {/* --- OVERLAYS --- */}

        {/* Loading */}
        {cameraState === 'loading' && (
             <div className="z-10 bg-black/70 p-6 rounded-2xl flex flex-col items-center backdrop-blur-md">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                <p className="text-white font-medium">Démarrage...</p>
             </div>
        )}

        {/* Error (Permission/Hardware) */}
        {cameraState === 'error' && (
            <div className="z-10 bg-black/80 p-6 rounded-2xl flex flex-col items-center text-center max-w-xs mx-4 backdrop-blur-md">
                <CameraOff className="w-12 h-12 text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-red-400 mb-2">Erreur Caméra</h3>
                <p className="text-slate-300 text-sm mb-4">{errorMessage}</p>
                <button onClick={handleRetry} className="bg-primary px-6 py-3 rounded-xl font-medium">
                    Réessayer
                </button>
            </div>
        )}

        {/* Scan Not Found Error */}
        {cameraState === 'scanned_error' && (
            <div className="z-10 bg-slate-800 p-8 rounded-3xl flex flex-col items-center text-center max-w-sm mx-4 shadow-2xl border border-slate-700">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Résultat</h3>
                <p className="text-slate-300 mb-2">{errorMessage}</p>
                {scannedCode && (
                    <div className="bg-black/40 px-3 py-1 rounded text-mono text-sm text-yellow-400 mb-6 font-mono border border-yellow-400/30">
                        {scannedCode}
                    </div>
                )}
                <button onClick={handleRetry} className="bg-primary px-6 py-3 rounded-xl text-white font-bold w-full flex items-center justify-center hover:bg-red-700 transition-colors">
                    <RefreshCw className="w-5 h-5 mr-2" /> Scanner à nouveau
                </button>
            </div>
        )}

        {/* SUCCESS POPUP (MODAL) */}
        {scannedEpiData && (
            <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
                    
                    {/* Close Button */}
                    <button 
                        onClick={closePopupAndRescan}
                        className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        {/* Image */}
                        <div className="w-24 h-24 bg-red-50 rounded-2xl mb-4 overflow-hidden shadow-inner flex items-center justify-center">
                            {scannedEpiData.photoUrl ? (
                                <img src={scannedEpiData.photoUrl} alt={scannedEpiData.nom} className="w-full h-full object-cover" />
                            ) : (
                                <Zap className="w-10 h-10 text-primary" />
                            )}
                        </div>

                        {/* Title & Status */}
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{scannedEpiData.nom}</h2>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${scannedEpiData.etat === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {scannedEpiData.etat}
                             </span>
                             {scannedEpiData.categorie && (
                                 <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                     {scannedEpiData.categorie}
                                 </span>
                             )}
                        </div>

                        {/* Quick Info */}
                        <div className="w-full bg-slate-50 rounded-xl p-3 mb-6 text-sm text-slate-600 space-y-2">
                             <div className="flex justify-between border-b border-slate-200 pb-2">
                                 <span>Référence:</span>
                                 <span className="font-semibold text-slate-900">{scannedEpiData.reference}</span>
                             </div>
                             {scannedEpiData.date_peremption && (
                                 <div className="flex justify-between">
                                     <span>Expiration:</span>
                                     <span className="font-semibold text-slate-900 flex items-center">
                                         <Calendar className="w-3 h-3 mr-1" />
                                         {new Date(scannedEpiData.date_peremption).toLocaleDateString()}
                                     </span>
                                 </div>
                             )}
                        </div>

                        {/* Actions */}
                        <div className="flex w-full gap-3">
                            <button 
                                onClick={closePopupAndRescan}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Scanner
                            </button>
                            <button 
                                onClick={goToEpiDetail}
                                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-colors flex items-center justify-center"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir fiche
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Active Scan Overlay (Laser) - Hidden when modal is open */}
        {cameraState === 'active' && !scannedEpiData && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                
                {/* Visual Frame */}
                <div className="w-72 h-72 border-2 border-white/40 rounded-3xl relative overflow-hidden bg-white/5 shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    
                    {/* Laser */}
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-scan-laser"></div>
                </div>

                <div className="absolute bottom-20 flex items-center space-x-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-white text-sm font-medium">Recherche active...</span>
                </div>
            </div>
        )}
      </div>
      
      <style>{`
        @keyframes scan-laser {
          0% { top: 10%; opacity: 0; }
          40% { opacity: 1; }
          60% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan-laser {
          animation: scan-laser 1.0s ease-in-out infinite; 
        }
      `}</style>
    </div>
  );
};
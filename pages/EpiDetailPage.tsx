import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Epi, Profile } from '../types';
import { 
  ArrowLeft, 
  Loader2, 
  HardHat, 
  Package, 
  Tag, 
  Factory, 
  Barcode, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle,
  User,
  ListFilter // for historique_actions, a placeholder icon
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EpiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [epi, setEpi] = useState<Epi | null>(null);
  const [sapeurProfile, setSapeurProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpiDetails = async () => {
      if (!id) {
        setError("ID de l'EPI manquant.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('epis')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          setError("EPI non trouvé.");
          return;
        }

        setEpi(data as Epi);

        // Fetch sapeur profile if assigned
        if (data.affectation_courante?.sapeurId) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('prenom, nom')
            .eq('id', data.affectation_courante.sapeurId)
            .single();

          if (profileError) {
            console.error("Erreur lors de la récupération du profil du sapeur:", profileError);
          } else if (profileData) {
            setSapeurProfile(profileData as Profile);
          }
        }

      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des détails de l\'EPI.');
        toast.error('Erreur: ' + (err.message || 'Impossible de charger l\'EPI'));
      } finally {
        setLoading(false);
      }
    };

    fetchEpiDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-red-50">
        <XCircle className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Erreur</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/epis')} 
          className="mt-6 px-4 py-2 bg-primary text-white rounded-xl shadow-md hover:bg-red-700 transition-colors"
        >
          Retour à la liste des EPIs
        </button>
      </div>
    );
  }

  if (!epi) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <HardHat className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">EPI non trouvé</h2>
        <p className="text-slate-500">L'équipement que vous recherchez n'existe pas ou n'est plus disponible.</p>
        <button 
          onClick={() => navigate('/epis')} 
          className="mt-6 px-4 py-2 bg-primary text-white rounded-xl shadow-md hover:bg-red-700 transition-colors"
        >
          Retour à la liste des EPIs
        </button>
      </div>
    );
  }

  const isExpired = epi.date_peremption ? new Date(epi.date_peremption) < new Date() : false;
  const isSoonExpired = epi.date_peremption ? new Date(epi.date_peremption) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false; // Within 30 days

  const renderBadge = (status: string) => {
    let colorClass = '';
    let icon = null;
    let label = status;

    if (status === 'Actif') {
      colorClass = 'bg-green-100 text-green-800';
      icon = <CheckCircle className="w-3 h-3 mr-1" />;
    } else if (status === 'Hors service') {
      colorClass = 'bg-red-100 text-red-800';
      icon = <XCircle className="w-3 h-3 mr-1" />;
    } else {
      colorClass = 'bg-slate-100 text-slate-700';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {icon} {label}
      </span>
    );
  };

  const renderDateBadge = (dateString: string | null, type: 'peremption' | 'controle') => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for comparison

    let colorClass = 'bg-slate-100 text-slate-700';
    let label = '';
    
    if (type === 'peremption') {
      if (date < today) {
        colorClass = 'bg-red-100 text-red-800';
        label = 'Expiré le';
      } else if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)) {
        colorClass = 'bg-orange-100 text-orange-800';
        label = 'Expire le';
      } else {
        colorClass = 'bg-slate-100 text-slate-700';
        label = 'Expire le';
      }
    } else { // For control dates
      if (date < today) {
        colorClass = 'bg-red-100 text-red-800';
        label = 'À contrôler le'; // Assuming this implies it's due
      } else if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)) {
        colorClass = 'bg-orange-100 text-orange-800';
        label = 'Contrôle le';
      } else {
        colorClass = 'bg-slate-100 text-slate-700';
        label = 'Contrôle le';
      }
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <Calendar className="w-3 h-3 mr-1" /> {label} {date.toLocaleDateString()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-primary p-6 shadow-sm z-10 sticky top-0 rounded-b-[2.5rem] flex items-center">
        <button onClick={() => navigate('/epis')} className="text-white hover:text-red-200 transition-colors absolute left-6">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white text-center flex-1">{epi.nom}</h1>
      </div>

      <div className="p-6 flex-1 space-y-6">
        {/* EPI Image/Icon */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-32 h-32 bg-red-50 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
            {epi.photoUrl ? (
              <img src={epi.photoUrl} alt={epi.nom} className="w-full h-full object-cover" />
            ) : (
              <HardHat className="w-16 h-16 text-primary" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center">{epi.nom}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {renderBadge(epi.etat)}
            {renderDateBadge(epi.date_peremption, 'peremption')}
          </div>
        </div>

        {/* General Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Informations Générales</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <Package className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Catégorie: <span className="font-medium">{epi.categorie || 'N/A'}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <Tag className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Référence: <span className="font-medium">{epi.reference || 'N/A'}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <Factory className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Fabricant: <span className="font-medium">{epi.fabricant || 'N/A'}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <Barcode className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Code Barre: <span className="font-medium">{epi.code_barre || 'N/A'}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Localisation: <span className="font-medium">{epi.localisation || 'N/A'}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Mise en service: <span className="font-medium">{epi.date_mise_service ? new Date(epi.date_mise_service).toLocaleDateString() : 'N/A'}</span></p>
            </div>
          </div>
        </div>

        {/* Assignment & Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Affectation & Contrôles</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Affecté à: 
                <span className="font-medium ml-1">
                  {sapeurProfile ? `${sapeurProfile.prenom} ${sapeurProfile.nom}` : (epi.affectation_courante?.sapeurId ? 'Utilisateur inconnu' : 'Non affecté')}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Dernier contrôle: <span className="font-medium">{epi.date_dernier_controle ? new Date(epi.date_dernier_controle).toLocaleDateString() : 'N/A'}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600">Prochain contrôle: <span className="font-medium">{epi.date_prochain_controle ? renderDateBadge(epi.date_prochain_controle, 'controle') : 'N/A'}</span></p>
            </div>
          </div>
        </div>

        {/* Action History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center">
            <ListFilter className="w-5 h-5 mr-2 text-slate-500" /> Historique des Actions
          </h3>
          <div className="space-y-3 text-sm">
            {epi.historique_actions && epi.historique_actions.length > 0 ? (
              epi.historique_actions.map((action, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-slate-700 font-medium">{action.type || 'Action'}: {action.description || 'Pas de description'}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {action.date ? new Date(action.date).toLocaleString() : 'Date inconnue'} par {action.utilisateur || 'Inconnu'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">Aucune action enregistrée pour cet EPI.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
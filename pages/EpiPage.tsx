import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Epi } from '../types';
import { Loader2, HardHat, Package, Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Link } from 'react-router-dom'; // Import Link

export const EpiPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // Get user and authLoading
  const [epis, setEpis] = useState<Epi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpis = async () => {
      // If auth is still loading or user is not available, do nothing yet
      if (authLoading) {
        setLoading(true); // Keep loading state if auth is still in progress
        return;
      }

      if (!user) {
        setEpis([]); // Clear EPIs if no user is logged in
        setLoading(false);
        setError("Veuillez vous connecter pour voir vos EPIs.");
        return;
      }
      
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const { data, error } = await supabase
          .from('epis')
          .select('*')
          .eq('affectation_courante->>sapeurId', user.id) // Filter by user ID
          .order('nom', { ascending: true });

        if (error) throw error;
        setEpis(data as Epi[]);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des EPIs.');
        toast.error('Erreur: ' + (err.message || 'Impossible de charger les EPIs'));
      } finally {
        setLoading(false);
      }
    };

    fetchEpis();
  }, [user, authLoading]); // Re-run when user or authLoading changes

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-primary p-6 shadow-sm z-10 sticky top-0 rounded-b-[2.5rem]">
        <h1 className="text-2xl font-bold text-white text-center">Mes EPIs</h1>
      </div>

      <div className="p-6 flex-1">
        {(loading || authLoading) ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        ) : epis.length === 0 ? (
          <div className="text-center text-slate-500 p-4 bg-slate-100 rounded-lg">
            <p>Aucun EPI trouvé pour le moment.</p>
            {user && <p className="mt-2 text-sm">Il semblerait que vous n'ayez pas encore d'EPIs affectés.</p>}
          </div>
        ) : (
          <div className="grid gap-4">
            {epis.map((epi) => (
              <Link to={`/epis/${epi.id}`} key={epi.id} className="block"> {/* Made EPI card clickable */}
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-4 hover:bg-slate-50 transition-colors">
                  <div className="w-20 h-20 bg-red-50 rounded-xl flex-shrink-0 overflow-hidden">
                    {epi.photoUrl ? (
                      <img src={epi.photoUrl} alt={epi.nom} className="w-full h-full object-cover" />
                    ) : (
                      <HardHat className="w-10 h-10 text-primary m-auto" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-slate-900">{epi.nom}</h3>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Package className="w-3 h-3 mr-1" /> {epi.categorie || 'Non spécifié'} - Réf: {epi.reference}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" /> {epi.localisation}
                    </p>
                    <div className="flex items-center text-xs">
                      {epi.etat === 'Actif' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" /> {epi.etat}
                        </span>
                      )}
                      {epi.date_peremption && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Calendar className="w-3 h-3 mr-1" /> Expire le {new Date(epi.date_peremption).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
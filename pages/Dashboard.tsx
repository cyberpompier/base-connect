import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient'; // Import supabase
import { Button } from '../components/ui/Button';
import { User as UserIcon, Tag, Briefcase, Building, HardHat, Loader2 } from 'lucide-react'; // Bell and CreditCard icons removed

export const Dashboard: React.FC = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth(); // Destructure authLoading
  const [epiCount, setEpiCount] = useState<number | null>(null);
  const [epiCountLoading, setEpiCountLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEpiCount = async () => {
      if (authLoading) {
        setEpiCountLoading(true);
        return;
      }
      if (!user) {
        setEpiCount(null);
        setEpiCountLoading(false);
        return;
      }

      setEpiCountLoading(true);
      try {
        const { count, error } = await supabase
          .from('epis')
          .select('id', { count: 'exact' }) // Count exact matching rows
          .eq('affectation_courante->>sapeurId', user.id);

        if (error) throw error;
        setEpiCount(count);
      } catch (err) {
        console.error('Error fetching EPI count:', err);
        setEpiCount(0); // Default to 0 on error
      } finally {
        setEpiCountLoading(false);
      }
    };

    fetchEpiCount();
  }, [user, authLoading]); // Re-run when user or authLoading changes

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (prenom: string | null, nom: string | null) => {
    let initials = '';
    if (prenom) initials += prenom[0];
    if (nom) initials += nom[0];
    return initials.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-primary pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl shadow-red-200/50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-red-200 text-sm font-medium">Bonjour,</p>
            <h1 className="text-3xl font-bold text-white mt-1">
              {profile?.grade ? profile.grade : 'Invité'}
            </h1>
          </div>
          {/* Settings button removed */}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-16 space-y-6 pb-8">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 flex items-center space-x-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar de profil" className="w-full h-full object-cover" />
            ) : profile?.prenom || profile?.nom ? (
              <span className="text-2xl font-bold text-primary">
                {getInitials(profile.prenom, profile.nom)}
              </span>
            ) : (
              <UserIcon className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">
              {profile?.prenom} {profile?.nom}
            </h3>
            <p className="text-xs text-slate-500">{profile?.role || 'Compte Standard'}</p>
          </div>
        </div>

        {/* Quick Actions Removed */}
        {/*
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center space-y-3 aspect-square">
            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-700">Notifs</span>
          </button>
          
          <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center space-y-3 aspect-square">
             <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-700">Abonnement</span>
          </button>
        </div>
        */}

        {/* My EPIs Card */}
        <Link to="/epis" className="block">
          <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 flex items-center space-x-4 hover:bg-slate-50 transition-colors">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center overflow-hidden">
                <HardHat className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Mes EPIs</h3>
              <p className="text-xs text-slate-500">
                {epiCountLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  `${epiCount !== null ? epiCount : 'N/A'} équipements attribués`
                )}
              </p>
            </div>
          </div>
        </Link>


        {/* User Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Mes Informations</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <Tag className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600 flex-1">Matricule: {profile?.matricule || 'N/A'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600 flex-1">Grade: {profile?.grade || 'N/A'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Building className="w-4 h-4 text-slate-400" />
              <p className="text-slate-600 flex-1">Caserne: {profile?.caserne || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Dernières Activités</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-slate-600 flex-1">Connexion réussie</p>
              <span className="text-slate-400 text-xs">Aujourd'hui</span>
            </div>
             <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-slate-600 flex-1">Profil mis à jour</p>
              <span className="text-slate-400 text-xs">Il y a 2m</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSignOut} variant="ghost" fullWidth className="text-red-500 hover:text-red-600 hover:bg-red-50">
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};
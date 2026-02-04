import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { useNavigate, useParams } from 'react-router-dom'; // Added useParams
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Save, LogOut, Tag, Briefcase, Building, Loader2, Camera, ArrowLeft } from 'lucide-react'; // Added ArrowLeft icon
import toast from 'react-hot-toast';
import { Profile } from '../types'; // Import Profile type

export const ProfilePage: React.FC = () => {
  const { user: currentUser, profile: currentAuthProfile, refreshProfile, signOut } = useAuth(); // Renamed to avoid conflict
  const { userId: paramUserId } = useParams<{ userId: string }>(); // Get userId from URL params
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayProfile, setDisplayProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [grade, setGrade] = useState('');
  const [caserne, setCaserne] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // For form submission
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const targetUserId = paramUserId || currentUser?.id;
  const isCurrentUserProfile = !paramUserId || paramUserId === currentUser?.id;

  const fetchDisplayProfile = useCallback(async (id: string) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      if (data) {
        setDisplayProfile(data);
        setPrenom(data.prenom || '');
        setNom(data.nom || '');
        setMatricule(data.matricule || '');
        setGrade(data.grade || '');
        setCaserne(data.caserne || '');
        setAvatarUrl(data.avatar || null);
      } else {
        setDisplayProfile(null);
        // If it's the current user's profile and it doesn't exist, it implies first login after signup
        if (isCurrentUserProfile && !data) {
            toast.info("Veuillez compléter votre profil pour continuer.");
        } else if (!isCurrentUserProfile) {
            toast.error("Profil de l'utilisateur non trouvé.");
            navigate('/dashboard'); // Redirect if scanned profile not found
        }
      }
    } catch (err: any) {
      console.error("Error fetching display profile:", err.message);
      toast.error("Erreur de chargement du profil: " + err.message);
      if (!isCurrentUserProfile) {
        navigate('/dashboard');
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [isCurrentUserProfile, navigate, currentUser]);

  useEffect(() => {
    if (targetUserId) {
      fetchDisplayProfile(targetUserId);
    } else {
      setLoadingProfile(false);
      // This case should ideally not happen if ProtectedRoute ensures currentUser exists
    }
  }, [targetUserId, fetchDisplayProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isCurrentUserProfile) return; // Only current user can save

    setLoading(true);
    try {
      const updates = {
        id: currentUser.id,
        prenom: prenom,
        nom: nom,
        matricule: matricule,
        grade: grade,
        caserne: caserne,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      
      await refreshProfile(); // Refresh context's profile
      await fetchDisplayProfile(currentUser.id); // Refresh local display profile
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !isCurrentUserProfile || !event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploadingAvatar(true);
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Date.now()}.${fileExtension}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').upsert({
        id: currentUser.id,
        avatar: publicUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refreshProfile();
      await fetchDisplayProfile(currentUser.id);
      toast.success('Avatar mis à jour !');

    } catch (error: any) {
      toast.error("Erreur d'upload d'avatar : " + error.message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no profile found at all for either current user or target user
  if (!displayProfile && !isCurrentUserProfile) {
    return null; // Already handled by toast and redirect in fetchDisplayProfile
  }
  
  // Special case: current user, but no profile yet (e.g., after signup)
  if (!displayProfile && isCurrentUserProfile && currentUser) {
      // Allow them to create their profile
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-xl shadow-red-200/50">
        <div className="flex justify-between items-start mb-6">
          {/* Back button only visible if not current user's profile, assuming navigation from scan */}
          {!isCurrentUserProfile && (
            <button onClick={() => navigate(-1)} className="text-white hover:text-red-200 transition-colors mr-4">
                <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className={`text-2xl font-bold text-white text-center flex-1 ${!isCurrentUserProfile ? '' : ''}`}>
            {isCurrentUserProfile ? 'Mon Profil' : `Profil de ${displayProfile?.prenom || ''} ${displayProfile?.nom || ''}`}
          </h1>
          {isCurrentUserProfile && (
            <button 
              onClick={handleSignOut}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm transition-all text-white ml-auto"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-16 space-y-6 pb-8">
        {/* Profile Avatar & Email Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 flex flex-col items-center space-y-4">
          <label htmlFor="avatar-upload" className="relative cursor-pointer group">
            <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden transition-all group-hover:scale-105">
              {uploadingAvatar ? (
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar de profil" className="w-full h-full object-cover" />
              ) : (displayProfile?.prenom || displayProfile?.nom) ? (
                <span className="text-4xl font-bold text-primary">
                  {getInitials(displayProfile.prenom, displayProfile.nom)}
                </span>
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            {/* Overlay for "Change photo" */}
            {isCurrentUserProfile && !uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
            {isCurrentUserProfile && (
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="hidden"
                ref={fileInputRef}
                aria-label="Upload new avatar"
              />
            )}
          </label>
          <p className="text-lg font-medium text-slate-800">{displayProfile?.email || currentUser?.email}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Informations Personnelles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                placeholder="Jean"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                disabled={!isCurrentUserProfile}
              />
              <Input
                label="Nom"
                placeholder="Dupont"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                disabled={!isCurrentUserProfile}
              />
            </div>
          </div>

          {/* Professional Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Détails Professionnels</h3>
            <Input
              label="Matricule"
              placeholder="Ex: 12345"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              icon={<Tag className="w-5 h-5" />}
              disabled={!isCurrentUserProfile}
            />
            <Input
              label="Grade"
              placeholder="Ex: Pompier 1ère classe"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              icon={<Briefcase className="w-5 h-5" />}
              disabled={!isCurrentUserProfile}
            />
            <Input
              label="Caserne"
              placeholder="Ex: Caserne Centre"
              value={caserne}
              onChange={(e) => setCaserne(e.target.value)}
              icon={<Building className="w-5 h-5" />}
              disabled={!isCurrentUserProfile}
            />
          </div>

          {isCurrentUserProfile && (
            <Button type="submit" fullWidth isLoading={loading} className="flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les modifications
            </Button>
          )}
        </form>
        
        {isCurrentUserProfile && (
          <div className="p-6 pt-0"> 
            <Button onClick={handleSignOut} variant="ghost" fullWidth className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
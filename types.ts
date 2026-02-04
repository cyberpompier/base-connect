export interface Profile {
  id: string;
  nom: string | null; // Corresponds to 'nom'
  prenom: string | null; // Corresponds to 'prenom'
  role: string | null; // New field
  updated_at: string | null;
  avatar: string | null; // New field (assuming it's a URL string)
  email: string | null; // New field, though usually from auth.users
  matricule: string | null; // New field
  grade: string | null; // New field
  caserne: string | null; // New field
}

export interface AuthContextType {
  user: any | null; // using any for Supabase User type simplicity here
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

// New interface for EPI (Équipement de Protection Individuelle)
export interface Epi {
  id: string;
  nom: string;
  categorie: string | null;
  reference: string;
  fabricant: string;
  date_mise_service: string; // date string
  date_peremption: string; // date string
  etat: string;
  localisation: string;
  code_barre: string;
  photoUrl: string;
  affectation_courante: any | null; // jsonb, can be more specific if needed
  historique_actions: any[]; // jsonb array
  date_prochain_controle: string | null; // date string
  date_dernier_controle: string | null; // date string
  created_at: string | null;
}

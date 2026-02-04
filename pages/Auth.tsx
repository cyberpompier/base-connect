import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Bon retour !');
        // Navigation is handled by AuthContext effect in App.tsx typically, 
        // but explicit navigation helps UX perception
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Inscription réussie !');
        navigate('/profile'); // Redirect to profile creation
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page-container min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Animated background element */}
      <div className="animated-gradient-bg"></div>

      {/* Content Layer */}
      <div className="relative z-10 p-8 text-center space-y-8 flex flex-col w-full max-w-sm">
        <div className="mb-4 text-left"> {/* Adjusted for back button */}
          <button onClick={() => navigate('/')} className="text-white hover:text-red-200 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="text-lg opacity-90 max-w-sm mx-auto drop-shadow-md">
            {isLogin ? 'Heureux de vous revoir sur BaseConnect.' : 'Rejoignez la communauté dès aujourd\'hui.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 w-full mt-8">
          <Input
            label="Email"
            type="email"
            placeholder="nom@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5 text-slate-400" />}
            required
            className="bg-white/90 text-slate-900 placeholder:text-slate-500 border-transparent focus:border-primary focus:ring-primary"
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5 text-slate-400" />}
            required
            className="bg-white/90 text-slate-900 placeholder:text-slate-500 border-transparent focus:border-primary focus:ring-primary"
          />
          
          <Button type="submit" fullWidth isLoading={loading} className="text-lg py-4 px-6 shadow-xl shadow-red-300/50">
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-base text-red-100 drop-shadow-md">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-semibold text-secondary hover:text-orange-300 transition-colors drop-shadow-lg"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
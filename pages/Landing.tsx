import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Download, LogIn } from 'lucide-react'; // Only Download and LogIn icons needed

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Animated background element */}
      <div className="animated-gradient-bg"></div>

      {/* Content Layer */}
      <div className="relative z-10 p-8 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg">Prêt à intervenir ?</h1>
          <p className="text-lg opacity-90 max-w-sm mx-auto drop-shadow-md">
            Connectez-vous pour accéder à vos outils ou installez l'application.
          </p>
        </div>

        <div className="w-full space-y-3">
          <Button 
            onClick={() => navigate('/auth')} 
            fullWidth 
            className="text-lg py-4 px-6 flex items-center justify-center gap-2 shadow-xl shadow-red-300/50"
          >
            <LogIn className="w-6 h-6" />
            Commencer
          </Button>
          <Button 
            onClick={() => navigate('/install')} 
            variant="secondary" 
            fullWidth 
            className="text-lg py-4 px-6 flex items-center justify-center gap-2 shadow-xl shadow-orange-300/50"
          >
            <Download className="w-6 h-6" />
            Installer l'Application
          </Button>
        </div>
      </div>
    </div>
  );
};
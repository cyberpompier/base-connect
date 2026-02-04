import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share, PlusSquare, Menu, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const InstallGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="flex items-center text-primary font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Installation de l'App</h1>

      <div className="space-y-8 flex-1">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary flex items-center">
            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 text-sm">iOS</span>
            Sur iPhone / iPad
          </h2>
          <ol className="space-y-4 text-slate-600 pl-4 border-l-2 border-red-100">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Ouvrez cette page dans <strong>Safari</strong>.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span className="flex items-center flex-wrap">
                Appuyez sur le bouton "Partager" <Share className="w-4 h-4 mx-1 inline" /> en bas de l'écran.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span className="flex items-center flex-wrap">
                Faites défiler et sélectionnez "Sur l'écran d'accueil" <PlusSquare className="w-4 h-4 mx-1 inline" />.
              </span>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-secondary flex items-center">
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 text-sm">And</span>
            Sur Android
          </h2>
          <ol className="space-y-4 text-slate-600 pl-4 border-l-2 border-orange-100">
             <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Ouvrez cette page dans <strong>Chrome</strong>.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span className="flex items-center flex-wrap">
                Appuyez sur le menu (trois points) <Menu className="w-4 h-4 mx-1 inline" /> en haut à droite.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span className="flex items-center flex-wrap">
                Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil" <Download className="w-4 h-4 mx-1 inline" />.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
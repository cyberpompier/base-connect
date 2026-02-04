import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, User, Scan, HardHat } from 'lucide-react'; // Import Scan icon

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeClasses = "text-primary font-bold";
  const inactiveClasses = "text-slate-500";

  return (
    <NavLink to={to} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isActive ? activeClasses : inactiveClasses}`}>
      <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
      <span className={`text-xs mt-1 ${isActive ? activeClasses : inactiveClasses}`}>{label}</span>
    </NavLink>
  );
};

export const BottomNavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-t-lg rounded-t-3xl max-w-md mx-auto py-3 px-4 flex justify-around items-center border-t border-slate-100">
      <NavItem to="/dashboard" icon={LayoutGrid} label="Accueil" />
      <NavItem to="/epis" icon={HardHat} label="EPI" />
      <NavItem to="/profile" icon={User} label="Profil" />
      <NavItem to="/scan" icon={Scan} label="Scan" /> {/* Replaced 'More' with 'Scan' */}
    </nav>
  );
};
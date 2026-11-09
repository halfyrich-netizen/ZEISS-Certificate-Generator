import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onExportCurrent?: () => void;
  recipientCount?: number;
}

const OFFICIAL_ZEISS_LOGO_URL = '/assets/aistudio/ZEISS_Logo_RGB_b3095ed1_cropped.png';

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="no-print bg-white border-b border-slate-200 px-6 py-3 hidden lg:flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src={OFFICIAL_ZEISS_LOGO_URL}
          alt="ZEISS"
          className="w-7 h-7 object-contain"
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
            ZEISS Training Certificate Generator
          </span>
        </div>
      </div>

      {/* Right area: only Installable App button */}
      <div className="flex items-center gap-2">
        <PWAInstallButton />
      </div>
    </header>
  );
};

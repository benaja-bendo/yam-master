import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button/Button';

interface SettingsState {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoSave: boolean;
}

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'light',
    soundEnabled: true,
    vibrationEnabled: true,
    autoSave: true
  });

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SettingToggle: React.FC<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres</h1>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="space-y-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Thème</h2>
              <div className="flex space-x-4">
                {['light', 'dark'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleSettingChange('theme', theme)}
                    className={`px-4 py-2 rounded-lg ${settings.theme === theme ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {theme === 'light' ? 'Clair' : 'Sombre'}
                  </button>
                ))}
              </div>
            </div>

            <SettingToggle
              label="Sons"
              value={settings.soundEnabled}
              onChange={(value) => handleSettingChange('soundEnabled', value)}
            />

            <SettingToggle
              label="Vibrations"
              value={settings.vibrationEnabled}
              onChange={(value) => handleSettingChange('vibrationEnabled', value)}
            />

            <SettingToggle
              label="Sauvegarde automatique"
              value={settings.autoSave}
              onChange={(value) => handleSettingChange('autoSave', value)}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
};
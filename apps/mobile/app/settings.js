import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    theme: 'light',
    soundEnabled: true,
    vibrationEnabled: true,
    autoSave: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SettingToggle = ({ label, value, onChange }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#d1d5db', true: '#3498db' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Paramètres</Text>

        <View style={styles.card}>
          <View style={styles.themeSection}>
            <Text style={styles.sectionTitle}>Thème</Text>
            <View style={styles.themeButtons}>
              {['light', 'dark'].map((theme) => (
                <TouchableOpacity
                  key={theme}
                  onPress={() => handleSettingChange('theme', theme)}
                  style={[
                    styles.themeButton,
                    settings.theme === theme && styles.themeButtonActive
                  ]}
                >
                  <Text style={[
                    styles.themeButtonText,
                    settings.theme === theme && styles.themeButtonTextActive
                  ]}>
                    {theme === 'light' ? 'Clair' : 'Sombre'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  content: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  themeButtonActive: {
    backgroundColor: '#e6f2ff',
  },
  themeButtonText: {
    color: '#666',
  },
  themeButtonTextActive: {
    color: '#3498db',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
});
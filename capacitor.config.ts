import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alankern.idleants',
  appName: 'Idle Ants',
  webDir: 'web',
  ios: {
    contentInset: 'never',
    backgroundColor: '#000000'
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;

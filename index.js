import { registerRootComponent } from 'expo';
import './src/services/nativeStorage';
import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// This allows the app to run natively with Expo CLI or EAS Build
registerRootComponent(App);

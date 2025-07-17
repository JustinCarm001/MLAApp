/**
 * Hockey Live App - Main Entry Point
 * 
 * This file registers the main App component with React Native
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from '../package.json';

// Register the app component
AppRegistry.registerComponent(appName, () => App);

console.log('<Ò Hockey Live App - React Native app registered successfully!');
console.log('=ñ App Name:', appName);
console.log('= Backend URL: http://localhost:8000');
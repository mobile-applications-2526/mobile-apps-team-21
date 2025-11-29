// Align colors with Ionic theme variables
const tintColorLight = '#4caf50'; // --ion-color-primary
const tintColorDark = '#4caf50';

export default {
  light: {
    text: '#1f2933', // --ion-text-color
    background: '#f9fafb', // --ion-background-color
    tint: tintColorLight,
    tabIconDefault: '#6a7282', // --ion-color-medium
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

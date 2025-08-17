import { providePrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

// Define custom theme preset based on Aura with our colors
const CustomAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#34f5dd',
      400: '#34d3b6', // Our custom primary color
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
  },
});

export const primeNGProvider = () => [
  providePrimeNG({
    theme: {
      preset: CustomAura,
      options: {
        prefix: 'p',
        darkModeSelector: '.wiqes-app-dark',
        cssLayer: false,
      },
    },
  }),
  ToastModule,
  MessageService,
];

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const primeNGProvider = () =>
  providePrimeNG({
    theme: {
      preset: Aura,
    },
  });

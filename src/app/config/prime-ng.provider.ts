import { providePrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';

export const primeNGProvider = () => [
  providePrimeNG({
    theme: {
      preset: Aura,
    },
  }),
  ToastModule,
  MessageService,
];

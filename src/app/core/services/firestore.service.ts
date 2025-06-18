import { inject, Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import Keycloak from 'keycloak-js';
import { getAuth, signInWithCredential, OAuthProvider } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Environment } from '../../../environments/environment';
import { StateService } from './state.service';
import { IOrder } from '../models/entity/order.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private keycloak = inject(Keycloak);
  private stateService = inject(StateService);

  constructor() {
    if (!getApps().length) {
      initializeApp({
        apiKey: Environment.firestoreApiKey,
        authDomain: Environment.firestoreAuthDomain,
        projectId: Environment.firestoreProjectId,
        storageBucket: Environment.firestoreStorageBucket,
        messagingSenderId: Environment.firestoreMessagingSenderId,
        appId: Environment.firestoreAppId,
        measurementId: Environment.firestoreMeasurementId,
      });
    }
  }

  private async signInToFirestore(idToken: string) {
    const provider = new OAuthProvider(Environment.oidcProviderId);
    const credential = provider.credential({ idToken });
    const result = await signInWithCredential(getAuth(), credential);

    this.stateService.user.set({
      uid: result.user.uid || '',
      email: result.user.email || '',
      displayName: result.user.displayName || '',
      photoURL: result.user.photoURL || '',
      phoneNumber: result.user.phoneNumber || '',
      locale: this.keycloak.tokenParsed?.['locale'] || 'en-US',
    });
  }

  async getData(): Promise<void> {
    const idToken = this.keycloak.idToken;
    if (!idToken) return;

    try {
      await this.signInToFirestore(idToken);

      const [orders, translations] = await Promise.all([this.getOrders(), this.getTranslations()]);
      this.stateService.orders.set(orders as IOrder[]);
      console.log('Orders fetched:', orders);
      console.log('Translations fetched:', translations);
      this.stateService.translations.set(translations);
    } catch (error) {
      console.error('Error during Firebase sign-in or data fetch:', error);
    }
  }

  async getOrders() {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, 'orders'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getTranslations() {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, 'translations'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

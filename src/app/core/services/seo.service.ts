import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private meta: Meta,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  updateSeoData(seoData: SeoData): void {
    // Update title
    this.titleService.setTitle(seoData.title);

    // Update meta description
    this.meta.updateTag({ name: 'description', content: seoData.description });

    // Update keywords if provided
    if (seoData.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seoData.keywords });
    }

    // Update canonical URL
    this.updateCanonicalUrl(seoData.url);

    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: seoData.title });
    this.meta.updateTag({ property: 'og:description', content: seoData.description });

    if (seoData.image) {
      this.meta.updateTag({ property: 'og:image', content: seoData.image });
    }

    if (seoData.url) {
      this.meta.updateTag({ property: 'og:url', content: seoData.url });
    }

    if (seoData.type) {
      this.meta.updateTag({ property: 'og:type', content: seoData.type });
    }

    // Update Twitter Card tags
    this.meta.updateTag({ name: 'twitter:title', content: seoData.title });
    this.meta.updateTag({ name: 'twitter:description', content: seoData.description });

    if (seoData.image) {
      this.meta.updateTag({ name: 'twitter:image', content: seoData.image });
    }
  }

  private updateCanonicalUrl(url?: string): void {
    // Remove existing canonical link
    const existingCanonical = this.document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const canonicalUrl = url || environment.DOMAIN;
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    this.document.head.appendChild(link);
  }

  getDefaultSeoData(): SeoData {
    return {
      title: 'Eucael: Shadows of the Totem – Summon the Creatures',
      description:
        'Eucael: Shadows of the Totem is an immersive strategy game where you produce shadows and transform them into rare Mythological creatures. Build your extensive Creature collection and master the art of strategic gameplay.',
      keywords:
        'Eucael: Shadows of the Totem, strategy game, Creature collection, shadows, Eucael, RPG, gaming, Mythological creatures, collection game, strategic gameplay',
      image: '/assets/images/og-image.jpg',
      type: 'website',
    };
  }

  getPageSeoData(page: string): SeoData {
    const baseData = this.getDefaultSeoData();
    const baseUrl = environment.production ? 'https://www.eucael.com' : 'http://localhost:4200';

    switch (page) {
      case 'home':
        return {
          ...baseData,
          title: 'Eucael: Shadows of the Totem – Summon the Creatures',
          description:
            'Welcome to Eucael: Shadows of the Totem! Start your journey in the ultimate strategy game where shadows become legendary Mythological creatures. Join thousands of players building their Creature collections.',
          url: `${baseUrl}/home`,
        };

      case 'embodiments':
        return {
          ...baseData,
          title: 'Eucael: Shadows of the Totem – Summon the Creatures',
          description:
            'Discover all Mythological creature embodiments in Eucael: Shadows of the Totem. Learn about rare transformations, shadow requirements, and build the ultimate strategic team.',
          keywords:
            baseData.keywords +
            ', embodiments, Mythological creature summonings, rare Mythological creatures, character builds',
          url: `${baseUrl}/embodiments`,
        };

      case 'login':
      case '': // root path
        return {
          ...baseData,
          title: 'Eucael: Shadows of the Totem – Login & Start Playing',
          description:
            'Login to Eucael: Shadows of the Totem to access your Creature collection, continue your shadow gathering journey, and compete with players worldwide.',
          url: baseUrl,
        };

      case 'reset-password':
        return {
          ...baseData,
          title: 'Reset Password - Eucael: Shadows of the Totem',
          description:
            'Reset your Eucael: Shadows of the Totem account password to regain access to your creature collection and gaming progress.',
          url: `${baseUrl}/reset-password`,
        };

      // Protected pages - minimal SEO data (optional, for edge cases)
      case 'admin':
      case 'profile':
        return {
          title: 'Eucael: Shadows of the Totem', // Minimal title for tab display
          description: 'Game management interface',
          // No URL, keywords, or other SEO data needed
        };

      default:
        return {
          ...baseData,
          url: baseUrl,
        };
    }
  }
}

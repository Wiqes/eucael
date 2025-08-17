import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

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
  constructor(private meta: Meta, private titleService: Title) {}

  updateSeoData(seoData: SeoData): void {
    // Update title
    this.titleService.setTitle(seoData.title);

    // Update meta description
    this.meta.updateTag({ name: 'description', content: seoData.description });

    // Update keywords if provided
    if (seoData.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seoData.keywords });
    }

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

  getDefaultSeoData(): SeoData {
    return {
      title:
        'Eucalyptus: Shadow Of Turnskin - Collect Shadows, Transform Heroes | Strategy Game by Wiqes',
      description:
        'Eucalyptus: Shadow Of Turnskin is an immersive strategy game where you collect shadows and transform them into rare heroes. Build your extensive hero collection and master the art of strategic gameplay.',
      keywords:
        'Eucalyptus: Shadow Of Turnskin, strategy game, hero collection, shadows, Wiqes, RPG, gaming, heroes, collection game, strategic gameplay',
      image: '/assets/images/og-image.jpg',
      type: 'website',
    };
  }

  getPageSeoData(page: string): SeoData {
    const baseData = this.getDefaultSeoData();

    switch (page) {
      case 'home':
        return {
          ...baseData,
          title: 'Eucalyptus: Shadow Of Turnskin - Home | Collect Shadows & Transform Heroes',
          description:
            'Welcome to Eucalyptus: Shadow Of Turnskin! Start your journey in the ultimate strategy game where shadows become legendary heroes. Join thousands of players building their hero collections.',
        };

      case 'embodiments':
        return {
          ...baseData,
          title: 'Hero Embodiments | Eucalyptus: Shadow Of Turnskin - Transform Your Collection',
          description:
            'Discover all hero embodiments in Eucalyptus: Shadow Of Turnskin. Learn about rare transformations, shadow requirements, and build the ultimate strategic team.',
          keywords:
            baseData.keywords +
            ', embodiments, hero transformations, rare heroes, character builds',
        };

      case 'admin':
        return {
          ...baseData,
          title: 'Admin Panel | Eucalyptus: Shadow Of Turnskin Management',
          description:
            'Administrative interface for Eucalyptus: Shadow Of Turnskin game management and player oversight.',
        };

      case 'profile':
        return {
          ...baseData,
          title: 'Player Profile | Eucalyptus: Shadow Of Turnskin - Your Hero Collection',
          description:
            'View your Eucalyptus: Shadow Of Turnskin player profile, hero collection statistics, and achievement progress.',
          keywords: baseData.keywords + ', player profile, achievements, statistics',
        };

      case 'login':
        return {
          ...baseData,
          title: 'Login | Eucalyptus: Shadow Of Turnskin - Access Your Hero Collection',
          description:
            'Login to Eucalyptus: Shadow Of Turnskin to access your hero collection, continue your shadow gathering journey, and compete with players worldwide.',
        };

      default:
        return baseData;
    }
  }
}

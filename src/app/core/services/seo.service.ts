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
        'Euqael: Shadow Of Turnskin - Collect Shadows, Transform Turnskins | Strategy Game by Wiqes',
      description:
        'Euqael: Shadow Of Turnskin is an immersive strategy game where you collect shadows and transform them into rare Turnskins. Build your extensive hero collection and master the art of strategic gameplay.',
      keywords:
        'Euqael: Shadow Of Turnskin, strategy game, hero collection, shadows, Wiqes, RPG, gaming, Turnskins, collection game, strategic gameplay',
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
          title: 'Euqael: Shadow Of Turnskin - Home | Collect Shadows & Transform Turnskins',
          description:
            'Welcome to Euqael: Shadow Of Turnskin! Start your journey in the ultimate strategy game where shadows become legendary Turnskins. Join thousands of players building their hero collections.',
        };

      case 'Turnskins':
        return {
          ...baseData,
          title: 'Hero Turnskins | Euqael: Shadow Of Turnskin - Transform Your Collection',
          description:
            'Discover all hero Turnskins in Euqael: Shadow Of Turnskin. Learn about rare transformations, shadow requirements, and build the ultimate strategic team.',
          keywords:
            baseData.keywords +
            ', Turnskins, hero transformations, rare Turnskins, character builds',
        };

      case 'admin':
        return {
          ...baseData,
          title: 'Admin Panel | Euqael: Shadow Of Turnskin Management',
          description:
            'Administrative interface for Euqael: Shadow Of Turnskin game management and player oversight.',
        };

      case 'profile':
        return {
          ...baseData,
          title: 'Player Profile | Euqael: Shadow Of Turnskin - Your Hero Collection',
          description:
            'View your Euqael: Shadow Of Turnskin player profile, hero collection statistics, and achievement progress.',
          keywords: baseData.keywords + ', player profile, achievements, statistics',
        };

      case 'login':
        return {
          ...baseData,
          title: 'Login | Euqael: Shadow Of Turnskin - Access Your Hero Collection',
          description:
            'Login to Euqael: Shadow Of Turnskin to access your hero collection, continue your shadow gathering journey, and compete with players worldwide.',
        };

      default:
        return baseData;
    }
  }
}

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
        'Eucael: Shadow Of Turnskin - Collect Shadows, Transform Turnskins | Strategy Game by Wiqes',
      description:
        'Eucael: Shadow Of Turnskin is an immersive strategy game where you collect shadows and transform them into rare Turnskins. Build your extensive Turnskin collection and master the art of strategic gameplay.',
      keywords:
        'Eucael: Shadow Of Turnskin, strategy game, Turnskin collection, shadows, Wiqes, RPG, gaming, Turnskins, collection game, strategic gameplay',
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
          title: 'Eucael: Shadow Of Turnskin - Home | Collect Shadows & Transform Turnskins',
          description:
            'Welcome to Eucael: Shadow Of Turnskin! Start your journey in the ultimate strategy game where shadows become legendary Turnskins. Join thousands of players building their Turnskin collections.',
        };

      case 'embodiments':
        return {
          ...baseData,
          title: 'Turnskin Embodiments | Eucael: Shadow Of Turnskin - Transform Your Collection',
          description:
            'Discover all Turnskin embodiments in Eucael: Shadow Of Turnskin. Learn about rare transformations, shadow requirements, and build the ultimate strategic team.',
          keywords:
            baseData.keywords +
            ', embodiments, Turnskin transformations, rare Turnskins, character builds',
        };

      case 'admin':
        return {
          ...baseData,
          title: 'Admin Panel | Eucael: Shadow Of Turnskin Management',
          description:
            'Administrative interface for Eucael: Shadow Of Turnskin game management and player oversight.',
        };

      case 'profile':
        return {
          ...baseData,
          title: 'Player Profile | Eucael: Shadow Of Turnskin - Your Turnskin Collection',
          description:
            'View your Eucael: Shadow Of Turnskin player profile, Turnskin collection statistics, and achievement progress.',
          keywords: baseData.keywords + ', player profile, achievements, statistics',
        };

      case 'login':
        return {
          ...baseData,
          title: 'Login | Eucael: Shadow Of Turnskin - Access Your Turnskin Collection',
          description:
            'Login to Eucael: Shadow Of Turnskin to access your Turnskin collection, continue your shadow gathering journey, and compete with players worldwide.',
        };

      default:
        return baseData;
    }
  }
}

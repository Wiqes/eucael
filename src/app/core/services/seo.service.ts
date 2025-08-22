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
      title: 'Eucael: Shadow of Totem - Produce Shadows, Summon the Shapeshifters | Strategy Game',
      description:
        'Eucael: Shadow of Totem is an immersive strategy game where you Produce Shadows and transform them into rare Shapeshifters. Build your extensive Card collection and master the art of strategic gameplay.',
      keywords:
        'Eucael: Shadow of Totem, strategy game, Card collection, shadows, Eucael, RPG, gaming, Shapeshifters, collection game, strategic gameplay',
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
          title: 'Eucael: Shadow of Totem - Home | Produce Shadows & Summon the Shapeshifters',
          description:
            'Welcome to Eucael: Shadow of Totem! Start your journey in the ultimate strategy game where shadows become legendary Shapeshifters. Join thousands of players building their Card collections.',
        };

      case 'embodiments':
        return {
          ...baseData,
          title: 'Shapeshifter Embodiments | Eucael: Shadow of Totem - Transform Your Collection',
          description:
            'Discover all Shapeshifter embodiments in Eucael: Shadow of Totem. Learn about rare transformations, shadow requirements, and build the ultimate strategic team.',
          keywords:
            baseData.keywords +
            ', embodiments, Shapeshifter summonings, rare Shapeshifters, character builds',
        };

      case 'admin':
        return {
          ...baseData,
          title: 'Admin Panel | Eucael: Shadow of Totem Management',
          description:
            'Administrative interface for Eucael: Shadow of Totem game management and player oversight.',
        };

      case 'profile':
        return {
          ...baseData,
          title: 'Player Profile | Eucael: Shadow of Totem - Your Card collection',
          description:
            'View your Eucael: Shadow of Totem player profile, Card collection statistics, and achievement progress.',
          keywords: baseData.keywords + ', player profile, achievements, statistics',
        };

      case 'login':
        return {
          ...baseData,
          title: 'Login | Eucael: Shadow of Totem - Access Your Card collection',
          description:
            'Login to Eucael: Shadow of Totem to access your Card collection, continue your shadow gathering journey, and compete with players worldwide.',
        };

      default:
        return baseData;
    }
  }
}

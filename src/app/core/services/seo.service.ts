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

    switch (page) {
      case 'home':
        return {
          ...baseData,
          title: 'Eucael: Shadows of the Totem – Summon the Creatures',
          description:
            'Welcome to Eucael: Shadows of the Totem! Start your journey in the ultimate strategy game where shadows become legendary Mythological creatures. Join thousands of players building their Creature collections.',
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
        };

      case 'admin':
        return {
          ...baseData,
          title: 'Eucael: Shadows of the Totem – Summon the Creatures',
          description:
            'Administrative interface for Eucael: Shadows of the Totem game management and player oversight.',
        };

      case 'profile':
        return {
          ...baseData,
          title: 'Eucael: Shadows of the Totem – Summon the Creatures',
          description:
            'View your Eucael: Shadows of the Totem player profile, Creature collection statistics, and achievement progress.',
          keywords: baseData.keywords + ', player profile, achievements, statistics',
        };

      case 'login':
        return {
          ...baseData,
          title: 'Eucael: Shadows of the Totem – Summon the Creatures',
          description:
            'Login to Eucael: Shadows of the Totem to access your Creature collection, continue your shadow gathering journey, and compete with players worldwide.',
        };

      default:
        return baseData;
    }
  }
}

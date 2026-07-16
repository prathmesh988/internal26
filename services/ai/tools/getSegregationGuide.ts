import { tool } from 'ai';
import { z } from 'zod';

export const getSegregationGuide = (session: { userId: string; userType: string }) =>
  tool({
    description: 'Get static/reference segregation instructions for sorting wet, dry, e-waste, and hazardous municipal waste.',
    parameters: z.object({
      category: z.enum(['WET', 'DRY', 'E_WASTE', 'HAZARDOUS']).optional(),
    }),
    execute: async ({ category }) => {
      // 1. Role Enforcement
      if (session.userType !== 'CITIZEN') {
        return { success: false, error: 'Unauthorized: Only citizens can request segregation guidance.' };
      }

      const guides: Record<string, string> = {
        WET: 'Wet waste includes kitchen scrap, food leftovers, vegetable peels, fruit skins, and tea leaves. Always dispose of wet waste in green bins.',
        DRY: 'Dry waste includes paper, clean cardboard, plastic bottles, metal cans, glass jars, and wrappers. Always clean dry waste before disposing in blue bins.',
        E_WASTE: 'E-waste includes dead batteries, broken chargers, old phones, calculators, and cables. Hand these over to ward collection Tipper crews directly or request special pickup.',
        HAZARDOUS: 'Hazardous waste includes diapers, sanitary pads, expired medicine, household chemicals, and sharp objects. Wrap sanitary waste securely and put in separate red bins.',
      };

      if (category) {
        return {
          success: true,
          category,
          guide: guides[category] || 'No specific guide found for this category.',
        };
      }

      return {
        success: true,
        guide: 'Municipal waste segregation rules require sorting waste at source into: Green (Wet), Blue (Dry), and Red (Hazardous) bins. E-waste should be handed over to staff directly.',
        details: guides,
      };
    },
  });

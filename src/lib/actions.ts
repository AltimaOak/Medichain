'use server';

import { aiSymptomChecker, AISymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { symptomCheckerSchema } from '@/lib/types';

export async function getSymptomAnalysis(
  input: unknown
): Promise<{ success: boolean; data?: AISymptomCheckerOutput; error?: string }> {
  const parsed = symptomCheckerSchema.safeParse(input);

  if (!parsed.success) {
    const error = parsed.error.format()._errors.join('\n');
    return { success: false, error };
  }

  try {
    const result = await aiSymptomChecker(parsed.data);
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

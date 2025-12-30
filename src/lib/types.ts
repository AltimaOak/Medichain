import { z } from 'zod';

export const symptomCheckerSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please describe your symptoms in at least 10 characters.',
  }),
  medicalHistory: z.string().optional(),
});

export type SymptomCheckerSchema = z.infer<typeof symptomCheckerSchema>;

// Symptom checker flow.

'use server';

/**
 * @fileOverview An AI-powered symptom checker chatbot.
 *
 * - aiSymptomChecker - A function that processes user symptoms and returns potential conditions.
 * - AISymptomCheckerInput - The input type for the aiSymptomChecker function.
 * - AISymptomCheckerOutput - The return type for the aiSymptomChecker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISymptomCheckerInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the patient\'s symptoms, including onset, duration, and severity.'),
  medicalHistory: z
    .string()
    .optional()
    .describe('The patient\'s relevant medical history, including pre-existing conditions and medications.'),
});
export type AISymptomCheckerInput = z.infer<typeof AISymptomCheckerInputSchema>;

const AISymptomCheckerOutputSchema = z.object({
  possibleConditions: z
    .string()
    .describe('A list of possible medical conditions based on the provided symptoms and medical history.'),
  confidenceLevel: z
    .string()
    .describe('A confidence level indication of the chatbot, should be low, medium, or high.'),
  nextSteps: z
    .string()
    .describe('Recommended next steps for the patient, such as consulting a doctor or seeking immediate medical attention.'),
  disclaimer: z
    .string()
    .describe('A disclaimer that the information provided is not a substitute for professional medical advice.'),
});
export type AISymptomCheckerOutput = z.infer<typeof AISymptomCheckerOutputSchema>;

export async function aiSymptomChecker(input: AISymptomCheckerInput): Promise<AISymptomCheckerOutput> {
  return aiSymptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerPrompt',
  input: {schema: AISymptomCheckerInputSchema},
  output: {schema: AISymptomCheckerOutputSchema},
  prompt: `You are an AI-powered symptom checker chatbot designed to provide preliminary insights into a patient's symptoms and possible conditions.

  Based on the provided symptoms and medical history, you will generate a list of possible medical conditions, a confidence level indication, recommended next steps, and a disclaimer.

  Symptoms: {{{symptoms}}}
  Medical History: {{{medicalHistory}}}

  Provide the output in the following format:
  Possible Conditions: [list of possible conditions]
  Confidence Level: [low, medium, or high]
  Next Steps: [recommended next steps]
  Disclaimer: [disclaimer message]`,
});

const aiSymptomCheckerFlow = ai.defineFlow(
  {
    name: 'aiSymptomCheckerFlow',
    inputSchema: AISymptomCheckerInputSchema,
    outputSchema: AISymptomCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

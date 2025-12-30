import Header from '@/components/header';
import SymptomCheckerForm from '@/components/symptom-checker-form';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
              AI-Powered Symptom Checker
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Describe your symptoms and medical history to get a preliminary
              analysis of possible conditions from our AI.
            </p>
          </div>
          <div className="mt-12">
            <SymptomCheckerForm />
          </div>
        </div>
      </main>
    </div>
  );
}

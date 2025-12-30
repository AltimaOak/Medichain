import Header from '@/components/header';
import SymptomCheckerForm from '@/components/symptom-checker-form';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
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

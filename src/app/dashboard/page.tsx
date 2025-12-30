'use client';

import { useAuth, UserRole } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, FileText, Stethoscope } from 'lucide-react';
import { AISymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import SymptomCheckerForm from '@/components/symptom-checker-form';

export default function DashboardPage() {
  const { user, reports, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.Patient:
        return <PatientDashboard user={user} reports={reports} />;
      case UserRole.Doctor:
        return <DoctorDashboard user={user} />;
      case UserRole.Admin:
        return <AdminDashboard user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Header />
      <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 md:p-10">
        {renderDashboard()}
      </main>
    </div>
  );
}

function PatientDashboard({ user, reports }: { user: any; reports: any[] }) {
  return (
    <div className="grid gap-10">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Here's your personal health dashboard.</p>
      </div>

      <SymptomCheckerForm />

      <Card className='bg-card/60 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle>AI Report History</CardTitle>
          <CardDescription>Your past symptom analyses are saved here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">{report.symptoms.substring(0, 50)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(report.date), 'PPP p')}
                    </p>
                  </div>
                   <ConfidenceBadge level={report.confidenceLevel} />
                </div>
              ))
            ) : (
              <p className='text-center text-muted-foreground py-8'>No reports found. Use the symptom checker to create your first report.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


const ConfidenceBadge = ({ level }: { level: string }) => {
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
    if (level?.toLowerCase() === 'high') {
      variant = 'default';
    } else if (level?.toLowerCase() === 'medium') {
      variant = 'secondary';
    } else if (level) {
      variant = 'destructive';
    }
    return <Badge variant={variant} className="capitalize">{level}</Badge>;
  };

function DoctorDashboard({ user }: { user: any }) {
    const { getAllReports } = useAuth();
    const reports = getAllReports();

  return (
    <div>
      <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
      <p className="text-muted-foreground">Welcome, Dr. {user.name}.</p>
      
      <Card className='mt-8 bg-card/60 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle>Patient AI Reports</CardTitle>
          <CardDescription>Review recent symptom analysis reports from patients.</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
            {reports.length > 0 ? (
              reports.filter(r => r.userRole === UserRole.Patient).map((report, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">{report.symptoms.substring(0, 50)}...</p>
                    <p className='text-sm font-semibold mt-1'>Patient: {report.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(report.date), 'PPP p')}
                    </p>
                  </div>
                   <ConfidenceBadge level={report.confidenceLevel} />
                </div>
              ))
            ) : (
              <p className='text-center text-muted-foreground py-8'>No patient reports available at this time.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const { users, getAllReports } = useAuth();
  const reports = getAllReports();
  const patientCount = users.filter(u => u.role === UserRole.Patient).length;
  const doctorCount = users.filter(u => u.role === UserRole.Doctor).length;
  const reportCount = reports.length;

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.name}.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card className='bg-card/60 backdrop-blur-sm'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCount}</div>
          </CardContent>
        </Card>
        <Card className='bg-card/60 backdrop-blur-sm'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorCount}</div>
          </CardContent>
        </Card>
        <Card className='bg-card/60 backdrop-blur-sm'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useAuth, UserRole, Report } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Stethoscope, Search, Download, MessageSquare, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import SymptomCheckerForm from '@/components/symptom-checker-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
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
        return <PatientDashboard />;
      case UserRole.Doctor:
        return <DoctorDashboard />;
      case UserRole.Admin:
        return <AdminDashboard />;
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

function PatientDashboard() {
  const { user, reports } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredReports = useMemo(() => {
    return reports
      .filter(report => {
        const searchMatch =
          report.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.possibleConditions.toLowerCase().includes(searchTerm.toLowerCase());
        const severityMatch = severityFilter === 'all' || report.confidenceLevel.toLowerCase() === severityFilter;
        return searchMatch && severityMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        return 0;
      });
  }, [reports, searchTerm, severityFilter, sortBy]);

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here's your personal health dashboard.</p>
      </div>

      <SymptomCheckerForm />

      <Card className='bg-card/60 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle>AI Report History</CardTitle>
          <CardDescription>Your past symptom analyses are saved here.</CardDescription>
           <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
             <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <ReportCard key={index} report={report} />
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

function DoctorDashboard() {
  const { user, getAllReports } = useAuth();
  const allReports = getAllReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredReports = useMemo(() => {
    return allReports
      .filter(report => report.userRole === UserRole.Patient)
      .filter(report => {
        const searchMatch =
          (report.userName && report.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (report.symptoms && report.symptoms.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (report.possibleConditions && report.possibleConditions.toLowerCase().includes(searchTerm.toLowerCase()));
        const severityMatch = severityFilter === 'all' || (report.confidenceLevel && report.confidenceLevel.toLowerCase() === severityFilter);
        return searchMatch && severityMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        return 0;
      });
  }, [allReports, searchTerm, severityFilter, sortBy]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
      <p className="text-muted-foreground">Welcome, Dr. {user?.name}.</p>
      
      <Card className='mt-8 bg-card/60 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle>Patient AI Reports</CardTitle>
          <CardDescription>Review recent symptom analysis reports from patients.</CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, symptom..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
             <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <ReportCard key={index} report={report} />
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

function AdminDashboard() {
  const { user, users, getAllReports } = useAuth();
  const reports = getAllReports();
  const patientCount = users.filter(u => u.role === UserRole.Patient).length;
  const doctorCount = users.filter(u => u.role === UserRole.Doctor).length;
  const reportCount = reports.length;

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user?.name}.</p>
      
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

const emergencyKeywords = [
    'chest pain', 'breathing difficulty', 'severe bleeding', 'loss of consciousness',
    'seizure', 'paralysis', 'severe pain', 'slurred speech', 'vision loss'
];

function ReportCard({ report }: { report: Report }) {
    const { user, addDoctorNote } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [doctorNote, setDoctorNote] = useState(report.doctorNotes || "");
    const [isEditingNote, setIsEditingNote] = useState(false);
    
    const isEmergency = emergencyKeywords.some(keyword => report.symptoms.toLowerCase().includes(keyword));

    const handleSaveNote = () => {
        addDoctorNote(report.date, doctorNote);
        setIsEditingNote(false);
    };
  
    const handleDownloadPdf = () => {
        const reportElement = document.getElementById(`report-${report.userId}-${report.date}`);
        if (reportElement) {
          html2canvas(reportElement, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'px', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const height = canvasHeight / ratio;
            
            if (height <= pdfHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
            } else {
                let y = 0;
                let remainingHeight = canvasHeight;
                while (remainingHeight > 0) {
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvasWidth;
                    const pageHeight = Math.min(remainingHeight, pdfHeight * ratio);
                    pageCanvas.getContext('2d')?.drawImage(canvas, 0, y, canvasWidth, pageHeight, 0, 0, canvasWidth, pageHeight);
                    const pageImgData = pageCanvas.toDataURL('image/png');
                    
                    pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, (pageHeight / ratio));
                    remainingHeight -= pageHeight;
                    y += pageHeight;
                    if (remainingHeight > 0) {
                        pdf.addPage();
                    }
                }
            }
            pdf.save(`MediChain_Report_${report.userName}_${new Date(report.date).toLocaleDateString()}.pdf`);
          });
        }
      };

    return (
      <Card className="bg-card/70 transition-all">
        {isEmergency && !isExpanded && (
            <div className="flex items-center gap-2 rounded-t-lg border-b-2 border-red-600 bg-red-500/10 p-2 text-sm font-semibold">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <span className="text-red-600">Emergency Symptoms Detected</span>
            </div>
        )}
         <div id={`report-${report.userId}-${report.date}`} className='p-6'>
            {isEmergency && isExpanded && (
                <div className="flex items-center gap-4 rounded-lg border-b-4 border-red-600 bg-red-500/10 p-4 mb-6">
                    <ShieldAlert className="h-10 w-10 flex-shrink-0 text-red-600" />
                    <div>
                        <h3 className="text-lg font-bold text-red-600">Emergency Warning</h3>
                        <p className="text-sm text-red-700 dark:text-red-400">Critical symptoms detected. This case requires immediate attention.</p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="md:col-span-3">
                    {report.userName && <p className='text-sm font-semibold text-primary'>Patient: {report.userName}</p>}
                    <p className="font-semibold">{report.symptoms.substring(0, 80)}{report.symptoms.length > 80 ? '...' : ''}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(report.date), 'PPP p')}
                    </p>
                </div>
                <div className="flex flex-col items-start md:items-end justify-between">
                    <ConfidenceBadge level={report.confidenceLevel} />
                </div>
            </div>
            <div className="mt-4">
              <SeverityIndicator level={report.confidenceLevel} />
            </div>

            {isExpanded && (
                <div className="mt-6 border-t pt-6 space-y-4 animate-in fade-in-50">
                     <div>
                        <h4 className="font-semibold text-primary">Possible Conditions</h4>
                        <p className="text-muted-foreground">{report.possibleConditions}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary">Next Steps</h4>
                        <p className="text-muted-foreground">{report.nextSteps}</p>
                    </div>

                    {user?.role === UserRole.Doctor && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                                <MessageSquare />
                                Doctor's Notes & Recommendations
                            </h4>
                            {isEditingNote ? (
                                <div className="mt-2 space-y-2">
                                    <Textarea 
                                        value={doctorNote}
                                        onChange={(e) => setDoctorNote(e.target.value)}
                                        placeholder="Add your notes and recommendations here..."
                                        className="min-h-[100px]"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditingNote(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleSaveNote}>Save Note</Button>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => setIsEditingNote(true)} className="mt-2 cursor-pointer hover:bg-primary/10 p-2 rounded-md">
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {report.doctorNotes || "Click to add notes."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {user?.role === UserRole.Patient && report.doctorNotes && (
                         <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                                <MessageSquare />
                                Doctor's Notes
                            </h4>
                            <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{report.doctorNotes}</p>
                        </div>
                    )}


                    <div className="rounded-lg border border-amber-300/50 bg-amber-500/10 p-4">
                        <h4 className="font-semibold text-amber-600 dark:text-amber-400">Important Disclaimer</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{report.disclaimer}</p>
                    </div>
                </div>
            )}
        </div>
        {isExpanded && (
             <CardFooter className='bg-muted/50'>
                <Button onClick={handleDownloadPdf} variant="ghost" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </CardFooter>
        )}
      </Card>
    );
  }
  

const ConfidenceBadge = ({ level }: { level: string }) => {
    const levelLower = level?.toLowerCase();
    let variant: 'destructive' | 'default' | 'secondary' = 'secondary';
    let colorClass = '';

    if (levelLower === 'high') {
      variant = 'destructive';
      colorClass = 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30';
    } else if (levelLower === 'medium') {
      variant = 'default';
      colorClass = 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-500/30';
    } else if (levelLower) {
      variant = 'secondary';
      colorClass = 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30';
    }
    
    return <Badge variant={variant} className={`capitalize ${colorClass}`}>{level}</Badge>;
  };
  
  const SeverityIndicator = ({ level }: { level: string }) => {
    const levelLower = level?.toLowerCase();
    let severityPercentage = 33;
    let colorClass = 'bg-green-500';
  
    if (levelLower === 'high') {
      severityPercentage = 100;
      colorClass = 'bg-red-500';
    } else if (levelLower === 'medium') {
      severityPercentage = 66;
      colorClass = 'bg-yellow-500';
    }
  
    return (
      <div>
        <div className="flex justify-between mb-1">
            <span className='text-sm font-medium text-muted-foreground'>Severity</span>
            <span className={`text-sm font-bold ${
                levelLower === 'high' ? 'text-red-500' :
                levelLower === 'medium' ? 'text-yellow-500' :
                'text-green-500'
            }`}>{level}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClass}`} style={{ width: `${severityPercentage}%` }}></div>
        </div>
      </div>
    );
  };

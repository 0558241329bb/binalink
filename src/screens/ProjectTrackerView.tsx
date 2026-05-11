// src/screens/ProjectTrackerView.tsx
import React, { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hammer, 
  CheckCircle2, 
  Clock, 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  User,
  Loader2,
  Plus
} from 'lucide-react';

const PHASES = [
  { id: 'foundation', name: 'phase_foundation', icon: Hammer, color: 'bg-orange-500' },
  { id: 'structure', name: 'phase_structure', icon: Hammer, color: 'bg-blue-500' },
  { id: 'plumbing', name: 'phase_plumbing', icon: Hammer, color: 'bg-cyan-500' },
  { id: 'electrical', name: 'phase_electrical', icon: Hammer, color: 'bg-yellow-500' },
  { id: 'finishing', name: 'phase_finishing', icon: Hammer, color: 'bg-purple-500' },
  { id: 'decor', name: 'phase_decor', icon: Hammer, color: 'bg-pink-500' },
];

export default function ProjectTrackerView() {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const [activePhase, setActivePhase] = useState(PHASES[0].id);
  const [uploading, setUploading] = useState<string | null>(null);

  // Mock project data
  const project = {
    id: '1',
    name: 'Villa Modern Algiers',
    address: 'Hydra, Algiers',
    completion: 65,
    provider: 'Ahmed Benali',
    startDate: '2025-10-15',
    phases: {
      foundation: { status: 'DONE', completion: 100, date: '2025-11-20', photos: ['https://picsum.photos/seed/f1/400/300', 'https://picsum.photos/seed/f2/400/300'] },
      structure: { status: 'DONE', completion: 100, date: '2026-01-15', photos: ['https://picsum.photos/seed/s1/400/300'] },
      plumbing: { status: 'ACTIVE', completion: 45, date: '2026-03-10', photos: ['https://picsum.photos/seed/p1/400/300'] },
      electrical: { status: 'PENDING', completion: 0, date: '2026-04-05', photos: [] },
      finishing: { status: 'PENDING', completion: 0, date: '2026-05-20', photos: [] },
      decor: { status: 'PENDING', completion: 0, date: '2026-06-15', photos: [] },
    }
  };

  const handlePhotoUpload = async (phaseId: string) => {
    setUploading(phaseId);
    // Simulate upload
    setTimeout(() => {
      setUploading(null);
      toast.success(t('photo_uploaded') || 'Photo uploaded successfully!');
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="space-y-8">
        {/* Project Header */}
        <Card className="border-none shadow-xl bg-primary text-white overflow-hidden rounded-3xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">{project.address}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-primary-foreground/80" />
                    <span className="text-sm font-bold">{project.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary-foreground/80" />
                    <span className="text-sm font-bold">{project.startDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="none"
                      stroke="white"
                      strokeWidth="12"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * project.completion) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{project.completion}%</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">{t('completion')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phases Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold px-2">{t('phases')}</h2>
            <div className="space-y-2">
              {PHASES.map((phase) => {
                const phaseData = (project.phases as any)[phase.id];
                const isActive = activePhase === phase.id;
                
                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white shadow-lg border-l-4 border-primary' 
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${phase.color} text-white shadow-lg`}>
                        {phaseData.status === 'DONE' ? <CheckCircle2 size={20} /> : <phase.icon size={20} />}
                      </div>
                      <div className="text-left">
                        <p className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-slate-700'}`}>{t(phase.name)}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t(`status_${phaseData.status.toLowerCase()}`)}</p>
                      </div>
                    </div>
                    {isActive && (isRTL ? <ChevronLeft size={16} className="text-primary" /> : <ChevronRight size={16} className="text-primary" />)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {PHASES.filter(p => p.id === activePhase).map(phase => {
                  const phaseData = (project.phases as any)[phase.id];
                  
                  return (
                    <Card key={phase.id} className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${phase.color} text-white shadow-xl`}>
                                <phase.icon size={24} />
                              </div>
                              <CardTitle className="text-3xl font-bold">{t(phase.name)}</CardTitle>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                              <span className="flex items-center gap-1"><Clock size={14} /> {phaseData.date}</span>
                              <span className="flex items-center gap-1"><User size={14} /> {project.provider}</span>
                            </div>
                          </div>
                          <div className="w-full md:w-48 space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span>{t('completion')}</span>
                              <span className="text-primary">{phaseData.completion}%</span>
                            </div>
                            <Progress value={phaseData.completion} className="h-3 rounded-full" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <Camera size={20} className="text-primary" />
                              {isRTL ? 'معرض الصور' : 'Photo Gallery'}
                            </h3>
                            <Button 
                              variant="outline" 
                              className="rounded-xl border-dashed border-2 hover:bg-slate-50"
                              onClick={() => handlePhotoUpload(phase.id)}
                              disabled={uploading === phase.id}
                            >
                              {uploading === phase.id ? <Loader2 className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                              {t('upload_photo')}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {phaseData.photos.map((photo: string, i: number) => (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="aspect-video rounded-2xl overflow-hidden shadow-md relative group cursor-pointer"
                              >
                                <img src={photo} alt="Phase" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Plus className="text-white h-8 w-8" />
                                </div>
                              </motion.div>
                            ))}
                            {phaseData.photos.length === 0 && (
                              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed">
                                <Camera size={48} className="mb-4 opacity-20" />
                                <p className="font-bold">{isRTL ? 'لا توجد صور بعد' : 'No photos yet'}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <h3 className="font-bold text-slate-800">{isRTL ? 'ملاحظات المحترف' : 'Provider Notes'}</h3>
                          <p className="text-slate-600 leading-relaxed italic">
                            {isRTL 
                              ? "تم الانتهاء من الأعمال الأساسية وفقاً للمخططات المعتمدة. جودة الخرسانة ممتازة وتم إجراء كافة الاختبارات اللازمة."
                              : "Core works completed according to approved plans. Concrete quality is excellent and all necessary tests were performed."}
                          </p>
                        </div>
                        
                        <Button className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                          {isRTL ? 'مراسلة المحترف' : 'Message Provider'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

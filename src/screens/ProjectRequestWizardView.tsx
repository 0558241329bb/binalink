// src/screens/ProjectRequestWizardView.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Check, 
  Upload, 
  Home, 
  Hammer, 
  Armchair, 
  CheckCircle2,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';
import { WILAYAS } from '@/constants';

const SERVICES = [
  { id: 'foundation', label: 'Foundation' },
  { id: 'structure', label: 'Structure' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'tiling', label: 'Tiling' },
  { id: 'painting', label: 'Painting' },
  { id: 'decoration', label: 'Decoration' },
  { id: 'security', label: 'Security Cameras' },
  { id: 'furniture', label: 'Furniture' },
];

export default function ProjectRequestWizardView() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: 'new_build',
    wilaya: WILAYAS[15],
    city: '',
    address: '',
    services: [] as string[],
    budget: 5000000,
    timeline: 12,
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await api.post('/projects/request', formData);
      toast.success('Project request submitted successfully!');
      navigate('/tracker');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
            <span>{t(`wizard_step_${step}`)}</span>
            <span>{step} / 5</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900">{t('project_type')}</h2>
                      <p className="text-slate-500">{isRTL ? 'اختر الفئة التي تصف مشروعك بشكل أفضل' : 'Select the category that best describes your project'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'new_build', label: 'new_build', icon: Home, color: 'bg-orange-100 text-orange-600' },
                        { id: 'renovation', label: 'renovation', icon: Hammer, color: 'bg-blue-100 text-blue-600' },
                        { id: 'furnishing', label: 'furnishing', icon: Armchair, color: 'bg-purple-100 text-purple-600' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 gap-4 ${
                            formData.type === type.id 
                              ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div className={`p-4 rounded-2xl ${type.color}`}>
                            <type.icon size={32} />
                          </div>
                          <span className="font-bold text-slate-800">{t(type.label)}</span>
                          {formData.type === type.id && (
                            <div className="bg-primary text-white rounded-full p-1">
                              <Check size={12} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900">{t('wizard_step_2')}</h2>
                      <p className="text-slate-500">{isRTL ? 'أين يقع مشروعك؟' : 'Where is your project located?'}</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>{t('wilaya')}</Label>
                        <select 
                          className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={formData.wilaya}
                          onChange={e => setFormData({...formData, wilaya: e.target.value})}
                        >
                          {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>{isRTL ? 'البلدية' : 'City/Commune'}</Label>
                          <Input 
                            className="h-12 rounded-xl" 
                            placeholder="e.g., Hydra" 
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isRTL ? 'العنوان' : 'Address'}</Label>
                          <Input 
                            className="h-12 rounded-xl" 
                            placeholder="e.g., 123 Street Name" 
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="h-48 bg-slate-100 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 gap-2">
                        <MapPin size={32} className="opacity-20" />
                        <p className="font-bold text-sm">{isRTL ? 'تحديد الموقع على الخريطة' : 'Set location on map'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900">{t('wizard_step_3')}</h2>
                      <p className="text-slate-500">{isRTL ? 'ما هي الخدمات التي تحتاجها؟' : 'Which services do you need?'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {SERVICES.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`flex items-center space-x-3 space-x-reverse p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.services.includes(service.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <Checkbox 
                            checked={formData.services.includes(service.id)}
                            onCheckedChange={() => toggleService(service.id)}
                            className="rounded-md"
                          />
                          <span className="font-medium text-slate-700">{isRTL ? t(`phase_${service.id}`) : service.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-12">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900">{t('wizard_step_4')}</h2>
                      <p className="text-slate-500">{isRTL ? 'حدد ميزانيتك والجدول الزمني المتوقع' : 'Set your budget and expected timeline'}</p>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <Label className="text-lg font-bold flex items-center gap-2">
                            <DollarSign size={20} className="text-primary" />
                            {t('budget_range')}
                          </Label>
                          <span className="text-2xl font-black text-primary">{(formData.budget / 1000000).toFixed(1)}M DA</span>
                        </div>
                        <Slider 
                          min={500000} 
                          max={20000000} 
                          step={500000} 
                          value={[formData.budget]} 
                          onValueChange={(val: any) => setFormData({...formData, budget: Array.isArray(val) ? val[0] : val})}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>500k DA</span>
                          <span>20M DA</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <Label className="text-lg font-bold flex items-center gap-2">
                            <Calendar size={20} className="text-primary" />
                            {t('timeline')}
                          </Label>
                          <span className="text-2xl font-black text-primary">{formData.timeline} {isRTL ? 'أشهر' : 'Months'}</span>
                        </div>
                        <Slider 
                          min={1} 
                          max={36} 
                          step={1} 
                          value={[formData.timeline]} 
                          onValueChange={(val: any) => setFormData({...formData, timeline: Array.isArray(val) ? val[0] : val})}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>1 {isRTL ? 'شهر' : 'Month'}</span>
                          <span>36 {isRTL ? 'شهر' : 'Months'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900">{t('wizard_step_5')}</h2>
                      <p className="text-slate-500">{isRTL ? 'راجع تفاصيل مشروعك قبل الإرسال' : 'Review your project details before submitting'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">{t('wizard_step_1')} & {t('wizard_step_2')}</h3>
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-slate-800">{t(formData.type)}</p>
                          <p className="text-slate-600 flex items-center gap-2"><MapPin size={16} /> {formData.wilaya}, {formData.city}</p>
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">{t('wizard_step_4')}</h3>
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-slate-800">{(formData.budget / 1000000).toFixed(1)}M DA</p>
                          <p className="text-slate-600 flex items-center gap-2"><Calendar size={16} /> {formData.timeline} {isRTL ? 'أشهر' : 'Months'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                      <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">{t('wizard_step_3')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.services.map(s => (
                          <div key={s} className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-primary" />
                            {isRTL ? t(`phase_${s}`) : s}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 py-12">
                      <Upload size={48} className="text-primary opacity-20" />
                      <div className="text-center">
                        <p className="font-bold text-slate-800">{isRTL ? 'رفع المخططات أو الصور المرجعية' : 'Upload plans or reference images'}</p>
                        <p className="text-sm text-slate-500">{isRTL ? 'اختياري - يساعد في الحصول على عروض أسعار أدق' : 'Optional - helps in getting more accurate quotes'}</p>
                      </div>
                      <Button variant="outline" className="rounded-xl">{isRTL ? 'اختر ملفات' : 'Select Files'}</Button>
                    </div>
                  </div>
                )}

                <div className="mt-12 flex justify-between gap-4">
                  {step > 1 && (
                    <Button 
                      variant="ghost" 
                      onClick={prevStep} 
                      className="h-14 px-8 rounded-2xl text-lg font-bold"
                    >
                      <ChevronLeft className={`mr-2 h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                      {t('back')}
                    </Button>
                  )}
                  <div className="flex-grow" />
                  {step < 5 ? (
                    <Button 
                      onClick={nextStep} 
                      className="h-14 px-12 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                    >
                      {t('next')}
                      <ChevronRight className={`ml-2 h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isLoading}
                      className="h-14 px-12 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-accent hover:bg-accent/90"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : t('submit')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

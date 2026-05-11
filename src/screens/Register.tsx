// src/screens/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Phone, User, MapPin, Lock, Briefcase, Award, Loader2 } from 'lucide-react';
import { WILAYAS } from '@/constants';
import { auth } from '@/lib/firebase';

const TRADES = [
  { value: 'CONTRACTOR', label: 'General Contractor' },
  { value: 'PLUMBER', label: 'Plumber' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'DESIGNER', label: 'Interior Designer' },
  { value: 'PAINTER', label: 'Painter' },
  { value: 'OTHER', label: 'Other' },
];

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  const handleRegister = async (role: 'CLIENT' | 'PROVIDER', formData: any) => {
    setIsLoading(true);
    try {
      const data = await api.post('/auth/register', { ...formData, role });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success(t('register_success') || 'Registration successful!');
      navigate('/verify-otp', { state: { phone: formData.phone } });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50/50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="bg-primary text-white text-center pb-8">
            <CardTitle className="text-3xl font-bold">{t('register')}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {t('join_binalink')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="CLIENT" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-xl bg-slate-100 p-1">
                <TabsTrigger value="CLIENT" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <User className="w-4 h-4 mr-2" />
                  {t('register_client')}
                </TabsTrigger>
                <TabsTrigger value="PROVIDER" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {t('register_provider')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="CLIENT">
                <ClientForm onSubmit={(data) => handleRegister('CLIENT', data)} isLoading={isLoading} t={t} />
              </TabsContent>

              <TabsContent value="PROVIDER">
                <ProviderForm onSubmit={(data) => handleRegister('PROVIDER', data)} isLoading={isLoading} t={t} isRTL={isRTL} />
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center text-sm text-slate-500">
              {t('already_have_account') || 'Already have an account?'} {' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                {t('login')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ClientForm({ onSubmit, isLoading, t }: { onSubmit: (data: any) => void, isLoading: boolean, t: any }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: WILAYAS[15], // Alger default
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{t('name')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-10 h-12 rounded-xl" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t('phone')}</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-10 h-12 rounded-xl" 
              required 
              placeholder="05XXXXXXXX"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('wilaya')}</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <select 
            className="flex h-12 w-full rounded-xl border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.wilaya}
            onChange={e => setFormData({...formData, wilaya: e.target.value})}
          >
            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('password')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            type="password" 
            className="pl-10 h-12 rounded-xl" 
            required 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>
      </div>

      <Button className="w-full h-12 text-lg rounded-xl shadow-lg" type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : t('register')}
      </Button>
    </form>
  );
}

function ProviderForm({ onSubmit, isLoading, t, isRTL }: { onSubmit: (data: any) => void, isLoading: boolean, t: any, isRTL: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: WILAYAS[15],
    trade: 'CONTRACTOR',
    yearsExperience: '5',
    password: '',
    contractorTier: '' as 'PREMIUM' | 'STANDARD' | '',
    capitalAmount: 0,
    brandReputation: '',
    priceRangeMin: 0,
    priceRangeMax: 0,
    serviceType: '' as 'FULL_BUILD' | 'SEMI_BUILD' | '',
    pricePerUnit: 0,
    completionTimeWeeks: 0,
    reputationScore: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...formData,
        contractorTier: formData.contractorTier || 'STANDARD',
        capitalAmount: formData.capitalAmount || undefined,
        brandReputation: formData.brandReputation || undefined,
        priceRangeMin: formData.priceRangeMin || undefined,
        priceRangeMax: formData.priceRangeMax || undefined,
        serviceType: formData.serviceType || undefined,
        pricePerUnit: formData.pricePerUnit || undefined,
        completionTimeWeeks: formData.completionTimeWeeks || undefined,
        reputationScore: formData.reputationScore || undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{t('name')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-10 h-12 rounded-xl" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t('phone')}</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-10 h-12 rounded-xl" 
              required 
              placeholder="05XXXXXXXX"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{t('trade')}</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <select 
              className="flex h-12 w-full rounded-xl border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.trade}
              onChange={e => setFormData({...formData, trade: e.target.value})}
            >
              {TRADES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t('experience')}</Label>
          <div className="relative">
            <Award className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              type="number" 
              className="pl-10 h-12 rounded-xl" 
              required 
              value={formData.yearsExperience}
              onChange={e => setFormData({...formData, yearsExperience: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Contractor Tier Selection — shown only when trade === 'CONTRACTOR' */}
      {formData.trade === 'CONTRACTOR' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <Label className="text-sm font-bold text-slate-700">
            {t('contractor_type')}
          </Label>
          
          {/* Tier selector — two clickable option cards */}
          <div className="grid grid-cols-1 gap-3">
            {/* Premium option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, contractorTier: 'PREMIUM' })}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                formData.contractorTier === 'PREMIUM'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    ★★★★★ {t('premium_contractors')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{t('premium_contractor_desc')}</p>
                </div>
                {formData.contractorTier === 'PREMIUM' && (
                  <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 20 20" fill="white" className="h-3 w-3">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Standard option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, contractorTier: 'STANDARD' })}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                formData.contractorTier === 'STANDARD'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    ★★★☆☆ {t('standard_contractors')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{t('standard_contractor_desc')}</p>
                </div>
                {formData.contractorTier === 'STANDARD' && (
                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 20 20" fill="white" className="h-3 w-3">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Premium-specific fields */}
          {formData.contractorTier === 'PREMIUM' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">{t('capital_amount_label')}</Label>
                  <Input
                    type="number"
                    min="0"
                    className="h-11 rounded-xl bg-white border-slate-200"
                    placeholder="150000000"
                    value={formData.capitalAmount || ''}
                    onChange={e => setFormData({ ...formData, capitalAmount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">{t('brand_reputation')}</Label>
                  <select
                    className="w-full h-11 p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                    value={formData.brandReputation || ''}
                    onChange={e => setFormData({ ...formData, brandReputation: e.target.value })}
                  >
                    <option value="">—</option>
                    <option value="LOCAL">{t('reputation_local')}</option>
                    <option value="REGIONAL">{t('reputation_regional')}</option>
                    <option value="NATIONAL">{t('reputation_national')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">{t('price_min_label')}</Label>
                  <Input
                    type="number"
                    min="0"
                    className="h-11 rounded-xl bg-white border-slate-200"
                    placeholder="35000"
                    value={formData.priceRangeMin || ''}
                    onChange={e => setFormData({ ...formData, priceRangeMin: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">{t('price_max_label')}</Label>
                  <Input
                    type="number"
                    min="0"
                    className="h-11 rounded-xl bg-white border-slate-200"
                    placeholder="85000"
                    value={formData.priceRangeMax || ''}
                    onChange={e => setFormData({ ...formData, priceRangeMax: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">{t('service_type')}</Label>
                <div className="flex gap-3">
                  {(['FULL_BUILD', 'SEMI_BUILD'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, serviceType: type })}
                      className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.serviceType === type
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 text-slate-600 hover:border-primary/50'
                      }`}
                    >
                      {type === 'FULL_BUILD' ? t('full_build') : t('semi_build')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Standard-specific fields */}
          {formData.contractorTier === 'STANDARD' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">{t('price_per_unit_label')}</Label>
                  <Input
                    type="number"
                    min="0"
                    className="h-11 rounded-xl bg-white border-slate-200"
                    placeholder="25000"
                    value={formData.pricePerUnit || ''}
                    onChange={e => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">{t('completion_weeks_label')}</Label>
                  <Input
                    type="number"
                    min="1"
                    className="h-11 rounded-xl bg-white border-slate-200"
                    placeholder="8"
                    value={formData.completionTimeWeeks || ''}
                    onChange={e => setFormData({ ...formData, completionTimeWeeks: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">{t('brand_reputation')}</Label>
                <select
                  className="w-full h-11 p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                  value={formData.reputationScore || ''}
                  onChange={e => setFormData({ ...formData, reputationScore: e.target.value })}
                >
                  <option value="">—</option>
                  <option value="LOW">{t('reputation_local')}</option>
                  <option value="MEDIUM">{isRTL ? 'متوسطة' : 'Medium'}</option>
                  <option value="HIGH">{isRTL ? 'عالية' : 'High'}</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('wilaya')}</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <select 
            className="flex h-12 w-full rounded-xl border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.wilaya}
            onChange={e => setFormData({...formData, wilaya: e.target.value})}
          >
            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('password')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            type="password" 
            className="pl-10 h-12 rounded-xl" 
            required 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>
      </div>

      <Button className="w-full h-12 text-lg rounded-xl shadow-lg" type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : t('register')}
      </Button>
    </form>
  );
}


import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Search, User as UserIcon, Star, MapPin, CheckCircle, ArrowRight, HardHat } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { WILAYAS } from '../constants';

export default function ContractorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [premiumContractors, setPremiumContractors] = useState<any[]>([]);
  const [standardContractors, setStandardContractors] = useState<any[]>([]);
  const [loadingPremium, setLoadingPremium] = useState(true);
  const [loadingStandard, setLoadingStandard] = useState(true);
  const [location, setLocation] = useState(searchParams.get('wilaya') || 'All');
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    const fetchContractors = async () => {
      const query = new URLSearchParams();
      if (location !== 'All') {
        query.append('wilaya', location);
        setSearchParams(query, { replace: true });
      } else {
        setSearchParams(new URLSearchParams(), { replace: true });
      }

      setLoadingPremium(true);
      setLoadingStandard(true);

      const qs = query.toString();
      const queryUrl = qs ? `?${qs}` : '';

      try {
        const premiumData = await api.get(`/contractors/premium${queryUrl}`);
        setPremiumContractors(premiumData);
      } catch (err) {
        console.error('Failed to load premium contractors', err);
      } finally {
        setLoadingPremium(false);
      }

      try {
        const standardData = await api.get(`/contractors/standard${queryUrl}`);
        setStandardContractors(standardData);
      } catch (err) {
        console.error('Failed to load standard contractors', err);
      } finally {
        setLoadingStandard(false);
      }
    };
    fetchContractors();
  }, [location, setSearchParams]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4 text-primary shadow-inner">
          <HardHat className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          {t('contractors')}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
          {isRTL 
            ? 'اكتشف أفضل المقاولين لتنفيذ مشاريعك بأعلى معايير الجودة والاحترافية.' 
            : 'Discover the best contractors to execute your projects with the highest standards.'}
        </p>

        <div className="max-w-md mx-auto mt-8">
          <Label className="text-sm font-bold text-slate-700 mb-2 block text-left">{isRTL ? 'تصفية حسب الولاية' : 'Filter by Wilaya'}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <select 
              className="w-full h-12 pl-10 pr-4 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="All">{isRTL ? 'كل الولايات' : 'All Wilayas'}</option>
              {WILAYAS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Premium Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-amber-800 flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-current" />
          {t('premium_contractors')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingPremium ? (
             [1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-amber-50/50 animate-pulse rounded-2xl border border-amber-100" />
            ))
          ) : premiumContractors.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-amber-50/50 rounded-2xl border border-amber-100">
               <p className="text-amber-600/80 font-medium">{isRTL ? 'لا يوجد مقاولون مميزون حالياً في هذه الولاية.' : 'No premium contractors found in this wilaya.'}</p>
            </div>
          ) : (
            premiumContractors.map(p => (
              <Card key={p.id} className="overflow-hidden group border-amber-200 shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-300 bg-white">
                <div className="h-48 bg-amber-100/50 flex items-center justify-center relative overflow-hidden">
                   <img 
                     src={`https://picsum.photos/seed/contractor${p.id}/600/400`} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                     alt={p.name}
                     referrerPolicy="no-referrer"
                   />
                   <div className="absolute top-4 left-4 z-20">
                     <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-none shadow-md">
                       <Star className="h-3 w-3 mr-1 fill-current" /> {t('premium_badge')}
                     </Badge>
                   </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                    <div className="flex items-center bg-amber-100 px-2 py-1 rounded-lg text-amber-700 text-sm">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-1 font-bold">{p.providerProfile?.starRating || 5}.0</span>
                    </div>
                  </div>
                  <p className="text-slate-500 mb-4 flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1 text-primary" /> {p.wilaya}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                     <div>
                       <p className="text-xs text-slate-400 font-medium">{t('capital_amount')}</p>
                       <p className="font-bold text-slate-700">{p.providerProfile?.capitalAmount} {t('million_da')}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-400 font-medium">{t('service_type')}</p>
                       <p className="font-bold text-slate-700 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                         {p.providerProfile?.serviceType === 'FULL_BUILD' ? t('full_build') : t('semi_build')}
                       </p>
                     </div>
                  </div>
                  <div className="mt-6 pt-4 border-t flex flex-col justify-end">
                    <Link to={`/provider/${p.id}`} className="w-full">
                       <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors">
                         {t('view_profile')} <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                       </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Standard Section */}
      <section className="space-y-6 pt-8 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-blue-500 fill-current" />
          {t('standard_contractors')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingStandard ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-blue-50/50 animate-pulse rounded-2xl border border-blue-100" />
            ))
          ) : standardContractors.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-blue-50/50 rounded-2xl border border-blue-100">
               <p className="text-blue-600/80 font-medium">{isRTL ? 'لا يوجد مقاولون عاديون حالياً في هذه الولاية.' : 'No standard contractors found in this wilaya.'}</p>
            </div>
          ) : (
            standardContractors.map(p => (
              <Card key={p.id} className="overflow-hidden group border-blue-100 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-white">
                <div className="h-40 bg-blue-50 flex items-center justify-center relative overflow-hidden">
                   <UserIcon className="absolute h-16 w-16 text-blue-200 z-10 group-hover:scale-110 transition-transform" />
                   <div className="absolute top-4 left-4 z-20">
                     <Badge className="bg-blue-500 text-white border-none shadow-sm">
                       {t('standard_badge')}
                     </Badge>
                   </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-800">{p.name}</h3>
                  </div>
                  <p className="text-slate-500 mb-4 flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1 text-blue-500" /> {p.wilaya}
                  </p>
                  <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-700">{p.providerProfile?.yearsExperience || 0}</span> {t('years_experience')}
                  </p>
                  <div className="pt-4 border-t">
                    <Link to={`/provider/${p.id}`} className="w-full">
                       <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors">
                         {t('view_profile')}
                       </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

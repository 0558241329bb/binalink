import React, { useState, useEffect } from 'react';
import { 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  Navigate,
  useNavigate
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Bell, 
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  MoreVertical,
  LogOut,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-slate-200 animate-pulse rounded-md ${className}`} />
);

const StatCard = ({ title, value, growth, icon: Icon, loading }: any) => {
  if (loading) return (
    <Card className="border-none shadow-sm h-32 flex flex-col justify-between p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </Card>
  );

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Icon size={24} />
          </div>
          {growth !== undefined && (
            <div className={`flex items-center text-xs font-bold ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {growth >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
              {Math.abs(growth)}%
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
};

// --- Overview Page ---

const Overview = () => {
  const { t, isRTL } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, verData, projData] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/providers/pending'),
          api.get('/admin/projects/recent')
        ]);
        setStats(statsData);
        setVerifications(verData);
        setRecentProjects(projData);
      } catch (err) {
        // Fallback to mock for demo if API fails
        setStats({
          totalUsers: 1458,
          activeProjects: 52,
          pendingVerifications: 15,
          revenue: 1250000,
          growth: 15.2
        });
        setVerifications([
          { id: '1', name: 'Mustapha Z.', trade: 'Contractor', wilaya: 'Alger', date: '2024-03-15' },
          { id: '2', name: 'Leila B.', trade: 'Architect', wilaya: 'Oran', date: '2024-03-14' }
        ]);
        setRecentProjects([
          { id: '1', title: 'Villa Renovation', client: 'Ahmed K.', provider: 'Mustapha Z.', status: 'IN_PROGRESS', budget: '850k' },
          { id: '2', title: 'Garden Design', client: 'Sara L.', provider: 'Leila B.', status: 'COMPLETED', budget: '120k' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/providers/${id}/verify`, { status });
      toast.success(`Provider ${status === 'VERIFIED' ? 'approved' : 'rejected'} successfully`);
      setVerifications(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const revenueData = [
    { name: 'Jan', revenue: 450000 },
    { name: 'Feb', revenue: 520000 },
    { name: 'Mar', revenue: 480000 },
    { name: 'Apr', revenue: 610000 },
    { name: 'May', revenue: 550000 },
    { name: 'Jun', revenue: 670000 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={isRTL ? 'إجمالي المستخدمين' : 'Total Users'} 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          loading={loading} 
        />
        <StatCard 
          title={isRTL ? 'المشاريع النشطة' : 'Active Projects'} 
          value={stats?.activeProjects || 0} 
          icon={Briefcase} 
          loading={loading} 
        />
        <StatCard 
          title={isRTL ? 'تحققات معلقة' : 'Pending Verifications'} 
          value={stats?.pendingVerifications || 0} 
          icon={UserCheck} 
          loading={loading} 
        />
        <StatCard 
          title={isRTL ? 'الإيرادات (دج)' : 'Revenue (DZD)'} 
          value={stats?.revenue?.toLocaleString() || '0'} 
          growth={stats?.growth} 
          icon={DollarSign} 
          loading={loading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>{isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</CardTitle>
            <CardDescription>{isRTL ? 'نظرة عامة على الإيرادات لعام 2024' : 'Revenue overview for 2024'}</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#1A7A5E" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Verification Requests */}
        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isRTL ? 'طلبات التحقق' : 'Verification Requests'}
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">{verifications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[350px]">
            <div className="space-y-4">
              {verifications.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">{isRTL ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>
                </div>
              )}
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : (
                verifications.map((v) => (
                  <div key={v.id} className="p-4 bg-slate-50 rounded-xl space-y-3 transition-all hover:bg-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900">{v.name}</p>
                        <p className="text-xs text-slate-500">{v.trade} • {v.wilaya}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{v.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 h-8 text-xs font-bold border border-emerald-100"
                        onClick={() => handleVerify(v.id, 'VERIFIED')}
                      >
                        <CheckCircle2 size={14} className={isRTL ? 'ml-1' : 'mr-1'} />
                        {isRTL ? 'قبول' : 'Approve'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-8 text-xs font-bold border border-rose-100"
                        onClick={() => handleVerify(v.id, 'REJECTED')}
                      >
                        <XCircle size={14} className={isRTL ? 'ml-1' : 'mr-1'} />
                        {isRTL ? 'رفض' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isRTL ? 'آخر المشاريع' : 'Recent Projects'}</CardTitle>
          <Link to="projects" className="text-primary font-bold text-sm hover:underline">{isRTL ? 'عرض الكل' : 'View All'}</Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="bg-slate-50 border-y border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">{isRTL ? 'المشروع' : 'Project'}</th>
                  <th className="px-6 py-4 font-bold">{isRTL ? 'العميل' : 'Client'}</th>
                  <th className="px-6 py-4 font-bold">{isRTL ? 'المحترف' : 'Provider'}</th>
                  <th className="px-6 py-4 font-bold">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-4 font-bold text-right">{isRTL ? 'الميزانية' : 'Budget'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-6 py-4"><Skeleton className="h-8 w-full" /></td></tr>
                  ))
                ) : (
                  recentProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{p.title}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.client}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.provider}</td>
                      <td className="px-6 py-4">
                        <Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'} className={p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{p.budget}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Providers Page ---

const Providers = () => {
  const { isRTL } = useTranslation();
  const [providers, setProviders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await api.get('/admin/providers');
        setProviders(data);
      } catch (err) {
        setProviders([
          { id: '1', name: 'Mustapha Zahi', trade: 'Contractor', wilaya: 'Alger', status: 'VERIFIED', experience: 15, phone: '0555123456', projects: 12 },
          { id: '2', name: 'Leila Brahimi', trade: 'Architect', wilaya: 'Oran', status: 'PENDING', experience: 8, phone: '0666789123', projects: 5 },
          { id: '3', name: 'Karim Mansouri', trade: 'Plumber', wilaya: 'Constantine', status: 'VERIFIED', experience: 10, phone: '0777456789', projects: 24 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.trade.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b">
        <div>
          <CardTitle className="text-xl font-bold">{isRTL ? 'إدارة المحترفين' : 'Provider Management'}</CardTitle>
          <CardDescription>{isRTL ? 'البحث ومراجعة والتحقق من مقدمي الخدمات' : 'Search, review and verify service providers'}</CardDescription>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-10 w-64 bg-slate-50 border-slate-200" 
              placeholder={isRTL ? 'بحث بالاسم او المهنة...' : 'Search name or trade...'} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="bg-slate-50 border border-slate-200 rounded-md px-3 text-sm font-medium outline-none h-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">{isRTL ? 'الكل' : 'All Status'}</option>
            <option value="VERIFIED">{isRTL ? 'محقق' : 'Verified'}</option>
            <option value="PENDING">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">{isRTL ? 'المحترف' : 'Provider'}</th>
                <th className="px-6 py-4">{isRTL ? 'المهنة' : 'Trade'}</th>
                <th className="px-6 py-4">{isRTL ? 'الولاية' : 'Wilaya'}</th>
                <th className="px-6 py-4">{isRTL ? 'الخبرة' : 'Experience'}</th>
                <th className="px-6 py-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="px-6 py-4"><Skeleton className="h-10 w-full" /></td></tr>)
              ) : (
                filteredProviders.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr 
                      className={`group hover:bg-primary/5 transition-colors cursor-pointer ${expandedId === p.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${p.id}`} />
                            <AvatarFallback>{p.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-slate-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.trade}</td>
                      <td className="px-6 py-4 text-slate-500">{p.wilaya}</td>
                      <td className="px-6 py-4 text-slate-500">{p.experience} {isRTL ? 'سنة' : 'yrs'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={p.status === 'VERIFIED' ? 'default' : 'secondary'} className={p.status === 'VERIFIED' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none' : 'bg-amber-100 text-amber-700 border-none'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {expandedId === p.id ? <ChevronUp className="h-5 w-5 text-primary inline" /> : <ChevronDown className="h-5 w-5 text-slate-400 inline group-hover:text-primary transition-colors" />}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === p.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-50/50"
                        >
                          <td colSpan={6} className="px-10 py-6 border-b border-primary/10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">{isRTL ? 'معلومات الاتصال' : 'Contact Details'}</h4>
                                <p className="text-sm font-bold text-slate-700">{isRTL ? 'رقم الهاتف:' : 'Phone:'} <span className="text-primary">{p.phone}</span></p>
                                <p className="text-sm font-bold text-slate-700">{isRTL ? 'الموقع:' : 'Wilaya:'} {p.wilaya}</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">{isRTL ? 'الإحصائيات' : 'Performance'}</h4>
                                <p className="text-sm font-bold text-slate-700">{isRTL ? 'المشاريع المنفذة:' : 'Completed Projects:'} {p.projects}</p>
                                <div className="flex gap-1 mt-1">
                                  {Array(5).fill(0).map((_, i) => <Badge key={i} className="bg-amber-400 h-2 w-2 p-0 min-w-0" />)}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 justify-end">
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1 bg-primary">{isRTL ? 'عرض الملف الشخصي' : 'View Profile'}</Button>
                                  {p.status !== 'VERIFIED' && <Button size="sm" variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5">{isRTL ? 'تحقق الآن' : 'Verify Now'}</Button>}
                                </div>
                                <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold">{isRTL ? 'حظر الحساب' : 'Suspend Account'}</Button>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Projects Page ---

const Projects = () => {
  const { isRTL } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.get('/admin/projects');
        setProjects(data);
      } catch (err) {
        setProjects([
          { id: '1', title: 'Modern Kitchen Renovation', client: 'Ahmed Karim', provider: 'Mustapha Zahi', status: 'IN_PROGRESS', budget: '850,000 DZD', date: '2024-03-01' },
          { id: '2', title: 'Villa Interior Design', client: 'Sarah Brahimi', provider: 'Leila Chen', status: 'PENDING', budget: '1,200,000 DZD', date: '2024-03-10' },
          { id: '3', title: 'Electrical Overhaul', client: 'Karim Mansour', provider: 'Zinedine B.', status: 'COMPLETED', budget: '45,000 DZD', date: '2024-02-15' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => statusFilter === 'ALL' || p.status === statusFilter);

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b">
        <div>
          <CardTitle className="text-xl font-bold">{isRTL ? 'قائمة المشاريع' : 'Project Directory'}</CardTitle>
          <CardDescription>{isRTL ? 'تتبع التقدم وإدارة عقود المشاريع' : 'Track progress and manage project contracts'}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="bg-slate-50 border border-slate-200 rounded-md px-3 text-sm font-medium outline-none h-10 min-w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{isRTL ? 'كل الحالات' : 'All Status'}</option>
            <option value="PENDING">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="IN_PROGRESS">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
            <option value="COMPLETED">{isRTL ? 'مكتمل' : 'Completed'}</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">{isRTL ? 'المشروع' : 'Project'}</th>
                <th className="px-6 py-4">{isRTL ? 'العميل' : 'Client'}</th>
                <th className="px-6 py-4">{isRTL ? 'المحترف' : 'Provider'}</th>
                <th className="px-6 py-4">{isRTL ? 'الميزانية' : 'Budget'}</th>
                <th className="px-6 py-4">{isRTL ? 'التاريخ' : 'Created'}</th>
                <th className="px-6 py-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="px-6 py-4"><Skeleton className="h-10 w-full" /></td></tr>)
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.title}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{p.client}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{p.provider}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{p.budget}</td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{p.date}</td>
                    <td className="px-6 py-4">
                      <Badge variant="ghost" className={`
                        ${p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : ''}
                        ${p.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' : ''}
                        ${p.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : ''}
                      `}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Users Page ---

const UserManagement = () => {
  const { isRTL } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100">
      <Users size={64} className="mb-4 opacity-10" />
      <h3 className="text-xl font-bold">{isRTL ? 'إدارة المستخدمين' : 'User Management'}</h3>
      <p className="max-w-md text-center mt-2 font-medium">{isRTL ? 'هذه الميزة قيد التطوير حالياً وستتوفر قريباً في التحديث القادم.' : 'Account management portal is currently under development. Coming soon.'}</p>
    </div>
  );
};

// --- Main Layout ---

const AdminSidebar = ({ admin }: any) => {
  const { t, isRTL } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/admin', icon: LayoutDashboard, label: isRTL ? 'نظرة عامة' : 'Overview', end: true },
    { to: '/admin/providers', icon: Users, label: isRTL ? 'المحترفون' : 'Providers' },
    { to: '/admin/projects', icon: Briefcase, label: isRTL ? 'المشاريع' : 'Projects' },
    { to: '/admin/users', icon: UserCheck, label: isRTL ? 'المستخدمون' : 'Users' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 h-screen sticky top-0 hidden lg:flex flex-col group">
      {/* Header */}
      <div className="p-8 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${admin.name}&background=1A7A5E&color=fff`} />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 truncate uppercase tracking-wider">{admin.name}</p>
            <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/20 bg-primary/5 py-0">Admin Area</Badge>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = link.end 
            ? location.pathname === link.to 
            : location.pathname.startsWith(link.to);
          
          return (
            <Link 
              key={link.to} 
              to={link.to}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <link.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-50">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl h-12 font-bold px-4"
          onClick={handleLogout}
        >
          <LogOut size={20} className={isRTL ? 'ml-3' : 'mr-3'} />
          {isRTL ? 'تسجيل الخروج' : 'Logout'}
        </Button>
      </div>
    </aside>
  );
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { t, isRTL } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Protected route check
  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
    </div>
  );

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-slate-50 min-h-screen flex">
      <AdminSidebar admin={user} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl">
              <Plus className="text-primary rotate-45" />
            </div>
            <span className="font-extrabold text-slate-900">DARIE ADMIN</span>
          </div>
          <button 
            className="p-2 bg-slate-100 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <XCircle /> : <MoreVertical />}
          </button>
        </header>

        {/* Global Top Bar */}
        <div className="bg-white border-b border-slate-100 px-8 h-20 hidden lg:flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
            {location.pathname.split('/').pop()?.toUpperCase() || 'OVERVIEW'}
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full translate-x-1/4 -translate-y-1/4" />
              <Bell size={20} className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
            </div>
            <div className="h-10 w-px bg-slate-100 mx-2" />
            <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">System Healthy</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                <Route index element={<Overview />} />
                <Route path="providers" element={<Providers />} />
                <Route path="projects" element={<Projects />} />
                <Route path="users" element={<UserManagement />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

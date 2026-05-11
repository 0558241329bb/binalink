import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { api } from './lib/api';
import socket from './lib/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Search, 
  Briefcase, 
  User as UserIcon, 
  Star, 
  MapPin, 
  CheckCircle, 
  Plus,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Loader2,
  Hammer,
  Paintbrush,
  Compass,
  HardHat,
  MessageSquare
} from 'lucide-react';

// --- Components ---

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, isRTL, language, setLanguage } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 space-x-reverse">
          <img src="/logo.png" alt="BinaLink" className="h-9 w-auto" />
          <span className="text-lg font-bold tracking-tight text-[#1A7A5E]">BinaLink</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8 space-x-reverse">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors relative py-5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform">{t('home')}</Link>
          <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors relative py-5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform">{t('explore')}</Link>
          <Link to="/contractors" className="text-sm font-medium hover:text-primary transition-colors relative py-5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform">
            {isRTL ? 'المقاولون' : 'Contractors'}
          </Link>
          {user && <Link to="/tracker" className="text-sm font-medium hover:text-primary transition-colors relative py-5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform">{t('tracker')}</Link>}
          
          {/* Language Switcher */}
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            {(['en', 'fr', 'ar'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  language === lang ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center space-x-4 space-x-reverse">
              {user.role === 'PROVIDER' && (
                <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Profile Score</span>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${user.completionScore}%` }}
                    />
                  </div>
                </div>
              )}
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2 ml-2" /> {t('logout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('login')}</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">{t('register')}</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-b bg-background p-4 space-y-4"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium">Home</Link>
            <Link to="/explore" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium">Explore</Link>
            <Link to="/contractors" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium">
              {isRTL ? 'المقاولون' : 'Contractors'}
            </Link>
            {user ? (
              <>
                <Link to="/projects" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium">My Projects</Link>
                <Button variant="outline" className="w-full" onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-50 border-t-2 border-primary py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <img src="/logo.png" alt="BinaLink" className="h-8 w-auto" />
              <span className="text-xl font-bold text-primary">BinaLink</span>
            </div>
            <p className="text-[#C8963E] text-sm italic">نربطك بمن يبني معك</p>
          </div>
          <p className="text-sm text-muted-foreground">
            منصة BinaLink — الرابط الجزائري بين أصحاب المشاريع والمقاولين
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('explore')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore">Find Craftsmen</Link></li>
            <li><Link to="/register">Join as Provider</Link></li>
            <li><Link to="/admin">Admin Dashboard</Link></li>
            <li><Link to="/how-it-works">How it Works</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <p className="text-sm text-muted-foreground">Algiers, Algeria</p>
          <p className="text-sm text-muted-foreground">contact@binalink.dz</p>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        © 2026 BinaLink. All rights reserved.
      </div>
    </footer>
  );
};

// --- Views ---

const Home = () => {
  const { t, isRTL } = useTranslation();
  const [featuredProviders, setFeaturedProviders] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api.get('/providers?featured=true&limit=3')
      .then(res => setFeaturedProviders(res.data || res))
      .catch(() => toast.error('Failed to load featured providers'))
      .finally(() => setLoadingFeatured(false));
  }, []);

  const categories = [
    { 
      id: 'contractors', 
      name: t('cat_contractors'), 
      desc: t('cat_contractors_desc'), 
      icon: HardHat, 
      color: 'bg-orange-100 text-orange-600' 
    },
    { 
      id: 'architects', 
      name: t('cat_architects'), 
      desc: t('cat_architects_desc'), 
      icon: Compass, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      id: 'interior', 
      name: t('cat_interior_design'), 
      desc: t('cat_interior_design_desc'), 
      icon: Paintbrush, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      id: 'craftsmen', 
      name: t('cat_craftsmen'), 
      desc: t('cat_craftsmen_desc'), 
      icon: Hammer, 
      color: 'bg-green-100 text-green-600' 
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[900px] py-20 flex items-center justify-center overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1541888086225-ee531e21b2bb?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1A7A5E]/30 to-slate-900/90" />
        <div className="container relative z-10 px-4 text-center space-y-6">
          <motion.img 
            src="/logo.png"
            alt="BinaLink"
            className="w-[120px] md:w-[150px] mx-auto"
            style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.3))' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter"
          >
            {t('hero_title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl font-medium italic text-[#C8963E]"
          >
            نربطك بمن يبني معك
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto"
          >
            {t('hero_subtitle')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/request-project">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Button size="lg" className="h-14 px-8 text-lg bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">{t('start_project')}</Button>
              </motion.div>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/10 backdrop-blur border-white/20 hover:bg-white/20">{t('find_professional')}</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('looking_for')}</h2>
          <p className="text-muted-foreground">{t('browse_network')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Link key={cat.id} to={`/explore?category=${cat.id.toUpperCase()}`}>
              <motion.div
                whileHover={{ y: -5 }}
                className="group cursor-pointer h-full"
              >
                <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                  <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                    <div className={`p-5 rounded-3xl ${cat.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                      <cat.icon className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-slate-800">{cat.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Providers */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('top_rated')}</h2>
            <p className="text-muted-foreground">{t('verified_experts')}</p>
          </div>
          <Link to="/explore">
            <Button variant="ghost" className="group">
              {t('view_all')} <ChevronRight className={`ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loadingFeatured ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-none shadow-sm">
                <div className="h-56 bg-slate-200" />
                <CardHeader className="space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-slate-200 rounded" />
                </CardContent>
              </Card>
            ))
          ) : featuredProviders.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">
              {isRTL ? 'لا يوجد محترفون مميزون حالياً' : 'No featured providers at the moment'}
            </div>
          ) : featuredProviders.map((p) => (
            <Card key={p.id} className="overflow-hidden group border-none shadow-md hover:shadow-2xl transition-all duration-500">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={`https://picsum.photos/seed/provider${p.id}/800/600`} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-none shadow-sm">
                    {t('verified')}
                  </Badge>
                </div>
              </div>
              <CardHeader className="relative pb-2">
                <Avatar className="absolute -top-10 left-6 h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${p.id}`} />
                  <AvatarFallback>{p.name[0]}</AvatarFallback>
                </Avatar>
                <div className="pt-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-800">{p.name}</CardTitle>
                    <div className="flex items-center bg-accent-light px-2 py-1 rounded-lg text-accent">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-bold">4.9</span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin size={14} className="mr-1" /> {p.providerProfile?.trade} • {p.wilaya}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600">Verified Pro</Badge>
                  <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600">{p.providerProfile?.yearsExperience}Y Exp</Badge>
                </div>
                <Link to={`/provider/${p.id}`}>
                  <Button className="w-full bg-primary hover:bg-primary/90 shadow-md group">
                    {t('view_profile')}
                    <ArrowRight className={`ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [searchName, setSearchName] = useState(searchParams.get('search') || '');
  const { t, isRTL } = useTranslation();

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchProviders = async () => {
        setLoading(true);
        try {
          const query = new URLSearchParams();
          if (category !== 'All') query.append('category', category.toUpperCase());
          if (location !== 'All') query.append('location', location);
          if (searchName) query.append('search', searchName);
          
          // Update URL
          setSearchParams(query, { replace: true });

          const res = await api.get(`/providers?${query.toString()}`);
          setProviders(res.data || res);
        } catch (err) {
          toast.error('Failed to load providers');
        } finally {
          setLoading(false);
        }
      };
      fetchProviders();
    }, 400);

    return () => clearTimeout(handler);
  }, [category, location, searchName, setSearchParams]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 space-y-6">
          <Card className="p-6 border-none shadow-lg bg-white sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-xl">{t('filter')}</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">{isRTL ? 'البحث بالاسم' : 'Search by Name'}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200"
                    placeholder={isRTL ? 'اسم المحترف...' : 'Provider name...'}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">{t('trade')}</Label>
                <select 
                  className="w-full p-3 border rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="ARCHITECT">Architect</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="PAINTER">Painter</option>
                  <option value="CRAFTSMEN">Craftsmen</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">{isRTL ? 'الولاية' : 'Wilaya'}</Label>
                <select 
                  className="w-full p-3 border rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 transition-all"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Alger">Alger</option>
                  <option value="Oran">Oran</option>
                  <option value="Constantine">Constantine</option>
                  <option value="Blida">Blida</option>
                </select>
              </div>
            </div>
          </Card>
        </aside>

        {/* Results */}
        <main className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800">
              {loading ? t('search') : `${providers.length} ${isRTL ? 'محترف تم العثور عليهم' : 'Professionals Found'}`}
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-slate-500 font-medium">{t('search')}</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Search className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold text-xl">{isRTL ? 'لم يتم العثور على نتائج' : 'No results found'}</p>
              </div>
            ) : providers.map(p => (
              <Card key={p.id} className="flex flex-col md:flex-row overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-white">
                <div className="w-full md:w-56 h-56 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  <UserIcon className="h-16 w-16 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                  {p.providerProfile?.verificationStatus === 'VERIFIED' && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-500 text-white border-none shadow-sm">
                        <CheckCircle className="h-3 w-3 mr-1" /> {t('verified')}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors">{p.name}</h3>
                      <div className="flex items-center bg-accent-light px-2 py-1 rounded-lg text-accent">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 font-bold">4.8</span>
                      </div>
                    </div>
                    <p className="text-slate-500 mb-4 flex items-center font-medium">
                      <MapPin className="h-4 w-4 mr-1 text-primary" /> {p.wilaya} • {p.providerProfile?.trade}
                    </p>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">
                      {isRTL 
                        ? `خدمات احترافية في مجال ${p.providerProfile?.trade} في ولاية ${p.wilaya}. خبرة واسعة وجودة مضمونة.`
                        : `Professional ${p.providerProfile?.trade} services in ${p.wilaya}. Extensive experience and guaranteed quality.`}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('experience')}</span>
                        <span className="text-sm font-bold text-slate-700">{p.providerProfile?.yearsExperience} {t('years_exp')}</span>
                      </div>
                    </div>
                    <Link to={`/provider/${p.id}`}>
                      <Button className="px-8 h-12 bg-primary hover:bg-primary/90 shadow-lg group">
                        {t('view_profile')}
                        <ArrowRight className={`ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const ProviderDetails = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiry, setInquiry] = useState({ title: '', budget: '', message: '' });
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    api.get(`/providers/${id}`)
      .then(res => setProvider(res.data || res))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendInquiry = async () => {
    if (!inquiry.title || !inquiry.budget) {
      toast.error('Please fill in the project title and budget');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/projects', {
        ...inquiry,
        providerId: id,
        clientId: user?.id
      });
      toast.success('Inquiry sent successfully!');
      setInquiry({ title: '', budget: '', message: '' });
    } catch (err) {
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto p-20 text-center flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-slate-500 font-medium">{t('search')}</p>
    </div>
  );
  
  if (!provider) return (
    <div className="container mx-auto p-20 text-center">
      <h2 className="text-2xl font-bold text-slate-800">{isRTL ? 'المحترف غير موجود' : 'Provider not found'}</h2>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${provider.id}`} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{provider.name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold text-slate-900">{provider.name}</h1>
                {provider.providerProfile?.verificationStatus === 'VERIFIED' && (
                  <Badge className="bg-green-500 text-white border-none px-3 py-1">
                    <CheckCircle className="h-3 w-3 mr-1" /> {t('verified')}
                  </Badge>
                )}
              </div>
              <p className="text-xl text-slate-500 font-medium flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary" />
                {provider.providerProfile?.trade} • <MapPin className="h-5 w-5 mx-2 text-primary" /> {provider.wilaya}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-accent-light px-3 py-1.5 rounded-xl text-accent">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-bold text-lg">4.9</span>
                  <span className="ml-2 text-accent/60 font-medium text-sm">({provider.reviewsCount || 24} {t('reviews')})</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('experience')}</span>
                  <span className="text-lg font-bold text-slate-700">{provider.providerProfile?.yearsExperience} {t('years_experience')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="w-2 h-8 bg-primary rounded-full mr-3" />
              {t('about')}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {isRTL 
                ? `محترف متخصص في ${provider.providerProfile?.trade} مع خبرة تزيد عن ${provider.providerProfile?.yearsExperience} سنوات في ولاية ${provider.wilaya}. نلتزم بتقديم أعلى معايير الجودة والاحترافية في كافة مشاريعنا.`
                : `Professional ${provider.providerProfile?.trade} with ${provider.providerProfile?.yearsExperience} years of experience in ${provider.wilaya}. Committed to delivering the highest standards of quality and professionalism in all projects.`}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">{isRTL ? 'المهارات الأساسية' : 'Core Skills'}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white border-slate-200">{provider.providerProfile?.trade}</Badge>
                  <Badge variant="outline" className="bg-white border-slate-200">{isRTL ? 'إدارة المشاريع' : 'Project Management'}</Badge>
                  <Badge variant="outline" className="bg-white border-slate-200">{isRTL ? 'الاستشارات التقنية' : 'Technical Consulting'}</Badge>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">{isRTL ? 'مناطق الخدمة' : 'Service Areas'}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white border-slate-200">{provider.wilaya}</Badge>
                  <Badge variant="outline" className="bg-white border-slate-200">{isRTL ? 'الولايات المجاورة' : 'Neighboring Wilayas'}</Badge>
                </div>
              </div>
            </div>

            {provider.providerProfile?.contractorTier === 'PREMIUM' && (
              <div className="mt-8 bg-amber-50 p-6 rounded-2xl border border-amber-200">
                <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center">
                  <Star className="h-6 w-6 mr-2 fill-current" />
                  {t('premium_contractors')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-amber-600/80 mb-1">{t('capital_amount')}</p>
                    <p className="font-bold text-amber-900">{provider.providerProfile?.capitalAmount} {t('million_da')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600/80 mb-1">{t('brand_reputation')}</p>
                    <p className="font-bold text-amber-900">
                      {provider.providerProfile?.brandReputation === 'NATIONAL' ? t('reputation_national') : 
                       provider.providerProfile?.brandReputation === 'REGIONAL' ? t('reputation_regional') : t('reputation_local')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600/80 mb-1">{t('price_range')}</p>
                    <p className="font-bold text-amber-900">{provider.providerProfile?.priceRangeMin} - {provider.providerProfile?.priceRangeMax}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-600/80 mb-1">{t('service_type')}</p>
                    <p className="font-bold text-amber-900">
                      {provider.providerProfile?.serviceType === 'FULL_BUILD' ? t('full_build') : t('semi_build')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {provider.providerProfile?.contractorTier === 'STANDARD' && (
              <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 fill-current" />
                  {t('standard_contractors')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600/80 mb-1">{t('price_per_unit')}</p>
                    <p className="font-bold text-blue-900">{provider.providerProfile?.pricePerUnit} DZD</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600/80 mb-1">{t('completion_time')}</p>
                    <p className="font-bold text-blue-900">{provider.providerProfile?.completionTimeWeeks} {t('weeks')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600/80 mb-1">{t('brand_reputation')}</p>
                    <p className="font-bold text-blue-900">
                      {provider.providerProfile?.reputationScore === 'HIGH' ? (isRTL ? 'عالية' : 'High') : 
                       provider.providerProfile?.reputationScore === 'MEDIUM' ? (isRTL ? 'متوسطة' : 'Medium') : t('reputation_local')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Section Mockup */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="w-2 h-8 bg-accent rounded-full mr-3" />
              {isRTL ? 'معرض الأعمال' : 'Portfolio'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden group cursor-pointer relative">
                  <img 
                    src={`https://picsum.photos/seed/port${i+provider.id}/600/600`} 
                    alt="Work" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="text-white h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
            <div className="bg-primary p-6 text-white">
              <CardTitle className="text-2xl font-bold">{t('hire')} {provider.name}</CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-1">{t('get_quote')}</CardDescription>
            </div>
            <CardContent className="p-6 space-y-6">
              {user ? (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700">{t('project_title')}</Label>
                    <Input 
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20" 
                      placeholder="e.g., Kitchen Renovation" 
                      value={inquiry.title}
                      onChange={(e) => setInquiry({ ...inquiry, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700">{t('budget')} (DZD)</Label>
                    <Input 
                      type="number" 
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-primary/20" 
                      placeholder="50000" 
                      value={inquiry.budget}
                      onChange={(e) => setInquiry({ ...inquiry, budget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700">{isRTL ? 'رسالة' : 'Message'}</Label>
                    <textarea 
                      className="w-full p-3 h-24 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
                      placeholder={isRTL ? 'صف مشروعك بإيجاز...' : 'Briefly describe your project...'}
                      value={inquiry.message}
                      onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleSendInquiry}
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-xl rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <MessageSquare className="mr-2 h-5 w-5" />}
                    {t('send_inquiry')}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <UserIcon className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed">{t('login_to_contact')}</p>
                  <Link to="/login" className="block">
                    <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg">
                      {t('login')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="p-6 border-none shadow-lg bg-slate-50 rounded-3xl">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              {isRTL ? 'لماذا تختار هذا المحترف؟' : 'Why choose this pro?'}
            </h4>
            <ul className="space-y-3">
              {[
                isRTL ? 'هوية موثقة ومعتمدة' : 'Verified Identity',
                isRTL ? 'سجل حافل بالنجاحات' : 'Proven Track Record',
                isRTL ? 'التزام بالمواعيد والجودة' : 'Quality Commitment'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

import Login from './screens/Login';
import Register from './screens/Register';
import ProjectTrackerView from './screens/ProjectTrackerView';
import VerifyOTP from './screens/VerifyOTP';
import AdminDashboard from './screens/AdminDashboard';
import ProjectRequestWizardView from './screens/ProjectRequestWizardView';
import ContractorsPage from './screens/ContractorsPage';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import SplashScreen from './components/SplashScreen';

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <TranslationProvider>
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>
        <Router>
          <AppContent />
        </Router>
      </TranslationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isRTL } = useTranslation();

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/provider/:id" element={<ProviderDetails />} />
          <Route path="/tracker" element={<ProjectTrackerView />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/request-project" element={<ProjectRequestWizardView />} />
          <Route path="/contractors" element={<ContractorsPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}

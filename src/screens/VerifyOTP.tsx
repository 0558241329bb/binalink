// src/screens/VerifyOTP.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, Timer } from 'lucide-react';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const phone = location.state?.phone || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!phone) navigate('/register');
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, phone, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/verify-otp', { phone, code });
      toast.success('Phone verified successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    try {
      await api.post('/auth/resend-otp', { phone });
      toast.success('New code sent!');
      setTimeLeft(60);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl bg-white text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">{t('verify_otp')}</CardTitle>
              <CardDescription>
                {t('otp_sent')} <span className="font-bold text-slate-900">{phone}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-center gap-2" dir="ltr">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:border-primary focus:ring-primary/20"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                />
              ))}
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full h-12 text-lg rounded-xl shadow-lg" 
                onClick={handleVerify} 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : t('verify')}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-slate-400" />
                <span className={timeLeft > 0 ? 'text-slate-500' : 'text-primary font-bold cursor-pointer'} onClick={handleResend}>
                  {timeLeft > 0 ? `${t('resend_otp')} in ${timeLeft}s` : t('resend_otp')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

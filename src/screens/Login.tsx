// src/screens/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { api } from '@/lib/api';
import socket from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Phone, Lock, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithPhoneNumber, RecaptchaVerifier, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log('recaptcha resolved');
        }
      });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setupRecaptcha();
      // Format phone number to international (Algeria +213)
      const formattedPhone = phone.startsWith('+') ? phone : `+213${phone.replace(/^0/, '')}`;
      
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationId(confirmationResult);
      toast.success(t('otp_sent') || 'Verification code sent!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send OTP');
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await verificationId.confirm(otpCode);
      const idToken = await result.user.getIdToken();
      
      const data = await api.post('/auth/firebase-sync', { idToken });
      login(data.accessToken, data.refreshToken, data.user);
      
      socket.emit('user_login', { userId: data.user.id });
      toast.success(t('login_success') || 'Welcome back!');
      navigate('/');
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`${t('login_failed') || 'Login failed'}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const data = await api.post('/auth/firebase-sync', { idToken });
      login(data.accessToken, data.refreshToken, data.user);
      
      socket.emit('user_login', { userId: data.user.id });
      toast.success(t('login_success') || 'Welcome back!');
      navigate('/');
    } catch (err: any) {
      console.error('Google Login Error:', err);
      toast.error(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testAPI = async () => {
    try {
      const data = await api.get('/health');
      toast.success(`Server Connected! Env: ${data.env}`);
    } catch (err: any) {
      console.error('API Test Error:', err);
      toast.error(`Server Connection Failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div id="recaptcha-container"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">{t('login')}</CardTitle>
            <CardDescription>
              {verificationId 
                ? (t('enter_otp') || 'Enter the code sent to your phone')
                : (t('enter_phone_login') || 'Enter your phone number to receive a login code')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!verificationId ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      className="pl-10 h-12 rounded-xl"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : (t('send_code') || 'Send Verification Code')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('verification_code') || 'Verification Code'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="otp"
                      type="text"
                      className="pl-10 h-12 rounded-xl"
                      placeholder="XXXXXX"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : (t('verify_login') || 'Verify & Login')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-xs text-slate-500" 
                  onClick={() => setVerificationId(null)}
                >
                  {t('change_phone') || 'Change phone number'}
                </Button>
              </form>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">{t('or_continue_with') || 'Or continue with'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50" 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Google
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                className="w-full text-xs text-slate-400" 
                onClick={testAPI}
              >
                {t('test_connection') || 'Test Server Connection'}
              </Button>
            </div>

            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500">{t('no_account') || "Don't have an account?"} </span>
              <Link to="/register" className="font-bold text-primary hover:underline">
                {t('register')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

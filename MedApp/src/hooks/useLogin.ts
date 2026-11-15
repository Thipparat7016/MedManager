import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useApp } from '@/context/AppContext';
import { authService } from '@/services/authService';
import { extractOAuthParams } from '@/utils/oauthUtils';

WebBrowser.maybeCompleteAuthSession();

export function useLogin() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const incomingLinkingUrl = Linking.useURL();
  const { login, loginWithGoogle, isAuthenticated, isLoading: isAppLoading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isProcessingOAuthRef = useRef(false);
  const processedTokensRef = useRef<Set<string>>(new Set());

  const completeOAuthFromUrl = useCallback(
    async (callbackUrl: string) => {
      if (!authService.isOAuthAvailable() || isProcessingOAuthRef.current) return;
      const params = extractOAuthParams(callbackUrl);
      const tokenKey =
        params.access_token || params.code || params.error_description || params.error;

      if (!tokenKey) {
        setIsGoogleLoading(false);
        return;
      }

      if (processedTokensRef.current.has(tokenKey)) {
        return;
      }
      processedTokensRef.current.add(tokenKey);

      isProcessingOAuthRef.current = true;
      setIsGoogleLoading(true);

      try {
        if (params.error || params.error_description) {
          const rawMsg = params.error_description || params.error;
          const cleanMsg = decodeURIComponent(rawMsg.replace(/\+/g, ' '));
          Alert.alert('เข้าสู่ระบบไม่สำเร็จ', cleanMsg);
          return;
        }

        const oauthUser = await authService.resolveOAuthUserFromParams(params);
        if (!oauthUser.email) {
          Alert.alert('เข้าสู่ระบบไม่สำเร็จ', 'ไม่พบข้อมูลอีเมลจากบัญชี Google');
          return;
        }

        const res = await loginWithGoogle(oauthUser.email, oauthUser.name, oauthUser.avatar);
        if (res.success) {
          router.replace('/(tabs)' as any);
        } else {
          Alert.alert('เข้าสู่ระบบไม่สำเร็จ', res.error || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
        }
      } catch (err: any) {
        console.warn('OAuth completion error:', err);
        Alert.alert(
          'เข้าสู่ระบบไม่สำเร็จ',
          err?.message || 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลบัญชี Google'
        );
      } finally {
        setIsGoogleLoading(false);
        isProcessingOAuthRef.current = false;
      }
    },
    [loginWithGoogle, router]
  );

  // Handle OAuth callback on Web ONLY when redirected back with OAuth params in URL
  useEffect(() => {
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      authService.isOAuthAvailable()
    ) {
      const currentHref = window.location.href;
      if (
        currentHref.includes('access_token=') ||
        currentHref.includes('code=') ||
        currentHref.includes('error=')
      ) {
        window.history.replaceState({}, document.title, window.location.pathname);
        completeOAuthFromUrl(currentHref);
      }
    }
  }, [completeOAuthFromUrl]);

  // Handle OAuth callback on Mobile via Linking URL
  useEffect(() => {
    if (
      Platform.OS !== 'web' &&
      incomingLinkingUrl &&
      (incomingLinkingUrl.includes('access_token=') ||
        incomingLinkingUrl.includes('code=') ||
        incomingLinkingUrl.includes('error='))
    ) {
      completeOAuthFromUrl(incomingLinkingUrl);
    }
  }, [incomingLinkingUrl, completeOAuthFromUrl]);

  // Handle OAuth callback on Mobile if Expo Router parsed deep link query params into route
  useEffect(() => {
    if (
      Platform.OS !== 'web' &&
      (searchParams.access_token ||
        searchParams.code ||
        searchParams.error ||
        searchParams.error_description)
    ) {
      const qs = new URLSearchParams();
      if (searchParams.access_token) qs.set('access_token', String(searchParams.access_token));
      if (searchParams.refresh_token) qs.set('refresh_token', String(searchParams.refresh_token));
      if (searchParams.code) qs.set('code', String(searchParams.code));
      if (searchParams.error) qs.set('error', String(searchParams.error));
      if (searchParams.error_description) {
        qs.set('error_description', String(searchParams.error_description));
      }
      completeOAuthFromUrl(`medapp://login?${qs.toString()}`);
    }
  }, [
    searchParams.access_token,
    searchParams.refresh_token,
    searchParams.code,
    searchParams.error,
    searchParams.error_description,
    completeOAuthFromUrl,
  ]);

  const shouldRedirectToTabs =
    !isAppLoading && isAuthenticated && !isProcessingOAuthRef.current;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setIsLoading(true);
    const result = await login(email.trim(), password.trim());
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)' as any);
    } else {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', result.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleGoogleLogin = async () => {
    if (!authService.isOAuthAvailable()) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อระบบฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    try {
      processedTokensRef.current.clear();
      setIsGoogleLoading(true);

      if (Platform.OS === 'web') {
        const redirectUrl =
          typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
        const { error } = await authService.signInWithGoogleWeb(redirectUrl);
        if (error) {
          setIsGoogleLoading(false);
          Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error.message);
        }
        return;
      }

      // Native Mobile:
      // ใน Expo Go บน Android เบราว์เซอร์ Chrome Custom Tabs จะบล็อก HTTP 302 Redirect ที่ชี้ไปยัง exp:// โดยตรง
      // จึงให้ Supabase Redirect ไปหน้าเว็บตัวกลาง /oauth-redirect.html บน Dev Server ก่อน แล้วส่ง Intent กลับเข้าแอป
      const appReturnUrl = Linking.createURL('login');
      const hostUri = Constants.expoConfig?.hostUri || '';
      const isExpoGo =
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient && Boolean(hostUri);
      const bridgeProtocol = hostUri.includes('.exp.direct') ? 'https' : 'http';
      const supabaseRedirectUrl = isExpoGo
        ? `${bridgeProtocol}://${hostUri}/oauth-redirect.html`
        : appReturnUrl;

      console.log('[Google OAuth] Supabase Redirect URL:', supabaseRedirectUrl);
      console.log('[Google OAuth] App Return URL:', appReturnUrl);

      let capturedCallbackUrl: string | null = null;
      const urlSubscription = Linking.addEventListener('url', event => {
        if (
          event?.url &&
          (event.url.includes('access_token=') ||
            event.url.includes('code=') ||
            event.url.includes('error='))
        ) {
          capturedCallbackUrl = event.url;
        }
      });

      const { url, error } = await authService.requestGoogleOAuthUrl(supabaseRedirectUrl);

      if (error || !url) {
        urlSubscription.remove();
        setIsGoogleLoading(false);
        Alert.alert(
          'เข้าสู่ระบบไม่สำเร็จ',
          error?.message || 'ไม่สามารถเปิดหน้าล็อกอิน Google ได้'
        );
        return;
      }

      const authResult = await WebBrowser.openAuthSessionAsync(url, appReturnUrl);

      // รอรับอีเวนต์ Linking สั้นๆ กรณี AppState กลับมาทำงานก่อน Linking บน Android
      if (authResult.type !== 'success' && !capturedCallbackUrl && !isProcessingOAuthRef.current) {
        for (let i = 0; i < 12; i++) {
          if (capturedCallbackUrl || isProcessingOAuthRef.current) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      urlSubscription.remove();

      const finalCallbackUrl =
        (authResult.type === 'success' && authResult.url ? authResult.url : null) ||
        capturedCallbackUrl;

      if (finalCallbackUrl) {
        await completeOAuthFromUrl(finalCallbackUrl);
        return;
      }

      if (!isProcessingOAuthRef.current) {
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      console.warn('Google login error:', err);
      Alert.alert(
        'เข้าสู่ระบบไม่สำเร็จ',
        err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google'
      );
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    isGoogleLoading,
    shouldRedirectToTabs,
    handleLogin,
    handleGoogleLogin,
    navigateToRegister: () => router.push('/(auth)/register'),
  };
}

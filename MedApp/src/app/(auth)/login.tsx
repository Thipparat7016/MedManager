import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';

WebBrowser.maybeCompleteAuthSession();

function extractOAuthParams(rawUrl: string): Record<string, string> {
  const result: Record<string, string> = {};
  const queryIndex = rawUrl.indexOf('?');
  const hashIndex = rawUrl.indexOf('#');

  if (queryIndex !== -1) {
    const queryPart =
      hashIndex > queryIndex
        ? rawUrl.slice(queryIndex + 1, hashIndex)
        : rawUrl.slice(queryIndex + 1);
    new URLSearchParams(queryPart).forEach((val, key) => {
      result[key] = val;
    });
  }

  if (hashIndex !== -1) {
    const hashPart = rawUrl.slice(hashIndex + 1);
    new URLSearchParams(hashPart).forEach((val, key) => {
      result[key] = val;
    });
  }

  return result;
}

export default function LoginScreen() {
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
      if (!supabase || isProcessingOAuthRef.current) return;
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

        let googleEmail = '';
        let googleName = '';

        if (params.access_token) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token || '',
          });
          if (sessionErr) throw sessionErr;
          googleEmail = sessionData?.user?.email || '';
          googleName =
            sessionData?.user?.user_metadata?.full_name ||
            sessionData?.user?.user_metadata?.name ||
            '';
        } else if (params.code) {
          const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(
            params.code
          );
          if (codeErr) throw codeErr;
          googleEmail = codeData?.user?.email || '';
          googleName =
            codeData?.user?.user_metadata?.full_name ||
            codeData?.user?.user_metadata?.name ||
            '';
        }

        if (!googleEmail) {
          const { data: freshSession } = await supabase.auth.getSession();
          googleEmail = freshSession?.session?.user?.email || '';
          googleName =
            freshSession?.session?.user?.user_metadata?.full_name ||
            freshSession?.session?.user?.user_metadata?.name ||
            '';
        }

        if (!googleEmail) {
          Alert.alert('เข้าสู่ระบบไม่สำเร็จ', 'ไม่พบข้อมูลอีเมลจากบัญชี Google');
          return;
        }

        const res = await loginWithGoogle(googleEmail, googleName);
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
    if (Platform.OS === 'web' && typeof window !== 'undefined' && supabase) {
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

  // If already logged in, redirect directly to tabs
  if (!isAppLoading && isAuthenticated) {
    return <Redirect href={'/(tabs)' as any} />;
  }

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
    if (!supabase) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อระบบฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    try {
      setIsGoogleLoading(true);

      if (Platform.OS === 'web') {
        const redirectUrl =
          typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });
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

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: supabaseRedirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error || !data?.url) {
        urlSubscription.remove();
        setIsGoogleLoading(false);
        Alert.alert(
          'เข้าสู่ระบบไม่สำเร็จ',
          error?.message || 'ไม่สามารถเปิดหน้าล็อกอิน Google ได้'
        );
        return;
      }

      const authResult = await WebBrowser.openAuthSessionAsync(data.url, appReturnUrl);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="pill" size={36} color="#8B95F6" />
            </View>
            <Text style={styles.brandTitle}>MedManager</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>อีเมล</Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>รหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>หรือ</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Login */}
            <TouchableOpacity
              style={[styles.googleButton, isGoogleLoading && styles.disabledButton]}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#EA4335" style={styles.googleIcon} />
              ) : (
                <AntDesign name="google" size={20} color="#EA4335" style={styles.googleIcon} />
              )}
              <Text style={styles.googleButtonText}>
                {isGoogleLoading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google'}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>ยังไม่มีบัญชี? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>สมัครสมาชิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#F5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FAFAFC',
  },
  primaryButton: {
    height: 52,
    backgroundColor: '#8B95F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#8B95F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#94A3B8',
  },
  googleButton: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
});

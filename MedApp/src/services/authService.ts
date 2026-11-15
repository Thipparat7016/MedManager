import { safeStorage } from './storage';
import { supabase } from './supabase';
import { userService } from './userService';
import { UserProfile } from '../utils/types';
import { toUserStorageKey } from '../utils/formatUtils';
import { resolveGoogleAvatar, resolveGoogleName } from '../utils/oauthUtils';

export const authService = {
  isOAuthAvailable(): boolean {
    return Boolean(supabase);
  },

  async resolveOAuthUserFromParams(params: Record<string, string>): Promise<{
    email: string;
    name: string;
    avatar: string;
  }> {
    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อระบบฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    let googleEmail = '';
    let googleName = '';
    let googleAvatar = '';

    if (params.access_token) {
      const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token || '',
      });
      if (sessionErr) throw sessionErr;
      googleEmail = sessionData?.user?.email || '';
      googleName = resolveGoogleName(sessionData?.user?.user_metadata);
      googleAvatar = resolveGoogleAvatar(sessionData?.user?.user_metadata);
    } else if (params.code) {
      const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(
        params.code
      );
      if (codeErr) throw codeErr;
      googleEmail = codeData?.user?.email || '';
      googleName = resolveGoogleName(codeData?.user?.user_metadata);
      googleAvatar = resolveGoogleAvatar(codeData?.user?.user_metadata);
    }

    if (!googleEmail) {
      const { data: freshSession } = await supabase.auth.getSession();
      googleEmail = freshSession?.session?.user?.email || '';
      googleName = resolveGoogleName(freshSession?.session?.user?.user_metadata);
      googleAvatar = resolveGoogleAvatar(freshSession?.session?.user?.user_metadata);
    }

    return {
      email: googleEmail,
      name: googleName,
      avatar: googleAvatar,
    };
  },

  async signInWithGoogleWeb(redirectTo?: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('ไม่สามารถเชื่อมต่อระบบฐานข้อมูลได้') };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    return { error };
  },

  async requestGoogleOAuthUrl(redirectTo: string): Promise<{ url?: string; error: any }> {
    if (!supabase) {
      return { error: new Error('ไม่สามารถเชื่อมต่อระบบฐานข้อมูลได้') };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    return { url: data?.url || undefined, error };
  },

  async loginUser(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      throw new Error('กรุณากรอกอีเมล');
    }
    if (!cleanPass) {
      throw new Error('กรุณากรอกรหัสผ่าน');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    // Check user in Supabase app_users table
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (error) {
      console.error('Supabase query error during login:', error);
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบบัญชี: ' + error.message);
    }

    // STRICT CHECK: User MUST exist in Supabase app_users!
    if (!data || data.length === 0) {
      throw new Error(
        'ไม่พบข้อมูลบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกก่อนเข้าสู่ระบบ'
      );
    }

    const u = data[0];

    // PASSWORD VERIFICATION:
    // 1. If password exists in database record
    if (u.password !== undefined && u.password !== null && String(u.password).trim() !== '') {
      if (u.password !== cleanPass) {
        throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
      }
      await safeStorage.setItem(`med_user_pwd_${cleanEmail}`, cleanPass);
    } else {
      // 2. Fallback check local credential cache
      const cachedPass = await safeStorage.getItem(`med_user_pwd_${cleanEmail}`);
      if (cachedPass) {
        if (cachedPass !== cleanPass) {
          throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
        }
        try {
          await supabase.from('app_users').update({ password: cleanPass }).eq('id', u.id);
        } catch {}
      } else {
        throw new Error(
          'บัญชีนี้สมัครด้วย Google และยังไม่ได้ตั้งรหัสผ่าน กรุณาเข้าสู่ระบบด้วย Google แล้วไปตั้งรหัสผ่านที่หน้าโปรไฟล์'
        );
      }
    }

    const userKey = toUserStorageKey(cleanEmail);
    const prefs = await userService.getUserPreferences(userKey);

    const profile: UserProfile = {
      id: u.id,
      name: u.name,
      email: u.email || cleanEmail,
      phone: u.phone || '',
      hasPassword: true,
      ...prefs,
    };
    await safeStorage.setItem('med_is_authenticated', 'true');
    await safeStorage.setItem('med_user_profile', JSON.stringify(profile));

    // Log activity: 'เข้าสู่ระบบ'
    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([
        {
          time: timeStr,
          user_name: profile.name,
          activity: 'เข้าสู่ระบบ',
          details: `ผู้ใช้งาน ${profile.name} (${profile.email}) เข้าสู่ระบบ MedApp`,
        },
      ]);
    } catch (logErr) {
      console.warn('Failed to log login activity:', logErr);
    }

    return profile;
  },

  async loginWithGoogleUser(
    email: string,
    fullName?: string,
    avatarUrl?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('ไม่พบข้อมูลอีเมลจาก Google');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    const resolvedName =
      (fullName && fullName.trim()) || cleanEmail.split('@')[0] || 'ผู้ใช้งาน';

    // Check if user already exists in Supabase app_users table (strictly by email, never by name)
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('email', cleanEmail);

    if (error) {
      console.error('Supabase query error during Google login:', error);
      throw new Error('เกิดข้อผิดพลาดในการตรวจสอบบัญชี: ' + error.message);
    }

    let u: any = (data || []).find(
      (row: any) => String(row.email || '').trim().toLowerCase() === cleanEmail
    );
    let isNewGoogleRegistration = false;

    // Auto-register user in app_users using Google profile data if this email is not yet registered
    if (!u) {
      isNewGoogleRegistration = true;

      const { data: existingUsers } = await supabase.from('app_users').select('code');

      let maxNum = 0;
      for (const row of existingUsers || []) {
        const match = String(row.code || '').match(/(\d+)/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      }
      const nextCode = `USR-${String(maxNum + 1).padStart(3, '0')}`;

      const insertPayload: any = {
        code: nextCode,
        name: resolvedName,
        email: cleanEmail,
        phone: '',
        status: 'Active',
      };

      const { data: insertedData, error: insertErr } = await supabase
        .from('app_users')
        .insert([insertPayload])
        .select();

      if (insertErr) {
        console.error('Supabase insert error during Google auto-register:', insertErr);
        throw new Error('ไม่สามารถสร้างบัญชีสมาชิกจาก Google ได้: ' + insertErr.message);
      }

      u = insertedData?.[0] || {
        id: `user-${Date.now()}`,
        name: resolvedName,
        email: cleanEmail,
        phone: '',
      };
    }

    const userKey = toUserStorageKey(cleanEmail);
    const prefs = await userService.getUserPreferences(userKey);
    const resolvedAvatar = prefs.avatarUrl || (avatarUrl && avatarUrl.trim()) || undefined;

    if (userKey && resolvedAvatar && !prefs.avatarUrl) {
      await safeStorage.setItem(
        `med_user_prefs_${userKey}`,
        JSON.stringify({
          ...prefs,
          avatarUrl: resolvedAvatar,
        })
      );
    }

    const cachedPass = await safeStorage.getItem(`med_user_pwd_${cleanEmail}`);
    const hasPassword = Boolean(
      (u.password !== undefined && u.password !== null && String(u.password).trim() !== '') ||
        cachedPass
    );

    const profile: UserProfile = {
      id: u.id,
      name: u.name || resolvedName,
      email: u.email || cleanEmail,
      phone: u.phone || '',
      hasPassword,
      ...prefs,
      avatarUrl: resolvedAvatar,
    };

    await safeStorage.setItem('med_is_authenticated', 'true');
    await safeStorage.setItem('med_user_profile', JSON.stringify(profile));

    // Log activity to activity_logs
    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([
        {
          time: timeStr,
          user_name: profile.name,
          activity: isNewGoogleRegistration ? 'สมัครสมาชิก (Google)' : 'เข้าสู่ระบบ (Google)',
          details: isNewGoogleRegistration
            ? `ผู้ใช้งาน ${profile.name} (${profile.email}) สมัครสมาชิกและเข้าสู่ระบบด้วย Google สำเร็จ`
            : `ผู้ใช้งาน ${profile.name} (${profile.email}) เข้าสู่ระบบด้วย Google บน MedApp`,
        },
      ]);
    } catch (logErr) {
      console.warn('Failed to log Google login activity:', logErr);
    }

    return profile;
  },

  async registerUser(params: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<UserProfile> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.name.trim();
    const cleanPhone = (params.phone || '').trim();
    const cleanPass = params.password.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    // 1. Check if email already registered in Supabase
    const { data: existingUser, error: checkErr } = await supabase
      .from('app_users')
      .select('id, email')
      .ilike('email', cleanEmail)
      .limit(1);

    if (checkErr) {
      console.warn('Check existing user error:', checkErr);
    }

    if (existingUser && existingUser.length > 0) {
      throw new Error('อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยอีเมลนี้');
    }

    // 2. Generate next sequential code (USR-xxx)
    const { data: existingUsers } = await supabase
      .from('app_users')
      .select('code')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextCode = 'USR-001';
    if (existingUsers && existingUsers.length > 0 && existingUsers[0].code) {
      const match = existingUsers[0].code.match(/(\d+)/);
      if (match) {
        nextCode = `USR-${String(parseInt(match[1], 10) + 1).padStart(3, '0')}`;
      }
    }

    // 3. Insert into Supabase app_users with password
    const insertPayload: any = {
      code: nextCode,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPass,
      status: 'Active',
    };

    let insertedUser: any = null;
    const { data: insertedData, error: insertErr } = await supabase
      .from('app_users')
      .insert([insertPayload])
      .select();

    if (insertErr) {
      console.warn(
        'Insert with password column failed, retrying without password column:',
        insertErr.message
      );
      delete insertPayload.password;
      const retryResult = await supabase.from('app_users').insert([insertPayload]).select();

      if (retryResult.error) {
        throw new Error('ไม่สามารถบันทึกข้อมูลสมาชิกได้: ' + retryResult.error.message);
      }
      insertedUser = retryResult.data?.[0];
    } else {
      insertedUser = insertedData?.[0];
    }

    // Cache password locally
    await safeStorage.setItem(`med_user_pwd_${cleanEmail}`, cleanPass);

    const profile: UserProfile = {
      id: insertedUser?.id || `user-${Date.now()}`,
      name: insertedUser?.name || cleanName,
      email: insertedUser?.email || cleanEmail,
      phone: insertedUser?.phone || cleanPhone,
      hasPassword: true,
      notify30MinBefore: true,
      notifyFoodWarning: true,
      notifyAppointments: true,
      notifyLowStock: false,
    };
    await safeStorage.setItem('med_is_authenticated', 'true');
    await safeStorage.setItem('med_user_profile', JSON.stringify(profile));

    // 4. Log activity: 'สมัครสมาชิก' ONLY when explicitly registering
    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([
        {
          time: timeStr,
          user_name: profile.name,
          activity: 'สมัครสมาชิก',
          details: `ผู้ใช้งาน ${profile.name} (${profile.email}) สมัครสมาชิกเข้าสู่ระบบสำเร็จ`,
        },
      ]);
    } catch (logErr) {
      console.warn('Failed to log registration activity:', logErr);
    }

    return profile;
  },

  async setAccountPassword(params: {
    verifyInput: string;
    newPassword: string;
  }): Promise<UserProfile> {
    const current = await userService.getUserProfile();
    if (!current || !current.email) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนตั้งรหัสผ่าน');
    }

    const cleanEmail = current.email.trim().toLowerCase();
    const cleanVerify = (params.verifyInput || '').trim();
    const cleanNewPass = (params.newPassword || '').trim();

    if (!cleanVerify) {
      throw new Error('กรุณากรอกข้อมูลเพื่อยืนยันตัวตน');
    }
    if (!cleanNewPass || cleanNewPass.length < 6) {
      throw new Error('กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }

    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (error || !data || data.length === 0) {
      throw new Error('ไม่พบข้อมูลบัญชีผู้ใช้นี้ในฐานข้อมูล');
    }

    const u = data[0];
    const dbPass =
      u.password !== undefined && u.password !== null ? String(u.password).trim() : '';
    const cachedPass = (await safeStorage.getItem(`med_user_pwd_${cleanEmail}`)) || '';
    const hasExistingPass = Boolean(dbPass || cachedPass);

    const normalizePhoneDigits = (p?: string) => (p || '').replace(/\D/g, '');
    const userPhoneDigits = normalizePhoneDigits(u.phone || current.phone);
    const verifyDigits = normalizePhoneDigits(cleanVerify);

    if (hasExistingPass) {
      const matchesOldPass =
        (dbPass && cleanVerify === dbPass) || (cachedPass && cleanVerify === cachedPass);
      const matchesEmail = cleanVerify.toLowerCase() === cleanEmail;
      if (!matchesOldPass && !matchesEmail) {
        throw new Error(
          'ข้อมูลยืนยันตัวตนไม่ถูกต้อง กรุณากรอกรหัสผ่านเดิมหรืออีเมลของบัญชีนี้ให้ถูกต้อง'
        );
      }
    } else {
      const matchesEmail = cleanVerify.toLowerCase() === cleanEmail;
      const matchesPhone = Boolean(
        userPhoneDigits && verifyDigits && userPhoneDigits === verifyDigits
      );
      if (!matchesEmail && !matchesPhone) {
        throw new Error(
          'การยืนยันตัวตนไม่สำเร็จ กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ของบัญชีนี้ให้ถูกต้อง'
        );
      }
    }

    // Save password to Supabase app_users table
    const { error: updateErr } = await supabase
      .from('app_users')
      .update({ password: cleanNewPass })
      .eq('id', u.id);

    if (updateErr) {
      throw new Error('ไม่สามารถบันทึกรหัสผ่านลงฐานข้อมูลได้: ' + updateErr.message);
    }

    await safeStorage.setItem(`med_user_pwd_${cleanEmail}`, cleanNewPass);

    const updatedProfile: UserProfile = {
      ...current,
      id: u.id,
      hasPassword: true,
    };
    await safeStorage.setItem('med_user_profile', JSON.stringify(updatedProfile));

    try {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      await supabase.from('activity_logs').insert([
        {
          time: timeStr,
          user_name: updatedProfile.name,
          activity: hasExistingPass ? 'เปลี่ยนรหัสผ่านบัญชี' : 'ตั้งรหัสผ่านบัญชี',
          details: `ผู้ใช้งาน ${updatedProfile.name} (${updatedProfile.email}) กำหนดรหัสผ่านสำหรับการเข้าสู่ระบบแบบธรรมดาสำเร็จ`,
        },
      ]);
    } catch {}

    return updatedProfile;
  },

  async logoutUser(): Promise<void> {
    try {
      await safeStorage.removeItem('med_user_profile');
      await safeStorage.removeItem('med_is_authenticated');
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {
      console.warn('Error clearing med_user_profile on logout:', e);
    }
  },
};

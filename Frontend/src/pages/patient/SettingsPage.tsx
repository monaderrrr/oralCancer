import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Save } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import API from '../../Api';
import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const { t } = useTranslation(); 
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<'account' | 'notifications' | 'privacy'>('account');

  const [isSaving, setIsSaving] = useState(false);

  // ================= DATA =================
  const [accountData, setAccountData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // ================= ERRORS (structured instead of list) =================
  const [errors, setErrors] = useState<any>({});

  // ================= PASSWORD RULE =================
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  // ================= VALIDATE =================
  const validate = () => {
    const newErrors: any = {};

    if (!accountData.fullName.trim()) {
      newErrors.fullName = t("settings.errors.nameRequired", "Full name is required");
    }

    if (!accountData.email.trim()) {
      newErrors.email = t("settings.errors.emailRequired", "Email is required");
    }

    if (!accountData.phone.trim()) {
      newErrors.phone = t("settings.errors.phoneRequired", "Phone is required");
    }

    const hasPassword =
      passwordData.oldPassword ||
      passwordData.newPassword ||
      passwordData.confirmNewPassword;

    if (hasPassword) {

      if (!passwordData.oldPassword) {
        newErrors.oldPassword = t("settings.errors.oldPassRequired", "Current password is required");
      }

      if (!passwordData.newPassword) {
        newErrors.newPassword = t("settings.errors.newPassRequired", "New password is required");
      } else if (!passwordRegex.test(passwordData.newPassword)) {
        newErrors.newPassword =
          t("settings.errors.passFormat", "Password must be 8+ chars, 1 uppercase, 1 number");
      }

      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        newErrors.confirmNewPassword = t("settings.errors.passMatch", "Passwords do not match");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SAVE =================
  const handleSave = async () => {

    if (!validate()) return;

    setIsSaving(true);

    try {

      const payload = Object.fromEntries(
        Object.entries({
          fullName: accountData.fullName,
          email: accountData.email,
          phone: accountData.phone,
          bio: accountData.bio
        }).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
      );

      await API.put('/user/updateProfile', payload);

      let passwordChanged = false;

      if (
        passwordData.oldPassword &&
        passwordData.newPassword &&
        passwordData.confirmNewPassword
      ) {
        await API.patch('/user/updatePassword', {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword
        });

        passwordChanged = true;
      }

      alert(t("settings.success", 'Settings updated successfully ✅'));

      if (passwordChanged) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

      setErrors({}); // clear errors on success

    } catch (err: any) {
      console.log('ERROR:', err.response?.data);
      alert(err.response?.data?.message || t("settings.updateFailed", 'Update failed'));
    }

    setIsSaving(false);
  };

  const tabs = [
    { id: 'account', label: t('settings.tabs.account', 'Account'), icon: User },
    { id: 'notifications', label: t('settings.tabs.notifications', 'Notifications'), icon: Bell },
    { id: 'privacy', label: t('settings.tabs.privacy', 'Privacy'), icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-left" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("settings.title", "Settings")}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* SIDEBAR */}
          <Card className="p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700'
                      : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </Card>

          {/* CONTENT */}
          <div className="lg:col-span-3">
            <Card className="p-6 space-y-4">

              {activeTab === 'account' && (
                <>
                  <div>
                    <Input
                      label={t("settings.fields.fullName", "Full Name")}
                      value={accountData.fullName}
                      onChange={(e) =>
                        setAccountData({ ...accountData, fullName: e.target.value })
                      }
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label={t("settings.fields.email", "Email")}
                      value={accountData.email}
                      onChange={(e) =>
                        setAccountData({ ...accountData, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label={t("settings.fields.phone", "Phone")}
                      value={accountData.phone}
                      onChange={(e) =>
                        setAccountData({ ...accountData, phone: e.target.value })
                      }
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <Input
                    label={t("settings.fields.bio", "Bio")}
                    value={accountData.bio}
                    onChange={(e) =>
                      setAccountData({ ...accountData, bio: e.target.value })
                    }
                  />

                  {/* PASSWORD */}
                  <div className="pt-6 border-t space-y-3">

                    <h3 className="font-semibold">{t("settings.fields.changePass", "Change Password")}</h3>

                    <div>
                      <PasswordInput
                        value={passwordData.oldPassword}
                        placeholder={t("settings.placeholders.currentPass", "Current password")}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, oldPassword: e.target.value })
                        }
                      />
                      {errors.oldPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.oldPassword}</p>
                      )}
                    </div>

                    <div>
                      <PasswordInput
                        value={passwordData.newPassword}
                        placeholder={t("settings.placeholders.newPass", "New password")}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                      />
                      {errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <PasswordInput
                        value={passwordData.confirmNewPassword}
                        placeholder={t("settings.placeholders.confirmPass", "Confirm password")}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                        }
                      />
                      {errors.confirmNewPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.confirmNewPassword}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      isLoading={isSaving}
                      leftIcon={<Save />}
                    >
                      {t("settings.save", "Save Changes")}
                    </Button>
                  </div>
                </>
              )}

              {activeTab !== 'account' && (
                <div className="text-slate-500">
                  {t("settings.uiOnly", "This section is UI only")}
                </div>
              )}

            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
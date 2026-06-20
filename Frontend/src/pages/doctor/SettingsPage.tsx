import React, { useEffect, useState } from "react";
import { User, Bell, Shield, Save, MapPin, Clock, DollarSign } from "lucide-react"; // أضفنا أيقونات جديدة
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PasswordInput } from "../../components/ui/PasswordInput";
import API from "../../Api";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy'>('account');
  const [isSaving, setIsSaving] = useState(false);

  // ================= DATA =================
  const [accountData, setAccountData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    specialization: "",
    medicalLicenseNumber: "",
    hospital: "",
    yearsOfExperience: "",
    address: "",
    workingDays: "",
    consultationFee: ""
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [errors, setErrors] = useState<any>({});
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/user/profile"); // تأكدي إن الراوت ده بيرجع الحقول الجديدة
        if (res.data?.user) { // الباك أند عندك بيرجع الـ object باسم user
          const data = res.data.user;
          setAccountData({
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            bio: data.bio || "",
            specialization: data.specialization || "",
            medicalLicenseNumber: data.medicalLicenseNumber || "",
            hospital: data.hospital || "",
            yearsOfExperience: data.yearsOfExperience || "",
            address: data.address || "",
            workingDays: data.workingDays || "",
            consultationFee: data.consultationFee || ""
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchProfile();
  }, []);

  // ================= VALIDATE FUNCTION =================
  const validate = () => {
    const newErrors: any = {};
    if (!accountData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!accountData.email.trim()) newErrors.email = "Email is required";
    if (!accountData.phone.trim()) newErrors.phone = "Phone is required";

    const hasPasswordInput = passwordData.oldPassword || passwordData.newPassword || passwordData.confirmNewPassword;
    if (hasPasswordInput) {
      if (!passwordData.oldPassword) newErrors.oldPassword = "Current password is required";
      if (!passwordData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (!passwordRegex.test(passwordData.newPassword)) {
        newErrors.newPassword = "Password must be 8+ chars, 1 uppercase, 1 number";
      }
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SAVE FUNCTION =================
  const handleSave = async () => {
  if (!validate()) return;
  setIsSaving(true);
  try {
    const payload = {
      fullName: accountData.fullName.trim(),
      email: accountData.email.trim(),
      phone: accountData.phone.trim(),
      bio: accountData.bio,
      specialization: accountData.specialization,
      hospital: accountData.hospital,
      address: accountData.address,
      workingDays: accountData.workingDays,
      yearsOfExperience: accountData.yearsOfExperience ? Number(accountData.yearsOfExperience) : 0,
      consultationFee: accountData.consultationFee ? Number(accountData.consultationFee) : 0,
    };
      await API.put("/user/updateProfile", payload);

      if (passwordData.oldPassword && passwordData.newPassword) {
        await API.patch("/user/updatePassword", {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword
        });
        alert("Settings & Password updated! Please login again.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      alert("Profile updated successfully ✅");
      setErrors({});
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="p-2 h-fit bg-white border-none shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id ? "bg-teal-600 text-white shadow-md font-medium" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </Card>

          <div className="lg:col-span-3">
            <Card className="p-6 bg-white border-none shadow-sm rounded-3xl">
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={accountData.fullName}
                      onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
                      error={errors.fullName}
                    />
                    <Input
                      label="Email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      error={errors.email}
                    />
                    <Input
                      label="Phone"
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                      error={errors.phone}
                    />
                    <Input
                      label="Consultation Fee ($)"
                      type="number"
                      value={accountData.consultationFee}
                      onChange={(e) => setAccountData({ ...accountData, consultationFee: e.target.value })}
                      leftIcon={<DollarSign size={16}/>}
                    />
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       Professional Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Specialization"
                        value={accountData.specialization}
                        onChange={(e) => setAccountData({ ...accountData, specialization: e.target.value })}
                      />
                      <Input
                        label="Hospital / Clinic Name"
                        value={accountData.hospital}
                        onChange={(e) => setAccountData({ ...accountData, hospital: e.target.value })}
                      />
                    </div>

                    {/* --- الحقول الجديدة في الـ UI --- */}
                    <Input
                      label="Full Clinic Address"
                      placeholder="e.g. 123 Street, Mansoura, Egypt"
                      value={accountData.address}
                      onChange={(e) => setAccountData({ ...accountData, address: e.target.value })}
                      leftIcon={<MapPin size={16}/>}
                    />

                    <Input
                      label="Working Hours / Days"
                      placeholder="e.g. Sat-Wed (10 AM - 6 PM)"
                      value={accountData.workingDays}
                      onChange={(e) => setAccountData({ ...accountData, workingDays: e.target.value })}
                      leftIcon={<Clock size={16}/>}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Years of Experience"
                          type="number"
                          value={accountData.yearsOfExperience}
                          onChange={(e) => setAccountData({ ...accountData, yearsOfExperience: e.target.value })}
                        />
                        <Input
                          label="Medical License (Read Only)"
                          value={accountData.medicalLicenseNumber}
                          disabled
                          className="bg-slate-50 opacity-70"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">Bio</label>
                        <textarea 
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none min-h-[100px]"
                            value={accountData.bio}
                            onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                            placeholder="Tell patients about your expertise..."
                        />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="font-bold text-slate-800 mb-4">Security</h3>
                    <div className="space-y-4">
                      <PasswordInput
                        placeholder="Current password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        error={errors.oldPassword}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PasswordInput
                          placeholder="New password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          error={errors.newPassword}
                        />
                        <PasswordInput
                          placeholder="Confirm new password"
                          value={passwordData.confirmNewPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                          error={errors.confirmNewPassword}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button 
                      onClick={handleSave} 
                      isLoading={isSaving} 
                      className="bg-teal-600 hover:bg-teal-700 px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-teal-100"
                    >
                      <Save className="w-5 h-5 mr-2" /> Save Everything
                    </Button>
                  </div>
                </div>
              )}

              {activeTab !== "account" && (
                <div className="text-slate-400 text-center py-20">
                   <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-slate-300" />
                   </div>
                   <p className="font-medium text-lg">Coming Soon</p>
                   <p className="text-sm">These settings will be available in the next update.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: "account", label: "Profile Settings", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield }
];
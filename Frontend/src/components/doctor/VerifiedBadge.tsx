import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  status?: 'verified' | 'approved' | 'pending' | string;
  role?: 'doctor' | 'patient' | string;
}

export function VerifiedBadge({
  size = 'md',
  className = '',
  status,
  role
}: VerifiedBadgeProps) {
  const { t } = useTranslation(); 

  /**
   * Backend-based verification logic
   */
  const isVerified =
    role === 'doctor' &&
    (status === 'verified' || status === 'approved');

  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <div
      className={`inline-flex items-center font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full shadow-sm ${sizeClasses[size]} ${className}`}
      title={t("verifiedBadge.title", "Verified Medical Professional")}
    >
      <CheckCircle className={`${iconSizes[size]} fill-teal-600 text-white`} />
      <span className="uppercase tracking-wider">
        {t("verifiedBadge.text", "Verified")}
      </span>
    </div>
  );
}
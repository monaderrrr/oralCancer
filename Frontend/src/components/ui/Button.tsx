import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type RiskLevel = 'low' | 'medium' | 'high';
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  riskLevel?: RiskLevel;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  riskLevel,
  disabled,
  children,
  ...props
}: ButtonProps) {
  let dynamicVariant = variant;
  if (riskLevel) {
    switch (riskLevel) {
      case 'high':
        dynamicVariant = 'outline';
        className += ' border-red-600 text-red-600 hover:bg-red-50';
        break;
      case 'medium':
        dynamicVariant = 'outline';
        className += ' border-orange-500 text-orange-600 hover:bg-orange-50';
        break;
      case 'low':
        dynamicVariant = 'outline';
        className += ' border-green-600 text-green-600 hover:bg-green-50';
        break;
    }
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[dynamicVariant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

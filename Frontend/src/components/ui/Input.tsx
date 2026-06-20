import React, { forwardRef } from 'react';
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  leftIcon, // اسحبي الـ leftIcon هنا
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input 
          ref={ref} 
          id={inputId} 
          className={`
            w-full px-4 py-2.5 rounded-lg border border-slate-200
            ${leftIcon ? 'pl-10' : ''} 
            ${error ? 'border-red-300' : ''} 
            ${className}
          `} 
          {...props} 
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
import React, { forwardRef } from 'react';
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return <div className="w-full">
        {label && <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>}
        <textarea ref={ref} id={textareaId} className={`
            w-full px-4 py-2.5 rounded-lg
            border border-slate-200
            text-slate-900 placeholder-slate-400
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            resize-y min-h-[100px]
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${className}
          `} {...props} />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>;
});
Textarea.displayName = 'Textarea';
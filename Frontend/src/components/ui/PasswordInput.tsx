import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "./Input";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  disabled = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative mt-1">
      <Input
        type={show ? "text" : "password"}
        required={required}
        disabled={disabled}
        leftIcon={<Lock className="h-5 w-5" />}
        className="pr-10"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        disabled={disabled}
        className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
      >
        {show ? (
          <EyeOff className="h-5 w-5 text-slate-400" />
        ) : (
          <Eye className="h-5 w-5 text-slate-400" />
        )}
      </button>
    </div>
  );
}
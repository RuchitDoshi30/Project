/**
 * Input Component with Validation
 * Reusable form input with built-in validation support
 */

import { useState, InputHTMLAttributes } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  validate?: (value: string) => string | null;
  onValidation?: (isValid: boolean) => void;
}

export const Input = ({ 
  label, 
  error, 
  success, 
  helperText, 
  validate,
  onValidation,
  className = '',
  onBlur,
  onChange,
  ...props 
}: InputProps) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (validate) {
      const validationError = validate(e.target.value);
      setLocalError(validationError);
      if (onValidation) {
        onValidation(!validationError);
      }
    }
    if (onBlur) onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (touched && validate) {
      const validationError = validate(e.target.value);
      setLocalError(validationError);
      if (onValidation) {
        onValidation(!validationError);
      }
    }
    if (onChange) onChange(e);
  };

  const displayError = error || localError;
  const showSuccess = success && !displayError && touched;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
            displayError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : showSuccess
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } ${className}`}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {(displayError || showSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {displayError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      {displayError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {displayError}
        </p>
      )}
      {helperText && !displayError && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  rows?: number;
  validate?: (value: string) => string | null;
  onValidation?: (isValid: boolean) => void;
}

export const TextArea = ({ 
  label, 
  error, 
  success, 
  helperText,
  rows = 4,
  validate,
  onValidation,
  className = '',
  onBlur,
  onChange,
  ...props 
}: TextAreaProps) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true);
    if (validate) {
      const validationError = validate(e.target.value);
      setLocalError(validationError);
      if (onValidation) {
        onValidation(!validationError);
      }
    }
    if (onBlur) onBlur(e as React.FocusEvent<HTMLTextAreaElement, Element>);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (touched && validate) {
      const validationError = validate(e.target.value);
      setLocalError(validationError);
      if (onValidation) {
        onValidation(!validationError);
      }
    }
    if (onChange) onChange(e as React.ChangeEvent<HTMLTextAreaElement>);
  };

  const displayError = error || localError;
  const showSuccess = success && !displayError && touched;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={rows}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors ${
            displayError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : showSuccess
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } ${className}`}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      </div>
      {displayError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {displayError}
        </p>
      )}
      {helperText && !displayError && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// Validation helpers
/* eslint-disable react-refresh/only-export-components */
export const validators = {
  required: (value: string) => (!value.trim() ? 'This field is required' : null),
  minLength: (min: number) => (value: string) => 
    value.length < min ? `Minimum ${min} characters required` : null,
  maxLength: (max: number) => (value: string) =>
    value.length > max ? `Maximum ${max} characters allowed` : null,
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Invalid email address' : null;
  },
  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL format';
    }
  },
  number: (value: string) => (isNaN(Number(value)) ? 'Must be a number' : null),
  positive: (value: string) => (Number(value) <= 0 ? 'Must be positive' : null),
  slug: (value: string) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return !slugRegex.test(value) ? 'Must be lowercase with hyphens only' : null;
  },
  combine: (...validators: Array<(value: string) => string | null>) => (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  },
};

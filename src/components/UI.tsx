import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { Toast } from '../contexts/AppContext';

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  className?: string;
  children: React.ReactNode;
  key?: any;
}

export function Card({ id, className = '', children, ...props }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-xs p-6 hover:shadow-md transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button';
}

export function Button({
  id,
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';
  
  const variants = {
    primary: 'bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm focus:ring-brand-navy',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:ring-neutral-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus:ring-rose-500',
    success: 'bg-brand-orange hover:bg-brand-orange/90 text-white shadow-sm focus:ring-brand-orange',
    ghost: 'bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 focus:ring-neutral-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  return (
    <button
      id={id}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// Input Field
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  className?: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Input({ id, label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full text-sm py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors focus:outline-none ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
}

// Select Field
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id?: string;
  className?: string;
  label?: string;
  error?: string;
  children: React.ReactNode;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

export function Select({ id, label, error, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full text-sm py-2.5 px-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:outline-none transition-colors cursor-pointer ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
}

// Modal Component
export interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerButtons?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ id, isOpen, onClose, title, children, footerButtons, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          id={id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`w-full ${sizeClasses[size]} bg-white dark:bg-neutral-900 rounded-xl shadow-xl overflow-hidden flex flex-col border border-neutral-100 dark:border-neutral-800 z-10`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">{title}</h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-1.5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto max-h-[70vh] text-sm text-neutral-600 dark:text-neutral-300">
            {children}
          </div>

          {/* Footer */}
          {footerButtons && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              {footerButtons}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Badge
export interface BadgeProps {
  id?: string;
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export function Badge({ id, variant = 'neutral', children }: BadgeProps) {
  const styles = {
    neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700',
    success: 'bg-orange-50 text-brand-orange dark:bg-brand-orange/10 dark:text-brand-orange border border-brand-orange/20',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/40',
    error: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/40',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200/40 dark:border-sky-900/40'
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

// Skeleton Loader
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md ${className}`} />
  );
}

export function SkeletonLoader({ type = 'table' }: { type?: 'table' | 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col gap-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/2" />
      </div>
      <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="bg-neutral-50 dark:bg-neutral-950 p-4 border-b border-neutral-100 dark:border-neutral-800">
          <Skeleton className="h-5 w-full" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Toast Notification Container & Items
export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle className="w-5 h-5 text-brand-orange" />,
            error: <XCircle className="w-5 h-5 text-rose-500" />,
            info: <Info className="w-5 h-5 text-sky-500" />,
            warning: <AlertCircle className="w-5 h-5 text-amber-500" />
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-lg rounded-xl p-4 flex gap-3 pointer-events-auto items-start"
            >
              <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
              <div className="flex-grow flex flex-col gap-0.5 text-sm">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {toast.title}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs leading-normal">
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => onClose(toast.id)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-500 p-0.5 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}


import React from 'react';
import Loader from './Loader';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  children,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full flex items-center justify-center px-6 py-3 border border-transparent 
        text-base font-medium rounded-md text-white 
        bg-cyan-600 hover:bg-cyan-700 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 
        transition-all duration-300 ease-in-out
        disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400
        transform hover:scale-105 active:scale-100
      `}
    >
      {isLoading ? <Loader /> : children}
    </button>
  );
};

export default Button;

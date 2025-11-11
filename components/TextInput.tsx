import React from 'react';

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled?: boolean;
  isTextArea?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  isTextArea = false,
}) => {
  const commonClasses = `w-full bg-slate-900/50 border-2 border-slate-700 rounded-lg px-4 py-3 
    text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
    focus:outline-none transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div>
      <label htmlFor={id} className="block text-base font-medium text-slate-300 mb-2">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={`${commonClasses} resize-none`}
        />
      ) : (
        <input
          type="text"
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={commonClasses}
        />
      )}
    </div>
  );
};

export default TextInput;
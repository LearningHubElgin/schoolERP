import React from 'react';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    className = '',
    small = false
}) => {
    const inputClasses = `
    w-full ${small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

    return (
        <div className={small ? 'mb-2' : 'mb-4'}>
            {label && (
                <label className={`block ${small ? 'text-xs' : 'text-sm'} font-medium text-gray-700 ${small ? 'mb-1' : 'mb-2'}`}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    rows={4}
                    className={inputClasses}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={inputClasses}
                />
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default Input;

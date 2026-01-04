import React from "react";

type Variant = "primary" | "success" | "warning" | "neutral";

type Props = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  children: React.ReactNode;
  type?: "button" | "submit";
  className?: string;
};

const baseStyles =
  "w-full h-11 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variantStyles: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  warning: "bg-amber-600 text-white hover:bg-amber-700",
  neutral: "bg-gray-200 text-gray-900 hover:bg-gray-300",
};

const Button: React.FC<Props> = ({ onClick, variant = "primary", children, type = "button", className }) => {
  const classes = `${baseStyles} ${variantStyles[variant]}${className ? ` ${className}` : ""}`;
  return (
    <button onClick={onClick} type={type} className={classes}>
      {children}
    </button>
  );
};

export default Button;

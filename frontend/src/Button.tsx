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
  "w-full h-24 rounded-2xl text-lg font-semibold transition-all duration-300 ease-in-out " +
  "flex items-center justify-center gap-4 px-8 shadow-lg hover:shadow-xl active:shadow-md " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0 " +
  "relative overflow-hidden";

const variantStyles: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white hover:from-[#5558E3] hover:via-[#7C3AED] hover:to-[#9333EA]",
  success: "bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white hover:from-[#0D9F73] hover:via-[#047857] hover:to-[#065F46]",
  warning: "bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-white hover:from-[#D97706] hover:via-[#B45309] hover:to-[#92400E]",
  neutral: "bg-gradient-to-r from-[#F3F4F6] via-[#E5E7EB] to-[#D1D5DB] text-gray-800 hover:from-[#E5E7EB] hover:via-[#D1D5DB] hover:to-[#C7C7C7]",
};

const Button: React.FC<Props> = ({ onClick, variant = "primary", children, type = "button", className }: Props): React.ReactElement => {
  const isFlexCol = className?.includes('flex-col');
  const classes = `${baseStyles} ${variantStyles[variant]} ${isFlexCol ? 'flex-col' : ''}${className ? ` ${className}` : ""}`;
  return (
    <button 
      onClick={onClick} 
      type={type} 
      className={classes}
    >
      {children}
    </button>
  );
};

export default Button;

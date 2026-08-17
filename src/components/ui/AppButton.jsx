import { ArrowRight } from "lucide-react";

const VARIANTS = {
  primary: "bg-[#F97316] hover:bg-[#EA580C] text-white",
  outline: "bg-transparent border-2 border-[#5B21B6] text-[#5B21B6] hover:bg-[#5B21B6] hover:text-white",
};

export default function AppButton({
  children,
  variant = "primary",
  icon = null,
  iconPosition = "right",
  className = "",
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-bold text-base
        px-8 py-3.5
        transition-colors duration-150
        ${VARIANTS[variant] || VARIANTS.primary}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </button>
  );
}
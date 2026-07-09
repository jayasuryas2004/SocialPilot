export default function Button({ 
  children, 
  variant = "primary", 
  icon: Icon, 
  onClick 
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95";
  
  const variants = {
    primary: "bg-[#ff6b00] text-white hover:bg-[#e66000] shadow-lg shadow-orange-500/30",
    outline: "bg-transparent text-[#4a00ff] border-2 border-[#4a00ff] hover:bg-purple-50"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} onClick={onClick}>
      {Icon && variant === "outline" && <Icon className="w-5 h-5" />}
      {children}
      {Icon && variant === "primary" && <Icon className="w-5 h-5" />}
    </button>
  );
}
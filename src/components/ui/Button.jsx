function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  disabled = false
}) {
  const base =
    "px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lavender";

  const variants = {
    primary:
      "bg-lavender text-white hover:opacity-90 active:scale-95",
    secondary:
      "bg-mint text-gray-800 hover:opacity-90 active:scale-95",
    ghost:
      "bg-transparent text-lavender hover:bg-lilac"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;

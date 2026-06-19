type BrandLogoProps = {
  className?: string;
  showText?: boolean;
};

export function BrandLogo({ className = "", showText = true }: BrandLogoProps) {
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src="/logo.svg"
        alt="DigiExpress"
        style={{ height: 40, width: "auto", objectFit: "contain" }}
      />

      {showText && (
        <span style={{ fontSize: 18, fontWeight: 700 }}>
          DigiExpress CRM
        </span>
      )}
    </div>
  );
}
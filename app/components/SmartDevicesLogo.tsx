type SmartDevicesLogoProps = {
  className?: string;
};

export function SmartDevicesLogo({ className = "" }: SmartDevicesLogoProps) {
  return (
    <span className={`brand-lockup ${className}`.trim()} aria-hidden="true">
      <svg className="brand-symbol" viewBox="0 0 40 40" role="presentation" focusable="false">
        <rect x="1" y="1" width="38" height="38" rx="12" fill="currentColor" />
        <path
          d="M28 11.5c-1.9-2.2-4.6-3.3-7.9-3.3-5.5 0-8.9 2.8-8.9 6.8 0 4 3 6 8.8 6h.5c4 0 8.3 1.3 8.3 5.3 0 3.8-3.6 5.7-8.8 5.7-3.5 0-6.5-1.2-8.6-3.6"
          fill="none"
          stroke="var(--logo-ink, #06191e)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="brand-wordmark">SmartDevices<span className="brand-domain">.com</span></span>
    </span>
  );
}

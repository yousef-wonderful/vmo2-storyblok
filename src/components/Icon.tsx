// O2's own icon set (public/brand/icons), tinted with currentColor via a CSS mask.
export function Icon({ name, size = 20, label }: { name: string; size?: number; label?: string }) {
  const mask = `url("/brand/icons/${name}.svg")`;
  return <span className="icon" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    style={{ width: size, height: size, WebkitMaskImage: mask, maskImage: mask }} />;
}

import { appConfig } from '@/config/app';

export function BrandMark() {
  return (
    <div className="brand">
      <span className="brand__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand__name">{appConfig.name}</span>
    </div>
  );
}

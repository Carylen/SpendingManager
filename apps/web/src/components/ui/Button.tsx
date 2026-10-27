import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'neutral';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export function Button({
  variant = 'neutral',
  block,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    variant !== 'neutral' && `button--${variant}`,
    block && 'button--block',
    className,
  ];
  return <button type={type} className={classes.filter(Boolean).join(' ')} {...props} />;
}

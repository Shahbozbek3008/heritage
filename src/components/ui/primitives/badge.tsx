import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.12em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gold/25 bg-gold/10 text-gold-200',
        secondary: 'border-border/12 bg-white/[0.065] text-muted-foreground',
        outline: 'border-border/20 text-muted-foreground',
        solid: 'border-transparent bg-foreground text-background',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): React.ReactElement {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

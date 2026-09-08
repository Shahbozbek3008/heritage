import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-medium tracking-wide transition-all duration-300 ease-heritage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /* The one loud element on a page: warm metal on near-black. */
        default:
          'bg-gradient-to-b from-gold-200 to-gold-500 text-primary-foreground shadow-[0_8px_24px_-10px_hsl(var(--gold)/0.7)] hover:brightness-110 hover:shadow-[0_12px_32px_-10px_hsl(var(--gold)/0.85)] active:brightness-95',
        secondary:
          'border border-border/15 bg-white/[0.065] text-foreground backdrop-blur-sm hover:border-border/25 hover:bg-white/[0.11]',
        ghost: 'text-muted-foreground hover:bg-white/[0.08] hover:text-foreground',
        outline:
          'border border-gold/35 bg-transparent text-gold-200 hover:border-gold/60 hover:bg-gold/10',
        link: 'h-auto rounded-none border-b border-border/25 px-0 pb-1 text-foreground hover:border-gold hover:text-gold-200',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-[0.8125rem]',
        lg: 'h-[3.25rem] px-8 text-[0.9375rem]',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  readonly asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

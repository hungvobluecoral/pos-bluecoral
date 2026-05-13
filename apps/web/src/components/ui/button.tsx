import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
        secondary:
          'border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-5 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function buttonClassName(options?: ButtonVariantProps) {
  return cn(buttonVariants(options));
}

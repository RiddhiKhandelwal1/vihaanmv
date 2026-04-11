'use client';

interface GradientTextProps {
    children: React.ReactNode;
    from?: string;
    to?: string;
    className?: string;
}

export function GradientText({
    children,
    from = '#E8A598',
    to = '#C9B8D8',
    className = '',
}: GradientTextProps) {
    return (
        <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${className}`}
            style={{
                backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
            }}
        >
            {children}
        </span>
    );
}

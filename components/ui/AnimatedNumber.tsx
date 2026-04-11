'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    className?: string;
    suffix?: string;
    prefix?: string;
}

export function AnimatedNumber({
    value,
    duration = 0.8,
    className = '',
    suffix = '',
    prefix = '',
}: AnimatedNumberProps) {
    const spring = useSpring(0, {
        duration: duration * 1000,
        bounce: 0.1,
    });
    const display = useTransform(spring, (latest) => Math.round(latest));
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    useEffect(() => {
        return display.on('change', (latest) => {
            setDisplayValue(latest);
        });
    }, [display]);

    return (
        <motion.span className={`font-mono tabular-nums ${className}`}>
            {prefix}
            {displayValue}
            {suffix}
        </motion.span>
    );
}

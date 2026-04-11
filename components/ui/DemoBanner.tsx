'use client';
import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export function DemoBanner() {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;

    return (
        <div className="bg-gradient-to-r from-flow-primary to-flow-accent text-white text-xs px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                    <strong>Demo Mode:</strong> Try asking Luna &quot;Why am I
                    tired today?&quot; or &quot;What should I eat this
                    week?&quot;
                </span>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="opacity-70 hover:opacity-100 flex-shrink-0 ml-2"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

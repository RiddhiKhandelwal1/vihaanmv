export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-flow-bg">
            {children}
        </div>
    );
}

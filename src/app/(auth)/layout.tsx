export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-bg-base)]">
      {/* Decorative background elements for a premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)] opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-secondary)] opacity-20 blur-[100px] pointer-events-none" />
      
      <main className="w-full max-w-md px-4 flex justify-center relative z-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

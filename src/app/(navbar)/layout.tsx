import Navbar from "@/components/navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="auth-layout">
        <Navbar />
            {children}
      </div>
    );
  }
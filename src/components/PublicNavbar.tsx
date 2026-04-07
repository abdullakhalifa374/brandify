import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const PublicNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();

const navLinks = [
    { label: "Free Templates", path: "/free-templates" },
    { label: "Marketplace", path: "/marketplace" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="text-xl font-bold text-foreground tracking-tight">
          Brandify
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={location.pathname === link.path ? "secondary" : "ghost"}
                size="sm"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          {user ? (
            <Link to="/app">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-1 ml-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default PublicNavbar;

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (roles.includes('admin')) return '/admin/dashboard';
    if (roles.includes('shelter')) return '/shelter/dashboard';
    if (roles.includes('adopter')) return '/adopter/browse';
    return '/auth';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PawMatch
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                onClick={() => navigate(getDashboardPath())}
                variant="ghost"
              >
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/adopter/browse">
                <Button variant="ghost">Browse Pets</Button>
              </Link>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

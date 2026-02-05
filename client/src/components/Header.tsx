import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, Music, User, X, LayoutDashboard, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { useChatContext } from "../contexts/ChatContext";

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { unreadTotal } = useChatContext();
  const [location] = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Music className="w-6 h-6 text-purple-600" />
          <span className="text-xl font-bold text-slate-900">VERSONORA</span>
        </Link>

        <div className="flex items-center gap-4">
          {showNav && (
            <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
              <a href="/#como-funciona" className="hover:text-purple-600 transition-colors">
                Como Funciona
              </a>
              <a href="/#tipos" className="hover:text-purple-600 transition-colors">
                Tipos
              </a>
              <a href="/#formulario" className="hover:text-purple-600 transition-colors">
                Contato
              </a>
            </nav>
          )}

          <div className="hidden md:flex items-center gap-4 border-l border-slate-200 pl-4">
            {isAuthenticated() ? (
              <>
                <Link href="/chat" className="relative p-2 text-slate-600 hover:text-purple-600 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  {unreadTotal > 0 && (
                    <span className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-1 rounded-full min-w-[1.2rem] text-center border-2 border-white">
                      {unreadTotal}
                    </span>
                  )}
                </Link>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5 text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin() && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated() && (
              <>
                <Link href="/chat" className="relative p-2 text-slate-600 hover:text-purple-600 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  {unreadTotal > 0 && (
                    <span className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-1 rounded-full min-w-[1.2rem] text-center border-2 border-white">
                      {unreadTotal}
                    </span>
                  )}
                </Link>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5 text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin() && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">Painel Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 pb-4">
          <nav className="container mx-auto px-4 flex flex-col gap-4 text-sm font-medium">
            {showNav && (
              <>
                <a
                  href="/#como-funciona"
                  className="hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Como Funciona
                </a>
                <a
                  href="/#tipos"
                  className="hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tipos
                </a>
                <a
                  href="/#formulario"
                  className="hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contato
                </a>
              </>
            )}
            {!isAuthenticated() && (
              <Link
                href="/login"
                className="hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
            {location !== "/" && (
              <Link
                href="/"
                className="hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Voltar para Home
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

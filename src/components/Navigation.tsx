import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BarChart3, TrendingUp, Brain, Briefcase, Menu, X, Layers, Search, MessageSquare } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

export function Navigation() {
  const location = useLocation();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: BarChart3 },
    { path: '/market-data', label: t('nav.marketData'), icon: TrendingUp },
    { path: '/collections', label: 'Collections', icon: Layers },
    { path: '/nft-analysis', label: 'NFT Analysis', icon: Search },
    { path: '/analysis', label: t('nav.aiAnalysis'), icon: Brain },
    { path: '/portfolio', label: t('nav.portfolio'), icon: Briefcase },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
  ];

  const closeSheet = () => setIsOpen(false);

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-lg md:text-xl font-bold hidden sm:block">Market AI Analyzer</h1>
            <h1 className="text-lg font-bold sm:hidden">MAA</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to={path} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                </Button>
              ))}
            </div>
            <LanguageSelector />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <h2 className="text-lg font-bold">Market AI</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closeSheet}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-col space-y-2">
                  {navItems.map(({ path, label, icon: Icon }) => (
                    <Button
                      key={path}
                      variant={location.pathname === path ? "default" : "ghost"}
                      size="lg"
                      asChild
                      className="justify-start"
                      onClick={closeSheet}
                    >
                      <Link to={path} className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Button
              key={path}
              variant={location.pathname === path ? "default" : "ghost"}
              size="sm"
              asChild
              className="flex flex-col h-auto py-2 px-1"
            >
              <Link to={path} className="flex flex-col items-center space-y-1">
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}

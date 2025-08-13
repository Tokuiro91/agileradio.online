import { Button } from "@/components/ui/button";

interface HeaderProps {
  isPlaying?: boolean;
}

const Header = ({ isPlaying = false }: HeaderProps) => {
  const navItems = [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-radio-border bg-radio-bg/95 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with Online Indicator */}
          <div className="flex items-center space-x-3">
            <div
              onClick={() =>
                window.open("https://www.instagram.com/agile_batumi/", "_blank")
              }
              style={{ cursor: "pointer" }}
              className="text-2xl font-bold text-radio-text tracking-wider"
            >
              <img src="/logo.jpg" width={50} height={50} alt="" />
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isPlaying
                    ? "bg-radio-accent animate-pulse"
                    : "bg-radio-border"
                }`}
              />
              <span className="text-xs text-radio-text-muted font-medium">
                {isPlaying ? "LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="text-radio-text-muted hover:text-radio-accent hover:bg-transparent transition-colors duration-300"
                asChild
              >
                <a href={item.href}>{item.name}</a>
              </Button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden text-radio-text-muted hover:text-radio-accent"
            size="sm"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

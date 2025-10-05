import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Search, MessageCircle, Shield } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import heroImage from '@/assets/hero-pets.jpg';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-secondary/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Find Your
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Perfect Companion
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with loving pets waiting for their forever homes. Browse verified shelters and start your adoption journey today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/adopter/browse">
                <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Pets
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: 'Browse Pets',
                description: 'Search through thousands of adorable pets from verified shelters',
              },
              {
                icon: Heart,
                title: 'Apply to Adopt',
                description: 'Submit your application directly to the shelter',
              },
              {
                icon: MessageCircle,
                title: 'Connect',
                description: 'Chat with shelters about your potential new family member',
              },
              {
                icon: Shield,
                title: 'Adopt Safely',
                description: 'All shelters are verified for your peace of mind',
              },
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            <CardContent className="py-16 text-center space-y-6 relative z-10">
              <h2 className="text-4xl font-bold">Are You a Shelter?</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join our platform to connect with loving adopters and find homes for your animals faster.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Register Your Shelter
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 PawMatch. Bringing pets and families together.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

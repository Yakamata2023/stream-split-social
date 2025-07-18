import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VideoGrid from '@/components/VideoGrid';
import { 
  Play, 
  Users, 
  Zap, 
  Crown, 
  BarChart3, 
  Share2, 
  Smartphone,
  LogOut,
  Settings,
  Heart,
  TrendingUp,
  Monitor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const isPremium = profile?.role === 'premium' || profile?.subscription_status === 'active';
  const isTrialActive = profile?.subscription_status === 'trial' && new Date(profile?.trial_ends_at) > new Date();

  // Landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Monitor className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Split-Stream
              </span>
            </div>
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              🚀 Now with Paystack Premium Integration
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Multi-Screen
              </span>
              <br />
              <span className="text-foreground">YouTube Streaming</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch multiple YouTube videos simultaneously in customizable layouts. 
              Perfect for tutorials, music playlists, and entertainment.
            </p>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="text-lg px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Start Streaming Free
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="text-lg px-8">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for the ultimate streaming experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-border/50 bg-gradient-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Screen Layout</CardTitle>
                <CardDescription>
                  Watch up to 4 videos simultaneously in responsive grid layouts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 bg-gradient-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-stream-accent/10 p-3 rounded-lg w-fit">
                  <BarChart3 className="h-6 w-6 text-stream-accent" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Track your viewing habits with detailed analytics and insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 bg-gradient-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-primary-glow/10 p-3 rounded-lg w-fit">
                  <Share2 className="h-6 w-6 text-primary-glow" />
                </div>
                <CardTitle>Social Sharing</CardTitle>
                <CardDescription>
                  Share your streaming sessions and discover content with friends
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 bg-gradient-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-stream-success/10 p-3 rounded-lg w-fit">
                  <Smartphone className="h-6 w-6 text-stream-success" />
                </div>
                <CardTitle>PWA Ready</CardTitle>
                <CardDescription>
                  Install as a native app on mobile and desktop devices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 bg-gradient-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-stream-warning/10 p-3 rounded-lg w-fit">
                  <Heart className="h-6 w-6 text-stream-warning" />
                </div>
                <CardTitle>Favorites & Playlists</CardTitle>
                <CardDescription>
                  Save your favorite videos and organize them into playlists
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-border/50 bg-gradient-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Premium Features</CardTitle>
                <CardDescription>
                  Unlock unlimited screens, advanced analytics, and more
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you need more power
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-2xl">Free Trial</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold">₦0</div>
                <div className="text-sm text-muted-foreground">7 days free</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Up to 2 simultaneous streams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Basic analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Social sharing</span>
                  </div>
                </div>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/50 bg-gradient-card shadow-premium relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="h-6 w-6 text-primary" />
                  Premium
                </CardTitle>
                <CardDescription>For power users and professionals</CardDescription>
                <div className="text-3xl font-bold">₦2,500</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Up to 8 simultaneous streams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Advanced analytics & insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Unlimited favorites & playlists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Export viewing data</span>
                  </div>
                </div>
                <Link to="/auth">
                  <Button variant="premium" className="w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; 2024 Split-Stream. Built with React, TypeScript, and Supabase.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Monitor className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Split-Stream
              </span>
            </div>
            
            {profile && (
              <div className="flex items-center gap-2">
                <Badge variant={isPremium ? "default" : isTrialActive ? "secondary" : "outline"}>
                  {isPremium ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </>
                  ) : isTrialActive ? (
                    'Free Trial'
                  ) : (
                    'Free'
                  )}
                </Badge>
                
                {isTrialActive && !isPremium && (
                  <span className="text-sm text-muted-foreground">
                    Trial expires: {new Date(profile.trial_ends_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:block">
              Welcome back, {profile?.full_name || user?.email}
            </span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Upgrade CTA for trial/free users */}
        {!isPremium && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-hero/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Unlock Premium Features
                </h3>
                <p className="text-muted-foreground">
                  Get unlimited screens, advanced analytics, and more with Premium
                </p>
              </div>
              <Link to="/subscription">
                <Button variant="premium">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Video Grid */}
        <VideoGrid maxScreens={isPremium ? 8 : isTrialActive ? 4 : 2} />
      </main>
    </div>
  );
};

export default Index;

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, PawPrint, FileText, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ShelterDashboard = () => {
  const [shelter, setShelter] = useState<any>(null);
  const [stats, setStats] = useState({ totalPets: 0, activePets: 0, adoptedPets: 0, pendingApps: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadShelterData();
    }
  }, [user]);

  const loadShelterData = async () => {
    try {
      // Get shelter info
      const { data: shelterData, error: shelterError } = await supabase
        .from('shelters')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (shelterError) {
        if (shelterError.code === 'PGRST116') {
          navigate('/shelter/setup');
          return;
        }
        throw shelterError;
      }

      setShelter(shelterData);

      // Get pets stats
      const { data: pets } = await supabase
        .from('pets')
        .select('status')
        .eq('shelter_id', shelterData.id);

      const totalPets = pets?.length || 0;
      const activePets = pets?.filter(p => p.status === 'available').length || 0;
      const adoptedPets = pets?.filter(p => p.status === 'adopted').length || 0;

      // Get pending applications
      const { data: applications } = await supabase
        .from('applications')
        .select('id')
        .eq('shelter_id', shelterData.id)
        .eq('status', 'pending');

      setStats({
        totalPets,
        activePets,
        adoptedPets,
        pendingApps: applications?.length || 0,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load shelter data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!shelter?.verified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Awaiting Verification
              </CardTitle>
              <CardDescription>
                Your shelter profile is pending admin approval. You'll be able to list pets once verified.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{shelter.name}</h1>
          <p className="text-lg text-muted-foreground">Manage your shelter and pet listings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.activePets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Adopted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.adoptedPets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.pendingApps}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pets">
              <PawPrint className="h-4 w-4 mr-2" />
              Pets
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pets" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Pet Listings</CardTitle>
                  <CardDescription>Manage pets available for adoption</CardDescription>
                </div>
                <Link to="/shelter/pets/new">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Pet
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Pet management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adoption Applications</CardTitle>
                <CardDescription>Review and manage adoption requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Application management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShelterDashboard;

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PetCardProps {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    age_years?: number;
    age_months?: number;
    gender: string;
    size: string;
    photo_url?: string;
    status: string;
    shelter?: {
      name: string;
      city: string;
      state: string;
    };
  };
}

export const PetCard = ({ pet }: PetCardProps) => {
  const getAge = () => {
    const years = pet.age_years || 0;
    const months = pet.age_months || 0;
    
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years}y ${months}m`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-3 right-3 bg-white/90 text-foreground">
          {pet.status}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{pet.name}</h3>
            <p className="text-sm text-muted-foreground">
              {pet.breed} • {getAge()}
            </p>
          </div>
          <Badge variant="secondary">{pet.species}</Badge>
        </div>
        {pet.shelter && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{pet.shelter.city}, {pet.shelter.state}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/adopter/pet/${pet.id}`} className="w-full">
          <Button className="w-full">Learn More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

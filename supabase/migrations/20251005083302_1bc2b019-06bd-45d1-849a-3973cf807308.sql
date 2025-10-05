-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'shelter', 'adopter');

-- Create enum for pet status
CREATE TYPE public.pet_status AS ENUM ('available', 'pending', 'adopted');

-- Create enum for pet species
CREATE TYPE public.pet_species AS ENUM ('dog', 'cat', 'rabbit', 'bird', 'other');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create shelters table
CREATE TABLE public.shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on shelters
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id UUID REFERENCES public.shelters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species public.pet_species NOT NULL,
  breed TEXT NOT NULL,
  age_years INTEGER,
  age_months INTEGER,
  gender TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT,
  description TEXT NOT NULL,
  medical_info TEXT,
  behavior_notes TEXT,
  photo_url TEXT,
  status public.pet_status DEFAULT 'available' NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  adopter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shelter_id UUID REFERENCES public.shelters(id) ON DELETE CASCADE NOT NULL,
  status public.application_status DEFAULT 'pending' NOT NULL,
  message TEXT NOT NULL,
  home_type TEXT,
  has_other_pets BOOLEAN,
  has_children BOOLEAN,
  experience TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_shelters_updated_at
  BEFORE UPDATE ON public.shelters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for shelters
CREATE POLICY "Anyone can view verified shelters"
  ON public.shelters FOR SELECT
  TO authenticated
  USING (verified = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Shelter users can create their shelter"
  ON public.shelters FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'shelter') AND user_id = auth.uid());

CREATE POLICY "Shelter users can update their shelter"
  ON public.shelters FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can verify shelters"
  ON public.shelters FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pets
CREATE POLICY "Anyone can view approved available pets"
  ON public.pets FOR SELECT
  TO authenticated
  USING (
    approved = true OR 
    EXISTS (SELECT 1 FROM public.shelters WHERE id = pets.shelter_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Shelter users can create pets"
  ON public.pets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shelters WHERE id = shelter_id AND user_id = auth.uid())
  );

CREATE POLICY "Shelter users can update their pets"
  ON public.pets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.shelters WHERE id = shelter_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Shelter users can delete their pets"
  ON public.pets FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.shelters WHERE id = shelter_id AND user_id = auth.uid())
  );

-- RLS Policies for applications
CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    adopter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.shelters WHERE id = applications.shelter_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Adopters can create applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'adopter') AND adopter_id = auth.uid()
  );

CREATE POLICY "Shelters can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.shelters WHERE id = applications.shelter_id AND user_id = auth.uid())
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their applications"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE id = messages.application_id 
      AND (adopter_id = auth.uid() OR shelter_id IN (
        SELECT id FROM public.shelters WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can send messages in their applications"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE id = application_id 
      AND (adopter_id = auth.uid() OR shelter_id IN (
        SELECT id FROM public.shelters WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());
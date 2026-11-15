CREATE TABLE public.installation_claims (
  id integer PRIMARY KEY DEFAULT 1,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT installation_claims_singleton CHECK (id = 1)
);
GRANT ALL ON public.installation_claims TO service_role;
ALTER TABLE public.installation_claims ENABLE ROW LEVEL SECURITY;
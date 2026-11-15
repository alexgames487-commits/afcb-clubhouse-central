-- Account identity and status
ALTER TABLE public.profiles
  ADD COLUMN afcb_id text,
  ADD COLUMN account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN contact_info text;

UPDATE public.profiles p
SET afcb_id = lower(u.email)
FROM auth.users u
WHERE u.id = p.id AND p.afcb_id IS NULL;

CREATE UNIQUE INDEX profiles_afcb_id_unique ON public.profiles (afcb_id) WHERE afcb_id IS NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_afcb_id_format
  CHECK (afcb_id IS NULL OR afcb_id ~ '^[a-z0-9][a-z0-9._-]{2,31}@afcb\.com$');
ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_status_valid
  CHECK (account_status IN ('active', 'suspended'));

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url, platform_id, contact_info) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.is_account_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND account_status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r text := coalesce(new.raw_user_meta_data->>'account_type','player');
BEGIN
  INSERT INTO public.profiles (id, display_name, afcb_id, contact_info)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    lower(new.email),
    new.raw_user_meta_data->>'contact_info'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, CASE WHEN r = 'club_manager' THEN 'club_manager'::app_role ELSE 'player'::app_role END);
  RETURN new;
END
$$;

-- Club affiliation and public profile
ALTER TABLE public.clubs
  ADD COLUMN slug text,
  ADD COLUMN abbreviation text,
  ADD COLUMN description text,
  ADD COLUMN responsible_name text,
  ADD COLUMN contact_info text,
  ADD COLUMN platform text NOT NULL DEFAULT 'Old Gen',
  ADD COLUMN status text NOT NULL DEFAULT 'pending',
  ADD COLUMN submitted_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN reviewed_by uuid,
  ADD COLUMN review_notes text;

ALTER TABLE public.clubs ADD CONSTRAINT clubs_status_valid
  CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
ALTER TABLE public.clubs ADD CONSTRAINT clubs_platform_old_gen
  CHECK (platform = 'Old Gen');
ALTER TABLE public.clubs ADD CONSTRAINT clubs_slug_format
  CHECK (slug IS NULL OR slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
CREATE UNIQUE INDEX clubs_slug_unique ON public.clubs (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX clubs_single_main_manager ON public.clubs (manager_id) WHERE manager_id IS NOT NULL;
CREATE INDEX clubs_status_index ON public.clubs (status);

DROP POLICY IF EXISTS "public read active clubs" ON public.clubs;
DROP POLICY IF EXISTS "manager reads own club" ON public.clubs;
DROP POLICY IF EXISTS "manager updates own club" ON public.clubs;
DROP POLICY IF EXISTS "superadmin write" ON public.clubs;

CREATE POLICY "public read approved clubs" ON public.clubs
  FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "manager reads own club" ON public.clubs
  FOR SELECT TO authenticated
  USING (manager_id = auth.uid() AND public.is_account_active(auth.uid()));
CREATE POLICY "superadmin reads clubs" ON public.clubs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));
CREATE POLICY "manager updates own club" ON public.clubs
  FOR UPDATE TO authenticated
  USING (manager_id = auth.uid() AND public.is_account_active(auth.uid()))
  WITH CHECK (manager_id = auth.uid() AND public.is_account_active(auth.uid()));
CREATE POLICY "superadmin writes clubs" ON public.clubs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));

REVOKE INSERT, DELETE ON public.clubs FROM authenticated;
REVOKE UPDATE ON public.clubs FROM authenticated;
GRANT UPDATE (short_name, abbreviation, crest_url, description, responsible_name, contact_info) ON public.clubs TO authenticated;

-- Player roster ownership and individual history
ALTER TABLE public.players ADD COLUMN photo_url text;
CREATE UNIQUE INDEX players_user_unique ON public.players (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX players_club_index ON public.players (club_id);

DROP POLICY IF EXISTS "public read rostered players" ON public.players;
DROP POLICY IF EXISTS "player reads own profile" ON public.players;
DROP POLICY IF EXISTS "player updates own profile" ON public.players;
DROP POLICY IF EXISTS "superadmin write" ON public.players;

CREATE POLICY "public read approved club players" ON public.players
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = players.club_id AND c.status = 'approved'));
CREATE POLICY "player reads own profile" ON public.players
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.is_account_active(auth.uid()));
CREATE POLICY "manager reads own club players" ON public.players
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clubs c
    WHERE c.id = players.club_id AND c.manager_id = auth.uid() AND public.is_account_active(auth.uid())
  ));
CREATE POLICY "superadmin reads players" ON public.players
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));
CREATE POLICY "manager inserts own club players" ON public.players
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clubs c
    WHERE c.id = players.club_id AND c.manager_id = auth.uid() AND public.is_account_active(auth.uid())
  ));
CREATE POLICY "manager updates own club players" ON public.players
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clubs c
    WHERE c.id = players.club_id AND c.manager_id = auth.uid() AND public.is_account_active(auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clubs c
    WHERE c.id = players.club_id AND c.manager_id = auth.uid() AND public.is_account_active(auth.uid())
  ));
CREATE POLICY "manager deletes own club players" ON public.players
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clubs c
    WHERE c.id = players.club_id AND c.manager_id = auth.uid() AND public.is_account_active(auth.uid())
  ));
CREATE POLICY "player updates own profile" ON public.players
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.is_account_active(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_account_active(auth.uid()));
CREATE POLICY "superadmin writes players" ON public.players
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));

REVOKE UPDATE ON public.players FROM authenticated;
GRANT UPDATE (sport_name, platform_id, position, photo_url) ON public.players TO authenticated;
GRANT INSERT (sport_name, platform_id, position, club_id, photo_url, market_value) ON public.players TO authenticated;

CREATE TABLE public.player_club_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.player_club_history TO authenticated;
GRANT ALL ON public.player_club_history TO service_role;
ALTER TABLE public.player_club_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "player reads own club history" ON public.player_club_history
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players p WHERE p.id = player_club_history.player_id AND p.user_id = auth.uid()));
CREATE POLICY "manager reads club history" ON public.player_club_history
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = player_club_history.club_id AND c.manager_id = auth.uid()));
CREATE POLICY "superadmin reads club history" ON public.player_club_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));

CREATE TABLE public.transfer_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  from_club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL,
  to_club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  transferred_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transfer_history TO authenticated;
GRANT ALL ON public.transfer_history TO service_role;
ALTER TABLE public.transfer_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "player reads own transfers" ON public.transfer_history
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.players p WHERE p.id = transfer_history.player_id AND p.user_id = auth.uid()));
CREATE POLICY "superadmin reads transfers" ON public.transfer_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));

-- Audit and administrator-assisted access recovery
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "superadmin reads audit log" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));
CREATE INDEX audit_log_created_index ON public.audit_log (created_at DESC);

CREATE TABLE public.access_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  afcb_id text NOT NULL,
  contact_info text NOT NULL,
  identity_details text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz,
  handled_by uuid,
  CONSTRAINT access_reset_requests_status_valid CHECK (status IN ('pending', 'completed', 'rejected'))
);
GRANT SELECT, UPDATE ON public.access_reset_requests TO authenticated;
GRANT ALL ON public.access_reset_requests TO service_role;
ALTER TABLE public.access_reset_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "superadmin reads reset requests" ON public.access_reset_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));
CREATE POLICY "superadmin handles reset requests" ON public.access_reset_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin') AND public.is_account_active(auth.uid()));

-- Private crest storage: only the owning manager or a superadmin can write.
CREATE POLICY "manager uploads own club crest" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'club-crests'
    AND public.is_account_active(auth.uid())
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "manager updates own club crest" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'club-crests'
    AND public.is_account_active(auth.uid())
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'club-crests'
    AND public.is_account_active(auth.uid())
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "manager deletes own club crest" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'club-crests'
    AND public.is_account_active(auth.uid())
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "superadmin manages club crests" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'club-crests' AND public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (bucket_id = 'club-crests' AND public.has_role(auth.uid(), 'superadmin'));

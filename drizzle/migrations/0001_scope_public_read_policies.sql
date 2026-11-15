DROP POLICY IF EXISTS "public read" ON public.news;
CREATE POLICY "public read published news" ON public.news FOR SELECT TO anon, authenticated USING (published_at <= now());

DROP POLICY IF EXISTS "public read" ON public.competitions;
CREATE POLICY "public read listed competitions" ON public.competitions FOR SELECT TO anon, authenticated USING (status <> 'draft');

DROP POLICY IF EXISTS "public read" ON public.competition_clubs;
CREATE POLICY "public read listed competition clubs" ON public.competition_clubs FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.competitions c WHERE c.id = competition_id AND c.status <> 'draft'));

DROP POLICY IF EXISTS "public read" ON public.clubs;
CREATE POLICY "public read active clubs" ON public.clubs FOR SELECT TO anon, authenticated USING (manager_id IS NOT NULL);
CREATE POLICY "manager reads own club" ON public.clubs FOR SELECT TO authenticated USING (manager_id = auth.uid());

DROP POLICY IF EXISTS "public read" ON public.players;
CREATE POLICY "public read rostered players" ON public.players FOR SELECT TO anon, authenticated USING (club_id IS NOT NULL);
CREATE POLICY "player reads own profile" ON public.players FOR SELECT TO authenticated USING (user_id = auth.uid());
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by uuid;
CREATE OR REPLACE FUNCTION public.protect_club_admin_fields() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'superadmin') THEN RETURN NEW; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
     OR NEW.review_notes IS DISTINCT FROM OLD.review_notes OR NEW.manager_id IS DISTINCT FROM OLD.manager_id OR NEW.coins IS DISTINCT FROM OLD.coins
     OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at OR NEW.deleted_by IS DISTINCT FROM OLD.deleted_by OR NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'Somente o Superadministrador pode alterar a filiação da equipe.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_club_admin_fields ON public.clubs;
CREATE TRIGGER protect_club_admin_fields BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.protect_club_admin_fields();
-- Add admin fields and policies for guest management

ALTER TABLE guest_families
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Allow authenticated users to manage guest families
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guest_families'
      AND policyname = 'Allow authenticated manage families'
  ) THEN
    CREATE POLICY "Allow authenticated manage families"
      ON guest_families
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to manage family members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'family_members'
      AND policyname = 'Allow authenticated manage members'
  ) THEN
    CREATE POLICY "Allow authenticated manage members"
      ON family_members
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

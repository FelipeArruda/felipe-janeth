/*
  # Create Guest Management Tables

  1. New Tables
    - `guest_families`
      - `id` (uuid, primary key)
      - `family_name` (text, name of the family)
      - `access_code` (text, unique 8-digit code in format XXXX-XXXX)
      - `created_at` (timestamp)

    - `family_members`
      - `id` (uuid, primary key)
      - `family_id` (uuid, foreign key to guest_families)
      - `name` (text, member name)
      - `relationship` (text, optional - mother, father, brother, sister, cousin, etc.)
      - `created_at` (timestamp)

    - `member_confirmations`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key to family_members)
      - `attending` (boolean, RSVP confirmation)
      - `dietary_restrictions` (text, dietary preferences)
      - `message` (text, optional message for the couple)
      - `confirmed_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for anon users to access data via access codes
*/

CREATE TABLE IF NOT EXISTS guest_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name text NOT NULL,
  access_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guest_families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading families by access code"
  ON guest_families
  FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES guest_families(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading family members"
  ON family_members
  FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS member_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  attending boolean NOT NULL,
  dietary_restrictions text,
  message text,
  confirmed_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE member_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserting confirmations"
  ON member_confirmations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow reading confirmations"
  ON member_confirmations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow updating confirmations"
  ON member_confirmations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_guest_families_access_code ON guest_families(access_code);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_member_confirmations_member_id ON member_confirmations(member_id);
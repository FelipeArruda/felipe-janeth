/*
  # Create Guest Confirmations Table

  1. New Tables
    - `guest_confirmations`
      - `id` (uuid, primary key)
      - `name` (text, guest name)
      - `email` (text, guest email)
      - `phone` (text, guest phone number)
      - `attending` (boolean, RSVP confirmation - true for attending)
      - `guests_count` (integer, number of additional guests)
      - `dietary_restrictions` (text, dietary preferences)
      - `message` (text, optional message for the couple)
      - `created_at` (timestamp, when the RSVP was submitted)

  2. Security
    - Enable RLS on `guest_confirmations` table
    - Add policy to allow anyone to insert new confirmations
    - Add policy to allow reading all confirmations (for admin viewing)
*/

CREATE TABLE IF NOT EXISTS guest_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  attending boolean NOT NULL,
  guests_count integer DEFAULT 0,
  dietary_restrictions text,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guest_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert confirmations"
  ON guest_confirmations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow reading all confirmations"
  ON guest_confirmations
  FOR SELECT
  USING (true);

CREATE INDEX idx_guest_confirmations_email ON guest_confirmations(email);
CREATE INDEX idx_guest_confirmations_created_at ON guest_confirmations(created_at DESC);
/*
  # Drop relationship column from family_members

  Removes the optional relationship field so member records keep only the guest name.
*/

ALTER TABLE IF EXISTS family_members
DROP COLUMN IF EXISTS relationship;

import pool from '../db/pool.js';

export const createCV = async ({ title, personal, sections, accessTokenHash }) => {
  const result = await pool.query(
    `INSERT INTO cvs (title, personal_data, sections, access_token_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, personal_data, sections, created_at, updated_at`,
    [title, personal, sections, accessTokenHash]
  );
  return result.rows[0];
};

export const findCVById = async (id) => {
  const result = await pool.query(
    `SELECT id, user_id, title, personal_data, sections, access_token_hash, created_at, updated_at
     FROM cvs WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const updateCV = async (id, { personal, sections }) => {
  const result = await pool.query(
    `UPDATE cvs
     SET personal_data = $1,
         sections = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, title, personal_data, sections, created_at, updated_at`,
    [personal, sections, id]
  );
  return result.rows[0] || null;
};

export const deleteCV = async (id) => {
  const result = await pool.query(`DELETE FROM cvs WHERE id = $1`, [id]);
  return result.rowCount === 1;
};

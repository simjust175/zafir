import db from "../../Database/config/db.js";

class InviteModel {
  static async create({ email, name, token, expires_at, status }) {
    const sql = `
      INSERT INTO user_invites (email, name, token, expires_at, status, created_at, last_sent_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(sql, [email, name, token, expires_at, status]);
    
    return {
      id: result.insertId,
      email,
      name,
      token,
      expires_at,
      status,
      created_at: new Date()
    };
  }

  static async findById(id) {
    const sql = "SELECT * FROM user_invites WHERE id = ?";
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const sql = "SELECT * FROM user_invites WHERE email = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1";
    const [rows] = await db.query(sql, [email]);
    return rows[0] || null;
  }

  static async findByToken(token) {
    const sql = "SELECT * FROM user_invites WHERE token = ?";
    const [rows] = await db.query(sql, [token]);
    return rows[0] || null;
  }

  static async findAllPending() {
    const sql = `
      SELECT id, email, name, status, created_at, last_sent_at, expires_at
      FROM user_invites 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async updateStatus(id, status) {
    const sql = "UPDATE user_invites SET status = ? WHERE id = ?";
    const [result] = await db.query(sql, [status, id]);
    return result;
  }

  static async updateToken(id, token, expires_at) {
    const sql = "UPDATE user_invites SET token = ?, expires_at = ? WHERE id = ?";
    const [result] = await db.query(sql, [token, expires_at, id]);
    return result;
  }

  static async updateLastSent(id) {
    const sql = "UPDATE user_invites SET last_sent_at = NOW() WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result;
  }

  static async cleanupExpired() {
    const sql = "UPDATE user_invites SET status = 'expired' WHERE status = 'pending' AND expires_at < NOW()";
    const [result] = await db.query(sql);
    return result;
  }
}

export default InviteModel;

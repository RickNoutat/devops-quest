/**
 * Controller Auth — Register / Login / Me
 * Sessions JWT 7 jours
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../database/db");

const SESSION_DURATION = "7d";

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: SESSION_DURATION }
  );
}

/** POST /api/auth/register */
exports.register = (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email et password sont requis" });
  }
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: "Le username doit faire entre 3 et 30 caractères" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit faire au moins 6 caractères" });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .get(username, email);
  if (existing) {
    return res.status(409).json({ error: "Ce username ou email est déjà utilisé" });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
    .run(username, email, hash);

  const user = { id: result.lastInsertRowid, username, email };
  const token = signToken(user);

  res.status(201).json({ token, user });
};

/** POST /api/auth/login */
exports.login = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email et password sont requis" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
};

/** GET /api/auth/me */
exports.me = (req, res) => {
  const user = db
    .prepare("SELECT id, username, email, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  res.json(user);
};

function createMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/** POST /api/auth/forgot-password */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email est requis" });

  const user = db.prepare("SELECT id, username FROM users WHERE email = ?").get(email);

  // Toujours 200 pour ne pas révéler si l'email existe
  if (!user) return res.json({ message: "Si ce mail existe, un lien a été envoyé." });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1h

  db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);
  db.prepare(
    "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)"
  ).run(user.id, token, expiresAt);

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    const transporter = createMailTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "DevOps Quest — Réinitialisation de mot de passe",
      html: `
        <div style="font-family: monospace; background: #0a1628; color: #e2e8f0; padding: 32px; border-radius: 4px;">
          <h2 style="color: #4ade80;">// RESET PASSWORD</h2>
          <p>Bonjour <strong>${user.username}</strong>,</p>
          <p>Tu as demandé à réinitialiser ton mot de passe DevOps Quest.</p>
          <p>Clique sur le lien ci-dessous (valable <strong>1 heure</strong>) :</p>
          <a href="${resetLink}" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background: #022c0a; border: 1px solid #22c55e; color: #22c55e; text-decoration: none; font-weight: bold;">
            [ > RÉINITIALISER MON MOT DE PASSE ]
          </a>
          <p style="color: #64748b; font-size: 12px;">Si tu n'es pas à l'origine de cette demande, ignore ce mail.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Erreur envoi mail:", err.message);
    return res.status(500).json({ error: "Erreur lors de l'envoi du mail" });
  }

  res.json({ message: "Si ce mail existe, un lien a été envoyé." });
};

/** POST /api/auth/reset-password */
exports.resetPassword = (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: "token et password sont requis" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit faire au moins 6 caractères" });
  }

  const reset = db
    .prepare(
      "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
    )
    .get(token);

  if (!reset) {
    return res.status(400).json({ error: "Lien invalide ou expiré" });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, reset.user_id);
  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);

  res.json({ message: "Mot de passe mis à jour avec succès" });
};

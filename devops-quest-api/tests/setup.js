/**
 * Setup global des tests — base de données en mémoire + env variables
 */

// Base SQLite en mémoire pour les tests (isolée de la prod)
process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET = "test-jwt-secret-for-tests-only";
process.env.NODE_ENV = "test";

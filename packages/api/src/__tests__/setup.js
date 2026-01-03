// Test setup file
// Configuración global para los tests

// Mock de variables de entorno
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';
process.env.JWT_SECRET = 'test-secret';

// Aumentar timeout para tests de integración
jest.setTimeout(10000);

// Este archivo se ejecuta antes de todos los tests
// NO incluir tests aquí

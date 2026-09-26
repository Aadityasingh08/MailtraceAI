import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'mailtrace-ai-jwt-secret-secure-key-2025',
  databaseUrl: process.env.DATABASE_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  virustotalApiKey: process.env.VIRUSTOTAL_API_KEY || '',
  abuseipdbApiKey: process.env.ABUSEIPDB_API_KEY || '',
  geolocationApiKey: process.env.GEOLOCATION_API_KEY || '',
};

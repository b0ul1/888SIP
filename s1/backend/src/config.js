import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  ari: {
    url: process.env.ARI_URL,
    user: process.env.ARI_USER,
    pass: process.env.ARI_PASS
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME
  },
  googleKey: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  soundsDir: '/var/lib/asterisk/sounds/tts'
};

# RoboCaller minimal

## Lancer
cp .env.example .env
# Éditez pjsip.conf avec votre trunk SIP
docker compose up --build

API: http://localhost:8000/docs
UI:  http://localhost:8080

## Comptes
Créez un admin:
curl -X POST http://localhost:8000/auth/seed-admin -H "Content-Type: application/json" -d '{"email":"admin@local","password":"admin"}'
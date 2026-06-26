# RUN BOOK

## Automotive Multi-Agent System

**Version observee :** 1.0.0  
**Date du run book :** 26 juin 2026  
**Source :** `Automotive_MAS.zip`  
**Perimetre :** exploitation locale, validation, surveillance, incidents et reprise.

---

## 1. Synthese operationnelle

Automotive MAS est un systeme multi-agents automobile francophone. Un superviseur analyse la requete utilisateur et route vers un agent specialise :

- `diagnostic` : pannes, codes OBD-II, symptomes moteur.
- `maintenance` : entretien preventif, vidanges, revisions.
- `parts` : references pieces, compatibilite, prix indicatifs.
- `telemetry` : donnees capteurs, CAN-bus, temperature, consommation, performance.

Le backend expose une API FastAPI. L'interface React consomme l'endpoint `/query` et bascule vers une simulation locale si l'API n'est pas disponible.

> **Decision operateur**  
> Pour une utilisation reelle, demarrer le backend Python/FastAPI sur le port `8000` avant l'interface. Le serveur Express de l'espace frontend ne couvre que `/api/healthz` et ne remplace pas l'API metier `/query`.

---

## 2. Carte du systeme

| Composant | Role | Emplacement |
|---|---|---|
| Supervisor | Orchestration LangGraph et routage d'intention | `backend/agents/supervisor.py` |
| Diagnostic Agent | Analyse pannes, codes OBD-II et symptomes | `backend/agents/diagnostic_agent.py` |
| Maintenance Agent | Planification d'entretien preventif | `backend/agents/maintenance_agent.py` |
| Parts Agent | References pieces, compatibilite et prix indicatifs | `backend/agents/parts_agent.py` |
| Telemetry Agent | Analyse capteurs, CAN-bus et performance | `backend/agents/telemetry_agent.py` |
| Monitoring Agent | Logs JSON et correlation ID | `backend/monitoring/monitor.py` |
| FastAPI | Endpoints `/` et `/query` | `backend/api.py` |
| React UI | Chat, garage vehicule, export conversation | `frontend/artifacts/automotive-mas` |

---

## 3. Prerequis

| Element | Version / valeur | Notes |
|---|---|---|
| Python | 3.11+ | Le Dockerfile cible `python:3.11-slim`. |
| Backend Python | `pytest`, `langgraph`, `langchain-core`, `langchain-groq`, `langsmith`, `python-dotenv`, `fastapi`, `uvicorn` | Installer depuis `backend/requirements.txt`. |
| LLM | Groq ChatGroq, modele `llama-3.3-70b-versatile` | Le code lit `GROQ_API_KEY` depuis l'environnement. |
| Node.js | 24 | Declare dans `frontend/.replit`. |
| Frontend | pnpm workspace | Les scripts refusent npm/yarn via `preinstall`. |
| Ports | `8000` pour FastAPI; `5000` attendu par l'API server Express | Aligner les URLs si deploiement hors local. |

---

## 4. Variables d'environnement

| Variable | Obligatoire | Usage | Controle |
|---|---|---|---|
| `GROQ_API_KEY` | Oui | Authentification du LLM utilise par le superviseur et les agents | Ne jamais committer la valeur. Verifier presence uniquement. |
| `PORT` | Oui pour serveur Express | Port d'ecoute de `frontend/artifacts/api-server` | Doit etre numerique et positif. |
| `DATABASE_URL` | Reference frontend | Mentionnee dans `replit.md` pour l'espace DB | Non utilisee par le backend Python actuel. |

---

## 5. Demarrage local

### 5.1 Backend Python / FastAPI

1. Se placer dans le dossier backend.
2. Creer ou activer un environnement Python 3.11+.
3. Installer les dependances :

```bash
pip install -r requirements.txt
```

4. Definir `GROQ_API_KEY` dans l'environnement ou dans `backend/.env`.
5. Lancer l'API :

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

6. Verifier :

```bash
curl http://localhost:8000/
```

Reponse attendue :

```json
{"status":"running"}
```

### 5.2 Mode demonstration console

Le fichier `backend/main.py` lance trois requetes d'exemple avec un contexte vehicule Renault Clio IV 2019.

```bash
cd backend
python main.py
```

Controler l'affichage du correlation ID, du chemin d'agents et de la reponse finale.

### 5.3 Frontend React

1. Se placer dans `frontend`.
2. Installer avec `pnpm install` si les dependances ne sont pas deja presentes.
3. Lancer l'application :

```bash
pnpm --filter @workspace/automotive-mas run dev
```

4. Verifier que le backend FastAPI repond sur `http://localhost:8000/query`.
5. Si l'API est indisponible, l'interface affiche une reponse simulee. Ne pas confondre cette simulation avec une reponse du MAS reel.

---

## 6. API et contrats

| Endpoint | Methode | Corps / reponse | Usage operateur |
|---|---|---|---|
| `/` | GET | Retourne `{"status":"running"}` | Health check minimal du backend Python. |
| `/query` | POST | Entree : `question`, `vehicle_context` optionnel. Sortie : `correlation_id`, `response`, `agent_history`. | Point d'entree metier du MAS. |
| `/api/healthz` | GET | Retourne `{"status":"ok"}` | Health check du serveur Express frontend, pas du backend MAS. |

### Exemple `/query`

```http
POST /query
Content-Type: application/json
```

```json
{
  "question": "J ai un code OBD P0300 et mon moteur vibre",
  "vehicle_context": {
    "marque": "Renault",
    "modele": "Clio IV",
    "annee": 2019,
    "kilometrage": 85000,
    "motorisation": "1.5 dCi 90ch"
  }
}
```

Reponse attendue :

```json
{
  "correlation_id": "<uuid>",
  "response": "<reponse agent>",
  "agent_history": ["supervisor->diagnostic", "diagnostic:done"]
}
```

---

## 7. Verification avant mise en service

| Controle | Commande / action | Resultat attendu |
|---|---|---|
| Tests backend | `pytest` | Suite verte; les agents retournent des chaines et le monitoring conserve le correlation ID. |
| API backend | `GET /` puis `POST /query` | Status running puis reponse avec `correlation_id` et `agent_history`. |
| Frontend typecheck | `pnpm run typecheck` | Aucune erreur TypeScript. |
| Frontend build | `pnpm run build` | Build Vite et packages workspace sans erreur. |
| Routage fonctionnel | Tester diagnostic, maintenance, pieces, telemetrie | `agent_history` contient supervisor puis l'agent attendu. |

---

## 8. Supervision et journalisation

Le Monitoring Agent emet des logs JSON bruts via le logger `automotive.mas`. Chaque evenement contient :

- `timestamp`
- `correlation_id`
- `agent`
- `event`
- `level`

Exemple :

```json
{
  "timestamp": "2026-06-26T10:00:00Z",
  "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
  "agent": "diagnostic",
  "event": "processing",
  "level": "INFO"
}
```

| Signal | Ou le trouver | Interpretation |
|---|---|---|
| `correlation_id` | Reponse `/query` et logs JSON | Identifiant principal de diagnostic session. |
| `agent_history` | Reponse `/query` | Trace logique du routage et de l'agent execute. |
| `routed_to=<agent>` | Logs superviseur | Decision de routage prise par le LLM. |
| `total_events` | `get_session_metrics` | Volume d'evenements suivi en memoire pour une session. |

---

## 9. Procedures d'incident

| Symptome | Diagnostic rapide | Action de reprise |
|---|---|---|
| Le frontend repond mais les reponses semblent generiques | L'appel `http://localhost:8000/query` echoue et le fallback simule est actif. | Demarrer FastAPI sur le port `8000` puis retester `/query`. |
| Erreur d'authentification LLM | `GROQ_API_KEY` absente, invalide ou non chargee. | Verifier la variable, redemarrer le backend et controler les logs. |
| Routing vers `FINISH` ou agent inattendu | Le superviseur a recu une sortie hors liste ou une intention ambigue. | Reproduire avec la question exacte, verifier `agent_history` et renforcer le prompt si recurrent. |
| Aucun log exploitable | Sortie standard non collectee par la plateforme. | Rediriger stdout/stderr vers le collecteur ou configurer l'agent de logs. |
| Erreur `PORT` sur serveur Express | Variable `PORT` absente ou non numerique. | Definir `PORT=5000` ou un port valide avant le demarrage. |

---

## 10. Securite et gouvernance

- Ne jamais exposer la valeur `GROQ_API_KEY` dans le run book, les logs, les captures ou le code source.
- Le backend autorise CORS avec `allow_origins=["*"]`; restreindre les origines avant exposition publique.
- Les reponses sont informatives et ne remplacent pas un diagnostic professionnel.
- Le systeme ne dispose pas d'acces OBD physique ni de flux capteurs live.
- Le frontend stocke l'historique de chat dans `sessionStorage`; eviter d'y saisir des donnees personnelles non necessaires.
- Le workspace pnpm impose `minimumReleaseAge: 1440` pour limiter les risques supply-chain; ne pas le desactiver.

---

## 11. Checklist d'exploitation

| Moment | Checklist |
|---|---|
| Avant demarrage | `GROQ_API_KEY` definie; dependances installees; port `8000` libre; tests de base connus. |
| Apres demarrage | `GET /` OK; `POST /query` OK; `correlation_id` present; `agent_history` coherent. |
| Pendant exploitation | Surveiller erreurs LLM, latence percue, routages inattendus et volume de fallback frontend. |
| Avant livraison | `pytest`, `pnpm run typecheck`, `pnpm run build`; documenter les ecarts si une commande n'est pas applicable. |
| Apres incident | Conserver `correlation_id`, question utilisateur, contexte vehicule, logs et action corrective. |

---

## 12. Ecarts et points d'attention identifies

- L'Agent Card mentionne `claude-3-5-sonnet-20241022`, tandis que le code utilise ChatGroq avec `llama-3.3-70b-versatile`.
- Le Dockerfile lance `python main.py`; un conteneur construit tel quel execute donc la demonstration console plutot qu'un serveur FastAPI.
- Le health check frontend `/api/healthz` ne verifie pas l'API metier Python `/query`.
- Le frontend genere actuellement un `correlationId` local pour l'affichage, au lieu de reprendre explicitement le `correlation_id` renvoye par `/query`.
- Les dossiers `.venv`, `node_modules` et artefacts compiles sont presents dans l'archive; ils ne devraient pas etre inclus dans un livrable source propre.

---

## 13. Commandes rapides

| Objectif | Commande |
|---|---|
| Installer backend | `cd backend && pip install -r requirements.txt` |
| Lancer API Python | `cd backend && uvicorn api:app --host 0.0.0.0 --port 8000` |
| Demo console | `cd backend && python main.py` |
| Tests backend | `cd backend && pytest` |
| Installer frontend | `cd frontend && pnpm install` |
| Lancer interface | `cd frontend && pnpm --filter @workspace/automotive-mas run dev` |
| Typecheck frontend | `cd frontend && pnpm run typecheck` |
| Build frontend | `cd frontend && pnpm run build` |
| Serveur Express health | `cd frontend && PORT=5000 pnpm --filter @workspace/api-server run dev` |

---

## 14. Matrice de routage

| Intention utilisateur | Agent attendu | Mots indicateurs |
|---|---|---|
| Panne, voyant, code OBD, symptome moteur | `diagnostic` | `P0xxx`, `P1xxx`, voyant moteur, panne, vibrations |
| Revision, vidange, calendrier entretien | `maintenance` | entretien, vidange, revision, kilometrage |
| Reference, compatibilite, prix de piece | `parts` | piece, reference, plaquettes, filtre, compatibilite |
| Capteurs, consommation, temperature, performance | `telemetry` | capteur, temperature, pression, consommation, CAN-bus |
| Intention non reconnue | `FINISH` | Sortie de securite si le superviseur ne choisit pas un agent valide |


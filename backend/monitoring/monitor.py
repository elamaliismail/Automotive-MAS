"""
Agent de Monitoring — Observabilité avec Correlation ID.
Critère de validation : Correlation ID présent sur chaque exécution.
"""

import logging
import json
import uuid
from datetime import datetime, timezone
from typing import Any


# ─── Logger structuré ────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",   # JSON brut → ingestion ELK/Loki-ready
)
logger = logging.getLogger("automotive.mas")


class MonitoringAgent:
    """
    Agent de monitoring transversal.
    - Génère et propage le Correlation ID
    - Logge chaque événement en JSON structuré
    - Collecte les métriques d'exécution
    """

    def __init__(self):
        self._metrics: dict[str, list] = {}   # correlation_id → events

    # ─── Logging ─────────────────────────────────────────────────────────────

    def log(
        self,
        correlation_id: str,
        agent: str,
        event: str,
        level: str = "INFO",
        extra: dict | None = None,
    ) -> None:
        """
        Émet un log structuré JSON avec le Correlation ID.
        Satisfait le critère d'observabilité du projet.
        """
        record = {
            "timestamp":      datetime.now(timezone.utc).isoformat(),
            "correlation_id": correlation_id,    # ← critère obligatoire
            "agent":          agent,
            "event":          event,
            "level":          level,
        }
        if extra:
            record["extra"] = extra

        log_fn = getattr(logger, level.lower(), logger.info)
        log_fn(json.dumps(record, ensure_ascii=False))

        # Stockage interne pour métriques
        if correlation_id not in self._metrics:
            self._metrics[correlation_id] = []
        self._metrics[correlation_id].append(record)

    # ─── Métriques ────────────────────────────────────────────────────────────

    def get_session_metrics(self, correlation_id: str) -> dict:
        """Retourne les métriques d'une session identifiée par son Correlation ID."""
        events = self._metrics.get(correlation_id, [])
        if not events:
            return {"error": "correlation_id inconnu"}

        agents_used = list({e["agent"] for e in events if e["agent"] != "system"})
        start = events[0]["timestamp"]
        end   = events[-1]["timestamp"]

        return {
            "correlation_id": correlation_id,
            "total_events":   len(events),
            "agents_invoked": agents_used,
            "session_start":  start,
            "session_end":    end,
            "events":         events,
        }

    def generate_correlation_id(self) -> str:
        """Génère un Correlation ID unique (UUID v4)."""
        return str(uuid.uuid4())

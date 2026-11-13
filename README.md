# Adventure Table

A work-in-progress virtual tabletop for a game master and remote players. This
first slice supplies a shared grid, tokens, character cards, dice, initiative,
notes, and an optional link to a Discord voice channel. It is designed to
support 2024-style tabletop play, but does **not** implement or distribute the
2024 rules, classes, monsters, or official adventures.
Each new room includes a short original starter scenario in the GM's private
notes; the GM supplies any game statistics using the group's rules materials.

## Status and safety

This is a **local development prototype**, not a production or internet-ready
service. It has not been security reviewed. Do not expose it directly to the
internet or use it for sensitive information. There are no user accounts,
rate limits, password recovery, access revocation, encryption at rest, or
production deployment configuration. Players share one player invite; anyone
with it can act as a player and move any token or edit any character. The GM
link grants full GM control: never share it with players. Links are bearer
credentials and are not recoverable if lost. Discord voice is separate; the app
does not connect to Discord or carry audio.

Game data is stored in a local SQLite database. Browser tabs keep their
credentials in session storage; close the tab to clear them. The room links
carry credentials in the URL fragment, which is not sent in HTTP requests.
Do not post links publicly or use them on a shared device. Multiplayer requires
all players to reach the same server; this prototype does not yet provide safe
remote hosting. A networked or public rollout requires HTTPS, stronger identity
and authorization, abuse protections, backups, and a deployment review.

## Run locally

Requires Python 3.10+.

```powershell
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn adventure_table.app:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000` and create a room. Save your GM link and share
only the player link. Use another tab to test the player view. For real remote
play, wait for a secure hosted version rather than opening this development
server to the internet. To change the database path in development set
`ADVENTURE_TABLE_DB` before starting the server.

## Test

```powershell
python -m pytest
```

Tests use temporary databases and do not call Discord or any external service.

## Rules and content

Players and the GM enter their own information. The starter text is original,
and dice are general-purpose. No claim is made that the prototype enforces the
2024 rules. Future 2024 rules work should use appropriately licensed content,
such as the [SRD 5.2.1](https://www.dndbeyond.com/srd), and meet its license
and attribution requirements. Dungeons & Dragons and Discord are not affiliated
with this project.

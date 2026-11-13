import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import sqlite3
from contextlib import contextmanager
from typing import Literal
from urllib.parse import urlparse

from fastapi import FastAPI, Header, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

STATIC = Path(__file__).parent / "static"


class RoomCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class Token(BaseModel):
    id: str = Field(min_length=1, max_length=40, pattern=r"^[a-zA-Z0-9_-]+$")
    name: str = Field(min_length=1, max_length=30)
    x: int = Field(ge=0, le=9)
    y: int = Field(ge=0, le=9)


class Character(BaseModel):
    id: str = Field(min_length=1, max_length=40, pattern=r"^[a-zA-Z0-9_-]+$")
    name: str = Field(min_length=1, max_length=40)
    details: str = Field(default="", max_length=400)
    hp: int = Field(ge=0, le=9999)
    initiative: int = Field(ge=-100, le=100)


class Notes(BaseModel):
    text: str = Field(max_length=10000)


class Voice(BaseModel):
    url: str = Field(max_length=300)

    @field_validator("url")
    @classmethod
    def discord_channel(cls, value: str) -> str:
        if not value:
            return value
        url = urlparse(value)
        parts = url.path.strip("/").split("/")
        if (
            url.scheme != "https"
            or url.netloc != "discord.com"
            or len(parts) != 3
            or parts[0] != "channels"
            or not all(part.isdigit() for part in parts[1:])
            or url.query
            or url.fragment
        ):
            raise ValueError("Use a Discord channel link: https://discord.com/channels/server/channel")
        return value


class Roll(BaseModel):
    player: str = Field(min_length=1, max_length=30)
    count: int = Field(ge=1, le=20)
    sides: Literal[4, 6, 8, 10, 12, 20, 100]
    modifier: int = Field(default=0, ge=-100, le=100)


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def create_app(database: str | Path | None = None) -> FastAPI:
    db_path = str(database or os.environ.get("ADVENTURE_TABLE_DB", "adventure-table.sqlite3"))
    app = FastAPI(title="Adventure Table", docs_url=None, redoc_url=None, openapi_url=None)
    app.mount("/static", StaticFiles(directory=STATIC), name="static")

    @contextmanager
    def connect():
        connection = sqlite3.connect(db_path, timeout=10)
        connection.row_factory = sqlite3.Row
        try:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS rooms (
                    id TEXT PRIMARY KEY, gm_hash TEXT NOT NULL, player_hash TEXT NOT NULL,
                    name TEXT NOT NULL, state TEXT NOT NULL, private_notes TEXT NOT NULL
                )"""
            )
            with connection:
                yield connection
        finally:
            connection.close()

    def authorized(db: sqlite3.Connection, room_id: str, authorization: str | None) -> tuple[sqlite3.Row, bool]:
        room = db.execute("SELECT * FROM rooms WHERE id = ?", (room_id,)).fetchone()
        token = authorization[7:] if authorization and authorization.startswith("Bearer ") else ""
        hashed = digest(token)
        if room is None:
            raise HTTPException(404, "Room not found")
        is_gm = hmac.compare_digest(hashed, room["gm_hash"])
        if not is_gm and not hmac.compare_digest(hashed, room["player_hash"]):
            raise HTTPException(403, "Invalid room link")
        return room, is_gm

    def update(room_id: str, auth: str | None, change, *, gm_only: bool = False):
        with connect() as db:
            db.execute("BEGIN IMMEDIATE")
            room, is_gm = authorized(db, room_id, auth)
            if gm_only and not is_gm:
                raise HTTPException(403, "GM access required")
            state = json.loads(room["state"])
            change(state)
            db.execute("UPDATE rooms SET state = ? WHERE id = ?", (json.dumps(state), room_id))
        return {"ok": True}

    @app.get("/")
    def index():
        return FileResponse(STATIC / "index.html", headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"})

    @app.post("/api/rooms", status_code=201)
    def create_room(body: RoomCreate, response: Response):
        room_id, gm, player = secrets.token_urlsafe(16), secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        state = {
            "tokens": [], "characters": [], "rolls": [], "voice": "",
            "notes": "The Lantern at the Crossroads\n\nAt dusk, a lantern flickers beside an old crossroads. Beneath it lies a sealed letter asking for help at the nearby mill.",
        }
        starter = (
            "The Lantern at the Crossroads — a short original adventure\n\n"
            "A miller named Mara asks the party to find a missing brass key before "
            "the creek floods her mill. Three scenes follow:\n\n"
            "1. Crossroads: A courier saw a small figure carrying the key toward "
            "the old footbridge. The letter is sincere; reward the party with "
            "a warm meal and a favor from Mara.\n\n"
            "2. Footbridge: A fallen tree blocks the path. Let players describe "
            "how they cross. Decide whether a roll is needed and the consequences "
            "of failure using the rules your group has chosen.\n\n"
            "3. Mill: A frightened creature took the key to free its friend, "
            "trapped behind a rusted gate. The party can negotiate, help open "
            "the gate, or fight. Choose suitable foes and difficulty using your "
            "own rules materials. The key opens the mill's floodgate.\n\n"
            "Ending: If the party returns the key, Mara opens the floodgate and "
            "the mill is safe. Whatever happens, ask what the party does next."
        )
        with connect() as db:
            db.execute(
                "INSERT INTO rooms VALUES (?, ?, ?, ?, ?, ?)",
                (room_id, digest(gm), digest(player), body.name, json.dumps(state), starter),
            )
        response.headers["Cache-Control"] = "no-store"
        return {"room_id": room_id, "gm_key": gm, "player_key": player}

    @app.get("/api/rooms/{room_id}")
    def read_room(room_id: str, response: Response, authorization: str | None = Header(default=None)):
        with connect() as db:
            room, is_gm = authorized(db, room_id, authorization)
            result = {"name": room["name"], "role": "gm" if is_gm else "player", **json.loads(room["state"])}
            if is_gm:
                result["private_notes"] = room["private_notes"]
        response.headers["Cache-Control"] = "no-store"
        return result

    @app.put("/api/rooms/{room_id}/tokens")
    def put_token(room_id: str, body: Token, authorization: str | None = Header(default=None)):
        def change(state):
            tokens = [item for item in state["tokens"] if item["id"] != body.id]
            if len(tokens) >= 50:
                raise HTTPException(400, "Maximum 50 tokens")
            state["tokens"] = tokens + [body.model_dump()]
        return update(room_id, authorization, change)

    @app.delete("/api/rooms/{room_id}/tokens/{token_id}")
    def delete_token(room_id: str, token_id: str, authorization: str | None = Header(default=None)):
        return update(room_id, authorization, lambda s: s.update(tokens=[x for x in s["tokens"] if x["id"] != token_id]), gm_only=True)

    @app.put("/api/rooms/{room_id}/characters")
    def put_character(room_id: str, body: Character, authorization: str | None = Header(default=None)):
        def change(state):
            characters = [item for item in state["characters"] if item["id"] != body.id]
            if len(characters) >= 50:
                raise HTTPException(400, "Maximum 50 characters")
            state["characters"] = characters + [body.model_dump()]
        return update(room_id, authorization, change)

    @app.delete("/api/rooms/{room_id}/characters/{character_id}")
    def delete_character(room_id: str, character_id: str, authorization: str | None = Header(default=None)):
        return update(room_id, authorization, lambda s: s.update(characters=[x for x in s["characters"] if x["id"] != character_id]), gm_only=True)

    @app.put("/api/rooms/{room_id}/notes")
    def put_notes(room_id: str, body: Notes, authorization: str | None = Header(default=None)):
        return update(room_id, authorization, lambda s: s.update(notes=body.text), gm_only=True)

    @app.put("/api/rooms/{room_id}/private-notes")
    def private_notes(room_id: str, body: Notes, authorization: str | None = Header(default=None)):
        with connect() as db:
            db.execute("BEGIN IMMEDIATE")
            _, is_gm = authorized(db, room_id, authorization)
            if not is_gm:
                raise HTTPException(403, "GM access required")
            db.execute("UPDATE rooms SET private_notes = ? WHERE id = ?", (body.text, room_id))
        return {"ok": True}

    @app.put("/api/rooms/{room_id}/voice")
    def put_voice(room_id: str, body: Voice, authorization: str | None = Header(default=None)):
        return update(room_id, authorization, lambda s: s.update(voice=body.url), gm_only=True)

    @app.post("/api/rooms/{room_id}/rolls")
    def roll(room_id: str, body: Roll, authorization: str | None = Header(default=None)):
        def change(state):
            dice = [secrets.randbelow(body.sides) + 1 for _ in range(body.count)]
            state["rolls"] = ([{
                "player": body.player, "dice": dice, "sides": body.sides,
                "modifier": body.modifier, "total": sum(dice) + body.modifier,
            }] + state["rolls"])[:30]
        return update(room_id, authorization, change)

    return app


app = create_app()

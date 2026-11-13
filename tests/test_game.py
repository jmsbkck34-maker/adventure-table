from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient

from adventure_table.app import create_app


def new_game(tmp_path):
    client = TestClient(create_app(tmp_path / "test.sqlite3"))
    response = client.post("/api/rooms", json={"name": "The Lantern Road"})
    assert response.status_code == 201
    assert response.headers["cache-control"] == "no-store"
    room = response.json()
    path = "/api/rooms/" + room["room_id"]
    gm = {"Authorization": "Bearer " + room["gm_key"]}
    player = {"Authorization": "Bearer " + room["player_key"]}
    return client, path, gm, player


def test_roles_private_notes_and_invalid_keys(tmp_path):
    client, path, gm, player = new_game(tmp_path)
    assert client.get(path).status_code == 403
    assert client.get(path, headers={"Authorization": "Bearer wrong"}).status_code == 403
    assert client.get(path, headers=gm).json()["role"] == "gm"
    assert client.get(path, headers=player).json()["role"] == "player"
    assert "The Lantern at the Crossroads" in client.get(path, headers=gm).json()["private_notes"]
    assert client.put(path + "/private-notes", headers=gm, json={"text": "Hidden clue"}).status_code == 200
    assert client.get(path, headers=gm).json()["private_notes"] == "Hidden clue"
    assert "private_notes" not in client.get(path, headers=player).json()
    assert client.put(path + "/private-notes", headers=player, json={"text": "Oops"}).status_code == 403
    assert client.put(path + "/notes", headers=player, json={"text": "Oops"}).status_code == 403
    assert client.put(path + "/notes", headers=gm, json={"text": "Shared clue"}).status_code == 200
    assert client.get(path, headers=player).json()["notes"] == "Shared clue"
    assert client.get(path, headers=gm).headers["cache-control"] == "no-store"


def test_map_character_and_combat(tmp_path):
    client, path, gm, player = new_game(tmp_path)
    token = {"id": "token-1", "name": "Rook", "x": 1, "y": 2}
    assert client.put(path + "/tokens", headers=player, json=token).status_code == 200
    token["x"] = 9
    assert client.put(path + "/tokens", headers=player, json=token).status_code == 200
    character = {"id": "hero-1", "name": "Rook", "details": "Fighter", "hp": 12, "initiative": 17}
    assert client.put(path + "/characters", headers=player, json=character).status_code == 200
    state = client.get(path, headers=gm).json()
    assert state["tokens"] == [token]
    assert state["characters"] == [character]
    assert client.delete(path + "/tokens/token-1", headers=player).status_code == 403
    assert client.delete(path + "/tokens/token-1", headers=gm).status_code == 200
    assert client.delete(path + "/characters/hero-1", headers=player).status_code == 403
    assert client.delete(path + "/characters/hero-1", headers=gm).status_code == 200
    assert client.get(path, headers=player).json()["tokens"] == []


def test_dice_ranges_validation_and_history(tmp_path):
    client, path, _, player = new_game(tmp_path)
    roll = {"player": "Rook", "count": 2, "sides": 20, "modifier": 3}
    assert client.post(path + "/rolls", headers=player, json=roll).status_code == 200
    result = client.get(path, headers=player).json()["rolls"][0]
    assert len(result["dice"]) == 2
    assert all(1 <= die <= 20 for die in result["dice"])
    assert result["total"] == sum(result["dice"]) + 3
    assert client.post(path + "/rolls", headers=player, json={**roll, "count": 21}).status_code == 422
    assert client.post(path + "/rolls", headers=player, json={**roll, "sides": 21}).status_code == 422


def test_discord_link_and_input_validation(tmp_path):
    client, path, gm, player = new_game(tmp_path)
    voice = {"url": "https://discord.com/channels/12345/67890"}
    assert client.put(path + "/voice", headers=player, json=voice).status_code == 403
    assert client.put(path + "/voice", headers=gm, json=voice).status_code == 200
    assert client.get(path, headers=player).json()["voice"] == voice["url"]
    for bad in ["javascript:alert(1)", "https://discord.com.evil.test/channels/1/2", "https://discord.com/channels/1/2?x=3"]:
        assert client.put(path + "/voice", headers=gm, json={"url": bad}).status_code == 422
    assert client.put(path + "/tokens", headers=player, json={"id": "bad", "name": "x", "x": 10, "y": 0}).status_code == 422
    assert client.put(path + "/voice", headers=gm, json={"url": ""}).status_code == 200


def test_persistence_and_separate_rooms(tmp_path):
    client, path, gm, player = new_game(tmp_path)
    assert client.put(path + "/notes", headers=gm, json={"text": "Saved"}).status_code == 200
    reopened = TestClient(create_app(tmp_path / "test.sqlite3"))
    assert reopened.get(path, headers=player).json()["notes"] == "Saved"
    other = client.post("/api/rooms", json={"name": "Second"}).json()
    assert client.get("/api/rooms/" + other["room_id"], headers=gm).status_code == 403


def test_static_app_served(tmp_path):
    client, _, _, _ = new_game(tmp_path)
    response = client.get("/")
    assert response.status_code == 200
    assert "Adventure Table" in response.text
    assert response.headers["referrer-policy"] == "no-referrer"
    assert client.get("/static/app.js").status_code == 200


def test_simultaneous_updates_do_not_lose_rolls(tmp_path):
    client, path, _, player = new_game(tmp_path)
    roll = {"player": "Party", "count": 1, "sides": 20, "modifier": 0}
    with ThreadPoolExecutor(max_workers=8) as pool:
        statuses = list(pool.map(lambda _: client.post(path + "/rolls", headers=player, json=roll).status_code, range(20)))
    assert statuses == [200] * 20
    assert len(client.get(path, headers=player).json()["rolls"]) == 20

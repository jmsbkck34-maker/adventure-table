import https from "https";
import { Request, Response } from "express";
import Controller, { Methods } from "./Controller";

/**
 * Fetches a public D&D Beyond character for the import feature.
 *
 * D&D Beyond does not send CORS headers, so browsers can't read the character
 * JSON directly. This route only accepts a numeric character ID and only ever
 * calls D&D Beyond's character service, so it can't be used as an open proxy.
 * The endpoint is unofficial and undocumented; it may change or stop working.
 */
const CHARACTER_URL = "https://character-service.dndbeyond.com/character/v5/character/";
const TIMEOUT_MS = 10000;
const MAX_BYTES = 5 * 1024 * 1024;
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

type FetchResult = { status: number; body: string };

function fetchCharacter(id: string): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    const request = https.get(
      CHARACTER_URL + id,
      {
        headers: { Accept: "application/json", "User-Agent": "AdventureTable/1.0" },
        timeout: TIMEOUT_MS,
      },
      (response) => {
        let size = 0;
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            request.destroy(new Error("Response too large"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () =>
          resolve({
            status: response.statusCode || 500,
            body: Buffer.concat(chunks).toString("utf8"),
          })
        );
        response.on("error", reject);
      }
    );
    request.on("timeout", () => request.destroy(new Error("Timed out")));
    request.on("error", reject);
  });
}

export default class DndBeyondController extends Controller {
  path = "/dndbeyond";

  private requests = new Map<string, number[]>();

  routes = [
    {
      path: "/character/:id",
      method: Methods.GET,
      handler: this.handleCharacter.bind(this),
      localMiddleware: [],
    },
  ];

  private isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (this.requests.get(key) || []).filter(
      (time) => now - time < WINDOW_MS
    );
    recent.push(now);
    this.requests.set(key, recent);
    if (this.requests.size > 10000) {
      // Drop the oldest entries so memory can't grow without bound
      const oldest = this.requests.keys().next().value;
      if (oldest !== undefined) {
        this.requests.delete(oldest);
      }
    }
    return recent.length > MAX_REQUESTS_PER_WINDOW;
  }

  async handleCharacter(req: Request, res: Response): Promise<void> {
    res.set("Cache-Control", "no-store");
    const { id } = req.params;
    if (!/^\d{1,12}$/.test(id)) {
      res.status(400).json({ error: "That isn't a valid D&D Beyond character ID." });
      return;
    }
    if (this.isRateLimited(req.ip || "unknown")) {
      res.status(429).json({ error: "Too many imports. Wait a minute and try again." });
      return;
    }
    try {
      const result = await fetchCharacter(id);
      if (result.status === 403 || result.status === 404) {
        res.status(404).json({
          error:
            "D&D Beyond didn't share that character. Check the link, and in D&D Beyond set the character's privacy to Public.",
        });
        return;
      }
      if (result.status !== 200) {
        res.status(502).json({
          error: `D&D Beyond returned an error (${result.status}). Try again later, or paste the character JSON instead.`,
        });
        return;
      }
      const json = JSON.parse(result.body);
      if (!json?.success || !json?.data) {
        res.status(502).json({ error: "D&D Beyond sent data this app couldn't read." });
        return;
      }
      res.json({ data: json.data });
    } catch (error) {
      console.error("D&D Beyond import failed", error);
      res.status(502).json({
        error: "Couldn't reach D&D Beyond. Try again later, or paste the character JSON instead.",
      });
    }
  }
}

// src/pages/api/my-list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@/lib/db";
import { getVisitorId } from "@/lib/visitor";

function parseMovieId(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const visitorId = getVisitorId(req, res);

  try {
    if (req.method === "GET") {
      const rows = await sql<{ movie_id: number }[]>`
        select movie_id from my_list where visitor_id = ${visitorId}
      `;
      return res.status(200).json({ ids: rows.map((r) => r.movie_id) });
    }

    if (req.method === "POST") {
      const movieId = parseMovieId(req.body?.movieId);
      if (movieId === null) {
        return res
          .status(400)
          .json({ error: "movieId must be a positive integer" });
      }
      await sql`
        insert into my_list (visitor_id, movie_id)
        values (${visitorId}, ${movieId})
        on conflict do nothing
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const movieId = parseMovieId(req.query.movieId);
      if (movieId === null) {
        return res
          .status(400)
          .json({ error: "movieId must be a positive integer" });
      }
      await sql`
        delete from my_list
        where visitor_id = ${visitorId} and movie_id = ${movieId}
      `;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[api/my-list] query failed:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

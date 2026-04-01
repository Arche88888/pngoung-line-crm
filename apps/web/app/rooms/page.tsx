import Link from "next/link";
import { getRooms } from "../../lib/api";
import { ScoreBadge } from "../../components/score-badge";

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="shell">
      <main>
        <section className="section-header">
          <div>
            <h1 style={{ margin: 0 }}>Rooms</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              ภาพรวมของแต่ละห้องที่ระบบ ingest เข้ามาแล้ว
            </p>
          </div>
        </section>

        <section className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Type</th>
                <th>Sentiment</th>
                <th>Intent</th>
                <th>Stage</th>
                <th>Tags</th>
                <th>Last Message</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <Link href={`/rooms/${encodeURIComponent(room.id)}`}>
                      <strong>{room.name}</strong>
                    </Link>
                    <div className="muted">{room.messageCount} messages</div>
                  </td>
                  <td>{room.sourceType}</td>
                  <td><ScoreBadge card={room.sentiment} /></td>
                  <td><ScoreBadge card={room.purchaseIntent} /></td>
                  <td>{room.pipelineStage}</td>
                  <td>
                    <div className="tag-list">
                      {room.tags.length > 0 ? room.tags.map((tag: string) => <span className="tag" key={tag}>{tag}</span>) : <span className="muted">-</span>}
                    </div>
                  </td>
                  <td>
                    <div>{room.lastMessagePreview || "-"}</div>
                    <div className="muted">{room.lastMessageAt ?? "-"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import { getContacts } from "../../lib/api";
import { ScoreBadge } from "../../components/score-badge";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="shell">
      <main>
        <section className="section-header">
          <div>
            <h1 style={{ margin: 0 }}>Contacts</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              ลูกค้าที่ถูกสร้างจาก event ของ LINE อัตโนมัติ
            </p>
          </div>
        </section>

        <section className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Sentiment</th>
                <th>Intent</th>
                <th>Stage</th>
                <th>Rooms</th>
                <th>Tags</th>
                <th>Last Message</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <Link href={`/contacts/${encodeURIComponent(contact.id)}`}>
                      <strong>{contact.displayName}</strong>
                    </Link>
                    <div className="muted">{contact.totalMessages} messages</div>
                  </td>
                  <td><ScoreBadge card={contact.sentiment} /></td>
                  <td><ScoreBadge card={contact.purchaseIntent} /></td>
                  <td>{contact.pipelineStage}</td>
                  <td>{contact.roomIds.length}</td>
                  <td>
                    <div className="tag-list">
                      {contact.tags.length > 0 ? contact.tags.map((tag: string) => <span className="tag" key={tag}>{tag}</span>) : <span className="muted">-</span>}
                    </div>
                  </td>
                  <td>{contact.lastMessageAt ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

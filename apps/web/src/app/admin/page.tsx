import { countUsers, recentAuditLogs } from '@/features/admin/audit';

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
});

export default async function AdminPage() {
  const [users, logs] = await Promise.all([countUsers(), recentAuditLogs()]);

  return (
    <div className="stack">
      <h1 className="title">Ringkasan</h1>
      <section className="glass card">
        <p className="muted">Pengguna terdaftar</p>
        <p className="title">{users.toLocaleString('id-ID')}</p>
      </section>
      <section className="glass card stack">
        <div>
          <h2>Audit log</h2>
          <p className="muted">Tidak bisa diubah atau dihapus, termasuk oleh admin.</p>
        </div>
        {logs.length === 0 ? (
          <p className="muted">Belum ada aksi admin.</p>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Aksi</th>
                  <th>Target</th>
                  <th>Alasan</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{dateFormat.format(new Date(log.created_at))}</td>
                    <td>{log.action}</td>
                    <td>{[log.target_type, log.target_id].filter(Boolean).join(' · ') || '—'}</td>
                    <td>{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

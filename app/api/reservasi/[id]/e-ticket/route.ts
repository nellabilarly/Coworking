import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { readReservations } from "@/lib/reservasi-store";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [reservations, spaces] = await Promise.all([
    readReservations(),
    readSpaces(),
  ]);
  const reservation = reservations.find(
    (item) => String(item.id) === String(id),
  );

  if (!reservation) {
    return NextResponse.json(
      { message: "Reservasi tidak ditemukan." },
      { status: 404 },
    );
  }

  const space = spaces.find(
    (item) => String(item.id) === String(reservation.id_space),
  );
  const invoice = `LCZ-${new Date().getFullYear()}-${reservation.id}`;
  const totalBayar =
    Number(reservation.total_bayar || 0) ||
    Number(space?.harga_per_jam || 0) * Number(reservation.durasi_jam || 0);
  const ticketData = {
    invoice,
    reservation,
    space: space || null,
    total_bayar: totalBayar,
    issued_at: new Date().toISOString(),
  };

  if (_request.headers.get("accept")?.includes("text/html")) {
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({ invoice, reservation_id: reservation.id }),
    );
    const escapeHtml = (value: unknown) =>
      String(value ?? "-").replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] || character);

    const formattedDate = reservation.tanggal || reservation.tanggal_pinjam || "-";
    const formattedTime = reservation.jam_mulai
      ? `${reservation.jam_mulai}${reservation.jam_selesai ? ` - ${reservation.jam_selesai}` : ""}`
      : "-";
    const formattedDuration = reservation.durasi_jam ? `${reservation.durasi_jam} jam` : "-";
    const reservationName = reservation.nama_member || reservation.nama || "Member";
    const reservationEmail = reservation.email || reservation.email_member || "-";
    const statusText = String(reservation.status || "Pending");
    const issuedAt = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const dataRows = [
      ["Pemesan", reservationName],
      ["Email pemesan", reservationEmail],
      ["Tanggal", formattedDate],
      ["Jam", formattedTime],
      ["Durasi", formattedDuration],
    ]
      .map(
        ([label, value]) => `
          <article class="card">
            <p class="label">${escapeHtml(label)}</p>
            <p class="value">${escapeHtml(value)}</p>
          </article>`,
      )
      .join("");

    return new NextResponse(
      `<!doctype html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>E-Ticket ${escapeHtml(invoice)}</title>
          <style>
            :root {
              --bg: #f5f0e7;
              --paper: #ffffff;
              --ink: #26362e;
              --muted: #5e6c74;
              --line: #d8e1e7;
              --accent: #eaf4f5;
              --accent-strong: #3368a0;
            }

            * { box-sizing: border-box; }

            body {
              margin: 0;
              min-height: 100vh;
              padding: 24px 16px;
              background: var(--bg);
              color: var(--ink);
              font-family: Arial, Helvetica, sans-serif;
            }

            .page-shell {
              width: min(760px, 100%);
              margin: 0 auto;
            }

            .actions { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 16px; }

            .action {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-height: 40px;
              padding: 0 18px;
              border: 1px solid var(--line);
              border-radius: 8px;
              background: #fff;
              color: var(--ink);
              font-size: 13px;
              font-weight: 700;
              text-decoration: none;
              cursor: pointer;
            }

            .action.primary { border-color: var(--accent-strong); background: var(--accent-strong); color: #fff; }

            .ticket {
              width: 100%;
              background: var(--paper);
              border: 1px solid var(--line);
              border-radius: 4px;
              overflow: hidden;
              box-shadow: 0 12px 30px rgba(38, 54, 46, 0.1);
            }

            .topbar { padding: 14px 28px; border-bottom: 1px solid var(--line); }

            .topbar > div { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; }

            .brand { display: flex; align-items: baseline; gap: 8px; justify-self: start; white-space: nowrap; }

            .eyebrow {
              margin: 0;
              font-size: 8px;
              font-weight: 700;
              letter-spacing: 0.18em;
              text-transform: uppercase;
              color: var(--accent-strong);
            }

            .brand-name {
              margin: 0;
              font-size: 9px;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: var(--muted);
            }

            h1 {
              margin: 0;
              color: var(--ink);
              font-size: clamp(18px, 2.5vw, 26px);
              line-height: 1.1;
              letter-spacing: -0.03em;
              text-align: center;
            }

            .chip { display: inline-flex; align-items: center; justify-self: end; gap: 8px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; background: var(--accent); color: var(--accent-strong); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }

            .chip strong {
              color: var(--ink);
              letter-spacing: 0.08em;
            }

            .qr-wrap { display: grid; place-items: center; width: 196px; height: 196px; padding: 14px; border: 1px solid var(--line); border-radius: 6px; background: #fff; }

            .qr-wrap img {
              width: 100%;
              height: 100%;
              border-radius: 2px;
              display: block;
            }

            .content { padding: 0 28px 16px; }

            .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--line); }

            .card { padding: 8px 2px; border-bottom: 1px solid var(--line); }

            .card .label { margin: 0; color: var(--accent-strong); font-size: 8px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }

            .card .value { margin: 5px 0 0; color: var(--ink); font-size: clamp(12px, 1.5vw, 15px); font-weight: 700; line-height: 1.3; }

            .card .subvalue { margin: 5px 0 0; color: var(--muted); font-size: 9px; }

            .wide { grid-column: 1 / -1; }

            .qr-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 18px;
              text-align: center;
              background: #fff;
              border: 1px solid var(--line);
              border-radius: 5px;
              margin: 18px 28px 0;
            }

            .qr-code {
              margin: 8px 0 0;
              color: var(--accent-strong);
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.08em;
            }

            .status-card {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              flex-wrap: wrap;
              background: var(--accent);
              border: 1px solid var(--line);
              border-radius: 5px;
              padding: 12px 14px;
            }

            .status-pill {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 8px 12px;
              border-radius: 999px;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              background: #fff;
              color: var(--accent-strong);
              margin-left: auto;
              white-space: nowrap;
            }

            .footer {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 12px 28px;
              color: var(--muted);
              border-bottom: 1px solid var(--line);
            }

            .issued {
              font-size: 9px;
            }

            @media (max-width: 620px) {
              body { padding: 16px; }
              .actions { width: 100%; }
              .topbar { padding: 14px 16px; }
              .topbar > div { grid-template-columns: 1fr; gap: 8px; }
              .brand, .chip { justify-self: center; }
              .qr-wrap { width: 176px; height: 176px; }
              .detail-grid { grid-template-columns: 1fr; }
              .footer { flex-direction: column; align-items: flex-start; }
              .qr-card { margin-right: 16px; margin-left: 16px; }
            }

            @media print {
              body {
                background: #fff;
                padding: 0;
              }

              .actions { display: none; }

              .ticket {
                width: 100%;
                max-width: none;
                border: 0;
                border-radius: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-shell">
            <nav class="actions" aria-label="Ticket actions">
              <a class="action" href="/member/spaces">Kembali ke beranda</a>
              <button class="action primary" type="button" onclick="window.print()">Cetak</button>
            </nav>

            <main class="ticket">
              <section class="topbar">
                <div>
                  <div class="brand">
                    <p class="eyebrow">Locazyy</p>
                    <p class="brand-name">Coworking Space</p>
                  </div>
                  <h1>${escapeHtml(space?.nama_space || "Ruang coworking")}</h1>
                  <span class="chip">
                    Booking <strong>${escapeHtml(invoice)}</strong>
                  </span>
                </div>
              </section>

              <section class="qr-card">
                <div class="qr-wrap">
                  <img src="${qrCode}" alt="QR Code e-ticket" />
                </div>
                <p class="qr-code">BOOKING ${escapeHtml(invoice)}</p>
                <p class="subvalue">
                  Tunjukkan QR Code ini kepada petugas resepsionis saat check-in.
                </p>
              </section>

              <footer class="footer">
                <div class="issued">Diterbitkan: ${escapeHtml(issuedAt)}</div>
              </footer>

              <section class="content">
                <div class="detail-grid">
                  ${dataRows}

                  <article class="card wide status-card">
                    <div>
                      <p class="label">Status reservasi</p>
                      <p class="value">${escapeHtml(statusText)}</p>
                    </div>
                    <span class="status-pill">Check-in ready</span>
                  </article>

                  <article class="card wide">
                    <p class="label">Total pembayaran</p>
                    <p class="value">
                      Rp ${Number(totalBayar).toLocaleString("id-ID")}
                    </p>
                    <p class="subvalue">
                      Sudah termasuk biaya sewa ruang yang dipilih.
                    </p>
                  </article>
                </div>
              </section>
            </main>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  return NextResponse.json({
    message: "OK",
    data: ticketData,
  });
}

import { useEffect, useState } from 'react';
import { KNOBZ_CERTIFICATES, getCertificate as getStaticCertificate } from '../constants';
import type { KnobzCertificate } from '../types';

// Live certificate list from KnobzToLearn's Supabase `certificate_programmes` table.
// Editing a row there updates PathHer on the next page load. The built-in
// KNOBZ_CERTIFICATES list is shown until the live list arrives, and stays if
// the table can't be reached.

const LEVELS: KnobzCertificate['level'][] = ['Beginner', 'Intermediate', 'Advanced'];

/** Keeps only well-formed rows; returns null when nothing usable came back. */
export function parseCertificateRows(rows: unknown): KnobzCertificate[] | null {
  if (!Array.isArray(rows)) return null;
  const certificates: KnobzCertificate[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const number = r.number;
    const title = typeof r.title === 'string' ? r.title.trim() : '';
    const description = typeof r.description === 'string' ? r.description.trim() : '';
    const level = r.level as KnobzCertificate['level'];
    if (typeof number !== 'number' || !Number.isInteger(number) || number < 1) continue;
    if (!title || !description || !LEVELS.includes(level)) continue;
    certificates.push({
      number,
      title,
      subtitle: typeof r.subtitle === 'string' ? r.subtitle.trim() : '',
      description,
      level,
      modules: typeof r.modules === 'number' && r.modules >= 0 ? r.modules : 0,
    });
  }
  return certificates.length ? certificates : null;
}

/** Finds a certificate, falling back to the built-in list if the live one lacks it. */
export function findCertificate(list: KnobzCertificate[], number: number): KnobzCertificate | undefined {
  return list.find(c => c.number === number) ?? KNOBZ_CERTIFICATES.find(c => c.number === number);
}

let cached: KnobzCertificate[] | null = null;
let pending: Promise<KnobzCertificate[]> | null = null;

export function loadKnobzCertificates(): Promise<KnobzCertificate[]> {
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;

  const url = import.meta.env?.VITE_KNOBZ_SUPABASE_URL;
  const key = import.meta.env?.VITE_KNOBZ_SUPABASE_ANON_KEY;
  if (!url || !key) return Promise.resolve(KNOBZ_CERTIFICATES);

  const endpoint =
    `${url.replace(/\/$/, '')}/rest/v1/certificate_programmes` +
    '?select=number,title,subtitle,description,level,modules&is_public=eq.true&order=position.asc,number.asc';

  pending = fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(5000),
  })
    .then(res => (res.ok ? res.json() : null))
    .then(rows => {
      const live = parseCertificateRows(rows);
      if (live) cached = live;
      return live ?? KNOBZ_CERTIFICATES;
    })
    .catch(() => KNOBZ_CERTIFICATES)
    .finally(() => {
      pending = null;
    });
  return pending;
}

/** Certificates to show: the built-in list at first, then the live list once loaded. */
export function useKnobzCertificates() {
  const [certificates, setCertificates] = useState<KnobzCertificate[]>(cached ?? KNOBZ_CERTIFICATES);

  useEffect(() => {
    let active = true;
    loadKnobzCertificates().then(list => {
      if (active) setCertificates(list);
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    certificates,
    // Career paths only point at certificates 1-4, which the built-in list always has.
    getCertificate: (number: number) => findCertificate(certificates, number) ?? getStaticCertificate(number),
  };
}

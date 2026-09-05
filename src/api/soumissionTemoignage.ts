/**
 * Soumission publique d'un témoignage depuis la vitrine.
 * Endpoint multipart : POST /api/v1/temoignages/submit/
 */

import { apiPostForm } from './client';

export interface SoumissionTemoignageInput {
  hcaptcha_token: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
  ville?: string;
  texte: string;
  langue: 'fr' | 'en';
  photos: File[];
  honeypot?: string; // toujours vide ; rempli = bot
}

export interface SoumissionTemoignageResponse {
  message: string;
  id: string;
}

export async function soumettreTemoignagePublic(
  input: SoumissionTemoignageInput,
): Promise<SoumissionTemoignageResponse> {
  const form = new FormData();
  form.append('hcaptcha_token', input.hcaptcha_token);
  form.append('prenom', input.prenom.trim());
  form.append('nom', input.nom.trim());
  if (input.email) form.append('email', input.email.trim());
  if (input.telephone) form.append('telephone', input.telephone.trim());
  if (input.ville) form.append('ville', input.ville.trim());
  form.append('texte', input.texte.trim());
  form.append('langue', input.langue);
  form.append('_hp', input.honeypot ?? '');
  input.photos.forEach((file) => form.append('photos', file));
  return apiPostForm<SoumissionTemoignageResponse>('/temoignages/submit/', form);
}

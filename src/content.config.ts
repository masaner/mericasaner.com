/**
 * Content schema — the single source of truth for everything shown on the site.
 *
 * Every user-facing string is bilingual: `{ en: '...', tr: '...' }`.
 * If a translation is missing or a date is malformed, `npm run build` fails
 * with a clear error, so a broken page can never be deployed.
 *
 * To update the site, edit the YAML files in `src/content/` — see docs/UPDATING.md.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A string translated into every supported locale. */
const localized = z.object({ en: z.string().min(1), tr: z.string().min(1) });

/** Year-month string, e.g. "2025-12". */
const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use the format YYYY-MM, e.g. 2025-12');

const profile = defineCollection({
  loader: file('src/content/profile.yaml'),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    initials: z.string().max(3),
    title: localized,
    /** Wrap the highlighted part in *asterisks*. */
    headline: localized,
    /** `{years}` is replaced with the auto-computed years of experience. */
    lede: localized,
    location: localized,
    timezone: z.string(),
    email: z.email(),
    openToWork: z.boolean(),
    /** First month of professional experience — years of experience are computed from this. */
    careerStart: yearMonth,
    /** Optional file name inside `src/assets/` (e.g. "profile.jpg"). Falls back to initials. */
    photo: z.string().optional(),
    cv: z.object({ en: z.string(), tr: z.string() }).optional(),
    links: z.object({
      linkedin: z.url(),
      github: z.url().optional(),
      trailhead: z.url().optional(),
    }),
    about: z.object({ en: z.array(z.string()).min(1), tr: z.array(z.string()).min(1) }),
    languages: z.array(z.object({ name: localized, level: localized })),
    /** Salesforce-style “record” card shown in the hero. */
    recordFields: z.array(z.object({ label: localized, value: localized })),
    /** Career path shown as an SLDS Path. The last step is treated as the current one. */
    careerPath: z.array(localized).min(1),
    stats: z.array(z.object({ value: z.string(), label: localized })).max(4),
    seo: z.object({ description: localized }),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    url: z.url().optional(),
    role: localized,
    employment: z.enum(['full-time', 'contract', 'part-time', 'internship']).default('full-time'),
    start: yearMonth,
    /** Omit (or set to null) for your current role — it will display as “Present”. */
    end: yearMonth.nullable().optional(),
    location: localized,
    context: localized,
    highlights: z.array(localized).min(1),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/projects' }),
  schema: z.object({
    title: localized,
    org: z.string(),
    period: z.string(),
    /** Lower numbers are shown first. */
    order: z.number().int(),
    featured: localized.optional(),
    challenge: localized,
    contribution: localized,
    outcome: localized,
    tags: z.array(z.string()).default([]),
    link: z.url().optional(),
  }),
});

const certifications = defineCollection({
  loader: file('src/content/certifications.yaml'),
  schema: z.object({
    name: z.string(),
    issuer: z.string().optional(),
    kind: z.enum(['certification', 'course']),
    date: yearMonth.optional(),
    /** Public verification link (e.g. Salesforce Credential Verification / Trailhead). */
    url: z.url().optional(),
  }),
});

const skills = defineCollection({
  loader: file('src/content/skills.yaml'),
  schema: z.object({
    group: localized,
    order: z.number().int(),
    items: z.array(z.string()).min(1),
  }),
});

export const collections = { profile, experience, projects, certifications, skills };

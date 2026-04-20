#!/usr/bin/env node
/**
 * Builds src/data/brazil-medicine-institutions.json from INEP Censo da Educação Superior microdados.
 *
 * 1. Download the official ZIP (example2024):
 *    https://download.inep.gov.br/microdados/microdados_censo_da_educacao_superior_2024.zip
 * 2. Unzip somewhere, then run:
 *    node scripts/build-medicine-ies.mjs /path/to/microdados_censo_da_educacao_superior_2024/dados
 *
 * Filters cursos where NO_CURSO === "Medicina" (CINE 0912 — excludes Biomedicina / Medicina Veterinária).
 */

import { createReadStream, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline";

const CURSOS_FILE = "MICRODADOS_CADASTRO_CURSOS_2024.CSV";
const IES_FILE = "MICRODADOS_ED_SUP_IES_2024.CSV";

const IDX = {
  curso: { coIes: 15, noCurso: 16 },
  ies: { coIes: 20, noIes: 21 },
};

function splitCsvLine(line) {
  return line.split(";");
}

async function collectMedicineCoIes(dadosDir) {
  const path = resolve(dadosDir, CURSOS_FILE);
  const rl = readline.createInterface({
    input: createReadStream(path, { encoding: "latin1" }),
    crlfDelay: Infinity,
  });

  let lineNum = 0;
  const coIesSet = new Set();
  for await (const line of rl) {
    lineNum += 1;
    if (lineNum === 1) continue;
    const p = splitCsvLine(line);
    if (p[IDX.curso.noCurso] !== "Medicina") continue;
    const co = p[IDX.curso.coIes];
    if (co) coIesSet.add(co);
  }
  return coIesSet;
}

async function mapCoIesToNames(dadosDir, coIesSet) {
  const path = resolve(dadosDir, IES_FILE);
  const rl = readline.createInterface({
    input: createReadStream(path, { encoding: "latin1" }),
    crlfDelay: Infinity,
  });

  let lineNum = 0;
  const names = new Set();
  for await (const line of rl) {
    lineNum += 1;
    if (lineNum === 1) continue;
    const p = splitCsvLine(line);
    const co = p[IDX.ies.coIes];
    if (!coIesSet.has(co)) continue;
    const no = (p[IDX.ies.noIes] ?? "").trim();
    if (no) names.add(no);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

async function main() {
  const dadosDir = process.argv[2];
  if (!dadosDir) {
    console.error("Usage: node scripts/build-medicine-ies.mjs <path-to-microdados/.../dados>");
    process.exit(1);
  }

  const coIesSet = await collectMedicineCoIes(dadosDir);
  const names = await mapCoIesToNames(dadosDir, coIesSet);

   const outDir = resolve(process.cwd(), "src/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "brazil-medicine-institutions.json");
  const payload = {
    _meta: {
      source: "INEP — Censo da Educação Superior 2024 (MICRODADOS_CADASTRO_CURSOS + MICRODADOS_ED_SUP_IES)",
      filter: 'NO_CURSO === "Medicina"',
      generatedAt: new Date().toISOString().slice(0, 10),
      count: names.length,
    },
    institutions: names,
  };

  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.error(`Wrote ${names.length} institutions to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import raw from "@/data/brazil-medicine-institutions.json";

export const MEDICINE_INSTITUTIONS: readonly string[] = raw.institutions;

const medicineSet = new Set(MEDICINE_INSTITUTIONS);

const santaCasaMedicinaSp = MEDICINE_INSTITUTIONS.find(
  (n) => n.includes("SANTA CASA") && n.includes("SÃO PAULO") && n.includes("MÉDICAS"),
);

/** Highlighted entries (order preserved); only names that exist in the census extract are kept. */
const PRINCIPAIS_ORDER = [
  "UNIVERSIDADE DE SÃO PAULO",
  "UNIVERSIDADE ESTADUAL DE CAMPINAS",
  "UNIVERSIDADE FEDERAL DE SÃO PAULO",
  "UNIVERSIDADE FEDERAL DO RIO DE JANEIRO",
  "UNIVERSIDADE FEDERAL DE MINAS GERAIS",
  "UNIVERSIDADE FEDERAL DO RIO GRANDE DO SUL",
  "UNIVERSIDADE FEDERAL DO PARANÁ",
  "UNIVERSIDADE FEDERAL DE SANTA CATARINA",
  "UNIVERSIDADE DE BRASÍLIA",
  "UNIVERSIDADE FEDERAL DO CEARÁ",
  "UNIVERSIDADE FEDERAL DE PERNAMBUCO",
  "UNIVERSIDADE FEDERAL DA BAHIA",
  "UNIVERSIDADE ESTADUAL PAULISTA JÚLIO DE MESQUITA FILHO",
  "PONTIFÍCIA UNIVERSIDADE CATÓLICA DE SÃO PAULO",
  ...(santaCasaMedicinaSp ? [santaCasaMedicinaSp] : []),
  "Faculdade Israelita de Ciências da Saúde Albert Einstein",
];

export const PRINCIPAIS_FACULDADES: readonly string[] = PRINCIPAIS_ORDER.filter((n) => medicineSet.has(n));

const principaisSet = new Set(PRINCIPAIS_FACULDADES);

export const OUTRAS_MEDICINA_INSTITUTIONS: readonly string[] = MEDICINE_INSTITUTIONS.filter(
  (n) => !principaisSet.has(n),
);

export function isListedMedicineInstitution(name: string): boolean {
  return medicineSet.has(name.trim());
}

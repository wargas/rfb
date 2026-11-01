export const config = {
  tetoINSS: 8475.55,
  tetoRemuneratorio: 46366.19,
  bepIntegral: 11500,
  auxilioAlimentacao: 1192,
  percentualInsalubridade: 0.10,
  valorDiaFronteira: 91,
  "tabela": {
    "ESPECIAL-III": 32504.91,
    "ESPECIAL-II": 31601.86,
    "ESPECIAL-I": 31043.08,
    "PRIMEIRA-III": 26846.11,
    "PRIMEIRA-II": 26319.73,
    "PRIMEIRA-I": 25297.70,
    "SEGUNDA-III": 24324.71,
    "SEGUNDA-II": 23847.76,
    "SEGUNDA-I": 22921.71,
  },
  // Lei 13.464/2017, Anexo III, tabela "a" (TA = tempo no cargo, em meses)
  "faixas_bep": {
    "0": { label: "TA ≤ 12 (0%)", percentual: 0 },
    "50": { label: "12 < TA ≤ 24 (50%)", percentual: 0.5 },
    "75": { label: "24 < TA ≤ 36 (75%)", percentual: 0.75 },
    "100": { label: "TA > 36 (100%)", percentual: 1 },
  },
  "faixas_pss": [
    { ate: 1621.00, aliquota: 0.075 },
    { ate: 2902.84, aliquota: 0.09 },
    { ate: 4354.27, aliquota: 0.12 },
    { ate: 8475.55, aliquota: 0.14 },
    { ate: 14514.30, aliquota: 0.145 },
    { ate: 29028.57, aliquota: 0.165 },
    { ate: 56605.73, aliquota: 0.19 },
    { ate: Infinity, aliquota: 0.22 },
  ]
}

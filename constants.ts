import { LotteryGame, LotteryResult } from './types';

export const TIMES_TIMEMANIA = [
  "ABC/RN", "AMÉRICA/MG", "AMÉRICA/RN", "AMÉRICA/RJ", "AMERICANO/RJ", "ATLÉTICO/GO", "ATLÉTICO/MG", "ATLÉTICO/PR",
  "AVAÍ/SC", "BAHIA/BA", "BANGU/RJ", "BARUERI/SP", "BOTAFOGO/PB", "BOTAFOGO/RJ", "BOTAFOGO/SP", "BRAGANTINO/SP",
  "BRASILIENSE/DF", "CEARÁ/CE", "CORINTHIANS/SP", "CORITIBA/PR", "CRB/AL", "CRICIÚMA/SC", "CRUZEIRO/MG", "CS ALAGOANO/AL",
  "DESPORTIVA/ES", "FIGUEIRENSE/SC", "FLAMENGO/RJ", "FLUMINENSE/RJ", "FORTALEZA/CE", "GAMA/DF", "GOIÁS/GO", "GRÊMIO/RS",
  "GUARANI/SP", "INTER LIMEIRA/SP", "INTERNACIONAL/RS", "IPATINGA/MG", "ITUANO/SP", "JI-PARANÁ/RO", "JOINVILLE/SC",
  "JUVENTUDE/RS", "JUVENTUS/SP", "LONDRINA/PR", "MARÍLIA/SP", "MIXTO/MT", "MOTO CLUBE/MA", "NACIONAL/AM", "NÁUTICO/PE",
  "OPERÁRIO/MS", "PAISANDU/PA", "PALMEIRAS/SP", "PARANÁ/PR", "PAULISTA/SP", "PAYSSANDU/PA", "PONTE PRETA/SP", "PORTUGUESA/SP",
  "REMO/PA", "RIO BRANCO/AC", "RIO BRANCO/ES", "RIVER/PI", "RORAIMA/RR", "SAMPAIO CORRÊA/MA", "SANTA CRUZ/PE", "SANTO ANDRÉ/SP",
  "SANTOS/SP", "SÃO CAETANO/SP", "SÃO PAULO/SP", "SÃO RAIMUNDO/AM", "SERGIPE/SE", "SPORT/PE", "TREZE/PB", "TUNA LUSO/PA",
  "UBERLÂNDIA/MG", "UNIÃO BARBARENSE/SP", "UNIÃO SÃO JOÃO/SP", "VASCO/RJ", "VILA NOVA/GO", "VILLA NOVA/MG", "VITÓRIA/BA",
  "XV DE PIRACICABA/SP", "YPIRANGA/AP"
];

export const GAMES: LotteryGame[] = [
  {
    id: 'mega-sena',
    name: 'Mega-Sena',
    minNumber: 1,
    maxNumber: 60,
    minCount: 6,
    defaultCount: 6,
    maxCount: 20,
    color: 'emerald',
    icon: { type: 'sprite', yOffset: 0 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx',
    selectionHint: 'Escolha de 6 a 20 numeros entre 1 e 60.',
  },
  {
    id: 'lotofacil',
    name: 'Lotofacil',
    minNumber: 1,
    maxNumber: 25,
    minCount: 15,
    defaultCount: 15,
    maxCount: 20,
    color: 'purple',
    icon: { type: 'sprite', yOffset: -45 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx',
    selectionHint: 'Escolha de 15 a 20 numeros entre 1 e 25.',
  },
  {
    id: 'quina',
    name: 'Quina',
    minNumber: 1,
    maxNumber: 80,
    minCount: 5,
    defaultCount: 5,
    maxCount: 15,
    color: 'blue',
    icon: { type: 'sprite', yOffset: -91 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Quina.aspx',
    selectionHint: 'Escolha de 5 a 15 numeros entre 1 e 80.',
  },
  {
    id: 'lotomania',
    name: 'Lotomania',
    minNumber: 0,
    maxNumber: 99,
    minCount: 50,
    defaultCount: 50,
    maxCount: 50,
    color: 'orange',
    icon: { type: 'sprite', yOffset: -136 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Lotomania.aspx',
    selectionHint: 'Jogo fixo: 50 numeros entre 00 e 99.',
  },
  {
    id: 'timemania',
    name: 'Timemania',
    minNumber: 1,
    maxNumber: 80,
    minCount: 10,
    defaultCount: 10,
    maxCount: 10,
    color: 'amber',
    icon: { type: 'sprite', yOffset: -181 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Timemania.aspx',
    selectionHint: 'Jogo fixo: 10 numeros e 1 Time do Coracao.',
    extraOptions: {
      label: 'Time do Coracao',
      options: TIMES_TIMEMANIA
    }
  },
  {
    id: 'dupla-sena',
    name: 'Dupla Sena',
    minNumber: 1,
    maxNumber: 50,
    minCount: 6,
    defaultCount: 6,
    maxCount: 15,
    color: 'rose',
    icon: { type: 'sprite', yOffset: -225 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Dupla-Sena.aspx',
    selectionHint: 'Escolha de 6 a 15 numeros entre 1 e 50.',
  },
  {
    id: 'dia-de-sorte',
    name: 'Dia de Sorte',
    minNumber: 1,
    maxNumber: 31,
    minCount: 7,
    defaultCount: 7,
    maxCount: 15,
    color: 'sky',
    icon: { type: 'sprite', yOffset: -403 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Dia-de-Sorte.aspx',
    selectionHint: 'Escolha de 7 a 15 numeros + 1 Mes de Sorte.',
    specialRange: {
      label: 'Mes de Sorte',
      min: 1,
      max: 12,
      count: 1,
      minCount: 1,
      maxCount: 1,
      defaultCount: 1,
      color: 'sky'
    }
  },
  {
    id: 'super-sete',
    name: 'Super Sete',
    minNumber: 0,
    maxNumber: 9,
    minCount: 7,
    defaultCount: 7,
    maxCount: 21,
    color: 'lime',
    icon: { type: 'sprite', yOffset: -446 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Super-Sete.aspx',
    selectionHint: 'Escolha de 7 a 21 dezenas no total, com limite por coluna.',
    allowRepeats: true,
  },
  {
    id: 'milionaria',
    name: '+Milionaria',
    minNumber: 1,
    maxNumber: 50,
    minCount: 6,
    defaultCount: 6,
    maxCount: 12,
    color: 'teal',
    icon: { type: 'image', imagePath: '/game-icons/trevo-home.png' },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Mais-Milionaria.aspx',
    selectionHint: 'Escolha de 6 a 12 numeros e de 2 a 6 trevos.',
    specialRange: {
      label: 'Trevos',
      min: 1,
      max: 6,
      count: 2,
      minCount: 2,
      maxCount: 6,
      defaultCount: 2,
      color: 'emerald'
    }
  },
  {
    id: 'federal',
    name: 'Loteria Federal',
    minNumber: 0,
    maxNumber: 9,
    minCount: 5,
    defaultCount: 5,
    maxCount: 5,
    color: 'indigo',
    icon: { type: 'sprite', yOffset: -269 },
    officialUrl: 'https://loterias.caixa.gov.br/Paginas/Federal.aspx',
    selectionHint: 'Geracao de bilhete com 5 digitos (0 a 9).',
    countLabel: 'digitos',
    allowRepeats: true,
  }
];
// Mock Data representing current real-world(ish) values for display
// Used as fallback if API fails
export const MOCK_RESULTS: LotteryResult[] = [
  {
    gameId: 'mega-sena',
    contestNumber: '2705',
    date: '26/03/2024',
    numbers: [2, 16, 22, 27, 35, 47],
    accumulated: true,
    nextPrize: 'R$ 120.000.000,00',
    nextDate: '29/03/2024'
  },
  {
    gameId: 'lotofacil',
    contestNumber: '3063',
    date: '26/03/2024',
    numbers: [1, 2, 5, 6, 7, 9, 10, 11, 12, 15, 16, 17, 20, 24, 25],
    accumulated: false,
    nextPrize: 'R$ 1.700.000,00',
    nextDate: '27/03/2024'
  },
  {
    gameId: 'quina',
    contestNumber: '6399',
    date: '26/03/2024',
    numbers: [12, 34, 45, 67, 78],
    accumulated: true,
    nextPrize: 'R$ 4.500.000,00',
    nextDate: '27/03/2024'
  },
  {
     gameId: 'timemania',
     contestNumber: '2070',
     date: '26/03/2024',
     numbers: [5, 12, 18, 23, 45, 67, 71],
     extraString: 'FLAMENGO/RJ',
     accumulated: true,
     nextPrize: 'R$ 23.000.000,00',
     nextDate: '28/03/2024'
  },
  {
    gameId: 'dia-de-sorte',
    contestNumber: '890',
    date: '26/03/2024',
    numbers: [3, 7, 11, 15, 19, 21, 25],
    specialNumbers: [5], // Maio
    accumulated: false,
    nextPrize: 'R$ 350.000,00',
    nextDate: '28/03/2024'
  },
  {
    gameId: 'milionaria',
    contestNumber: '132',
    date: '23/03/2024',
    numbers: [10, 15, 22, 33, 44, 48],
    specialNumbers: [2, 5],
    accumulated: true,
    nextPrize: 'R$ 162.000.000,00',
    nextDate: '27/03/2024'
  },
   {
    gameId: 'lotomania',
    contestNumber: '2598',
    date: '25/03/2024',
    numbers: [0, 5, 8, 12, 15, 23, 27, 34, 38, 42, 45, 51, 56, 62, 67, 71, 78, 83, 89, 95],
    accumulated: true,
    nextPrize: 'R$ 8.000.000,00',
    nextDate: '27/03/2024'
  }
];


export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'saved', label: 'Bilhetes', icon: 'Bookmark' },
  { id: 'results', label: 'Resultados', icon: 'BarChart' },
];

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];


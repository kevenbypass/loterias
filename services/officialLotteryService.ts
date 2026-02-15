import { LotteryResult } from "../types";
import { MOCK_RESULTS } from "../constants";

// Helper to format currency
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Mapping app Game IDs to API slugs
const API_SLUGS: Record<string, string> = {
  'mega-sena': 'megasena',
  'lotofacil': 'lotofacil',
  'quina': 'quina',
  'lotomania': 'lotomania',
  'timemania': 'timemania',
  'dupla-sena': 'duplasena',
  'dia-de-sorte': 'diadesorte',
  'super-sete': 'supersete',
  'milionaria': 'maismilionaria', // Check specific API slug
  'federal': 'federal'
};

interface ApiResponse {
  concurso: number;
  data: string;
  dezenas: string[];
  dezenasOrdemSorteio?: string[];
  trevos?: string[]; // For +Milionaria
  timeCoracao?: string; // For Timemania
  mesSorte?: string; // For Dia de Sorte
  acumulou: boolean;
  valorEstimadoProximoConcurso: number;
  dataProximoConcurso: string;
}

// Fetch individual game result
const fetchGameResult = async (gameId: string): Promise<LotteryResult | null> => {
  const apiSlug = API_SLUGS[gameId];
  if (!apiSlug) return null;

  try {
    // Using a common public wrapper for Loterias Caixa
    // Note: This is a third-party open source API widely used for React demos
    const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/${apiSlug}/latest`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: ApiResponse = await response.json();

    // Map API response to our internal type
    let numbers = data.dezenas.map(d => parseInt(d));
    let specialNumbers: number[] | undefined = undefined;
    let extraString: string | undefined = undefined;

    // Handle specific game logic
    if (gameId === 'milionaria' && data.trevos) {
       specialNumbers = data.trevos.map(t => parseInt(t));
    }

    if (gameId === 'dia-de-sorte' && data.mesSorte) {
       // Convert Month name to number if needed or handle mapping
       // The API usually returns the name "Maio", we might need to map it back or just display it
       // For this implementation, we will keep the month logic visually separate in the UI if it's not a number
       // But wait, our components expect numbers for specialNumbers to map to names.
       // The API returns "Maio". Let's try to map it back to 5.
       const months = [
         "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
         "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
       ];
       const monthIdx = months.findIndex(m => m.toLowerCase() === data.mesSorte?.toLowerCase());
       if (monthIdx !== -1) {
           specialNumbers = [monthIdx + 1];
       }
    }

    if (gameId === 'timemania' && data.timeCoracao) {
        extraString = data.timeCoracao;
    }

    return {
      gameId,
      contestNumber: data.concurso.toString(),
      date: data.data,
      numbers,
      specialNumbers,
      extraString,
      accumulated: data.acumulou,
      nextPrize: formatCurrency(data.valorEstimadoProximoConcurso),
      nextDate: data.dataProximoConcurso
    };

  } catch (error) {
    console.warn(`Failed to fetch official results for ${gameId}, using mock.`, error);
    return null;
  }
};

export const fetchAllResults = async (): Promise<LotteryResult[]> => {
  // We fetch all supported games in parallel
  // We exclude 'federal' from the main view often because structure is different, but let's try to include
  const gamesToFetch = Object.keys(API_SLUGS);
  
  const results = await Promise.all(
    gamesToFetch.map(async (gameId) => {
      const liveData = await fetchGameResult(gameId);
      if (liveData) return liveData;
      
      // Fallback to mock data if API fails
      const mock = MOCK_RESULTS.find(m => m.gameId === gameId);
      return mock || null;
    })
  );

  return results.filter((r): r is LotteryResult => r !== null);
};
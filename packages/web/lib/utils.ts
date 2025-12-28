/**
 * Formatea un porcentaje de manera inteligente
 * Si es 100%, devuelve "100%" sin decimales
 * Si es menos del 100%, devuelve con 1 decimal (ej: "95.7%")
 */
export function formatPercentage(value: number): string {
  // Redondear a 1 decimal
  const rounded = Math.round(value * 10) / 10;
  
  // Si es exactamente 100, devolver sin decimales
  if (rounded === 100) {
    return '100%';
  }
  
  // Si es 0, devolver "0%"
  if (rounded === 0) {
    return '0%';
  }
  
  // Resto: con 1 decimal
  return `${rounded.toFixed(1)}%`;
}

/**
 * Aleatoriza un array usando el algoritmo Fisher-Yates
 * @param array Array a aleatorizar
 * @returns Nuevo array con los elementos en orden aleatorio
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Aleatoriza las opciones de una pregunta manteniendo las respuestas correctas sincronizadas
 * @param question Pregunta a aleatorizar
 * @returns Nueva pregunta con opciones en orden aleatorio
 */
export function shuffleQuestionOptions<T extends { options: any[]; correct_answer_ids: string[] }>(
  question: T
): T {
  // No aleatorizar si no hay opciones
  if (!question.options || question.options.length === 0) {
    return question;
  }

  // Aleatorizar las opciones
  const shuffledOptions = shuffleArray(question.options);

  // Devolver nueva pregunta con opciones aleatorizadas
  // correct_answer_ids permanece igual porque las opciones mantienen sus IDs
  return {
    ...question,
    options: shuffledOptions,
  };
}

/**
 * Aleatoriza tanto el orden de las preguntas como las opciones de cada pregunta
 * @param questions Array de preguntas a aleatorizar
 * @returns Nuevo array con preguntas y opciones aleatorizadas
 */
export function shuffleQuestionsAndOptions<T extends { options: any[]; correct_answer_ids: string[] }>(
  questions: T[]
): T[] {
  // Primero aleatorizar el orden de las preguntas
  const shuffledQuestions = shuffleArray(questions);
  
  // Luego aleatorizar las opciones de cada pregunta
  return shuffledQuestions.map(q => shuffleQuestionOptions(q));
}

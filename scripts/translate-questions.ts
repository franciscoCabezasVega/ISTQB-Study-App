/**
 * Script para traducir preguntas existentes al inglés
 * 
 * Este script:
 * 1. Obtiene todas las preguntas que no tienen traducción al inglés
 * 2. Para cada pregunta, genera una traducción (puede integrarse con OpenAI/Claude)
 * 3. Actualiza la base de datos con las traducciones
 * 
 * Uso:
 * - Configurar las variables de entorno de Supabase
 * - Opcionalmente configurar API key de OpenAI/Claude para traducción automática
 * - Ejecutar: tsx scripts/translate-questions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface QuestionToTranslate {
  id: string;
  title_es: string;
  description_es: string;
  options_es: any;
  explanation_es: string;
  topic: string;
  difficulty: string;
}

/**
 * Función para traducir texto usando IA (placeholder)
 * TODO: Integrar con OpenAI, Claude, o Google Translate API
 */
async function translateText(text: string, context: string = ''): Promise<string> {
  // OPCIÓN 1: Traducción manual (comentar para usar IA)
  console.log(`\n📝 Traducir: "${text}"`);
  console.log(`Contexto: ${context}`);
  console.log('⚠️  Retornando texto original - configura traducción automática');
  return text; // Placeholder - retorna el mismo texto
  
  // OPCIÓN 2: Usar OpenAI (descomentar y configurar)
  /*
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a professional translator specializing in ISTQB software testing terminology. Translate from Spanish to English maintaining technical accuracy.'
      },
      {
        role: 'user',
        content: `Translate the following text from Spanish to English:\n\n${text}\n\nContext: ${context}`
      }
    ],
    temperature: 0.3,
  });
  return response.choices[0].message.content || text;
  */
  
  // OPCIÓN 3: Usar Claude (descomentar y configurar)
  /*
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a professional translator specializing in ISTQB software testing terminology. Translate the following text from Spanish to English maintaining technical accuracy:\n\n${text}\n\nContext: ${context}`
      }
    ]
  });
  return message.content[0].text;
  */
}

/**
 * Traduce las opciones de una pregunta
 */
async function translateOptions(options: any[], context: string): Promise<any[]> {
  if (!options || !Array.isArray(options)) {
    return [];
  }

  const translatedOptions = [];
  for (const option of options) {
    const translatedText = await translateText(option.text, context);
    translatedOptions.push({
      ...option,
      text: translatedText,
    });
  }

  return translatedOptions;
}

/**
 * Obtiene todas las preguntas sin traducción al inglés
 */
async function getQuestionsToTranslate(): Promise<QuestionToTranslate[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, title_es, description_es, options_es, explanation_es, topic, difficulty')
    .is('title_en', null);

  if (error) {
    throw new Error(`Error fetching questions: ${error.message}`);
  }

  return data || [];
}

/**
 * Actualiza una pregunta con su traducción al inglés
 */
async function updateQuestionTranslation(
  questionId: string,
  translations: {
    title_en: string;
    description_en: string;
    options_en: any;
    explanation_en: string;
  }
) {
  const { error } = await supabase
    .from('questions')
    .update(translations)
    .eq('id', questionId);

  if (error) {
    throw new Error(`Error updating question ${questionId}: ${error.message}`);
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando traducción de preguntas...\n');

  // Obtener preguntas sin traducción
  const questions = await getQuestionsToTranslate();
  console.log(`📊 Encontradas ${questions.length} preguntas para traducir\n`);

  if (questions.length === 0) {
    console.log('✅ Todas las preguntas ya están traducidas!');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n[${i + 1}/${questions.length}] Traduciendo pregunta: ${question.id}`);
    console.log(`Tema: ${question.topic} | Dificultad: ${question.difficulty}`);

    try {
      // Contexto para mejorar la traducción
      const context = `ISTQB question - Topic: ${question.topic}, Difficulty: ${question.difficulty}`;

      // Traducir cada campo
      const title_en = await translateText(question.title_es, context);
      const description_en = await translateText(question.description_es || '', context);
      const explanation_en = await translateText(question.explanation_es, context);
      const options_en = await translateOptions(question.options_es || [], context);

      // Actualizar en la base de datos
      await updateQuestionTranslation(question.id, {
        title_en,
        description_en,
        options_en,
        explanation_en,
      });

      console.log(`✅ Traducción completada y guardada`);
      successCount++;

      // Delay para evitar rate limits (si usas API de traducción)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.error(`❌ Error traduciendo pregunta ${question.id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📈 Resumen:');
  console.log(`✅ Exitosas: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📊 Total: ${questions.length}`);
}

// Ejecutar
main()
  .then(() => {
    console.log('\n✨ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });

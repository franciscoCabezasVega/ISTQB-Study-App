/**
 * Script para detectar preguntas duplicadas basándose en respuestas idénticas
 * Agrupa por tópico y compara las opciones de cada pregunta
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar variables de entorno - intentar desde varios lugares
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../packages/api/.env'),
  path.resolve(__dirname, '.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`📁 Cargando variables de entorno desde: ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

interface Question {
  id: string;
  title_es: string;
  title_en: string | null;
  topic: string;
  options_es: QuestionOption[];
  options_en: QuestionOption[] | null;
  correct_answer_ids: string[];
}

interface DuplicateGroup {
  topic: string;
  questions: {
    id: string;
    title_es: string;
    title_en: string | null;
    optionsHash: string;
  }[];
}

/**
 * Normaliza las opciones de respuesta para comparación
 * Ordena alfabéticamente y elimina espacios extra
 */
function normalizeOptions(options: QuestionOption[]): string[] {
  return options
    .map(opt => opt.text.trim().toLowerCase())
    .sort();
}

/**
 * Crea un hash de las opciones para comparación
 */
function createOptionsHash(options: QuestionOption[]): string {
  const normalized = normalizeOptions(options);
  return normalized.join('|||');
}

/**
 * Compara si dos conjuntos de opciones son idénticas
 */
function areOptionsIdentical(options1: QuestionOption[], options2: QuestionOption[]): boolean {
  return createOptionsHash(options1) === createOptionsHash(options2);
}

/**
 * Obtiene todas las preguntas de la base de datos
 */
async function getAllQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, title_es, title_en, topic, options_es, options_en, correct_answer_ids')
    .order('topic', { ascending: true })
    .order('title_es', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener preguntas: ${error.message}`);
  }

  return data as Question[];
}

/**
 * Encuentra preguntas duplicadas por tópico
 */
function findDuplicatesByTopic(questions: Question[]): Map<string, DuplicateGroup[]> {
  // Agrupar por tópico
  const questionsByTopic = new Map<string, Question[]>();
  
  for (const question of questions) {
    if (!questionsByTopic.has(question.topic)) {
      questionsByTopic.set(question.topic, []);
    }
    questionsByTopic.get(question.topic)!.push(question);
  }

  // Encontrar duplicados dentro de cada tópico
  const duplicatesByTopic = new Map<string, DuplicateGroup[]>();

  for (const [topic, topicQuestions] of questionsByTopic.entries()) {
    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < topicQuestions.length; i++) {
      if (processed.has(topicQuestions[i].id)) continue;

      const currentQuestion = topicQuestions[i];
      const group: DuplicateGroup = {
        topic,
        questions: [{
          id: currentQuestion.id,
          title_es: currentQuestion.title_es,
          title_en: currentQuestion.title_en,
          optionsHash: createOptionsHash(currentQuestion.options_es)
        }]
      };

      // Buscar otras preguntas con las mismas opciones
      for (let j = i + 1; j < topicQuestions.length; j++) {
        if (processed.has(topicQuestions[j].id)) continue;

        const compareQuestion = topicQuestions[j];
        
        // Comparar opciones en español
        if (areOptionsIdentical(currentQuestion.options_es, compareQuestion.options_es)) {
          group.questions.push({
            id: compareQuestion.id,
            title_es: compareQuestion.title_es,
            title_en: compareQuestion.title_en,
            optionsHash: createOptionsHash(compareQuestion.options_es)
          });
          processed.add(compareQuestion.id);
        }
      }

      // Solo agregar si encontramos duplicados
      if (group.questions.length > 1) {
        duplicateGroups.push(group);
        processed.add(currentQuestion.id);
      }
    }

    if (duplicateGroups.length > 0) {
      duplicatesByTopic.set(topic, duplicateGroups);
    }
  }

  return duplicatesByTopic;
}

/**
 * Muestra los resultados en consola
 */
function displayResults(duplicatesByTopic: Map<string, DuplicateGroup[]>, allQuestions: Question[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTE DE PREGUNTAS DUPLICADAS');
  console.log('='.repeat(80));
  console.log(`\n📝 Total de preguntas analizadas: ${allQuestions.length}`);

  if (duplicatesByTopic.size === 0) {
    console.log('\n✅ ¡Excelente! No se encontraron preguntas con respuestas idénticas.');
    return;
  }

  let totalDuplicates = 0;
  
  console.log(`\n⚠️  Tópicos con preguntas duplicadas: ${duplicatesByTopic.size}\n`);

  for (const [topic, groups] of duplicatesByTopic.entries()) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📚 TÓPICO: ${topic}`);
    console.log(`${'─'.repeat(80)}`);

    groups.forEach((group, groupIndex) => {
      console.log(`\n  🔍 Grupo de duplicados #${groupIndex + 1}:`);
      console.log(`     ${group.questions.length} preguntas con respuestas idénticas\n`);

      group.questions.forEach((q, qIndex) => {
        console.log(`     ${qIndex + 1}. ID: ${q.id}`);
        console.log(`        Título (ES): ${q.title_es}`);
        if (q.title_en) {
          console.log(`        Título (EN): ${q.title_en}`);
        }
        console.log('');
      });

      // Mostrar las opciones del primer elemento del grupo
      const originalQuestion = allQuestions.find(q => q.id === group.questions[0].id);
      if (originalQuestion) {
        console.log('     Opciones compartidas:');
        originalQuestion.options_es.forEach((opt, idx) => {
          console.log(`        ${idx + 1}. ${opt.text}`);
        });
        console.log('');
      }

      totalDuplicates += group.questions.length;
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📊 RESUMEN:`);
  console.log(`   • Total de preguntas duplicadas: ${totalDuplicates}`);
  console.log(`   • Tópicos afectados: ${duplicatesByTopic.size}`);
  console.log(`   • Grupos de duplicados: ${Array.from(duplicatesByTopic.values()).reduce((sum, groups) => sum + groups.length, 0)}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Exporta los resultados a un archivo JSON
 */
async function exportResults(duplicatesByTopic: Map<string, DuplicateGroup[]>, allQuestions: Question[]): Promise<void> {
  const results = {
    timestamp: new Date().toISOString(),
    totalQuestions: allQuestions.length,
    totalDuplicates: 0,
    topicsWithDuplicates: duplicatesByTopic.size,
    duplicates: [] as any[]
  };

  for (const [topic, groups] of duplicatesByTopic.entries()) {
    groups.forEach(group => {
      const fullQuestions = group.questions.map(q => {
        const fullQ = allQuestions.find(fq => fq.id === q.id);
        return {
          id: q.id,
          title_es: q.title_es,
          title_en: q.title_en,
          options_es: fullQ?.options_es || [],
          correct_answer_ids: fullQ?.correct_answer_ids || []
        };
      });

      results.duplicates.push({
        topic,
        questionCount: group.questions.length,
        questions: fullQuestions
      });

      results.totalDuplicates += group.questions.length;
    });
  }

  const fs = require('fs');
  const outputPath = path.join(__dirname, 'duplicate-questions-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  
  console.log(`\n💾 Reporte exportado a: ${outputPath}\n`);
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  try {
    console.log('🔍 Iniciando análisis de preguntas duplicadas...\n');

    // Obtener todas las preguntas
    console.log('📥 Obteniendo preguntas de la base de datos...');
    const questions = await getAllQuestions();
    console.log(`✅ Se obtuvieron ${questions.length} preguntas\n`);

    // Encontrar duplicados
    console.log('🔎 Buscando preguntas con respuestas idénticas...');
    const duplicatesByTopic = findDuplicatesByTopic(questions);

    // Mostrar resultados
    displayResults(duplicatesByTopic, questions);

    // Exportar resultados
    if (duplicatesByTopic.size > 0) {
      await exportResults(duplicatesByTopic, questions);
    }

    console.log('✅ Análisis completado exitosamente\n');

  } catch (error) {
    console.error('\n❌ Error durante el análisis:', error);
    process.exit(1);
  }
}

// Ejecutar
main();

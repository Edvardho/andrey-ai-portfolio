import * as fs from 'node:fs';
import * as path from 'node:path';

const LOG_FILE_PATH = path.resolve(process.cwd(), 'scratch/openai-calls.jsonl');

async function main() {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    console.log(`Log file not found at: ${LOG_FILE_PATH}. Try running some requests first.`);
    return;
  }

  const fileContent = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
  const lines = fileContent.split('\n').filter(l => l.trim().length > 0);

  const starts = new Map();
  const ends = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.event === 'call_start') {
        starts.set(obj.callId, obj);
      } else if (obj.event === 'call_end') {
        ends.push(obj);
      }
    } catch (e) {
      // ignore bad lines
    }
  }

  console.log(`\n=== OPENAI TELEMETRY ANALYSIS ===`);
  console.log(`Total log lines: ${lines.length}`);
  console.log(`Started calls: ${starts.size}`);
  console.log(`Completed calls: ${ends.length}`);

  // 1. Атрибуция расходов по маршрутам/функциям
  const routeStats = {};
  for (const end of ends) {
    const start = starts.get(end.callId);
    const route = end.route || start?.route || 'unknown';
    const input = end.inputTokens || 0;
    const output = end.outputTokens || 0;

    if (!routeStats[route]) {
      routeStats[route] = {
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        maxInput: 0,
        inputsList: []
      };
    }

    const stats = routeStats[route];
    stats.calls++;
    stats.inputTokens += input;
    stats.outputTokens += output;
    stats.maxInput = Math.max(stats.maxInput, input);
    stats.inputsList.push(input);
  }

  console.log('\n=== ATTRIBUTION BY ROUTE ===');
  console.log(
    String('Route').padEnd(30) + ' | ' +
    String('Calls').padStart(6) + ' | ' +
    String('Input tokens').padStart(12) + ' | ' +
    String('Output tokens').padStart(13) + ' | ' +
    String('Avg input').padStart(10) + ' | ' +
    String('Max input').padStart(10)
  );
  console.log('-'.repeat(93));

  for (const [route, stats] of Object.entries(routeStats)) {
    const avgInput = stats.calls > 0 ? Math.round(stats.inputTokens / stats.calls) : 0;
    console.log(
      route.padEnd(30) + ' | ' +
      String(stats.calls).padStart(6) + ' | ' +
      String(stats.inputTokens).padStart(12) + ' | ' +
      String(stats.outputTokens).padStart(13) + ' | ' +
      String(avgInput).padStart(10) + ' | ' +
      String(stats.maxInput).padStart(10)
    );
  }

  // 2. Топ-10 по input_tokens
  const sortedByTokens = [...ends]
    .sort((a, b) => (b.inputTokens || 0) - (a.inputTokens || 0))
    .slice(0, 10);

  console.log('\n=== TOP 10 EXPENSIVE CALLS BY INPUT TOKENS ===');
  sortedByTokens.forEach((end, index) => {
    const start = starts.get(end.callId);
    console.log(
      `#${index + 1}: ${end.route} | Model: ${end.model} | Input Tokens: ${end.inputTokens} | Output Tokens: ${end.outputTokens} | Request ID: ${end.requestId || 'n/a'}`
    );
    if (start?.userMessagePreview) {
      console.log(`    User Message: "${start.userMessagePreview}"`);
    }
  });

  // 3. Топ-10 по total_payload_chars
  const sortedByPayload = Array.from(starts.values())
    .sort((a, b) => b.totalPayloadChars - a.totalPayloadChars)
    .slice(0, 10);

  console.log('\n=== TOP 10 CALLS BY TOTAL PAYLOAD SIZE (CHARS) ===');
  sortedByPayload.forEach((start, index) => {
    const end = ends.find(e => e.callId === start.callId);
    console.log(
      `#${index + 1}: ${start.route} | Model: ${start.model} | Payload Chars: ${start.totalPayloadChars} | Status: ${end ? (end.status === 'success' ? 'Completed' : 'Error') : 'Pending/Failed'}`
    );
    console.log(
      `    Breakdown: System prompt: ${start.systemPromptChars} chars | Dev prompt: ${start.developerPromptChars} chars | User message: ${start.userMessageChars} chars | RAG context: ${start.ragContextChars} chars`
    );
    if (start.userMessagePreview) {
      console.log(`    User Message: "${start.userMessagePreview}"`);
    }
  });
}

main().catch(console.error);

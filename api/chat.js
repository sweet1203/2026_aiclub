/** Vercel에서 가끔 req.body가 비는 경우를 대비해 JSON 본문을 읽습니다. */
async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8') || '{}');
    } catch {
      return {};
    }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function toAnthropicMessages(messages) {
  return messages.slice(-20).map((m) => {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const text =
      typeof m.content === 'string'
        ? m.content
        : m.content != null
          ? String(m.content)
          : '';
    return { role, content: text };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: 'JSON 본문을 읽을 수 없어요.' });
  }

  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '잘못된 요청이에요.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !String(apiKey).trim()) {
    console.error('ANTHROPIC_API_KEY is missing or empty');
    return res.status(500).json({ error: '서버 설정 오류(API 키). 관리자에게 문의해 주세요.' });
  }

  // 기본: 가장 낮은 티어·가장 저렴한 Haiku (별칭, 공식 문서 기준)
  const model =
    process.env.ANTHROPIC_MODEL?.trim() || 'claude-haiku-4-5';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: `당신은 고등학교 동아리 학생들을 위한 친절한 웹앱 개발 도우미입니다.

역할:
- 코딩을 처음 배우는 여고생들이 웹앱을 만들 수 있도록 도와줍니다
- HTML, CSS, JavaScript, 그리고 간단한 백엔드 개발을 가르칩니다

답변 방식:
- 항상 쉽고 친근한 말투로 설명해 주세요 (예: "~해 보세요!", "~이렇게 하면 돼요!")
- 코드를 줄 때는 반드시 각 줄이 무슨 역할인지 주석으로 설명해 주세요
- 복잡한 개념은 일상생활 예시로 비유해서 설명해 주세요
- 에러가 발생했을 때는 원인과 해결 방법을 단계별로 알려주세요
- 학생이 직접 응용할 수 있도록 추가 아이디어도 제안해 주세요
- 답변은 한국어로 해주세요

금지사항:
- 너무 전문적이거나 어려운 용어만 사용하는 것은 피해주세요
- 설명 없이 코드만 던져주지 마세요`,
        messages: toAnthropicMessages(messages),
      }),
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error('Anthropic API error:', response.status, raw);
      return res.status(500).json({
        error:
          'AI 서버 오류가 발생했어요. 잠시 후 다시 시도하거나, 모델 이름(ANTHROPIC_MODEL)을 확인해 주세요.',
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error('Anthropic response JSON parse:', e, raw.slice(0, 200));
      return res.status(500).json({ error: 'AI 응답 형식 오류가 났어요.' });
    }

    const block = data.content?.[0];
    const reply =
      block?.type === 'text' && block?.text
        ? block.text
        : typeof block?.text === 'string'
          ? block.text
          : '응답을 받지 못했어요.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' });
  }
}

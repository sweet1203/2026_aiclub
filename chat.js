export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '잘못된 요청이에요.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
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
        messages: messages.slice(-20), // 최근 20개 메시지만 유지 (비용 절약)
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(500).json({ error: 'AI 서버 오류가 발생했어요.' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '응답을 받지 못했어요.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' });
  }
}

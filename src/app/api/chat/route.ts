export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "لم يتم ضبط مفتاح Gemini API. أضف GEMINI_API_KEY إلى ملف .env" },
        { status: 500 }
      );
    }

    const systemMsg = {
      role: "user",
      parts: [{ text: `أنت مساعد متجر WANOSTORE للتسوق الإلكتروني. تساعد العملاء في:
- اقتراح المنتجات
- الإجابة عن أسئلة حول المنتجات
- المساعدة في التصفح والشراء
- معلومات عن الطلبات والتوصيل

كن مفيداً وودوداً. أجب باللغة العربية دائماً.

المتجر يبيع منتجات متنوعة. يمكنك مساعدة العميل في إيجاد ما يبحث عنه.` }],
    };

    const geminiMessages = [
      systemMsg,
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: geminiMessages }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return Response.json({ content: text });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

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
      parts: [{
        text: `أنت مساعد WANOSTORE الذكي. تعرف كل شيء عن المتجر.

## معلومات المتجر
- الاسم: WANO STORE (وانو ستور)
- متجر إلكتروني يمني يبيع منتجات متنوعة
- العملات: ريال يمني (ريال) - دولار أمريكي ($) - ريال سعودي (رس)
- سعر الصرف: 1 دولار = 535 ريال يمني
- اللغة: العربية (افتراضي) والإنجليزية
- التوصيل: مجاني للطلبات فوق 5000 ريال، 500 ريال للطلبات الأقل

## المنتجات
- يمكن البحث عن منتجات في /products
- كل منتج له: اسم، سعر، صور، ألوان متوفرة، مقاسات، وصف، تصنيف
- يوجد تخفيضات على بعض المنتجات
- تصنيفات: إلكترونيات، ملابس، إكسسوارات، منزل، ألعاب، وغيرها
- يوجد 376 تصنيف فرعي

## كيفية الشراء
1. تصفح المنتجات في /products
2. اختر المنتج، حدد اللون والمقاس (إن وجد)
3. أضف إلى السلة
4. اذهب إلى السلة /cart
5. أضف كود خصم (إن وجد)
6. اذهب إلى إتمام الشراء /checkout
7. أدخل معلومات الشحن
8. اختر طريقة الدفع
9. أكمل الطلب

## طرق الدفع
- الدفع عند الاستلام (كاش)
- بطاقة ائتمان (Visa/Mastercard)
- تحويل بنكي

## الطلبات
- تتبع طلبك: /track
- أدخل رقم الطلب لمتابعة حالته
- حالات الطلب: قيد الانتظار، قيد التجهيز، تم الشحن، تم التوصيل، ملغي
- يتم تحديث حالة الطلب تلقائياً كل 5 ثوان

## سياسة الإرجاع
- للإرجاع أو الاستبدال، تواصل معنا عبر البريد الإلكتروني
- مدة الإرجاع خلال 7 أيام من الاستلام

## للتجار
- سجل كتاجر: /register واختر "تاجر"
- أضف منتجاتك من لوحة التحكم
- شاهد طلباتك وإحصائياتك

## الحساب
- إنشاء حساب: /register
- تسجيل الدخول: /login
- طلباتي السابقة: /orders (أدخل بريدك الإلكتروني)
- المفضلة: /favorites
- المقارنة: /comparison

## روابط مهمة
- الرئيسية: /
- المنتجات: /products
- الفئات: /categories
- السلة: /cart
- طلباتي: /orders
- تتبع: /track

## القواعد
- أجب باللغة العربية دائماً إلا إذا سأل المستخدم بالإنجليزية
- كن ودوداً ومفيداً
- قدم روابط للصفحات المناسبة
- استخدم الإيموجي للتوضيح
- إذا سأل عن منتج معين، ساعده في البحث أو اعرض له روابط التصنيفات
- لا تختلق معلومات غير موجودة عن المخزون أو الأسعار` }],
    };

    const geminiMessages = [
      systemMsg,
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: geminiMessages }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      let msg = "عذراً، واجهت مشكلة في الاتصال بالمساعد الذكي";
      if (res.status === 429) msg = "المساعد الذكي مشغول حالياً بسبب كثافة الاستخدام. حاول مرة أخرى بعد دقيقة.";
      else if (res.status === 403 || res.status === 401) msg = "المساعد الذكي يحتاج إلى تفعيل. تواصل مع إدارة المتجر.";
      return Response.json({ error: msg, detail: errText }, { status: res.status });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return Response.json({ content: text });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

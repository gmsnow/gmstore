"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const CATEGORIES: any[] = [
  {
    name: "إلكترونيات", nameEn: "Electronics", children: [
      { name: "هواتف ذكية", nameEn: "Smartphones", children: [
        { name: "جرابات جوال", nameEn: "Phone Cases" },
        { name: "حمايات شاشة", nameEn: "Screen Protectors" },
        { name: "شواحن جوال", nameEn: "Phone Chargers" },
        { name: "باور بانك", nameEn: "Power Banks" },
        { name: "شواحن لاسلكية", nameEn: "Wireless Chargers" },
      ]},
      { name: "سماعات أذن", nameEn: "Earbuds" },
      { name: "سماعات رأس", nameEn: "Headphones" },
      { name: "ساعات ذكية", nameEn: "Smart Watches" },
      { name: "أجهزة لوحية", nameEn: "Tablets", children: [
        { name: "إكسسوارات أجهزة لوحية", nameEn: "Tablet Accessories" },
      ]},
      { name: "لابتوب", nameEn: "Laptops", children: [
        { name: "لابتوب ألعاب", nameEn: "Gaming Laptops" },
      ]},
      { name: "شاشات عرض", nameEn: "Monitors" },
      { name: "كاميرات", nameEn: "Cameras", children: [
        { name: "عدسات كاميرا", nameEn: "Camera Lenses" },
      ]},
      { name: "تلفزيونات", nameEn: "Televisions", children: [
        { name: "مساند تلفزيون", nameEn: "TV Mounts" },
      ]},
      { name: "طابعات", nameEn: "Printers", children: [
        { name: "خراطيش حبر", nameEn: "Ink Cartridges" },
      ]},
      { name: "راوتر", nameEn: "Routers", children: [
        { name: "سويتشات شبكة", nameEn: "Network Switches" },
      ]},
      { name: "أقراص صلبة", nameEn: "Hard Drives", children: [
        { name: "SSD", nameEn: "SSDs" },
        { name: "فلاش USB", nameEn: "USB Flash Drives" },
      ]},
    ],
  },
  {
    name: "موضة", nameEn: "Fashion", children: [
      { name: "ملابس رجالية", nameEn: "Men's Clothing" },
      { name: "ملابس نسائية", nameEn: "Women's Clothing" },
      { name: "ملابس أطفال", nameEn: "Kids Clothing" },
      { name: "تيشيرتات", nameEn: "T-Shirts" },
      { name: "جينز", nameEn: "Jeans" },
      { name: "فساتين", nameEn: "Dresses" },
      { name: "عباءات", nameEn: "Abayas" },
      { name: "حجاب", nameEn: "Hijabs" },
      { name: "أحذية", nameEn: "Shoes", children: [
        { name: "حذاء رياضي", nameEn: "Sneakers" },
        { name: "صنادل", nameEn: "Sandals" },
        { name: "بوت", nameEn: "Boots" },
      ]},
      { name: "مجوهرات", nameEn: "Jewelry", children: [
        { name: "خواتم", nameEn: "Rings" },
        { name: "قلادات", nameEn: "Necklaces" },
        { name: "أساور", nameEn: "Bracelets" },
      ]},
      { name: "حقائب يد", nameEn: "Handbags" },
      { name: "ساعات", nameEn: "Watches" },
      { name: "نظارات شمسية", nameEn: "Sunglasses" },
    ],
  },
  {
    name: "المنزل والمطبخ", nameEn: "Home & Kitchen", children: [
      { name: "أجهزة مطبخ", nameEn: "Kitchen Appliances", children: [
        { name: "ثلاجات", nameEn: "Refrigerators" },
        { name: "غسالات", nameEn: "Washing Machines" },
        { name: "ميكروويف", nameEn: "Microwaves" },
        { name: "أفران", nameEn: "Ovens" },
        { name: "ماكينات قهوة", nameEn: "Coffee Machines" },
        { name: "مقلايات هواء", nameEn: "Air Fryers" },
        { name: "خلاطات", nameEn: "Blenders" },
        { name: "عصارات", nameEn: "Juicers" },
      ]},
      { name: "أواني طبخ", nameEn: "Cookware", children: [
        { name: "مقالي", nameEn: "Frying Pans" },
        { name: "قدور", nameEn: "Pots" },
        { name: "سكاكين", nameEn: "Knives" },
      ]},
      { name: "مستلزمات تنظيف", nameEn: "Cleaning Supplies", children: [
        { name: "مكانس كهربائية", nameEn: "Vacuum Cleaners" },
        { name: "مماسح", nameEn: "Mops" },
      ]},
      { name: "مكيفات هواء", nameEn: "Air Conditioners" },
      { name: "مراوح", nameEn: "Fans" },
      { name: "دفايات", nameEn: "Heaters" },
    ],
  },
  {
    name: "تجميل", nameEn: "Beauty", children: [
      { name: "مكياج", nameEn: "Makeup", children: [
        { name: "أحمر شفاه", nameEn: "Lipstick" },
        { name: "فاونديشن", nameEn: "Foundation" },
      ]},
      { name: "عناية بالبشرة", nameEn: "Skincare", children: [
        { name: "غسول وجه", nameEn: "Face Wash" },
        { name: "مرطبات", nameEn: "Moisturizers" },
        { name: "واقي شمس", nameEn: "Sunscreen" },
        { name: "ماسكات وجه", nameEn: "Face Masks" },
      ]},
      { name: "عناية بالشعر", nameEn: "Hair Care", children: [
        { name: "شامبو", nameEn: "Shampoo" },
        { name: "بلسم", nameEn: "Conditioner" },
        { name: "مجففات شعر", nameEn: "Hair Dryers" },
      ]},
      { name: "عطور", nameEn: "Perfumes" },
      { name: "عناية بالفم", nameEn: "Oral Care", children: [
        { name: "فرش أسنان", nameEn: "Toothbrushes" },
        { name: "معجون أسنان", nameEn: "Toothpaste" },
      ]},
    ],
  },
  {
    name: "صحة", nameEn: "Health", children: [
      { name: "فيتامينات", nameEn: "Vitamins" },
      { name: "مكملات غذائية", nameEn: "Supplements" },
      { name: "معدات طبية", nameEn: "Medical Equipment" },
      { name: "أجهزة مساج", nameEn: "Massagers" },
    ],
  },
  {
    name: "رياضة", nameEn: "Sports", children: [
      { name: "معدات جيم", nameEn: "Gym Equipment", children: [
        { name: "دمبلز", nameEn: "Dumbbells" },
        { name: "سجادة يوجا", nameEn: "Yoga Mats" },
      ]},
      { name: "كرة قدم", nameEn: "Football" },
      { name: "كرة سلة", nameEn: "Basketball" },
    ],
  },
  {
    name: "سيارات", nameEn: "Automotive", children: [
      { name: "إكسسوارات سيارة", nameEn: "Car Accessories" },
      { name: "إلكترونيات السيارة", nameEn: "Car Electronics" },
    ],
  },
  {
    name: "ألعاب وأطفال", nameEn: "Toys & Baby", children: [
      { name: "ألعاب", nameEn: "Toys", children: [
        { name: "ألعاب تعليمية", nameEn: "Educational Toys" },
        { name: "دمى", nameEn: "Dolls" },
        { name: "مكعبات بناء", nameEn: "Building Blocks" },
      ]},
      { name: "عربيات أطفال", nameEn: "Baby Strollers" },
      { name: "كراسي سيارة", nameEn: "Baby Car Seats" },
      { name: "حفاضات", nameEn: "Baby Diapers" },
    ],
  },
  {
    name: "كتب وأدوات مكتبية", nameEn: "Books & Office", children: [
      { name: "أقلام حبر", nameEn: "Pens" },
      { name: "دفاتر", nameEn: "Notebooks" },
      { name: "كراسي مكتب", nameEn: "Office Chairs" },
    ],
  },
  {
    name: "ألعاب إلكترونية", nameEn: "Gaming", children: [
      { name: "أجهزة ألعاب", nameEn: "Gaming Consoles" },
      { name: "كراسي ألعاب", nameEn: "Gaming Chairs" },
    ],
  },
  {
    name: "مستلزمات حيوانات", nameEn: "Pet Supplies", children: [
      { name: "طعام كلاب", nameEn: "Dog Food" },
      { name: "طعام قطط", nameEn: "Cat Food" },
    ],
  },
  {
    name: "طعام وبقالة", nameEn: "Food & Grocery", children: [
      { name: "وجبات خفيفة", nameEn: "Snacks", children: [
        { name: "شوكولاتة", nameEn: "Chocolate" },
        { name: "بسكويت", nameEn: "Biscuits" },
      ]},
      { name: "قهوة", nameEn: "Coffee" },
      { name: "شاي", nameEn: "Tea" },
    ],
  },
  {
    name: "أثاث", nameEn: "Furniture", children: [
      { name: "أثاث غرفة المعيشة", nameEn: "Living Room Furniture" },
      { name: "أثاث غرفة النوم", nameEn: "Bedroom Furniture" },
    ],
  },
  { name: "حديقة", nameEn: "Garden" },
  { name: "صناعي", nameEn: "Industrial" },
  { name: "متنوعات", nameEn: "Miscellaneous" },
];

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function createTree(items: any[], parentId: string | null = null) {
  for (const item of items) {
    const slug = slugify(item.nameEn);
    const cat = await prisma.category.create({
      data: {
        name: item.name,
        nameEn: item.nameEn,
        slug,
        parentId,
        image: `https://placehold.co/400x300/EEE/999?text=${encodeURIComponent(item.nameEn)}`,
      },
    });
    if (item.children) {
      await createTree(item.children, cat.id);
    }
  }
}

export async function resetCategories() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("غير مصرح");
  }
  await prisma.cjProductMapping.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.cjLog.deleteMany();
  await prisma.category.deleteMany();
  await createTree(CATEGORIES);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

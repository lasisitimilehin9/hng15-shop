import type { Product } from "./types";

/** Used when Supabase is not configured yet so the UI still demos correctly. */
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "pure-shea-butter",
    name: "Pure Raw Shea Butter",
    description:
      "Unrefined Grade A shea butter from women's cooperatives in Osun State. Deeply moisturises dry skin and hair. 250g jar.",
    price_kobo: 450000,
    image_url:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
    category: "body",
    stock: 80,
    active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "african-black-soap",
    name: "African Black Soap Bar",
    description:
      "Traditional black soap made with plantain skin, cocoa pod ash, and palm oil. Gentle cleansing for face and body. 150g bar.",
    price_kobo: 250000,
    image_url:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    category: "body",
    stock: 120,
    active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "coconut-hair-oil",
    name: "Virgin Coconut Hair Oil",
    description:
      "Cold-pressed virgin coconut oil infused with rosemary and peppermint. Strengthens hair and soothes the scalp. 100ml bottle.",
    price_kobo: 350000,
    image_url:
      "https://images.unsplash.com/photo-1608248543808-dfd6e0f0b0f0?w=600&q=80",
    category: "hair",
    stock: 60,
    active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    slug: "turmeric-face-mask",
    name: "Turmeric Brightening Mask",
    description:
      "Clay mask with turmeric, honey powder, and oatmeal. Helps even skin tone. 100g pouch.",
    price_kobo: 320000,
    image_url:
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&q=80",
    category: "face",
    stock: 45,
    active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    slug: "palm-kernel-soap",
    name: "Palm Kernel Castile Soap",
    description:
      "Mild castile-style soap from local palm kernel oil. Unscented, suitable for sensitive skin. 200g bar.",
    price_kobo: 180000,
    image_url:
      "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9e?w=600&q=80",
    category: "body",
    stock: 90,
    active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    slug: "hibiscus-body-butter",
    name: "Hibiscus Body Butter",
    description:
      "Whipped body butter with shea, cocoa butter, and dried hibiscus. Soft floral scent. 200g jar.",
    price_kobo: 550000,
    image_url:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
    category: "body",
    stock: 40,
    active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    slug: "neem-scalp-serum",
    name: "Neem Scalp Serum",
    description:
      "Lightweight serum with neem, tea tree, and jojoba. Targets dryness and flaking. 50ml dropper bottle.",
    price_kobo: 400000,
    image_url:
      "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&q=80",
    category: "hair",
    stock: 55,
    active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    slug: "gift-set-essentials",
    name: "Essentials Gift Set",
    description:
      "Gift box with mini shea butter, black soap, and coconut oil. Ideal for first-time customers.",
    price_kobo: 850000,
    image_url:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
    category: "gifts",
    stock: 25,
    active: true,
  },
];

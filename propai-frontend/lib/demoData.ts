import type { Property } from "@/lib/types";

export const DEMO_PROPS: Property[] = [
  {
    id: "prop-001",
    name: "Maple Court — Unit 3A",
    photo:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop",
    phone: "+14045550123",
    context: {
      tenant_name: "John Doe",
      unit: "3A",
      address: "123 Maple St, Atlanta, GA 30318",
      hotline: "+1-555-0100",
      portal_url: "https://portal.example.com/login",
      property_name: "Maple Court",
      phone: "+14045550123"
    },
  },
  {
    id: "prop-002",
    name: "Pine Ridge — Unit 7D",
    photo:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1600&auto=format&fit=crop",
    phone: "+14045550124",
    context: {
      tenant_name: "Ava Smith",
      unit: "7D",
      address: "45 Pine Ridge Ave, Duluth, GA 30096",
      hotline: "+1-555-0100",
      portal_url: "https://portal.example.com/login",
      property_name: "Pine Ridge",
      phone: "+14045550124"
    },
  },
];

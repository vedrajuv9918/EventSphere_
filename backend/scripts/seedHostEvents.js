const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Event = require("../models/Event");

dotenv.config();

const HOST_PROFILE = {
  name: "John",
  email: "john@eventsphere.com",
  password: "John@12345",
  role: "host",
};

const EVENT_TEMPLATES = [
  {
    title: "Career Fair: Exclusive Tech Hiring Event",
    description:
      "Meet top tech employers and land your dream job. Includes resume clinics, mock interviews, and portfolio audits.",
    date: "2025-02-15T10:00:00Z",
    venue: "New Horizon College of Engineering, Bengaluru",
    category: "Technology",
    ticketPrice: 499,
    maxAttendees: 500,
    posterUrl:
      "https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Design Weekend: Storytelling in Spaces",
    description:
      "Immersive design showcase with interactive installations, maker labs, and curated talks from spatial storytellers.",
    date: "2025-03-08T09:30:00Z",
    venue: "The Grid Art District, Mumbai",
    category: "Arts",
    ticketPrice: 699,
    maxAttendees: 350,
    posterUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Founders' Forum: Scaling Sustainably",
    description:
      "Roundtables with climate-tech leaders, VC office hours, and curated investor meets focused on sustainable scale.",
    date: "2025-01-28T11:00:00Z",
    venue: "Seaport Innovation Hub, Chennai",
    category: "Business",
    ticketPrice: 0,
    maxAttendees: 250,
    posterUrl:
      "https://ff.co/wp-content/uploads/2025/06/APPROVED_GOH_FFAsia25_0927_J74008462-1920x1280.jpg",
  },
  {
    title: "AI & Automation Summit 2025",
    description:
      "Two-day summit covering GenAI workflows, AI safety sandboxes, and enterprise case studies with live demos.",
    date: "2025-04-12T09:00:00Z",
    venue: "NIMHANS Convention Centre, Bengaluru",
    category: "Technology",
    ticketPrice: 899,
    maxAttendees: 600,
    posterUrl:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Wellness Recharge Retreat",
    description:
      "Mindfulness bootcamp with breath-work, forest bathing, and nutrition labs led by leading wellness coaches.",
    date: "2025-02-22T06:30:00Z",
    venue: "Kumarakom Lake Resort, Kerala",
    category: "Lifestyle",
    ticketPrice: 1299,
    maxAttendees: 120,
    posterUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Indie Film Night & Director's Circle",
    description:
      "Screenings from upcoming indie filmmakers followed by panel discussions, pitch rooms, and networking mixers.",
    date: "2025-12-18T18:30:00Z",
    venue: "PVR Directors Cut, New Delhi",
    category: "Entertainment",
    ticketPrice: 550,
    maxAttendees: 200,
    posterUrl:
      "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "SaaS Growth Playbooks Workshop",
    description:
      "Hands-on GTM workshop for SaaS founders focusing on PLG motions, retention models, and pricing experiments.",
    date: "2025-03-29T10:00:00Z",
    venue: "T-Hub Innovation Campus, Hyderabad",
    category: "Business",
    ticketPrice: 799,
    maxAttendees: 180,
    posterUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Future of Mobility Expo",
    description:
      "Experience autonomous pods, EV test drives, and product launches from the newest mobility startups.",
    date: "2026-01-05T10:30:00Z",
    venue: "Hitex Exhibition Center, Hyderabad",
    category: "Technology",
    ticketPrice: 899,
    maxAttendees: 800,
    posterUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Urban Wellness Weekender",
    description:
      "Guided breath-work, cold plunge labs, and nutrition keynotes to recharge busy professionals.",
    date: "2025-08-16T07:00:00Z",
    venue: "Cubbon Park Amphitheatre, Bengaluru",
    category: "Lifestyle",
    ticketPrice: 1299,
    maxAttendees: 300,
    posterUrl:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Indie Dev Showcase & Game Jam",
    description:
      "48-hour jam with mentorship, playable demos, and publishing talks from leading studios.",
    date: "2025-09-12T09:00:00Z",
    venue: "Phoenix Tech Arena, Pune",
    category: "Entertainment",
    ticketPrice: 499,
    maxAttendees: 400,
    posterUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Climate Tech Builder Summit",
    description:
      "Founders and policy makers co-design pilots covering carbon capture, water security, and agritech.",
    date: "2025-12-23T09:30:00Z",
    venue: "Indian Habitat Centre, New Delhi",
    category: "Business",
    ticketPrice: 0,
    maxAttendees: 250,
    posterUrl:
      "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
  },
];

async function ensureHost() {
  const existing = await User.findOne({ email: HOST_PROFILE.email });
  if (existing) {
    if (existing.role !== "host") {
      existing.role = "host";
      await existing.save();
    }
    return existing;
  }

  const passwordHash = await bcrypt.hash(HOST_PROFILE.password, 10);
  const host = await User.create({
    name: HOST_PROFILE.name,
    email: HOST_PROFILE.email,
    password: passwordHash,
    role: "host",
  });
  return host;
}

async function seedEvents(host) {
  let created = 0;
  let updated = 0;

  for (const template of EVENT_TEMPLATES) {
    const existing = await Event.findOne({
      title: template.title,
      hostId: host._id,
    });

    const payload = {
      title: template.title,
      description: template.description,
      date: new Date(template.date),
      venue: template.venue,
      category: template.category,
      ticketPrice: template.ticketPrice,
      currency: "INR",
      maxAttendees: template.maxAttendees,
      registrationDeadline: new Date(template.date),
      imageUrl: template.posterUrl,
      posterUrl: template.posterUrl,
      hostId: host._id,
      hostName: host.name,
      type: "individual",
      teamLimit: 1,
      approved: true,
      adminRejected: false,
      rejectReason: null,
      status: "approved",
      allowCancellation: true,
      locationType: "in-person",
    };

    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      updated += 1;
    } else {
      await Event.create(payload);
      created += 1;
    }
  }

  return { created, updated };
}

async function run() {
  await connectDB();
  const host = await ensureHost();
  const result = await seedEvents(host);
  console.log(
    `Seed complete for host ${host.email}. Created ${result.created}, updated ${result.updated}.`
  );
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding host events failed", err);
  process.exit(1);
});

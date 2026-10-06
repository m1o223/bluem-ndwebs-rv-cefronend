import type { ProjectId } from "../portfolio/registry";

export type CodeTabKey = "react" | "css" | "logic";

export type CodeTab = {
  key: CodeTabKey;
  label: string;
  filename: string;
  code: string;
};

export type TemplateConceptDetail = {
  projectId: ProjectId;
  slug: string;
  liveUrl: string;
  codeTabs: CodeTab[];
};

const details = [
  {
    projectId: "ecommerce",
    slug: "morrow",
    liveUrl: "/templates/morrow",
    codeTabs: [
      {
        key: "react",
        label: "React",
        filename: "morrow-store.tsx",
        code: `export default function MorrowStore() {
  const [filter, setFilter] = useState("All essentials");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});

  return (
    <main data-project="ecommerce">
      <ProjectNav brand="MORROW" links={navLinks} action="Bag" />
      <section data-section="home" className={styles.hero}>
        <p>DAILY SKINCARE</p>
        <h1>Good skin. Simple days.</h1>
        <ProductArt />
      </section>
      <ProductGrid products={filteredProducts} onSelect={setSelected} />
      {selected && <ProductPanel product={selected} onAdd={addToBag} />}
    </main>
  );
}`,
      },
      {
        key: "css",
        label: "CSS",
        filename: "morrow-store.module.css",
        code: `.hero {
  min-height: 82vh;
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(320px, 1.1fr);
  align-items: center;
  gap: 48px;
  padding: 8vw 5vw 5vw;
  background: #dce5d4;
  color: #30472e;
}

.productCard {
  border: 1px solid #30472e22;
  background: #f8f7f0;
  border-radius: 8px;
  padding: 22px;
  transition: transform .22s ease, box-shadow .22s ease;
}

.productCard:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 42px #30472e18;
}`,
      },
      {
        key: "logic",
        label: "Logic",
        filename: "morrow-cart.ts",
        code: `function addToBag(productId: string, quantity: number) {
  setCart((current) => ({
    ...current,
    [productId]: (current[productId] || 0) + quantity,
  }));
  setPanel("bag");
}

const filteredProducts = products
  .filter((product) =>
    filter === "All essentials" ? true : product.category === filter,
  )
  .sort((a, b) => sort === "Price" ? a.price - b.price : 0);`,
      },
    ],
  },
  {
    projectId: "ai-platform",
    slug: "aster",
    liveUrl: "/templates/aster",
    codeTabs: [
      {
        key: "react",
        label: "React",
        filename: "aster-workspace.tsx",
        code: `export default function AsterWorkspace() {
  const [tab, setTab] = useState("Workspace");
  const [prompt, setPrompt] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);

  return (
    <main data-project="ai-platform">
      <aside className={styles.sidebar}>
        {templates.map((item) => (
          <button onClick={() => setPrompt(item.prompt)}>{item.label}</button>
        ))}
      </aside>
      <section className={styles.editor}>
        <textarea value={prompt} onChange={updatePrompt} />
        <button onClick={generateDraft}>Generate draft</button>
      </section>
    </main>
  );
}`,
      },
      {
        key: "css",
        label: "CSS",
        filename: "aster-workspace.module.css",
        code: `.workspace {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  background: #eee8f7;
  color: #675389;
}

.editor {
  display: grid;
  gap: 18px;
  align-content: start;
  padding: clamp(32px, 6vw, 72px);
}

.draftCard {
  border: 1px solid #67538924;
  background: #fffafc;
  border-radius: 12px;
}`,
      },
      {
        key: "logic",
        label: "Logic",
        filename: "aster-generate.ts",
        code: `function generateDraft() {
  const template = activeTemplate || templates[0];
  const body = makeDraft(prompt, template.label, tone, length);

  setDrafts((current) => [
    {
      id: Date.now(),
      title: template.title,
      type: template.label,
      body,
    },
    ...current,
  ]);
}`,
      },
    ],
  },
  {
    projectId: "photography",
    slug: "june-atlas",
    liveUrl: "/templates/june-atlas",
    codeTabs: [
      {
        key: "react",
        label: "React",
        filename: "june-atlas-gallery.tsx",
        code: `export default function JuneAtlasGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? null : photographs[selected];

  return (
    <main data-project="photography">
      <ProjectNav brand="JUNE ATLAS" links={galleryLinks} />
      <section className={styles.archive}>
        {photographs.map((photo, index) => (
          <button onClick={() => setSelected(index)}>
            <Photo name={photo.image} alt={photo.alt} />
            <span>{photo.title}</span>
          </button>
        ))}
      </section>
      {current && <PhotoStory image={current} onClose={() => setSelected(null)} />}
    </main>
  );
}`,
      },
      {
        key: "css",
        label: "CSS",
        filename: "june-atlas.module.css",
        code: `.archive {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 22px;
  padding: 6vw 5vw;
  background: #1d2926;
  color: #eee7d8;
}

.archive button:nth-child(odd) {
  grid-column: span 7;
}

.archive button:nth-child(even) {
  grid-column: span 5;
  margin-top: 8vw;
}`,
      },
      {
        key: "logic",
        label: "Logic",
        filename: "june-atlas-lightbox.ts",
        code: `function openStory(index: number) {
  setSelected(index);
}

function nextStory() {
  setSelected((current) =>
    current === null ? 0 : (current + 1) % photographs.length,
  );
}

function previousStory() {
  setSelected((current) =>
    current === null
      ? photographs.length - 1
      : (current - 1 + photographs.length) % photographs.length,
  );
}`,
      },
    ],
  },
  {
    projectId: "corporate",
    slug: "meridian",
    liveUrl: "/templates/meridian",
    codeTabs: [
      {
        key: "react",
        label: "React",
        filename: "meridian-casework.tsx",
        code: `export default function MeridianCasework() {
  const [selected, setSelected] = useState<CaseStudy | null>(null);

  return (
    <main data-project="corporate">
      <ProjectNav brand="MERIDIAN" links={navLinks} action="Talk to us" />
      <section className={styles.hero}>
        <h1>A clearer way forward.</h1>
        <p>Independent thinking and connected expertise.</p>
      </section>
      <CaseStudyGrid items={cases} onSelect={setSelected} />
      {selected && <CaseStudyPanel caseStudy={selected} />}
    </main>
  );
}`,
      },
      {
        key: "css",
        label: "CSS",
        filename: "meridian.module.css",
        code: `.hero {
  min-height: 76vh;
  display: grid;
  align-content: end;
  padding: 7vw 5vw;
  background: #edf0ec;
  color: #233746;
}

.caseGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid #23374624;
}

.caseCard {
  padding: 28px;
  border-right: 1px solid #23374618;
}`,
      },
      {
        key: "logic",
        label: "Logic",
        filename: "meridian-cases.ts",
        code: `function openCase(caseStudy: CaseStudy) {
  setSelected(caseStudy);
}

const featuredCases = cases.filter((item) => item.featured);

const outcomeTotals = selected?.outcomes.reduce(
  (count, outcome) => count + (outcome.value ? 1 : 0),
  0,
);`,
      },
    ],
  },
  {
    projectId: "furniture",
    slug: "form-field",
    liveUrl: "/templates/form-field",
    codeTabs: [
      {
        key: "react",
        label: "React",
        filename: "form-field-shop.tsx",
        code: `export default function FormFieldShop() {
  const [selected, setSelected] = useState<Piece | null>(null);
  const [finish, setFinish] = useState(0);

  return (
    <main data-project="furniture">
      <ProjectNav brand="FORM & FIELD" links={navLinks} action="Edit" />
      <ProductGallery pieces={pieces} onSelect={setSelected} />
      {selected && (
        <PiecePanel piece={selected} finish={finish} onFinish={setFinish} />
      )}
    </main>
  );
}`,
      },
      {
        key: "css",
        label: "CSS",
        filename: "form-field.module.css",
        code: `.collection {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  padding: 5vw;
  background: #f1ede2;
  color: #5b5b44;
}

.pieceCard {
  aspect-ratio: 4 / 5;
  display: grid;
  align-content: end;
  padding: 18px;
  background: #fffaf0;
}`,
      },
      {
        key: "logic",
        label: "Logic",
        filename: "form-field-cart.ts",
        code: `function addToEdit(piece: Piece) {
  const material = piece.finishes[finish];
  setEdit((current) => [
    ...current,
    {
      id: piece.id,
      finish: material.name,
      price: piece.price + material.extra,
    },
  ]);
}`,
      },
    ],
  },
  {
    projectId: "real-estate",
    slug: "haven",
    liveUrl: "/templates/haven",
    codeTabs: [
      {
        key: "react",
        label: "React",
        filename: "haven-search.tsx",
        code: `export default function HavenSearch() {
  const [selected, setSelected] = useState<Home | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  return (
    <main data-project="real-estate">
      <ProjectNav brand="HAVEN" links={navLinks} action="Saved homes" />
      <SearchFilters filters={filters} onChange={setFilters} />
      <HomeGrid homes={visibleHomes} onSelect={setSelected} />
      {selected && <HomePanel home={selected} saved={saved} />}
    </main>
  );
}`,
      },
      {
        key: "css",
        label: "CSS",
        filename: "haven.module.css",
        code: `.searchHero {
  min-height: 72vh;
  display: grid;
  align-items: end;
  padding: 6vw 5vw;
  background: #e8eee7;
  color: #34574f;
}

.homeGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.homeCard img {
  border-radius: 10px;
}`,
      },
      {
        key: "logic",
        label: "Logic",
        filename: "haven-filters.ts",
        code: `const visibleHomes = homes.filter((home) => {
  const matchesCity = filters.city === "All" || home.city === filters.city;
  const matchesType = filters.type === "All" || home.type === filters.type;
  const withinBudget = home.price <= filters.maxPrice;
  return matchesCity && matchesType && withinBudget;
});

function toggleSaved(homeId: string) {
  setSaved((current) =>
    current.includes(homeId)
      ? current.filter((id) => id !== homeId)
      : [...current, homeId],
  );
}`,
      },
    ],
  },
  {
    projectId: "restaurant",
    slug: "sera",
    liveUrl: "/templates/sera",
    codeTabs: [
      {
        key: "react",
        label: "React",
        filename: "sera-menu.tsx",
        code: `export default function SeraMenu() {
  const [selected, setSelected] = useState<Dish | null>(null);
  const [booking, setBooking] = useState(false);

  return (
    <main data-project="restaurant">
      <ProjectNav brand="SERA" links={navLinks} action="Book a table" />
      <SeasonalMenu dishes={dishes} onSelect={setSelected} />
      {selected && <DishPanel dish={selected} />}
      {booking && <BookingPanel onClose={() => setBooking(false)} />}
    </main>
  );
}`,
      },
      {
        key: "css",
        label: "CSS",
        filename: "sera.module.css",
        code: `.menuSection {
  display: grid;
  grid-template-columns: .8fr 1.2fr;
  gap: 48px;
  padding: 7vw 5vw;
  background: #f5edda;
  color: #743d32;
}

.dishButton {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
  border-bottom: 1px solid #743d3222;
}`,
      },
      {
        key: "logic",
        label: "Logic",
        filename: "sera-booking.ts",
        code: `function requestBooking(form: BookingForm) {
  setBookingRequest({
    name: form.name.trim(),
    guests: Number(form.guests),
    date: form.date,
    time: form.time,
    notes: form.notes.trim(),
  });
  setBooking(false);
  setConfirmation(true);
}`,
      },
    ],
  },
] satisfies TemplateConceptDetail[];

export const templateConceptDetails = details;

export const templateConceptByProject = Object.fromEntries(
  details.map((detail) => [detail.projectId, detail]),
) as Record<ProjectId, TemplateConceptDetail>;

export const templateConceptBySlug = Object.fromEntries(
  details.map((detail) => [detail.slug, detail]),
) as Record<string, TemplateConceptDetail>;

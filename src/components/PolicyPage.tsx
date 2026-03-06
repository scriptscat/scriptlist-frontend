interface PolicyPageProps {
  title: string;
  lastUpdated: string;
  sectionPrefix: string;
  t: {
    (key: string): string;
    has(key: string): boolean;
  };
}

export default function PolicyPage({
  title,
  lastUpdated,
  sectionPrefix,
  t,
}: PolicyPageProps) {
  const sections: { titleKey: string; contentKey: string }[] = [];
  for (let i = 1; t.has(`${sectionPrefix}${i}_title`); i++) {
    sections.push({
      titleKey: `${sectionPrefix}${i}_title`,
      contentKey: `${sectionPrefix}${i}_content`,
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">
        {title}
      </h1>
      <div className="prose dark:prose-invert max-w-none text-[rgb(var(--text-secondary))] space-y-6">
        <p className="text-sm text-[rgb(var(--text-tertiary))]">
          {lastUpdated}
        </p>

        {sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
              {t(section.titleKey)}
            </h2>
            <p className="whitespace-pre-line">{t(section.contentKey)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

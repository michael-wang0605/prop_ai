export default function SectionCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

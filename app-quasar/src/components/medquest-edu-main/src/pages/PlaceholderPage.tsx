import { AppLayout } from "@/components/AppLayout";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Em breve</p>
      </div>
    </div>
  );
}

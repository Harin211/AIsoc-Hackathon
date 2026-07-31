import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export default function FeatureCard({ feature }: { feature: FeatureCardProps }) {
  return (
    <Card className="h-full border border-border/60 bg-card/70 p-2 transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <feature.icon className="size-5" />
        </div>
        <CardTitle className="text-lg">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{feature.description}</CardDescription>
      </CardContent>
    </Card>
  );
}

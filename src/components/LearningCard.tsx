import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, PlayCircle, FileText, ListChecks } from "lucide-react";
import type { LearningContent } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { Link } from "react-router-dom";

interface LearningCardProps {
  content: LearningContent;
  onClick?: () => void;
}

const typeIcon = (type: string) => {
  switch (type) {
    case "video": return <PlayCircle className="h-4 w-4 text-primary" />;
    case "checklist": return <ListChecks className="h-4 w-4 text-primary" />;
    default: return <FileText className="h-4 w-4 text-primary" />;
  }
};

export function LearningCard({ content, onClick }: LearningCardProps) {
  const { lt } = useLocale();

  const card = (
    <Card
      className="group shadow-soft hover:shadow-hover transition-all duration-300 cursor-pointer border border-border/60 hover:border-primary/30 rounded-2xl"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeIcon(content.type)}
            <h3 className="font-display font-semibold text-sm leading-tight text-card-foreground">{lt(content.title)}</h3>
          </div>
          {content.completed ? (
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{lt(content.description)}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{lt(content.topic)}</Badge>
          <span className="text-xs text-muted-foreground">{content.duration}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) return card;

  return (
    <Link to={`/learn/${content.id}`} aria-label={lt(content.title)}>
      {card}
    </Link>
  );
}

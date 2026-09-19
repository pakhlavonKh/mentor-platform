import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, PlayCircle, FileText, ListChecks } from "lucide-react";
import type { LearningContent } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { Link } from "react-router-dom";

interface LearningCardProps {
  content: LearningContent;
  isCompleted?: boolean;
  onClick?: () => void;
}

const typeIcon = (type: string) => {
  switch (type) {
    case "video": return <PlayCircle className="h-4 w-4 text-primary" />;
    case "checklist": return <ListChecks className="h-4 w-4 text-primary" />;
    default: return <FileText className="h-4 w-4 text-primary" />;
  }
};

export function LearningCard({ content, isCompleted, onClick }: LearningCardProps) {
  const { lt } = useLocale();
  const completed = isCompleted ?? content.completed;
  const hasTest = Boolean(content.test && content.test.questions && content.test.questions.length > 0);

  const card = (
    <Card
      className="group shadow-soft hover:shadow-hover transition-all duration-300 cursor-pointer border border-border/60 hover:border-primary/30 rounded-2xl h-full flex flex-col justify-between"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeIcon(content.type)}
            <h3 className="font-display font-semibold text-sm leading-tight text-card-foreground group-hover:text-primary transition-colors">
              {lt(content.title)}
            </h3>
          </div>
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{lt(content.description)}</p>
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{lt(content.topic)}</Badge>
            <span className="text-xs text-muted-foreground">{content.duration}</span>
          </div>
          {hasTest && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 gap-1 border-primary/30 text-primary bg-primary/5"
            >
              Test ({content.test!.questions.length})
            </Badge>
          )}
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

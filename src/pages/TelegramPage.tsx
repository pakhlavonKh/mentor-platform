import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockTelegramPosts } from "@/data/mockData";
import { ExternalLink, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function TelegramPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Send className="h-5 w-5 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Opportunities Feed</h1>
          </div>
          <p className="text-muted-foreground">Latest scholarship news and opportunities.</p>
        </div>
        <div className="space-y-4">
          {mockTelegramPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="shadow-soft hover:shadow-hover transition-all border border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-base text-card-foreground">{post.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0 rounded-full">{post.source}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.description}</p>
                  <Button variant="outline" size="sm" className="rounded-full">Open Link <ExternalLink className="ml-1.5 h-3.5 w-3.5" /></Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

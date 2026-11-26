import { Inbox } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

const swatches = [
  ['bg-background border', 'background'],
  ['bg-surface border', 'surface'],
  ['bg-surface-muted', 'surface-muted'],
  ['bg-primary', 'primary'],
  ['bg-primary-soft', 'primary-soft'],
  ['bg-accent', 'accent'],
  ['bg-success-soft', 'success-soft'],
  ['bg-warning-soft', 'warning-soft'],
  ['bg-danger-soft', 'danger-soft'],
  ['bg-info-soft', 'info-soft'],
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-10 p-6">
      <header>
        <h1 className="text-4xl font-bold">Style guide</h1>
        <p className="mt-2 text-ink-muted">
          Heading font above, body font here. This page is for us while building.
        </p>
      </header>

      <Section id="colors" title="Colours">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {swatches.map(([cls, name]) => (
            <div key={name}>
              <div className={`h-14 rounded-xl border-border ${cls}`} />
              <p className="mt-1 text-xs text-ink-muted">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section id="badges" title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Idea</Badge>
          <Badge tone="info">Ongoing</Badge>
          <Badge tone="primary">Final Phase</Badge>
          <Badge tone="success">Looking for Members</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Rejected</Badge>
        </div>
      </Section>

      <Section id="cards" title="Card (a project card, as it will look)">
        <Card interactive>
          <CardHeader>
            <div>
              <CardTitle>Student Teammate Finder</CardTitle>
              <p className="mt-1 text-sm text-ink-muted">Web Development · by Shaurya Raj</p>
            </div>
            <Badge tone="success">Looking for Members</Badge>
          </CardHeader>
          <p className="text-sm">
            A platform that matches students by skills, so project ideas find the right teammates.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="info">Ongoing</Badge>
            <Badge>2 of 4 spots filled</Badge>
          </div>
          <CardFooter>
            <Button size="sm">Apply</Button>
            <Button size="sm" variant="ghost">View details</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section id="loading" title="Loading">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Spinner />
            <span className="text-sm text-ink-muted">Spinner, for small waits</span>
          </div>
          <Card>
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      </Section>

      <Section id="empty" title="Empty state">
        <EmptyState
          icon={Inbox}
          title="No applications yet"
          description="When you apply to a project, it will show up here with its status."
          action={<Button>Discover projects</Button>}
        />
      </Section>

      <Section id="avatars" title="Avatars">
        <div className="flex items-center gap-3">
          <Avatar name="Shaurya Raj" size="sm" />
          <Avatar name="Shaurya Raj" />
          <Avatar name="Priya Sharma" size="lg" />
          <Avatar name="Aman" />
          <Avatar name="Neha Verma" />
        </div>
      </Section>
    </main>
  );
}

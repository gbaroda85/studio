import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import type {LucideIcon} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {ArrowLeft} from 'lucide-react';

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="w-full max-w-lg text-center">
        <Card>
          <CardHeader className="items-center p-6">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-8 w-8" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

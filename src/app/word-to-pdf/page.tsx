import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceholderPage } from '@/components/placeholder-page';
import { FileText } from 'lucide-react';

export default function WordToPdfPage() {
  return (
    <PlaceholderPage 
        title="Tool Removed" 
        description="The Word to PDF tool has been removed from the application. Please go back to see other available tools."
        icon={FileText}
    />
  );
}
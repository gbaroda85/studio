import { PlaceholderPage } from '@/components/placeholder-page';
import { ScanLine } from 'lucide-react';

export default function ScanToPdfPage() {
  return (
    <PlaceholderPage 
        title="Tool Removed" 
        description="The Scan to PDF tool has been removed from the application. Please use the 'Document Scan' tool instead for better results."
        icon={ScanLine}
    />
  );
}

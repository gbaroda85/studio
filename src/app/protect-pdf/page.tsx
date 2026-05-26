import { PlaceholderPage } from '@/components/placeholder-page';
import { Lock } from 'lucide-react';

export default function ProtectPdfPage() {
  return (
    <PlaceholderPage 
        title="Tool Removed" 
        description="The Protect PDF tool has been removed from the application. Please go back to see other available tools."
        icon={Lock}
    />
  );
}

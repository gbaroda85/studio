import { PlaceholderPage } from '@/components/placeholder-page';
import { Video } from 'lucide-react';

/**
 * @fileOverview Placeholder page for permanently removed tool.
 */
export default function CompressVideoPage() {
  return (
    <PlaceholderPage 
        title="Tool Removed" 
        description="The Video Compressor tool has been removed from the platform. Please use our other multimedia utilities."
        icon={Video}
    />
  );
}

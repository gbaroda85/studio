import { PlaceholderPage } from '@/components/placeholder-page';
import { Music } from 'lucide-react';

/**
 * @fileOverview Placeholder page for permanently removed tool.
 */
export default function AddAudioToVideoPage() {
  return (
    <PlaceholderPage 
        title="Tool Removed" 
        description="The Add Audio to Video tool has been removed from the platform. Please use our other multimedia utilities."
        icon={Music}
    />
  );
}

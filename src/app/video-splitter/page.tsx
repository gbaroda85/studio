import { PlaceholderPage } from '@/components/placeholder-page';
import { Scissors } from 'lucide-react';

/**
 * @fileOverview Placeholder page for permanently removed tool.
 */
export default function VideoSplitterPage() {
  return (
    <PlaceholderPage 
        title="Tool Removed" 
        description="The Video Splitter tool has been removed from the platform. We apologize for the inconvenience."
        icon={Scissors}
    />
  );
}

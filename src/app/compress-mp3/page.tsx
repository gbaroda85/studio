import { PlaceholderPage } from '@/components/placeholder-page';
import { FileAudio } from 'lucide-react';

export default function CompressMp3Page() {
  return (
    <PlaceholderPage 
        title="Tool Under Maintenance" 
        description="The MP3 Compressor tool has been removed for maintenance. Please use our other Audio and PDF tools in the meantime."
        icon={FileAudio}
    />
  );
}

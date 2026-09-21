
import { redirect } from 'next/navigation';

/**
 * @fileOverview Redirect non-existent tool to prevent 404s and search console errors.
 */
export default function AiUpscalerPage() {
    redirect('/');
}

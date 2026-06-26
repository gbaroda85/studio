import { redirect } from 'next/navigation';

/**
 * @fileOverview Placeholder for removed tool to prevent 404s in search results.
 * Redirects back to the main tools hub.
 */
export default function ResumeBuilderPage() {
    redirect('/tools');
}

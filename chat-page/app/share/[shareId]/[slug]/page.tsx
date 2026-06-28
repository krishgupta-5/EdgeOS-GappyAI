import { Metadata } from 'next';
import { db } from "@/lib/firebase-admin";
import SharePageClient from './SharePageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ shareId: string; slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const doc = await db.collection("shared_chats").doc(resolvedParams.shareId).get();
    if (!doc.exists) return { title: 'Not Found | EdgeOS' };
    
    const data = doc.data()!;
    if (!data.isPublic) return { title: 'Not Available | EdgeOS' };

    return {
      title: `${data.title} | Shared via EdgeOS`,
      description: `Shared software planning project generated with EdgeOS. Created by ${data.ownerName}.`,
      openGraph: {
        title: `${data.title} | Shared via EdgeOS`,
        description: `Shared software planning project generated with EdgeOS.`,
        siteName: 'EdgeOS',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${data.title} | Shared via EdgeOS`,
        description: `Shared software planning project generated with EdgeOS.`,
      }
    };
  } catch (e) {
    return { title: 'Shared Chat | EdgeOS' };
  }
}

export default async function SharePage({ 
  params 
}: { 
  params: Promise<{ shareId: string; slug: string }> 
}) {
  const resolvedParams = await params;
  return <SharePageClient shareId={resolvedParams.shareId} slug={resolvedParams.slug} />;
}

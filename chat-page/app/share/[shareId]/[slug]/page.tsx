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
    if (!doc.exists) return { title: 'Not Found | ProdMate' };
    
    const data = doc.data()!;
    if (!data.isPublic) return { title: 'Not Available | ProdMate' };

    return {
      title: `${data.title} | Shared via ProdMate`,
      description: `Shared software planning project generated with ProdMate. Created by ${data.ownerName}.`,
      openGraph: {
        title: `${data.title} | Shared via ProdMate`,
        description: `Shared software planning project generated with ProdMate.`,
        siteName: 'ProdMate',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${data.title} | Shared via ProdMate`,
        description: `Shared software planning project generated with ProdMate.`,
      }
    };
  } catch (e) {
    return { title: 'Shared Chat | ProdMate' };
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

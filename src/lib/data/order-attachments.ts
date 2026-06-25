import { createClient } from '@/lib/supabase/server';
import type { OrderAttachmentView } from '@/components/orders/OrderAttachmentsSection';

export async function getOrderAttachmentViews(orderId: string, labId: string): Promise<OrderAttachmentView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('order_attachments')
    .select('id, attachment_type, file_name, file_type, file_size, file_path, file_url, created_at')
    .eq('order_id', orderId)
    .eq('lab_id', labId)
    .order('created_at', { ascending: false });

  const attachments: OrderAttachmentView[] = [];

  for (const attachment of data || []) {
    const filePath = attachment.file_path || attachment.file_url;
    let signedUrl: string | null = null;

    if (filePath) {
      const { data: signed } = await supabase.storage
        .from('order-attachments')
        .createSignedUrl(filePath, 60 * 10);
      signedUrl = signed?.signedUrl || null;
    }

    attachments.push({
      id: attachment.id,
      attachment_type: attachment.attachment_type || 'prescription',
      file_name: attachment.file_name,
      file_type: attachment.file_type,
      file_size: attachment.file_size,
      signed_url: signedUrl,
      created_at: attachment.created_at,
    });
  }

  return attachments;
}

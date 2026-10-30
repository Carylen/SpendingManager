import type { ProviderId } from '@arus/core';
import type { CaptureChannel, CategoryKind, FlowDirection } from '@/lib/supabase/database.types';

export interface CategoryView {
  id: string;
  name: string;
  kind: CategoryKind;
  colorFrom: string;
  colorTo: string;
}

export interface TransactionView {
  id: string;
  direction: FlowDirection;
  amount: number;
  merchant: string | null;
  note: string | null;
  occurredAt: string;
  channel: CaptureChannel;
  needsReview: boolean;
  timeKnown: boolean;
  category: CategoryView | null;
  providerId: ProviderId | null;
  raw: string | null;
}

export interface TransactionList {
  items: TransactionView[];
  truncated: boolean;
}

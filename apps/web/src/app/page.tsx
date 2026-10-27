import { redirect } from 'next/navigation';
import { appConfig } from '@/config/app';

export default function Index() {
  redirect(appConfig.homePath);
}

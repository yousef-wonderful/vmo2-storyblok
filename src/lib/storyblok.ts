import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import { COMPONENTS } from '@/components/sb';

const region = (process.env.STORYBLOK_REGION || 'eu').trim().toLowerCase();

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
  use: [apiPlugin],
  apiOptions: { region: region === 'eu' ? undefined : region },
  components: COMPONENTS,
  enableFallbackComponent: true,
});

export const configured = () => !!process.env.STORYBLOK_PREVIEW_TOKEN?.trim();

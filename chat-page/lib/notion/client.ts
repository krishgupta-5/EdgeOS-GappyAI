import { Client } from '@notionhq/client';

export const getNotionClient = (accessToken: string) => {
  return new Client({
    auth: accessToken,
  });
};


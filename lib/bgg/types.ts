export type BGGMarketplaceListing = {
  listingid: string;
  listdate: string;
  price: {
    currency: string;
    value: string;
  };
  condition: string;
  notes: string;
  link: {
    href: string;
    title: string;
  };
};

export type BGGMarketplaceItem = {
  id: string;
  name: string;
  yearpublished?: string;
  thumbnail?: string;
  listings: BGGMarketplaceListing[];
};

export type BGGApiResponse = {
  items: BGGMarketplaceItem[];
  total: number;
};

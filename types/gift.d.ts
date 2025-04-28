export interface Gift {
  _id: string;
  title: string;
  description: string;
}

export interface GiftEntry {
  _id: string;
  giftId: {
    _id: string;
    title: string;
    description: string;
  };
  earnedAt: string;
  expiresAt: string;
  usedAt?: string;
}


export interface GiftWallet {
  availableGifts: GiftEntry[];
  usedGifts: GiftEntry[];
}

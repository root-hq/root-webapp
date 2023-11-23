export interface UnifiedVault {
  vault_address: string;
  vault_identifier: string;
  exchange: string;
  market_address: string;
  owner_address: string;
  base_token_address: string;
  quote_token_address: string;
  is_base_deposit_practiced: boolean;
  is_quote_deposit_practiced: boolean;
}

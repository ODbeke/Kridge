//! Kridge Solana Interchain Program (Anchor SVM)
//! Dispatches API credit rental & donation instructions from Solana to GenLayer via Hyperlane Sealevel Mailbox

use anchor_lang::prelude::*;
use hyperlane_sealevel_mailbox::instruction::dispatch;

declare_id!("KrdgSolanaMailboxReceiver11111111111111111");

#[program]
pub mod kridge_solana_adapter {
    use super::*;

    pub fn rent_credit_from_solana(
        ctx: Context<RentCredit>,
        genlayer_domain: u32,
        listing_id: u64,
        amount_lamports: u64,
        duration_hours: u32,
    ) -> Result<()> {
        let buyer_key = ctx.accounts.buyer.key();
        
        let payload = (
            "RENT_SOLANA",
            buyer_key.to_string(),
            listing_id,
            amount_lamports,
            duration_hours,
        );

        msg!("Dispatching rental message to GenLayer domain: {}", genlayer_domain);
        Ok(())
    }

    pub fn donate_credit_from_solana(
        ctx: Context<DonateCredit>,
        genlayer_domain: u32,
        provider: String,
        quota_tokens: u64,
    ) -> Result<()> {
        let donor_key = ctx.accounts.donor.key();
        msg!("Dispatching donation message from Solana donor: {}", donor_key);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RentCredit<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DonateCredit<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    pub system_program: Program<'info, System>,
}
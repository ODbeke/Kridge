from typing import TypedDict, Optional, List

class Listing(TypedDict):
    id: str
    seller: str
    provider: str
    model: str
    tokens_available: int
    price_per_1k_tokens: float
    is_donation: bool
    created_at: int

class Rental(TypedDict):
    id: str
    listing_id: str
    buyer: str
    tokens_requested: int
    locked_amount: float
    status: str

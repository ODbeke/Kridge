import struct

class HyperlaneMessageCodec:
    @staticmethod
    def encode_rental_intent(buyer_addr: bytes, listing_id: bytes, amount: int) -> bytes:
        return struct.pack(">32s32sQ", buyer_addr, listing_id, amount)

    @staticmethod
    def decode_rental_intent(payload: bytes):
        return struct.unpack(">32s32sQ", payload)

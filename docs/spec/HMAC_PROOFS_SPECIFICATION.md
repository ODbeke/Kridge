# HMAC Audit Receipt Specification

Every API stream chunk emits an HMAC-SHA256 digest:
```
Signature = HMAC_SHA256(Secret, RequestID + Timestamp + Tokens + Status)
```

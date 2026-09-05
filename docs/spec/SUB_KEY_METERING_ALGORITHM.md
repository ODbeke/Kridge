# Sub-Key Token Metering Algorithm

Streaming chunks are decoded in real time. If `consumed_tokens >= quota`, the TCP connection is cleanly closed with an EOF marker and a final settlement event is dispatched.

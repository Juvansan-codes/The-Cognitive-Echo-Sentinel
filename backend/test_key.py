import httpx

key = "rc_b1f6a52132c106a03e76315563b898de6137e9ec53bb14323c017704d3d3e971"
response = httpx.post(
    "https://api.featherless.ai/v1/chat/completions",
    json={"model": "meta-llama/Llama-2-70b-chat-hf", "messages": [{"role": "user", "content": "hi"}], "max_tokens": 5},
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
)
print(response.status_code)
print(response.text)

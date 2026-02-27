# Ishtar Bootstrap Hook - Self-Check

**File:** For agent:bootstrap hook

```python
# Ishtar's bootstrap self-check
def ishtar_bootstrap(session):
    expected_key = "agent:ishtar:whatsapp:main"
    actual_key = session.key
    
    if actual_key != expected_key:
        log_warning(f"Ishtar session key mismatch! Expected {expected_key}, got {actual_key}")
        # Do NOT proceed until resolved
        return False
    
    # Verify WhatsApp channel is active
    if "whatsapp" not in session.deliveryContext.channels:
        log_warning("Ishtar WhatsApp channel not in delivery context!")
        return False
    
    return True
```

This ensures Ishtar's session is always the correct WhatsApp session.

# DTMF

# DTMF Events

DTMF (Dual-Tone Multi-Frequency) events allow SIP participants to send keypad input during calls. These events are forwarded to the Stream video call as custom events, enabling interactive voice response (IVR) scenarios, PIN entry, menu navigation, and more.

## How DTMF Works

When a SIP participant presses a key on their phone keypad:

1. The SIP client sends DTMF tones via RTP (RFC 2833/4733 telephone-events)
2. Stream SIP ingress detects and decodes the DTMF digits
3. When the digit press ends (RFC 4733 end-bit detected), a `call.dtmf` event is broadcast to the call
4. WebRTC participants receive the event in real-time via WebSocket as well as through the configured webhook URL
5. Your application can respond to the DTMF input

## DTMF Event Format

When a DTMF digit is received, Stream sends a `call.dtmf` event:

```json
{
  "type": "call.dtmf",
  "call_cid": "default:my-call-123",
  "digit": "5",
  "duration_ms": 250,
  "seq_number": 1,
  "timestamp": "2026-02-12T10:30:45.123Z",
  "user": {
    "id": "sip-+12025551234",
    "custom": {
      "phone": "+12025551234"
    }
  },
  "created_at": "2026-02-12T10:30:45.123Z"
}
```

**Event Fields**:

- `type`: Always `"call.dtmf"`
- `call_cid`: The call identifier (format: `{call_type}:{call_id}`)
- `digit`: The DTMF digit pressed (`"0"-"9"`, `"*"`, `"#"`, `"A"-"D"`)
- `duration_ms`: Duration of the digit press in milliseconds
- `seq_number`: Monotonically increasing sequence number for ordering DTMF events within a session
- `timestamp`: When the digit press ended and was detected (RFC 4733 end-bit detected)
- `user`: The SIP participant who pressed the digit
- `created_at`: Timestamp when the event was created


---

This page was last updated at 2026-04-17T17:34:00.921Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/sip/dtmf/](https://getstream.io/video/docs/react-native/sip/dtmf/).
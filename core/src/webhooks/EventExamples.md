# Example Events

This document contains examples of emitted events for each event type in the BIP/ERP integration.

* *Updated 3/1/23*

## 1. On-chain Received

```json
{
  "eventType": "onchain.received",
  "tenantId": "2cd824b2-cd8e-42c1-9c28-87b5a1584293",
  "data": {
    "amount": {
      "amountFiat": 2.43,
      "currency": "usd",
      "amountSats": 10000,
      "exchangeRate": 24326.95
    },
    "timestamp": "2023-02-16T15:33:32.000-05:00",
    "netBalanceChange": {
      "amountFiat": 2.43,
      "currency": "usd",
      "amountSats": 10000,
      "exchangeRate": 24326.95
    },
    "totalFees": {
      "amountFiat": 0,
      "currency": "usd",
      "amountSats": 0,
      "exchangeRate": 24326.95
    },
    "txnHash": "def6772bef028e68ed8ecc8050d721b2c5680be1c33c98249cc3312063a6982b",
    "blockHash": "5d6b87ccda6310c5e77d72e8ba1b460d1055304299685b0daf8981c8d2b20830",
    "source": "unknown",
    "erpMetadata": [
       {
        "dataType": "erpInvoiceId",
        "domain": "QBO",
        "value": "123"
      },
      {
        "dataType": "revenueCategory",
        "domain": "QBO",
        "value": "sales"
      }
    ]
  },
  "eventTimestamp": "2023-02-22T20:16:31.075Z"
}
```

## 2. On-chain Sent

```json
{
  "eventType": "onchain.sent",
  "tenantId": "2cd824b2-cd8e-42c1-9c28-87b5a1584293",
  "data": {
    "amount": {
      "amountFiat": 0.24,
      "currency": "usd",
      "amountSats": 1000,
      "exchangeRate": 23516.95
    },
    "timestamp": "2023-02-17T16:48:29.000-05:00",
    "netBalanceChange": {
      "amountFiat": -1.92,
      "currency": "usd",
      "amountSats": -8150,
      "exchangeRate": 23516.95
    },
    "receiver": "bcrt1pmkpkz3uwhxfxasmjaggft9kpydax6agkmup5rjnqwtjggpk4ckyqahyzua",
    "totalFees": {
      "amountFiat": 1.68,
      "currency": "usd",
      "amountSats": 7150,
      "exchangeRate": 23516.95
    },
    "txnHash": "5c3f61ae71054b0fec84a7b2a1917e604737e943601db1003f0b3e6a8f88a8c1",
    "blockHash": "03016c2430e5a83cbbf0adf63db802357b985ffc6088153393d27beacc3f429e",
    "erpMetadata": [
      {
        "dataType": "expenseCategory",
        "domain": "QBO",
        "value": "sales"
      }
    ]
  },
  "eventTimestamp": "2023-02-22T20:16:31.037Z"
}
```

## 3. Payment Sent (Lightning)

```json
{
  "eventType": "payment.sent",
  "tenantId": "2cd824b2-cd8e-42c1-9c28-87b5a1584293",
  "data": {
    "amount": {
      "currency": "usd",
      "amountFiat": 0,
      "amountSats": 2,
      "exchangeRate": 23516.95
    },
    "timestamp": "2023-02-17T16:42:58.000-05:00",
    "paymentRequest": "lnbcrt20n1p37la9xpp5tng42hj0htlhdjv8mawh4ktrjv2umm0tf0s27wpl5t9mpxv8xnvsdquw3jhxareypcxz7tdv4h8ggr0w46qcqzpgxqyz5vqsp5lnwwa3xpkkwzkvve8kysrtr9x9gk55tpvcuyq8tlp4gqqucx5fqq9qyyssqz4rmc72ntzey7lqcfc0cpcl52yzqzk3pfwjdxfpfahaqylynstgjhw5lteshls4s9hlj3r64u5f4w6dzje7zxlqazvqkkxtddkw27wqq95gwph"
  },
  "eventTimestamp": "2023-02-17T21:48:34.323Z",
  "erpMetadata": [
    {
      "dataType": "expenseCategory",
      "domain": "QBO",
      "value": "default"
    }
  ]
}
```

## 4. Payment Received (Lightning)

```json
{
  "eventType": "payment.received",
  "tenantId": "2cd824b2-cd8e-42c1-9c28-87b5a1584293",
  "data": {
    "source": "unknown",
    "amount": {
      "currency": "usd",
      "amountFiat": 1,
      "amountSats": 4252,
      "exchangeRate": 23516.95
    },
    "paymentRequest": "lnbcrt42520n1p37luurpp5j40rph65hfsuy9r2msqf5vdxe29t4cjc0lrgfdqy28cqawnyqq9sdqlw3jhxareyp5kuan0d93k2gr9wejkuaqcqzpgxqzfvrzjqdsk9wzcdztcjq002n8ksfxfpq2znu972wz4ahtl3fz72uc9ck3pjqqrwvqqqqgqqqqqqqlgqqqqn3qqjqsp5gdcreaf7matkxnztldr5gyuncl2ca7zm2a9fxawrjfum9apy4tds9qyyssq72tfgudyphfdtqvnl55flnl7ppp7f93u0ctxldzf23fjwzcdfqpqvwychuusxk6g0wj7yhh6tqzu34jm6xd3szl7s0xhmrt68kwxsmgp97fu87",
    "timestamp": "2023-02-17T16:37:15.000-05:00"
  },
  "eventTimestamp": "2023-02-17T21:48:34.276Z",
  "source": "pos",
  "erpMetadata": [
    {
      "dataType": "erpInvoiceId",
      "domain": "QBO",
      "value": "323"
    },
    {
      "dataType": "revenueCategory",
      "domain": "QBO",
      "value": "sales"
    }
  ]
}
```

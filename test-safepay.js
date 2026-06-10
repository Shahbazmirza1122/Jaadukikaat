import fetch from 'node-fetch';
(async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/safepay/create-tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 250, currency: 'PKR', environment: 'SANDBOX' })
        });
        const data = await response.text();
        console.log(response.status);
        console.log(data);
    } catch (e) {
        console.error(e);
    }
})();

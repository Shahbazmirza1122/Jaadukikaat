const scriptUrl = 'https://script.google.com/macros/s/AKfycbzw73C-NQzPpF0mFAz4heqHvUHyXp7lzdqfN1hsRGsk-JdOfnk6NYvKdbt_zJ62v9kvxQ/exec';
const formData = new URLSearchParams();
formData.append('action', 'send_email');
formData.append('recipient', 'shahbazmirza1122@gmail.com');
formData.append('subject', 'CLI Test Email');
formData.append('htmlBody', '<h1>Test test</h1>');

fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
})
.then(res => res.text())
.then(text => console.log('Response:', text))
.catch(err => console.error('Error:', err));

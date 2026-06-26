document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const bloodGroupInput = document.getElementById('bloodGroup');
    const locationInput = document.getElementById('location');
    const phoneInput = document.getElementById('phone');
    const reasonInput = document.getElementById('reason');
    const dateInput = document.getElementById('date');
    const amountInput = document.getElementById('amount');
    const timeInput = document.getElementById('time');

    // Outputs
    const previewSubject = document.getElementById('previewSubject');
    const previewBody = document.getElementById('previewBody');

    // Buttons
    const copySubjectBtn = document.getElementById('copySubjectBtn');
    const copyBodyBtn = document.getElementById('copyBodyBtn');

    function updatePreview() {
        const bg = bloodGroupInput.value || '[Blood Group]';
        const loc = locationInput.value || '[Location]';
        const ph = phoneInput.value || '[Phone]';
        const rs = reasonInput.value || '[Reason]';
        const dt = dateInput.value.trim();
        const am = amountInput.value.trim();
        const tm = timeInput.value.trim();

        // Update Subject
        const subjectText = `[GB-BUCC] Emergency ${bg} blood needed at ${loc}.`;
        previewSubject.textContent = subjectText;
        
        // Build details array
        const details = [];
        details.push(`<strong>Blood Type:</strong> <span style="color: red; font-weight: bold;">${bg}</span>`);
        if (am) details.push(`<strong>Amount :</strong> <span style="color: red; font-weight: bold;">${am}</span>`);
        details.push(`<strong>Contact Number:</strong> <span style="color: blue; font-weight: bold;">${ph}</span>`);
        details.push(`<strong>Location:</strong> <span style="color: blue; font-weight: bold;">${loc}</span>`);
        if (dt) details.push(`<strong>Date:</strong> <span style="color: red; font-weight: bold;">${dt}</span>`);
        if (tm) details.push(`<strong>Time:</strong> <span style="color: red; font-weight: bold;">${tm}</span>`);

        const detailsHtml = details.join('<br>');

        // Update Body (HTML with inline styles for Gmail)
        const bodyHTML = `<span style="font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Greetings,<br>Emergency <span style="color: red; font-weight: bold;">${bg}</span> blood needed for <span style="font-weight: bold;">${rs}</span> at <span style="color: blue; font-weight: bold;">${loc}</span>. If anyone is available, please contact <span style="color: blue; font-weight: bold;">${ph}</span> as soon as possible. Thank you.<br><br><span style="font-size: 18px; line-height: 1.6;"><span style="text-decoration: underline; font-weight: bold;">DETAILS:</span><br>${detailsHtml}</span></span>`;
        previewBody.innerHTML = bodyHTML;
    }

    // Attach event listeners to all inputs
    const inputs = [bloodGroupInput, locationInput, phoneInput, reasonInput, dateInput, amountInput, timeInput];
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Initial render
    updatePreview();

    // Copy handlers
    function handleCopy(button, textToCopy, isHtml = false) {
        const originalText = button.textContent;
        
        if (isHtml) {
            // Copy rich text
            try {
                const blobHtml = new Blob([textToCopy], { type: "text/html" });
                const blobText = new Blob([previewBody.innerText], { type: "text/plain" });
                const data = [new ClipboardItem({
                    "text/html": blobHtml,
                    "text/plain": blobText,
                })];

                navigator.clipboard.write(data).then(() => {
                    showSuccess(button);
                }).catch(err => {
                    console.error('Failed to copy rich text via ClipboardItem: ', err);
                    fallbackCopyHtmlToClipboard(textToCopy, button);
                });
            } catch (err) {
                console.error('ClipboardItem not supported, using fallback: ', err);
                fallbackCopyHtmlToClipboard(textToCopy, button);
            }
        } else {
            // Copy plain text
            navigator.clipboard.writeText(textToCopy).then(() => {
                showSuccess(button);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                fallbackCopyTextToClipboard(textToCopy, button);
            });
        }

        function showSuccess(btn) {
            btn.textContent = 'Copied!';
            btn.classList.add('success');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('success');
            }, 2000);
        }
    }

    function fallbackCopyHtmlToClipboard(htmlText, btn) {
        // Intercept the copy event to inject pure, uncomputed HTML directly into the clipboard
        function listener(e) {
            e.clipboardData.setData("text/html", htmlText);
            e.clipboardData.setData("text/plain", previewBody.innerText);
            e.preventDefault();
        }
        
        document.addEventListener("copy", listener);
        try {
            document.execCommand("copy");
            btn.textContent = 'Copied!';
            btn.classList.add('success');
            setTimeout(() => {
                btn.textContent = 'Copy Rich Text for Gmail';
                btn.classList.remove('success');
            }, 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.removeEventListener("copy", listener);
    }

    function fallbackCopyTextToClipboard(text, btn) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            btn.textContent = 'Copied!';
            btn.classList.add('success');
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.classList.remove('success');
            }, 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    }

    // Setup generic copy buttons
    document.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            handleCopy(btn, btn.getAttribute('data-copy'));
        });
    });

    copySubjectBtn.addEventListener('click', () => {
        handleCopy(copySubjectBtn, previewSubject.textContent);
    });

    copyBodyBtn.addEventListener('click', () => {
        // Copy the HTML content for rich text pasting in Gmail
        handleCopy(copyBodyBtn, previewBody.innerHTML, true);
    });

    const openGmailBtn = document.getElementById('openGmailBtn');
    if (openGmailBtn) {
        openGmailBtn.addEventListener('click', () => {
            if (window.FlutterChannel) {
                // We are inside the Flutter App
                window.FlutterChannel.postMessage(JSON.stringify({
                    action: 'openGmail',
                    subject: previewSubject.textContent
                }));
            } else {
                // We are in a normal browser
                const subject = encodeURIComponent(previewSubject.textContent);
                
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    // Apple devices: explicitly force the Gmail app using its custom URL scheme
                    window.location.href = `googlegmail:///co?to=gb-bucc@googlegroups.com&subject=${subject}`;
                } else if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    // Android and other mobile devices: mailto seamlessly handles Gmail opening
                    window.location.href = `mailto:gb-bucc@googlegroups.com?subject=${subject}`;
                } else {
                    // On desktop, force Google Workspace domain routing for easier account switching
                    window.open(`https://mail.google.com/a/g.bracu.ac.bd/?view=cm&fs=1&to=gb-bucc@googlegroups.com&su=${subject}`, '_blank');
                }
            }
        });
    }
});

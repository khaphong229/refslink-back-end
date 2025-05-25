document.addEventListener('DOMContentLoaded', async () => {
    const token = window.app_api_token || app_api_token;
    const links = Array.from(document.querySelectorAll('a'));
    const urls = links
        .map(a => a.getAttribute('href'))
        .filter(href => href && href.indexOf('http') === 0);

    console.log(urls.length);
    console.log("---------------------");
    if (urls.length === 0) return;

    try {
        const response = await fetch('http://localhost:3111/st/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
                urls,
            }),
        });

        const result = await response.json();
        console.log(result);

        if (result.success && Array.isArray(result.data)) {
            const mapUrl = {};
            result.data.forEach(item => {
                mapUrl[item.data.original_link] = item.data.shorten_link;
            });

            links.forEach(a => {
                if (mapUrl[a.href]) {
                    a.href = mapUrl[a.href];
                }
            });

            console.log("Thay thế thành công");
        }
    } catch (error) {
        console.error('Lỗi khi rút gọn link:', error);
    }
});

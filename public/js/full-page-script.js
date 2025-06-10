document.addEventListener('DOMContentLoaded', async () => {
  const token = window.app_api_token || app_api_token;
  const type = window.app_type || app_type;
  const domains = window.app_domains || app_domains;

  if (!token) {
    console.error('Không tìm thấy app_api_token');
    return;
  }

  const links = Array.from(document.querySelectorAll('a'));

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  const filteredLinks = links.filter(a => {
    const domain = getDomain(a.href);
    if (!domain) return false; 

    const inDomainList = domains.includes(domain);

    if (type === 'include') {
      return inDomainList;      
    } else if (type === 'exclude') {
      return !inDomainList;     
    }
    return true;
  });

  const urls = filteredLinks.map(a => a.href).filter(Boolean);

  if (urls.length === 0) return;

  try {
    const response = await fetch('https://deploy-be-resfink.onrender.com/st/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, urls }),
    });

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      const mapUrl = {};
      result.data.forEach(item => {
        mapUrl[item.data.original_link] = item.data.shorten_link;
      });

      filteredLinks.forEach(a => {
        if (mapUrl[a.href]) {
          a.href = mapUrl[a.href];
        }
      });
    }
  } catch (error) {
    console.error('Error shortening links:', error);
  }
});

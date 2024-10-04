function distinguirURL(url) {
    let domain;

    try {
        domain = new URL(url).hostname;
    } catch (e) {
        return "URL inválida";
    }

    if (domain.includes("amazon.com")) {
        return "amazon";
    } else if (domain.includes("aliexpress.us") || domain.includes("aliexpress.com")) {
        return "aliexpress";
    } else {
        return "Otro enlace";
    }
}

module.exports = { distinguirURL };
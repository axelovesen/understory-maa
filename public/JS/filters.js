function updateQuery(parms) {
    const url = new URL(window.location);
    
    Object.keys(parms).forEach((key) => {
        const values = parms[key];
        if (values === null || values === undefined || values === '') {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, values);
        }
    });
    window.location = url.toString();
}

 document.addEventListener('DOMContentLoaded', () => {

    const periodButtons = document.querySelectorAll('[data-period]');
    periodButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const period = button.dataset.period;
            updateQuery({ period });
        });
    });

    const sortButtons = document.querySelectorAll('[data-sort]');
    sortButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const sort = button.dataset.sort;
            updateQuery({ sort });
        });
    });
});
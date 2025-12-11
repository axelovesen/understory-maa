function updateQuery(parms) {
    const url = new URL(window.location); //nåværende  url
    
    Object.keys(parms).forEach((key) => {
        const values = parms[key];
        if (values === null || values === undefined || values === '') {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, values);
        }
    });
    window.location = url.toString(); //last siden på nytt
}

//kjører når DOM er ferdig lastet
document.addEventListener('DOMContentLoaded', () => {

    const periodButtons = document.querySelectorAll('[data-period]');
    periodButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const period = button.dataset.period; //setter valgt periode
            updateQuery({ period }); //oppdater url
        });
    });

    const sortButtons = document.querySelectorAll('[data-sort]'); //sorteringsknapper
    sortButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const sort = button.dataset.sort; //valgt sortering
            updateQuery({ sort }); //oppdater url
        });
    });
});
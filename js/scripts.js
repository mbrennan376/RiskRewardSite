function loadLayout() {
    fetch('layout.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('layout').innerHTML = html;
            loadMenu(); // Call loadMenu after layout is loaded
        })
        .catch(error => {
            console.error('Error loading layout:', error);
        });
}

function loadMenu() {
    const menuButton = document.querySelector('.menu-button');
    if (menuButton) {
        menuButton.addEventListener('click', () => {
            const menuContent = document.getElementById('menuContent');
            menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
        });
    }

    fetch('menu.json')
        .then(response => response.json())
        .then(menuData => {
            const menuContent = document.getElementById('menuContent');

            menuData.forEach(item => {
                const menuItem = document.createElement('a');
                menuItem.href = item.link;
                menuItem.classList.add('menu-item');
                menuItem.innerHTML = `
                    <img src="${item.icon}" alt="${item.title}" width="20" height="20">
                    ${item.title}
                `;
                menuContent.appendChild(menuItem);
            });

            fetch('content.html')
                .then(response => response.text())
                .then(htmlContent => {
                    const menuFooter = document.createElement('div');
                    menuFooter.classList.add('menu-footer');
                    menuFooter.innerHTML = htmlContent;
                    menuContent.appendChild(menuFooter);
                });
        })
        .catch(error => {
            console.error('Error loading menu JSON:', error);
        });
}

function loadCharts() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const thumbnailContainer = document.getElementById('thumbnailContainer');
            const details = document.getElementById('details');
            const defaultMessage = document.getElementById('defaultMessage');
            const fullscreenOverlay = document.getElementById('fullscreenOverlay');
            const fullscreenImg = document.getElementById('fullscreenImg');
            const closeBtn = document.getElementById('closeBtn');

            closeBtn.addEventListener('click', () => {
                fullscreenOverlay.style.display = 'none';
            });

            data.forEach(chart => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('thumbnail-wrapper');

                const img = document.createElement('img');
                img.src = chart['ChartFilename'];
                img.classList.add('thumbnail');
                img.alt = `${chart['TickerSymbol']} - ${chart['CompanyName']}`;
                img.addEventListener('click', () => {
                    details.innerHTML = `
                        <div class="chart-title">${chart['TickerSymbol']} - ${chart['CompanyName']}</div>
                        <div class="chart-date">Updated: ${chart['UpdatedDate']}</div>
                        <img class="chart-img" src="${chart['ChartFilename']}" alt="${chart['TickerSymbol']} - ${chart['CompanyName']}">
                        <div class="chart-comments">${chart['Comments']}</div>
                    `;
                    const detailImg = details.querySelector('.chart-img');
                    detailImg.addEventListener('click', () => {
                        fullscreenImg.src = detailImg.src;
                        fullscreenOverlay.style.display = 'flex';
                    });
                    defaultMessage.style.display = 'none';
                });

                const label = document.createElement('div');
                label.classList.add('thumbnail-label');
                label.textContent = chart['TickerSymbol'];

                wrapper.appendChild(img);
                wrapper.appendChild(label);
                thumbnailContainer.appendChild(wrapper);
            });
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
        });
}

function loadDisclaimer() {
    fetch('disclaimer.html')
        .then(response => response.text())
        .then(html => {
            const disclaimerElement = document.getElementById('disclaimer');
            disclaimerElement.innerHTML = html;
            const disclaimerToggle = document.getElementById('disclaimerToggle');
            disclaimerToggle.addEventListener('click', () => {
                const isHidden = disclaimerElement.style.display === 'none';
                disclaimerElement.style.display = isHidden ? 'block' : 'none';
                disclaimerToggle.textContent = isHidden ? 'Hide Disclaimer' : 'Show Disclaimer';
            });
        })
        .catch(error => {
            console.error('Error loading disclaimer:', error);
        });
}

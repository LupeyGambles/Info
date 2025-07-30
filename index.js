fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://raw.githubusercontent.com/LupeyGambles/tuff/refs/heads/main/tuff.json')}`)
.then(response => {
	if (response.ok) return response.json()
	throw new Error('Network response was not ok.')
    return response.json();
})
.then(data => {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = `
    <h2>name: ${name}</h2>
    <p>description: ${description}</p>
    `;
});



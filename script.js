document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = 'https://xgujrdvrazidffhxyiyw.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndWpyZHZyYXppZGZmaHh5aXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1NzIyNTEsImV4cCI6MjAzNTE0ODI1MX0.JtDbU7FSCPCPMQYQNU2bMPQEux1TggsfaQWsXpvxqFk';
    const table = 'bodybuilding_data';

    // Login functionality
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple client-side validation (for demo purposes)
            if (username === "Ruben40870" && password === "fsUMXPH6c9z5Zr") {
                localStorage.setItem('authenticated', 'true');
                localStorage.setItem('loginTime', Date.now().toString());
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid username or password');
            }
        });
    }

    // Auto logout after 1 hour
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime && (Date.now() - parseInt(loginTime)) > 3600000) { // 1 hour in milliseconds
        localStorage.removeItem('authenticated');
        localStorage.removeItem('loginTime');
        alert('Session expired. Please log in again.');
        window.location.href = 'login.html';
    }

    // Logout button functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authenticated');
            localStorage.removeItem('loginTime');
            window.location.href = 'login.html';
        });
    }

    // Form submission functionality
    const form = document.getElementById('entryForm');
    const dateInput = document.getElementById('date');
    const dayOfWeekInput = document.getElementById('day_of_week');

    if (dateInput) {
        dateInput.addEventListener('change', (event) => {
            const date = new Date(event.target.value);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            dayOfWeekInput.value = dayOfWeek;
        });
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            Object.keys(data).forEach(key => {
                if (data[key] === "" || data[key] === "-") {
                    data[key] = null;
                }
            });

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const result = await response.json();
                alert('Data inserted successfully!');
                form.reset();
                dayOfWeekInput.value = "";
            } catch (error) {
                alert('Error inserting data: ' + error.message);
            }
        });
    }

    // Fetch entries functionality
    if (document.getElementById('entriesTable')) {
        fetchEntries();
    }

    // Fetch weight data and display chart
    async function fetchWeightData() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/weight_data`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            console.log('Response status:', response.status);  // Log response status
            const responseText = await response.text();
            console.log('Response text:', responseText);  // Log response text

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = JSON.parse(responseText);
            console.log('Fetched data:', data);  // Log fetched data
            return data;
        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
            alert('Error fetching data from Supabase: ' + error.message);
        }
    }

    function filterDataByDateRange(data, range) {
        if (range === 'all') {
            return data;
        }
        const now = new Date();
        const daysAgo = new Date(now.setDate(now.getDate() - parseInt(range)));
        console.log('Filtering data from:', daysAgo);  // Debugging line
        return data.filter(entry => new Date(entry.Date) >= daysAgo);
    }

    function updateChart(chart, data) {
        console.log('Updating chart with data:', data);  // Debugging line
        chart.data.labels = data.map(entry => new Date(entry.Date));
        chart.data.datasets[0].data = data.map(entry => entry.Weight);
        chart.update();
    }

    const weightData = await fetchWeightData();

    if (weightData && weightData.length > 0) {
        const parsedWeightData = weightData.map(entry => ({
            date: new Date(entry.Date),
            weight: entry.Weight
        }));
        console.log('Parsed weight data:', parsedWeightData);

        const ctx = document.getElementById('weightChart').getContext('2d');
        const weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: parsedWeightData.map(entry => entry.date),
                datasets: [{
                    label: 'Weight (kg)',
                    data: parsedWeightData.map(entry => entry.weight),
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM d, yyyy'
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: 'white'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Weight (kg)',
                            color: 'white'
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });

        const dateRangeSelect = document.getElementById('dateRange');
        dateRangeSelect.addEventListener('change', () => {
            const selectedRange = dateRangeSelect.value;
            console.log('Selected range:', selectedRange); // Debugging line
            const filteredData = filterDataByDateRange(parsedWeightData, selectedRange);
            console.log('Filtered data:', filteredData); // Debugging line
            updateChart(weightChart, filteredData);
        });
    }
});

async function fetchEntries() {
    const SUPABASE_URL = 'https://xgujrdvrazidffhxyiyw.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndWpyZHZyYXppZGZmaHh5aXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1NzIyNTEsImV4cCI6MjAzNTE0ODI1MX0.JtDbU7FSCPCPMQYQNU2bMPQEux1TggsfaQWsXpvxqFk';
    const table = 'bodybuilding_data';

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        console.log('Data fetched successfully:', data);

        const tableBody = document.querySelector('#entriesTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '';

            data.forEach(entry => {
                const row = document.createElement('tr');
                const values = [
                    entry.date, entry.day_of_week, entry.weight_kg, entry.calories_kcal, entry.protein_g,
                    entry.carbs_g, entry.fats_g, entry.sleep_duration_min, entry.sleep_quality, entry.mood,
                    entry.stress, entry.gym_performance, entry.resting_heart_rate, entry.blood_pressure,
                    entry.blood_oxygen_level, entry.supplements_taken ? entry.supplements_taken.replace(/\n/g, '<br>') : "No Data",
                    entry.peds_taken ? entry.peds_taken.replace(/\n/g, '<br>') : "No Data"
                ];
                values.forEach(value => {
                    const cell = document.createElement('td');
                    cell.innerHTML = value !== null ? value : "No Data";
                    row.appendChild(cell);
                });
                tableBody.appendChild(row);
            });
<<<<<<< HEAD
        } else {
            console.error('Element with ID "entriesTable" not found');
=======
>>>>>>> 5a5123347646292f154ee8ce8e7e78215a285f4c
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data: ' + error.message);
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> 5a5123347646292f154ee8ce8e7e78215a285f4c

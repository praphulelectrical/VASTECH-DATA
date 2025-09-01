let data = [];
let currentEditId = null;
let currentDeleteId = null;

document.getElementById("dataForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    const entry = { id: Date.now(), description, amount, category };
    data.push(entry);
    renderTable();
    updateSummary();
    document.getElementById("successMessage").style.display = "block";
    setTimeout(() => document.getElementById("successMessage").style.display = "none", 2000);
    saveData();
    this.reset();
});

function renderTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    data.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.description}</td>
            <td>${entry.amount}</td>
            <td>${entry.category}</td>
            <td>
                <button onclick="editEntry(${entry.id})">Edit</button>
                <button onclick="deleteEntry(${entry.id})">Delete</button>
            </td>`;
        tbody.appendChild(row);
    });
}

function updateSummary() {
    let cashIn = 0, cashOut = 0;
    data.forEach(entry => {
        if (entry.category === "PAYMENT RECEIVED") cashIn += entry.amount;
        else cashOut += entry.amount;
    });
    document.getElementById("totalCashIn").innerText = cashIn;
    document.getElementById("totalCashOut").innerText = cashOut;
    document.getElementById("netBalance").innerText = cashIn - cashOut;
    document.getElementById("totalEntries").innerText = data.length;
}

function editEntry(id) {
    currentEditId = id;
    const entry = data.find(e => e.id === id);
    document.getElementById("editDescription").value = entry.description;
    document.getElementById("editAmount").value = entry.amount;
    document.getElementById("editCategory").value = entry.category;
    document.getElementById("editModal").style.display = "block";
}

document.getElementById("saveEdit").addEventListener("click", function() {
    const entry = data.find(e => e.id === currentEditId);
    entry.description = document.getElementById("editDescription").value;
    entry.amount = parseFloat(document.getElementById("editAmount").value);
    entry.category = document.getElementById("editCategory").value;
    renderTable();
    updateSummary();
    saveData();
    document.getElementById("editModal").style.display = "none";
});

function deleteEntry(id) {
    currentDeleteId = id;
    document.getElementById("deleteModal").style.display = "block";
}

document.getElementById("confirmDelete").addEventListener("click", function() {
    data = data.filter(e => e.id !== currentDeleteId);
    renderTable();
    updateSummary();
    saveData();
    document.getElementById("deleteModal").style.display = "none";
});

// Save to localStorage
function saveData() {
    localStorage.setItem("vastData", JSON.stringify(data));
}

// Load from localStorage
function loadData() {
    const stored = localStorage.getItem("vastData");
    if (stored) {
        data = JSON.parse(stored);
        renderTable();
        updateSummary();
    }
}
window.onload = loadData;

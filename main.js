/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
function generateId() {
  return +new Date();
}

// Helper: simpan ke localStorage
function saveToStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Helper: format angka ke Rupiah
function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

// Helper: format tanggal
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */

// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeListEl = document.getElementById("incomeList");
const expenseListEl = document.getElementById("expenseList");
const balanceAmountEl = document.querySelector(
  ".tracker-summary__balance-amount",
);
const incomeAmountEl = document.querySelector(
  ".tracker-summary__stat-amount--income",
);
const expenseAmountEl = document.querySelector(
  ".tracker-summary__stat-amount--expense",
);
const currentMonthLabelEl = document.getElementById("currentMonthLabel");
const monthFilterEl = document.getElementById("monthFilter");

// Deklarasi searchKeyword di sini agar bisa diakses oleh renderTransactions()
let searchKeyword = "";
let selectedMonth = "";

function getMonthKey(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function formatMonthLabel(monthKey) {
  if (!monthKey) return "Semua Bulan";
  const [year, month] = monthKey.split("-");
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */
function getFilteredTransactions() {
  const keyword = searchKeyword.trim().toLowerCase();
  return transactions.filter(t => {
    const matchesSearch = keyword
      ? t.title.toLowerCase().includes(keyword)
      : true;
    const matchesMonth = selectedMonth
      ? getMonthKey(t.date) === selectedMonth
      : true;
    return matchesSearch && matchesMonth;
  });
}

function renderTransactions() {
  incomeListEl.innerHTML = "";
  expenseListEl.innerHTML = "";

  const filtered = getFilteredTransactions();

  filtered.forEach(t => {
    const isIncome = t.type === "income";

    const item = document.createElement("div");
    item.classList.add("tracker-transaction-item");
    item.setAttribute("data-testid", "transactionItem");

    const icon = document.createElement("div");
    icon.classList.add(
      "tracker-transaction-item__icon",
      isIncome
        ? "tracker-transaction-item__icon--income"
        : "tracker-transaction-item__icon--expense",
    );
    icon.textContent = isIncome ? "↑" : "↓";

    const detail = document.createElement("div");
    detail.classList.add("tracker-transaction-item__detail");

    const title = document.createElement("h3");
    title.classList.add("tracker-transaction-item__title");
    title.setAttribute("data-testid", "transactionItemTitle");
    title.textContent = t.title;

    const date = document.createElement("p");
    date.classList.add("tracker-transaction-item__date");
    date.setAttribute("data-testid", "transactionItemDate");
    date.textContent = "Tanggal: " + formatDate(t.date);

    const type = document.createElement("p");
    type.setAttribute("data-testid", "transactionItemType");
    type.textContent = "Tipe: " + (isIncome ? "Pemasukan" : "Pengeluaran");

    detail.appendChild(title);
    detail.appendChild(date);
    detail.appendChild(type);

    const right = document.createElement("div");
    right.classList.add("tracker-transaction-item__right");

    const amount = document.createElement("p");
    amount.classList.add(
      "tracker-transaction-item__amount",
      isIncome
        ? "tracker-transaction-item__amount--income"
        : "tracker-transaction-item__amount--expense",
    );
    amount.setAttribute("data-testid", "transactionItemAmount");
    amount.textContent = "Nominal: " + formatRupiah(t.amount);

    const actions = document.createElement("div");
    actions.classList.add("tracker-transaction-item__actions");

    const editBtn = document.createElement("button");
    editBtn.classList.add("tracker-transaction-item__btn");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => handleEdit(t.id));

    const changeTypeBtn = document.createElement("button");
    changeTypeBtn.classList.add("tracker-transaction-item__btn");
    changeTypeBtn.setAttribute("data-testid", "transactionItemEditTypeButton");
    changeTypeBtn.textContent = "Ubah Tipe";
    changeTypeBtn.addEventListener("click", () => handleChangeType(t.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("tracker-transaction-item__btn");
    deleteBtn.setAttribute("data-testid", "transactionItemDeleteButton");
    deleteBtn.textContent = "Hapus";
    deleteBtn.addEventListener("click", () => handleDelete(t.id));

    actions.appendChild(editBtn);
    actions.appendChild(changeTypeBtn);
    actions.appendChild(deleteBtn);

    right.appendChild(amount);
    right.appendChild(actions);

    item.appendChild(icon);
    item.appendChild(detail);
    item.appendChild(right);

    if (t.type === "income") {
      incomeListEl.appendChild(item);
    } else {
      expenseListEl.appendChild(item);
    }
  });
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array
const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("transactionFormTitleInput");
const amountInput = document.getElementById("transactionFormAmountInput");
const dateInput = document.getElementById("transactionFormDateInput");
const typeSelect = document.getElementById("transactionFormTypeSelect");
const submitBtn = document.querySelector(
  '[data-testid="transactionFormSubmitButton"]',
);

let editingId = null;

form.addEventListener("submit", e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;

  /**
   * TODO [Skilled]:
   * Tambahkan validasi input sebelum menyimpan data:
   *  - Tampilkan alert() dan hentikan proses jika judul kosong
   *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
   */
  if (!title) {
    alert("Keterangan transaksi tidak boleh kosong.");
    return;
  }
  if (amount < 1) {
    alert("Nominal harus minimal 1 rupiah.");
    return;
  }

  if (editingId !== null) {
    const idx = transactions.findIndex(t => t.id === editingId);
    if (idx !== -1) {
      transactions[idx] = { id: editingId, title, amount, date, type };
    }
    editingId = null;
    submitBtn.textContent = "Simpan";
  } else {
    const newTransaction = {
      id: generateId(),
      title,
      amount,
      date,
      type,
    };
    transactions.push(newTransaction);
  }

  saveToStorage();
  form.reset();

  /**
   * TODO [Advanced]:
   * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
   *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
   *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
   */
  document.dispatchEvent(new Event("transaction:updated"));
});

monthFilterEl.addEventListener("change", () => {
  selectedMonth = monthFilterEl.value;
  currentMonthLabelEl.textContent = selectedMonth
    ? formatMonthLabel(selectedMonth)
    : "Semua Bulan";
  document.dispatchEvent(new Event("transaction:updated"));
});

function initializeMonthFilter() {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  selectedMonth = currentKey;
  monthFilterEl.value = currentKey;
  currentMonthLabelEl.textContent = formatMonthLabel(currentKey);
}

initializeMonthFilter();

/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */

/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */
function handleDelete(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  document.dispatchEvent(new Event("transaction:updated"));
}

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */
function handleEdit(id) {
  const t = transactions.find(t => t.id === id);
  if (!t) return;

  editingId = id;
  titleInput.value = t.title;
  amountInput.value = t.amount;
  dateInput.value = t.date;
  typeSelect.value = t.type;
  submitBtn.textContent = "Perbarui";

  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */
document.addEventListener("transaction:updated", () => {
  renderTransactions();
  updateDashboard();
});

function updateDashboard() {
  const displayed = getFilteredTransactions();

  const totalIncome = displayed
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = displayed
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  balanceAmountEl.textContent = formatRupiah(balance);
  incomeAmountEl.textContent = formatRupiah(totalIncome);
  expenseAmountEl.textContent = formatRupiah(totalExpense);
}

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */

/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */
function handleChangeType(id) {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return;

  transactions[idx].type =
    transactions[idx].type === "income" ? "expense" : "income";
  saveToStorage();
  document.dispatchEvent(new Event("transaction:updated"));
}

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */
const searchInput = document.getElementById("searchTransactionFormTitleInput");
const searchForm = document.getElementById("searchTransactionForm");

searchInput.addEventListener("input", () => {
  searchKeyword = searchInput.value;
  renderTransactions();
});

searchForm.addEventListener("submit", e => {
  e.preventDefault();
  searchKeyword = searchInput.value;
  renderTransactions();
});

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 *  (ditangani otomatis di renderTransactions(): jika searchKeyword kosong, semua transaksi ditampilkan)
 */

document.dispatchEvent(new Event("transaction:updated"));
